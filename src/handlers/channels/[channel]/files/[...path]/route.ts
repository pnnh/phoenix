import { NextRequest } from 'next/server'
import { SystemChannelService } from "@/services/server/domain/system/channel";
import { serverConfig } from "@/services/server/config";
import { getType } from '@/utils/mime';

export async function GET(request: NextRequest, { params }: { params: { channel: string, path: string[] } }) {
    console.debug('restful:', request.url, request.nextUrl.pathname)

    const domainUrl = serverConfig.INITIAL_DOMAINS
    const channelService = new SystemChannelService(domainUrl)
    const { channel, path } = params
    const result = await channelService.readAssets(String(channel), (path as string[]).join('/'))

    const mimeType = getType(params.path[params.path.length - 1])

    return new Response(result, { headers: { 'Content-Type': mimeType } });
}