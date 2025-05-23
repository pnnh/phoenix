import {serverConfig} from "@/server/config";
import {Request, Response} from "express";
import {SystemNoteService} from "@/server/domain/system/personal/note";
import {PSArticleModel} from "@/atom/common/models/article";

// 查询频道列表
export async function selectNotes(request: Request, response: Response) {
    const domainUrl = serverConfig.INITIAL_DOMAINS

    const {library, notebook} = request.params
    const service = new SystemNoteService(domainUrl)

    const result = await service.selectNotes(library, notebook)
    return response.json(result)
}

export async function updateNote(request: Request, response: Response) {
    const domainUrl = serverConfig.INITIAL_DOMAINS

    const {library, notebook, note} = request.params
    const service = new SystemNoteService(domainUrl)

    const article = request.body as PSArticleModel
    console.log('updateNote', article)

    const result = await service.updateNote(library, notebook, note, article)
    return response.json(result)
}
