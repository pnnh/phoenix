
import fs from "node:fs";
import path from "path";
import {PSChannelMetadataModel, PSChannelModel} from "@/atom/common/models/channel";
import {decodeBase64String, encodeBase64String} from "@/atom/common/utils/basex";
import {getMimeType} from "@/atom/common/utils/mime";
import YAML from 'yaml'
import {openMainDatabase} from "@/services/server/database";
import {CodeNotFound, CodeOk, PLGetResult, PLSelectResult} from "@/atom/common/models/protocol";
import {createPaginationByPage} from "@/utils/pagination";
import {isValidUUID, uuidV4} from "@/atom/common/utils/uuid";
import {SystemArticleService} from "@/services/server/articles/article";

export class SystemChannelService {
    systemDomain: string

    constructor(systemDomain: string) {
        this.systemDomain = systemDomain.replace('file://', '')
    }


    async #parseChannelInfo(channelFullPath: string): Promise<PSChannelModel | undefined> {
        const stat = fs.statSync(channelFullPath)
        const extName = path.extname(channelFullPath)
        if (!stat.isDirectory() || (extName !== '.chan' && extName !== '.channel')) {
            return undefined
        }
        const model: PSChannelModel = {
            create_time: "", creator: "", profile: "", update_time: "",
            image: '',
            name: path.basename(channelFullPath, extName),
            description: '',
            urn: ''
        }
        const metadataFile = path.join(channelFullPath, 'metadata.yaml')
        if (fs.existsSync(metadataFile)) {
            const statIndex = fs.statSync(metadataFile)
            model.create_time = statIndex.birthtime.toISOString()
            model.update_time = statIndex.mtime.toISOString()
            const metadataText = fs.readFileSync(metadataFile, 'utf-8')
            const metadata = YAML.parse(metadataText) as
                PSChannelMetadataModel
            if (metadata) {
                if (metadata.urn ) {
                    if (isValidUUID(metadata.urn)) {
                        model.urn = metadata.urn
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
        } else {
            model.urn = uuidV4()
            const metadataModel = {
                urn: model.urn,
                name: model.name,
                description: model.description,
                image: ''
            } as PSChannelMetadataModel
            const metadataContent = YAML.stringify(metadataModel)
            fs.writeFileSync(metadataFile, metadataContent)
        }
        return model
    }

    async #scanChannels() {
        const basePath = this.systemDomain
        const channels: PSChannelModel[] = []
        const files = fs.readdirSync(basePath)
        const articleService = new SystemArticleService(this.systemDomain)
        for (const file of files) {
            const fullPath = path.join(basePath, file)
            const model = await this.#parseChannelInfo(fullPath)
            if (model) {
                channels.push(model)
                await articleService.syncArticlesInChannel(model.urn, fullPath)
            }
        }
        return channels
    }

    async runSync() {
        const channels = await this.#scanChannels()
        await this.#bulkInsertOrUpdateArticles(channels)
    }

    async #bulkInsertOrUpdateArticles(channelModels: PSChannelModel[]) {
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
            if (!model.urn ) {
                console.log("channel invalid", model.name)
                continue
            }
            await stmt.run({
                $urn: model.urn,
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
