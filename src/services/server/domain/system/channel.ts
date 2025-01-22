
import fs from "node:fs";
import path from "path";
import {MTChannelModel, PSChannelMetadataModel, PSChannelModel} from "@/atom/common/models/channel";
import {decodeBase64String, encodeBase64String} from "@/atom/common/utils/basex";
import {getMimeType} from "@/atom/common/utils/mime";
import YAML from 'yaml'
import {openMainDatabase} from "@/services/server/database";
import {CodeNotFound, CodeOk, PLGetResult, PLSelectResult} from "@/atom/common/models/protocol";
import {createPaginationByPage} from "@/utils/pagination";
import {isValidUUID, uuidV4} from "@/atom/common/utils/uuid";
import {SystemArticleService} from "@/services/server/articles/article";
import {resolvePath} from "@/atom/server/filesystem/path";
import frontMatter from "front-matter";
import {PSArticleMetadataModel} from "@/atom/common/models/article";

export class SystemChannelService {
    systemDomain: string

    constructor(systemDomain: string) {
        this.systemDomain = resolvePath(systemDomain)
    }


    async #parseChannelInfo(channelFullPath: string): Promise<MTChannelModel | undefined> {
        const stat = fs.statSync(channelFullPath)
        const extName = path.extname(channelFullPath)
        if (!stat.isDirectory() || (extName !== '.chan' && extName !== '.channel')) {
            return undefined
        }
        const model: MTChannelModel = {
            create_time: "", creator: "", profile: "", update_time: "",
            image: '',
            name: path.basename(channelFullPath, extName),
            description: '',
            uid: ''
        }

        // 从metadata.md中解析元数据
        const indexFile = path.join(channelFullPath, 'metadata.md')
        let contentText: string | undefined
        if (fs.existsSync(indexFile)) {
            contentText = fs.readFileSync(indexFile, 'utf-8')
        } else {
            const readmeFile = path.join(channelFullPath, 'README.md')
            if (fs.existsSync(readmeFile)) {
                contentText = fs.readFileSync(readmeFile, 'utf-8')
            }
        }
        if (!contentText) {
            return undefined
        }
            const matter = frontMatter(contentText)
            const metadata = matter.attributes as PSChannelMetadataModel
            if (metadata) {
                const noteUid = metadata.uid || metadata.urn
                if (noteUid ) {
                    if (isValidUUID(noteUid)) {
                        model.uid = noteUid
                    } else {
                        throw new Error('urn格式错误')
                    }
                }
                if (metadata.description) {
                    model.description = metadata.description
                }
                if (metadata.image) {
                    model.image = metadata.image
                }
                if (metadata.name) {
                    model.name = metadata.name
                }
            }


        return model
    }

    async #scanChannels() {
        const basePath = this.systemDomain
        const channels: MTChannelModel[] = []
        const files = fs.readdirSync(basePath)
        const articleService = new SystemArticleService(this.systemDomain)
        for (const file of files) {
            const fullPath = path.join(basePath, file)
            const model = await this.#parseChannelInfo(fullPath)
            if (model && model.uid && model.name) {
                channels.push(model)
                await articleService.syncArticlesInChannel(model.uid, fullPath)
            }
        }
        return channels
    }

    async runSync() {
        const channels = await this.#scanChannels()
        await this.#bulkInsertOrUpdateArticles(channels)
    }

    async #bulkInsertOrUpdateArticles(channelModels: MTChannelModel[]) {
        const db = await openMainDatabase()
        await db.exec('BEGIN TRANSACTION;')
        const stmt = await db.prepare(`INSERT 
            INTO channels (urn, name, description, image)
            VALUES ($urn, $name, $description, $image)
            ON CONFLICT(urn) DO UPDATE SET
                name = excluded.name, 
                description = excluded.description, 
                image = excluded.image
            WHERE channels.urn = excluded.urn;`)
        for (const model of channelModels) {
            if ( !model.uid ) {
                console.log("channel invalid", model.name)
                continue
            }
            await stmt.run({
                $urn: model.uid ,
                $name: model.name,
                $description: model.description,
                $image: model.image,
            });
        }
        await stmt.finalize()
        await db.exec('COMMIT;')
    }


    async selectChannelsFromDatabase(page: number, size: number): Promise<PLSelectResult<PSChannelModel>> {

        const db = await openMainDatabase();
        const {limit, offset} = createPaginationByPage(page, size);

        let selectSql = `SELECT * FROM channels WHERE 1 = 1 `;
        let selectParams: any = {}

        const count = await db.get<{ total: number }>(
            `SELECT COUNT(*) AS total FROM (${selectSql}) as temp`, selectParams
        );
        if (!count) {
            throw new Error("查询count失败");
        }
        selectSql += ` LIMIT :limit OFFSET :offset`;
        selectParams[":limit"] = limit;
        selectParams[":offset"] = offset;
        const result = await db.all<PSChannelModel[]>(
            selectSql, selectParams,
        );
        return {
            code: CodeOk,
            message: '',
            data: {
                range: result,
                count: count.total,
                page: page,
                size: result.length
            }
        }
    }


    async findChannelFromDatabase(urn: string): Promise<PLGetResult<PSChannelModel | undefined>> {
        const db = await openMainDatabase()
        const result = await db.all<PSChannelModel[]>(
            `select * from channels where urn = :urn limit 1`, {
                ':urn': urn,
            })
        if (!result || result.length === 0) {
            return {
                code: CodeNotFound,
                message: '',
                data: undefined
            }
        }
        return {
            code: CodeOk,
            message: '',
            data:  result[0]
        }
    }



    async readAssets(channelUrn: string, fileUrn: string) {
        const channelPath = decodeBase64String(channelUrn)
        const assetsPath = decodeBase64String(fileUrn)
        const fullPath = path.join(this.systemDomain, channelPath, assetsPath)

        const stat = fs.statSync(fullPath)
        if (stat && stat.isFile() && stat.size < 4096000) {
            const mimeType = getMimeType(assetsPath)
            return {
                mime: mimeType,
                buffer: fs.readFileSync(fullPath)
            }
        }
        return undefined
    }
}
