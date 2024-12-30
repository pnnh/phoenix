
import fs from "node:fs";
import path from "path";
import {CodeOk, emptySelectResult, PLSelectResult} from "@/atom/common/models/protocol";
import {decodeBase64String, encodeBase64String} from "@/atom/common/utils/basex";
import {NPAlbumModel} from "@/atom/common/models/images/album";
import frontMatter from "front-matter";

export class NPAlbumService {
    systemDomain: string

    constructor(systemDomain: string) {
        this.systemDomain = systemDomain.replace('file://', '')
    }

    async selectNotebooks(libraryUrn: string): Promise<PLSelectResult<NPAlbumModel>> {
        const basePath = this.systemDomain
        const notebooks: NPAlbumModel[] = []
        const libraryFileName = decodeBase64String(libraryUrn)
        if (!fs.existsSync(path.join(basePath, libraryFileName))) {
            return emptySelectResult()
        }
        const files = fs.readdirSync(path.join(basePath, libraryFileName))
        for (const file of files) {
            const stat = fs.statSync(path.join(basePath, libraryFileName, file))
            if (stat.isDirectory() && file.endsWith('.album')) {
                const notebookName = path.basename(file, path.extname(file))
                const notebookUniqueName = encodeBase64String(file)
                const model: NPAlbumModel = {
                    image: "", owner_name: "", profile: "", profile_name: "",
                    title: notebookName,
                    create_time: "", update_time: "",
                    name: notebookName,
                    description: '',
                    owner: '',
                    urn: notebookUniqueName
                }
                const metadataFile = basePath + '/' + file + '/metadata.md'
                if (fs.existsSync(metadataFile)) {
                    const metadataText = fs.readFileSync(metadataFile, 'utf-8')
                    const metadata = frontMatter(metadataText).attributes as
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
                notebooks.push(model)
            }
        }
        return {
            code: CodeOk, message: '',
            data: {
                range: notebooks,
                count: notebooks.length,
                page: 1,
                size: notebooks.length
            }
        }
    }
}
