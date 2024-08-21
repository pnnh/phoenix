import {SystemChannelService} from "@/services/server/domain/system/channel";
import {serverConfig} from "@/services/server/config";
import {Request, Response} from "express";

// 查询频道列表
export async function selectChannels(request: Request, response: Response) {
    const domainUrl = serverConfig.INITIAL_DOMAINS

    const channelService = new SystemChannelService(domainUrl)

    const result = await channelService.selectChannels()
    return response.json(result)
}
