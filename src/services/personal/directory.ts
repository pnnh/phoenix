
import fs from "node:fs";
import frontMatter from "front-matter";
import path from "path";
import {emptySelectResult, PLSelectResult} from "@/atom/common/models/protocol";
import {decodeBase64String, encodeBase64String} from "@/atom/common/utils/basex";
import {NPDirectoryModel} from "@/atom/common/models/images/directory";

export class NPDirectoryService {
    systemDomain: string

    constructor(systemDomain: string) {
        this.systemDomain = systemDomain.replace('file://', '')
    }

    async selectNotebooks(libraryUrn: string): Promise<PLSelectResult<NPDirectoryModel>> {
        const basePath = this.systemDomain
        const notebooks: NPDirectoryModel[] = []
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
                const model: NPDirectoryModel = {
                    album: "", album_name: "", children: [], level: 0, parent: "", path: "",
                    profile: "", profile_name: "",
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
            code: 0, message: '',
            data: {
                range: notebooks,
                count: notebooks.length,
                page: 1,
                size: notebooks.length
            }
        }
    }
}
