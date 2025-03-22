import {openMainDatabase} from "@/services/server/database";
import {Request, Response} from "express";
import {SystemArticleService} from "@/services/server/articles/article";
import {serverConfig} from "@/services/server/config";
import {articleViewerCache} from "@/services/server/cache";
import {CodeNotFound, CodeOk, CommonResult, PLInsertResult, PLSelectResult} from "@/quark/atom/common/models/protocol";

// 查找单个文章
export async function findArticle(request: Request, response: Response) {
    const domainUrl = serverConfig.INITIAL_DOMAINS
    const articleService = new SystemArticleService(domainUrl)

    const {article} = request.params;
    const result = await articleService.findArticleFromDatabase(article)
    if (!result) {
        return response.json({code: CodeNotFound})
    }
    return response.json(result)
}


export async function selectArticlesFromDatabase(
    request: Request,
    response: Response,
) {
    let page = 1;
    let size = 10;
    const {
        page: pageStr, size: sizeStr, keyword: keywordStr,
        filter: filterStr, sort: sortStr
    } = request.query;
    if (pageStr && sizeStr) {
        page = parseInt(pageStr as string);
        size = parseInt(sizeStr as string);
    }
    if (page <= 0 || isNaN(page)) {
        page = 1;
    }
    if (size <= 10 || isNaN(size)) {
        size = 10;
    }
    const articleService = new SystemArticleService(serverConfig.INITIAL_DOMAINS)
    const selectResult = await articleService.selectArticlesFromDatabase(page,
        size, sortStr as string, keywordStr as string,
        filterStr as string, '')

    response.json(selectResult);
}

// 创建或更新文章阅读数据
export async function updateArticleViewer(
    request: Request,
    response: Response,
) {
    const {article} = request.params
    const {clientIp} = request.body;

    if (!clientIp || !article) {
        return response.json({
            code: 400,
            message: "缺少必须参数",
            data: null,
        });
    }
    const cacheKey = `article_viewer_${article}_${clientIp}`;
    const cacheValue = articleViewerCache.get(cacheKey);
    if (cacheValue) {
        return response.json({
            code: 200,
            message: "已经记录过",
            data: null,
        });
    }

    const db = await openMainDatabase();

    let selectSql = `update articles set discover = ifnull(discover, 0) + 1 where urn = :urn`;
    let selectParams: any = {
        ":urn": article,
    }

    const result = await db.run(
        selectSql, selectParams,
    );

    articleViewerCache.set(cacheKey, 1, 60 * 60 * 24);

    const selectResult: PLInsertResult<unknown> = {
        code: CodeOk,
        message: "",
        data: {
            urn: article,
            uid: article,
            changes: result.changes || 0,
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
