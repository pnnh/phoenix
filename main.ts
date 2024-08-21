import {initDatabase} from "@/services/worker/migration";
import {runSync} from "@/services/worker/sync";
import express from "express";
import http from "http";
import cron from "node-cron";
import {serverConfig} from "@/services/server/config";
import {findArticle, selectArticlesFromDatabase, selectFromChannel} from "@/handlers/articles/articles";
import {selectChannels} from "@/handlers/channels/channels";
import {selectLibraries} from "@/handlers/personal/libraries/libraries";
import {selectNotebooks} from "@/handlers/personal/notebook";
import {selectNotes} from "@/handlers/personal/note";
import cors from 'cors'

const workerPort = serverConfig.WORKER_PORT;

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

    server.get("/articles", selectArticlesFromDatabase);
    server.get("/channels/:channel/articles/:article", findArticle);
    server.get("/channels/:channel/articles", selectFromChannel);
    server.get("/channels", selectChannels);
    server.get("/personal/libraries", selectLibraries);
    server.get("/personal/libraries/:library/notebooks", selectNotebooks);
    server.get("/personal/libraries/:library/notebooks/:notebook/notes", selectNotes);

    server.all("*", (req, res) => {
        res.json({code: 200});
    });

    const httpServer = http.createServer(server);

    httpServer.listen(workerPort, async () => {
        console.log(
            `Worker server is running on http://localhost:${workerPort}`,
        );
        await initDatabase();
    });
}

runSync().then(() => {
}).catch(console.error);

runMain();
