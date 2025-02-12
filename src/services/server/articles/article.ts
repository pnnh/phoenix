import {bulkInsertOrUpdateArticles} from "@/services/server/domain/system/database";
import {openMainDatabase} from "@/services/server/database";
import {createPaginationByPage} from "@/utils/pagination";
import ignore from 'ignore'
import {decodeBase64String,} from "@/atom/common/utils/basex";
import {MTNoteModel, PSArticleFileModel, PSArticleMetadataModel} from "@/atom/common/models/article";
import {CodeNotFound, CodeOk, PLGetResult, PLSelectResult} from "@/atom/common/models/protocol";
import {getMimeType} from "@/atom/common/utils/mime";
import path from "path";
import fs from "node:fs";
import {PSArticleModel} from "@/atom/common/models/article";
import {encodeBase64String} from "@/atom/common/utils/basex";
import frontMatter from "front-matter";
import {isValidUUID, uuidV4} from "@/atom/common/utils/uuid";
import {resolvePath} from "@/atom/server/filesystem/path";

const assetsIgnore = ignore().add(['.*', 'node_modules', 'dist', 'build', 'out', 'target', 'logs', 'logs/*', 'logs/**/*'])

export async function fillNoteMetadata(noteDirectoryFullPath: string, model: MTNoteModel) {
    let contentFile = path.join(noteDirectoryFullPath, 'index.md')
    let contentText: string | undefined
    if (fs.existsSync(contentFile)) {
        contentText = fs.readFileSync(contentFile, 'utf-8')
    } else {
        contentFile = path.join(noteDirectoryFullPath, 'README.md')
        if (fs.existsSync(contentFile)) {
            contentText = fs.readFileSync(contentFile, 'utf-8')
        }
    }
    if (!contentFile || !contentText) {
        return
    }
    const statIndex = fs.statSync(contentFile)
    model.create_time = statIndex.birthtime.toISOString()
    model.update_time = statIndex.mtime.toISOString()
    const matter = frontMatter(contentText)
    model.body = matter.body
    const metadata = matter.attributes as PSArticleMetadataModel

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
        model.cover = metadata.image
    }
    if (metadata.title) {
        model.title = metadata.title
    }
}

export class SystemArticleService {
    systemDomain: string

    constructor(systemDomain: string) {
        this.systemDomain = resolvePath(systemDomain)
    }

    async #parseArticleInfo(channelUrn: string, articleFullPath: string): Promise<MTNoteModel | undefined> {
        const extName = path.extname(articleFullPath)
        const noteName = path.basename(articleFullPath, extName)

        const model: MTNoteModel = {
            uid: '', discover: 0,
            create_time: "", creator: "",
            update_time: "",
            description: '',
            title: noteName,
            header: 'markdown',
            body: '',
            keywords: '',
            cover: '',
            owner: '',
            channel: channelUrn,
            partition: '',
            path: ''
        }

        await fillNoteMetadata(articleFullPath, model)

        console.log('======', model.title, model.uid)
        if (!model.uid || !model.title) {
            return undefined
        }
        return model
    }

    async syncArticlesInChannel(channelUrn: string, channelFullPath: string) {
        const articles: MTNoteModel[] = []
        const files = fs.readdirSync(channelFullPath)
        for (const file of files) {

                const fullPath = path.join(channelFullPath, file)
            const stat = fs.statSync(fullPath)
            const extName = path.extname(file)
            if ((stat.isDirectory() && extName === '.note')) {
                const model = await this.#parseArticleInfo(channelUrn, fullPath)
                if (model) {
                    articles.push(model)
                }
            }
        }
        await bulkInsertOrUpdateArticles(articles)
        return articles
    }

    async selectArticlesFromDatabase(page: number, size: number, sort: string, keyword: string,
                                     filter: string, channel: string): Promise<PLSelectResult<PSArticleModel>> {

        const db = await openMainDatabase();
        const {limit, offset} = createPaginationByPage(page, size);

        let selectSql = `SELECT *, urn as uid FROM articles WHERE 1 = 1 `;
        let selectParams: any = {}

        if (keyword) {
            selectSql += ` AND (title LIKE '%' || :keyword || '%' OR description LIKE '%' || :keyword || '%' OR body LIKE '%' || :keyword || '%') `;
            selectParams[":keyword"] = keyword;
        }
        if (channel) {
            selectSql += ` AND channel = :channel `;
            selectParams[":channel"] = channel;
        }
        if (filter) {
            if (filter === 'year') {
                selectSql += ` AND strftime('%Y', update_time) = strftime('%Y', 'now') `;
            } else if (filter === 'month') {
                selectSql += ` AND strftime('%Y-%m', update_time) = strftime('%Y-%m', 'now') `;
            }
        }

        const count = await db.get<{ total: number }>(
            `SELECT COUNT(*) AS total FROM (${selectSql}) as temp`, selectParams
        );
        if (!count) {
            throw new Error("查询count失败");
        }
        selectSql += ` ORDER BY ${sort === 'latest' ? 'update_time' : 'discover'} DESC LIMIT :limit OFFSET :offset`;
        selectParams[":limit"] = limit;
        selectParams[":offset"] = offset;
        const result = await db.all<PSArticleModel[]>(
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

    async getArticle(channelUrn: string, articleUrn: string) {
        const channelPath = decodeBase64String(channelUrn)
        const articlePath = decodeBase64String(articleUrn)
        let fullPath = path.join(this.systemDomain, channelPath, articlePath)

        const stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
            return await this.#parseArticleInfo(channelPath, fullPath)
        }
        fullPath = path.join(this.systemDomain, channelPath, `${articleUrn}.md`)
        if (fs.existsSync(fullPath)) {
            return await this.#parseArticleInfo(channelPath, fullPath)
        }
        return undefined
    }

    async findArticleFromDatabase(urn: string): Promise<PLGetResult<PSArticleModel | undefined>> {
        const db = await openMainDatabase()
        const result = await db.all<PSArticleModel[]>(
            `select *, urn as uid from articles where urn = :urn limit 1`, {
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
            data: result.length > 0 ? result[0] : undefined
        }
    }

    async selectFiles(channelUrn: string, articleUrn: string, parentUrn: string): Promise<PLSelectResult<PSArticleFileModel>> {

        const files = this.#scanFiles(channelUrn, articleUrn, parentUrn)
        return {
            code: CodeOk,
            message: '',
            data: {
                range: files,
                count: files.length,
                page: 1,
                size: files.length
            }
        }
    }

    #scanFiles(channelUrn: string, articleUrn: string, parentUrn: string): PSArticleFileModel[] {
        const channelPath = decodeBase64String(channelUrn)
        const articlePath = decodeBase64String(articleUrn)
        const parentPath = parentUrn ? decodeBase64String(parentUrn) : ''

        const parentFullPath = path.join(this.systemDomain, channelPath, articlePath, parentPath)
        if (!fs.existsSync(parentFullPath)) {
            return []
        }
        const files = fs.readdirSync(parentFullPath)
        const resultFiles = files
            .filter(file => !assetsIgnore.ignores(file))
            .map(file => {
                const assetFullPath = path.join(parentFullPath, file)
                const stat = fs.statSync(assetFullPath)
                const assetRelativePath = path.join(parentPath, file)
                const assetUrn = encodeBase64String(assetRelativePath)
                return {
                    name: file,
                    path: path.join(parentPath, file),
                    urn: assetUrn,
                    type: stat.isDirectory() ? 'directory' : 'file',
                } as PSArticleFileModel
            })
        return resultFiles
    }

    readAssets(channelUrn: string, articleUrn: string, assetsUrn: string) {
        const channelPath = decodeBase64String(channelUrn)
        const articlePath = decodeBase64String(articleUrn)
        const assetsPath = decodeBase64String(assetsUrn)
        const fullPath = path.join(this.systemDomain, channelPath, articlePath, assetsPath)

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
