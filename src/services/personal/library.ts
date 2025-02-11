
import fs from "node:fs";
import frontMatter from "front-matter";
import path from "path";
import {CodeOk, PLSelectResult} from "@/atom/common/models/protocol";
import {encodeBase64String} from "@/atom/common/utils/basex";
import {NPLibraryModel} from "@/atom/common/models/images/library";
import {resolvePath} from "@/atom/server/filesystem/path";

export class NPLibraryService {
    systemDomain: string

    constructor(systemDomain: string) {
        this.systemDomain = resolvePath(systemDomain)
    }

    async selectLibraries(): Promise<PLSelectResult<NPLibraryModel>> {
        const basePath = this.systemDomain
        const librarys: NPLibraryModel[] = []
        const files = fs.readdirSync(basePath)
        for (const file of files) {
            const stat = fs.statSync(path.join(basePath, file))
            if (stat.isDirectory() && file.endsWith('.imagelibrary')) {
                const libraryName = path.basename(file, path.extname(file))
                const uniqueName = encodeBase64String(file)
                const model: NPLibraryModel = {
                    create_time: "",
                    update_time: "",
                    urn: uniqueName,
                    name: libraryName,
                    description: '',
                    owner: ''
                }
                const metadataFile = path.join(basePath, file, 'metadata.md')
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
                librarys.push(model)
            }
        }
        return {
            code: CodeOk, message: '',
            data: {
                range: librarys,
                count: librarys.length,
                page: 1,
                size: librarys.length
            }
        }
    }
}
