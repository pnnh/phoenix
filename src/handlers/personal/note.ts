import {serverConfig} from "@/services/server/config";
import {Request, Response} from "express";
import {SystemNoteService} from "@/services/server/domain/system/personal/note";

// 查询频道列表
export async function selectNotes(request: Request, response: Response) {
    const domainUrl = serverConfig.INITIAL_DOMAINS

    const {library, notebook} = request.params
    const service = new SystemNoteService(domainUrl)

    const result = await service.selectNotes(library, notebook)
    return response.json(result)
}
