import {initDatabase} from "@/server/worker/migration";
import {runSync} from "@/server/worker/sync";
import express, {Request, Response, NextFunction} from "express";
import http from "http";
import cron from "node-cron";
import {isDev, serverConfig, usePublicConfig} from "@/server/config";
import {
    fetchArticleAssets,
    fetchArticleFile,
    findArticle,
    selectArticlesFromDatabase,
    updateArticleViewer
} from "@/server/handlers/articles/articles";
import {
    fetchChannelFile,
    findChannel,
    selectChannelArticles,
    selectChannels
} from "@/server/handlers/channels/channels";
import {selectLibraries} from "@/server/handlers/personal/libraries/libraries";
import {selectNotebooks} from "@/server/handlers/personal/notebook";
import {selectNotes, updateNote} from "@/server/handlers/personal/note";
import cors from 'cors'
import stripAnsi from "strip-ansi";
import {selectTagsFromDatabase} from "@/server/handlers/tags/tags";
import {createProxyMiddleware} from "http-proxy-middleware";
import {engine} from "express-handlebars";
import {encodeBase58String} from "@/atom/common/utils/basex";

const workerPort = serverConfig.PORT;

function handleErrors(
    handlerFunc: (request: Request, response: Response) => Promise<Response<any, Record<string, any>> | undefined | void>) {

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await handlerFunc(req, res);
        } catch (e) {
            next(e);
        }
    }
}

async function healthCheck(
    request: Request,
    response: Response,) {
    response.status(200).send({
        code: 200,
        message: 'ok'
    })
}

function runMain() {
    // 每分钟执行一次同步
    cron.schedule("* * * * *", async () => {
        console.log("running a task every minute");
        await runSync();
    });

    const server = express();

    // 解决跨域问题
    server.use(cors({
        credentials: true,
        origin: true,
    }));
    server.use(express.json());
    server.use(express.urlencoded({extended: true}));

    server.get('/phoenix/healthz', handleErrors(healthCheck));
    server.get("/phoenix/articles", handleErrors(selectArticlesFromDatabase));
    server.get("/phoenix/tags", handleErrors(selectTagsFromDatabase));
    server.post("/phoenix/articles/:article/viewer", handleErrors(updateArticleViewer));
    server.get("/phoenix/articles/:article", handleErrors(findArticle));
    server.get("/phoenix/articles/:article/assets", handleErrors(fetchArticleAssets));
    server.get("/phoenix/articles/:article/assets/:asset", handleErrors(fetchArticleFile));
    server.get("/phoenix/channels", handleErrors(selectChannels));
    server.get("/phoenix/channels/:channel", handleErrors(findChannel));
    server.get("/phoenix/channels/:channel/articles", handleErrors(selectChannelArticles));
    server.get("/phoenix/channels/:channel/assets/:asset", handleErrors(fetchChannelFile));
    server.get("/phoenix/personal/libraries", handleErrors(selectLibraries));
    server.get("/phoenix/personal/libraries/:library/notebooks", handleErrors(selectNotebooks));
    server.get("/phoenix/personal/libraries/:library/notebooks/:notebook/notes", handleErrors(selectNotes));
    server.put("/phoenix/personal/libraries/:library/notebooks/:notebook/notes/:note", handleErrors(updateNote));

    server.engine('handlebars', engine());
    server.engine('.hbs', engine({extname: '.hbs'}));
    server.set('view engine', '.hbs');

    const cwd = process.cwd();

    const browserConfigString = JSON.stringify(usePublicConfig())
    const mainParams: any = {
        localhostSrc: isDev() ? '/lightning/src/client/localhost.tsx' : '/lightning/assets/localhost.mjs',
        cloudSrc: isDev() ? '/lightning/src/client/cloud.tsx' : '/lightning/assets/cloud.mjs',

    }
    if (isDev()) {
        console.log('isDev')
        server.set('views', `${cwd}/src/server/templates`);
        server.use('/lightning', express.static("public"));
        const proxyMiddleware = createProxyMiddleware<Request, Response>({
            target: 'http://localhost:5173',
            changeOrigin: true,
            ws: true,
        });
        server.use(proxyMiddleware);
    } else {
        console.log('isProd')
        mainParams.localhostStyle = '/lightning/assets/localhost.css';
        mainParams.cloudStyle = '/lightning/assets/cloud.css';
        mainParams.LGEnv = encodeBase58String(browserConfigString)
        server.set('views', `${cwd}/dist/templates`);
        server.use('/lightning', express.static("dist/client"));
        server.get('/lightning{*any}', (req, res) => {
            res.render('home', mainParams);
        });
    }

    server.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        const message = stripAnsi(err.stack || err.message || 'Unknown error')
        res.status(500).send({
            code: 500,
            message: message
        })
    })

    const httpServer = http.createServer(server);

    httpServer.listen(workerPort, async () => {
        console.log(
            `Worker server is running on http://0.0.0.0:${workerPort}`,
        );
        await initDatabase();
    });
}

runSync().then(() => {
}).catch(console.error);

runMain();
