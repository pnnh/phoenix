import {serverConfig} from "@/server/config";
import {SystemChannelService} from "@/server/domain/system/channel";

// 由定时任务调用，同步文章数据到本地数据库
export async function runSync() {
    const domainUrl = serverConfig.INITIAL_DOMAINS
    const channelService = new SystemChannelService(domainUrl)
    await channelService.runSync()
}
