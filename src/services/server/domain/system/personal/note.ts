import {PLSelectResult, PSNoteModel} from "@pnnh/polaris-business";
import fs from "node:fs";
import frontMatter from "front-matter";
import {decodeBase64String, encodeBase64String} from "@pnnh/atom";
import path from "path";
import {emptySelectResult} from "@pnnh/polaris-business";

export class SystemNoteService {
    systemDomain: string

    constructor(systemDomain: string) {
        this.systemDomain = systemDomain.replace('file://', '')
    }

    async selectNotes(libraryUrn: string, notebookUrn: string): Promise<PLSelectResult<PSNoteModel>> {
        const basePath = this.systemDomain
        const notes: PSNoteModel[] = []
        const libraryFileName = decodeBase64String(libraryUrn)
        if (!fs.existsSync(path.join(basePath, libraryFileName))) {
            return emptySelectResult()
        }
        const notebookFileName = decodeBase64String(notebookUrn)
        if (!fs.existsSync(path.join(basePath, libraryFileName, notebookFileName))) {
            return emptySelectResult()
        }
        const files = fs.readdirSync(path.join(basePath, libraryFileName, notebookFileName))
        for (const file of files) {
            const stat = fs.statSync(path.join(basePath, libraryFileName, notebookFileName, file))
            if (stat.isDirectory() && file.endsWith('.note')) {
                const noteName = path.basename(file, path.extname(file))
                const noteUniqueName = encodeBase64String(file)
                const model: PSNoteModel = {
                    body: "",
                    channel: "",
                    channel_name: "",
                    children: 0,
                    cover: "",
                    discover: 0,
                    header: "markdown",
                    keywords: "",
                    partition: "",
                    path: "",
                    title: noteName,
                    create_time: "", update_time: "",
                    uid: noteUniqueName,
                    name: noteName,
                    description: '',
                    owner: '',
                    urn: noteUniqueName
                }
                const metadataFile = path.join(basePath, libraryFileName, notebookFileName, file, 'index.md')
                if (fs.existsSync(metadataFile)) {
                    const metadataText = fs.readFileSync(metadataFile, 'utf-8')
                    const matter = frontMatter(metadataText)
                    model.body = matter.body
                    const metadata = matter.attributes as
                        { image: string, description: string, title: string }
                    if (metadata) {
                        if (metadata.description) {
                            model.description = metadata.description
                        }
                        if (metadata.title) {
                            model.name = metadata.title
                        }
                    }
                }
                notes.push(model)
            }
        }
        return {
            range: notes,
            count: notes.length,
            page: 1,
            size: notes.length
        }
    }
}
