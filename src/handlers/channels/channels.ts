import {SystemChannelService} from "@/services/server/domain/system/channel";
import {serverConfig} from "@/services/server/config";
import {Request, Response} from "express";
import {CodeOk, PLSelectResult} from "@/atom/common/models/protocol";
import {PSChannelModel} from "@/atom/common/models/channel";

// 查询频道列表
export async function selectChannels(request: Request, response: Response) {
    const domainUrl = serverConfig.INITIAL_DOMAINS

    const channelService = new SystemChannelService(domainUrl)

    const result = await channelService.selectChannels()
    const responseResult: PLSelectResult<PSChannelModel> = {
        code: CodeOk,
        message: '',
        data: result
    }
    return response.json(responseResult)
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
