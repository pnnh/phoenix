import {SystemChannelService} from "@/server/domain/system/channel";
import {serverConfig} from "@/server/config";
import {Request, Response} from "express";
import {SystemArticleService} from "@/server/articles/article";

// 查询频道列表
export async function selectChannels(request: Request, response: Response) {
    const domainUrl = serverConfig.INITIAL_DOMAINS

    const channelService = new SystemChannelService(domainUrl)

    const selectResult = await channelService.selectChannelsFromDatabase(1, 100)

    return response.json(selectResult)
}

export async function findChannel(request: Request, response: Response) {
    const domainUrl = serverConfig.INITIAL_DOMAINS
    const channelService = new SystemChannelService(domainUrl)

    const {channel} = request.params;
    const getResult = await channelService.findChannelFromDatabase(channel)

    return response.json(getResult)
}

// 查找某个频道里的文章列表
export async function selectChannelArticles(request: Request, response: Response) {
    const domainUrl = serverConfig.INITIAL_DOMAINS
    const articleService = new SystemArticleService(domainUrl)

    const {channel} = request.params;
    const result = await articleService.selectArticlesFromDatabase(1, 100, '', '', '',
        channel as string)
    return response.json(result)
}

// 查找单个文章
export async function fetchChannelFile(request: Request, response: Response) {
    const domainUrl = serverConfig.INITIAL_DOMAINS
    const channelService = new SystemChannelService(domainUrl)
    const {channel, asset} = request.params
    const result = await channelService.readAssets(String(channel), asset as string)

    if (!result) {
        return response.json({status: 404})
    }
    response.setHeader('Content-Type', result.mime)
    response.send(result.buffer);
}
