import {PSArticleModel} from "@/models/article";
import {openMainDatabase} from "@/services/server/database";
import {createPaginationByPage} from "@/utils/pagination";
import {CodeOk, CommonResult, PLSelectResult} from "@pnnh/polaris-business";
import {Request, Response} from "express";
import {SystemArticleService} from "@/services/server/domain/system/article";
import {serverConfig} from "@/services/server/config";

// 查找单个文章
export async function findArticle(request: Request, response: Response) {
    const domainUrl = serverConfig.INITIAL_DOMAINS
    const articleService = new SystemArticleService(domainUrl)

    const {channel, article} = request.params;
    const result = await articleService.getArticle(channel, article)
    if (!result) {
        return response.json({status: 404})
    }
    return response.json(result)
}

// 查找某个频道里的文章列表
export async function selectFromChannel(request: Request, response: Response) {
    const domainUrl = serverConfig.INITIAL_DOMAINS
    const articleService = new SystemArticleService(domainUrl)

    const {channel} = request.params;
    const result = await articleService.selectArticlesInChannel(channel as string)
    return response.json(result)
}

export async function selectArticlesFromDatabase(
    request: Request,
    response: Response,
) {
    const page = 1;
    const size = 10;
    const db = await openMainDatabase();
    const {limit, offset} = createPaginationByPage(page, size);
    const result = await db.all<PSArticleModel[]>(
        `SELECT * FROM articles ORDER BY update_time DESC LIMIT :limit OFFSET :offset`,
        {
            ":limit": limit,
            ":offset": offset,
        },
    );
    const count = await db.get<{ total: number }>(
        "SELECT COUNT(*) AS total FROM articles",
    );
    if (!count) {
        throw new Error("查询count失败");
    }

    const selectResult: CommonResult<PLSelectResult<PSArticleModel>> = {
        code: CodeOk,
        message: "",
        data: {
            range: result,
            count: count.total,
            page: page,
            size: result.length,
        }
    };
    response.json(selectResult);
}

// 查找单个文章
export async function fetchArticleAssets(request: Request, response: Response) {
    const domainUrl = serverConfig.INITIAL_DOMAINS
    const articleService = new SystemArticleService(domainUrl)
    const {channel, article,} = request.params
    const {parent} = request.query
    const result = await articleService.selectFiles(channel, article, parent as string)

    if (!result) {
        return response.json({status: 404})
    }
    const body = {
        code: CodeOk,
        data: result
    }
    response.json(body)
}


// 查找单个文章
export async function fetchArticleFile(request: Request, response: Response) {
    const domainUrl = serverConfig.INITIAL_DOMAINS
    const articleService = new SystemArticleService(domainUrl)
    const {channel, article, asset} = request.params
    const result = await articleService.readAssets(channel, article, asset)

    if (!result) {
        return response.json({status: 404})
    }
    response.setHeader('Content-Type', result.mime)
    response.send(result.buffer);
}
