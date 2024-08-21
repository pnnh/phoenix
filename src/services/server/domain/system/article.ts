import fs from "node:fs";
import frontMatter from "front-matter";
import path from "path";
import {stringToMd5} from "@/utils/basex";
import {PSArticleFileModel, PSArticleModel} from "@/models/article";
import {bulkInsertOrUpdateArticles} from "@/services/server/domain/system/database";
import {openMainDatabase} from "@/services/server/database";
import {createPaginationByPage} from "@/utils/pagination";
import {PLSelectResult} from "@pnnh/polaris-business";
import ignore from 'ignore'
import {getType} from "@pnnh/atom";

const assetsIgnore = ignore().add(['.*', 'node_modules', 'dist', 'build', 'out', 'target', 'logs', 'logs/*', 'logs/**/*'])

export class SystemArticleService {
    systemDomain: string

    constructor(systemDomain: string) {
        this.systemDomain = systemDomain.replace('file://', '')
    }

    async #parseArticleInfo(channelName: string, articlePath: string) {
        const extName = path.extname(articlePath)
        const noteName = path.basename(articlePath, extName)

        const model: PSArticleModel = {
            discover: 0,
            create_time: "", creator: "",
            update_time: "",
            uid: stringToMd5(noteName),
            description: '',
            urn: '',
            name: noteName,
            title: noteName,
            header: 'markdown',
            body: '',
            keywords: '',
            cover: '',
            owner: '',
            channel: channelName,
            partition: '',
            path: ''
        }
        model.urn = noteName

        let metaFilePath
        if (extName === '.note') {
            metaFilePath = path.join(articlePath, 'index.md')
        } else if (extName === '.md') {
            metaFilePath = articlePath
        } else {
            throw new Error('不支持的文件类型')
        }
        if (!fs.existsSync(metaFilePath)) {
            return model
        }
        const statIndex = fs.statSync(metaFilePath)
        if (statIndex.isFile()) {
            model.create_time = statIndex.birthtime.toISOString()
            model.update_time = statIndex.mtime.toISOString()
            const metadataText = fs.readFileSync(metaFilePath, 'utf-8')
            const matter = frontMatter(metadataText)
            model.body = matter.body
            const metadata = matter.attributes as
                { image: string, description: string, title: string }
            if (metadata) {
                if (metadata.description) {
                    model.description = metadata.description
                }
                if (metadata.image) {
                    model.cover = `${metadata.image}`
                }
                if (metadata.title) {
                    model.title = metadata.title
                }
            }
        }
        return model
    }

    async #scanArticlesInChannel(channelPath: string) {
        const articles: PSArticleModel[] = []
        const channelName = path.basename(channelPath, '.chan')
        const files = fs.readdirSync(channelPath)
        for (const file of files) {
            const fullPath = path.join(channelPath, file)
            const stat = fs.statSync(fullPath)
            const extName = path.extname(file)
            if ((stat.isDirectory() && extName === '.note')) {
                const model = await this.#parseArticleInfo(channelName, fullPath)
                articles.push(model)
            }
        }
        return articles
    }

    async #scanArticles() {
        const articles: PSArticleModel[] = []
        const files = fs.readdirSync(this.systemDomain)
        for (const file of files) {
            const extName = path.extname(file)
            const channelPath = path.join(this.systemDomain, file)
            const stat = fs.statSync(channelPath)
            if (stat.isDirectory() && extName === '.chan') {
                const channelArticles = await this.#scanArticlesInChannel(channelPath)
                articles.push(...channelArticles)
            }
        }
        return articles
    }

    async selectArticlesFromDatabase(page: number, size: number): Promise<PLSelectResult<PSArticleModel>> {
        const db = await openMainDatabase()
        const {limit, offset} = createPaginationByPage(page, size)
        const result = await db.all<PSArticleModel[]>(
            `SELECT * FROM articles ORDER BY update_time DESC LIMIT :limit OFFSET :offset`, {
                ':limit': limit,
                ':offset': offset
            })
        const count = await db.get<{ total: number }>('SELECT COUNT(*) AS total FROM articles')
        if (!count) {
            throw new Error('查询count失败')
        }
        return {
            range: result,
            count: count.total,
            page: page,
            size: result.length
        }
    }

    async selectArticlesInChannel(channelName: string) {
        const channelPath = path.join(this.systemDomain, `${channelName}.chan`)
        const articles: PSArticleModel[] = await this.#scanArticlesInChannel(channelPath)
        return {
            range: articles,
            count: articles.length,
            page: 1,
            size: articles.length
        }
    }

    // 由定时任务调用
    async runtimeSyncArticles() {
        const articles: PSArticleModel[] = await this.#scanArticles()
        await bulkInsertOrUpdateArticles(articles)
    }

    async selectArticles() {
        const articles: PSArticleModel[] = await this.#scanArticles()
        return {
            range: articles,
            count: articles.length,
            page: 1,
            size: articles.length
        }
    }

    async getArticle(channelName: string, articleName: string) {
        const channelPath = `${channelName}.chan`
        let fullPath = path.join(this.systemDomain, channelPath, `${articleName}.note`)

        const stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
            return await this.#parseArticleInfo(channelName, fullPath)
        }
        fullPath = path.join(this.systemDomain, channelPath, `${articleName}.md`)
        if (fs.existsSync(fullPath)) {
            return await this.#parseArticleInfo(channelName, fullPath)
        }
        return undefined
    }

    async selectFiles(channelName: string, articleName: string, parentPath: string): Promise<PLSelectResult<PSArticleFileModel>> {
        if (!parentPath) {
            parentPath = 'assets'
        }
        const files = this.#scanFiles(channelName, articleName, parentPath)
        return {
            range: files,
            count: files.length,
            page: 1,
            size: files.length
        } as PLSelectResult<PSArticleFileModel>
    }

    #scanFiles(channelName: string, articleName: string, parentPath: string): PSArticleFileModel[] {
        const channelPath = `${channelName}.chan`
        const articlePath = `${articleName}.note`

        const fullPath = path.join(this.systemDomain, channelPath, articlePath, parentPath)
        if (!fs.existsSync(fullPath)) {
            return []
        }
        const files = fs.readdirSync(fullPath)
            .filter(file => !assetsIgnore.ignores(file))
            .map(file => {
                const stat = fs.statSync(path.join(fullPath, file))
                return {
                    name: file,
                    path: path.join(parentPath, file),
                    type: stat.isDirectory() ? 'directory' : 'file'
                } as PSArticleFileModel
            })
        return files
    }

    readAssets(channelName: string, articleName: string, filePath: string) {
        if (!filePath.startsWith('assets/')) {
            throw new Error('只允许读取assets文件')
        }
        const channelPath = `${channelName}.chan`
        const articlePath = `${articleName}.note`
        const fullPath = path.join(this.systemDomain, channelPath, articlePath, filePath)

        const stat = fs.statSync(fullPath)
        if (stat && stat.isFile() && stat.size < 4096000) {
            const mimeType = getType(fullPath)
            return {
                mime: mimeType,
                buffer: fs.readFileSync(fullPath)
            }
        }
        return undefined
    }
}
