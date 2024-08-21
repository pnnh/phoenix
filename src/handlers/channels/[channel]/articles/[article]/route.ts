import {Request, Response} from "express";
import {SystemArticleService} from "@/services/server/domain/system/article";
import {serverConfig} from "@/services/server/config";

export async function GET(request: Request, response: Response, {params}: {
    params: { channel: string, article: string }
}) {
    const domainUrl = serverConfig.INITIAL_DOMAINS
    const articleService = new SystemArticleService(domainUrl)

    const {channel, article} = params;
    const result = await articleService.getArticle(channel, article)
    if (!result) {
        return response.json({status: 404})
    }
    return response.json(result)
}
