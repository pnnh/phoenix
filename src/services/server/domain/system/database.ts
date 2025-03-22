import {openMainDatabase} from "@/services/server/database";
import {Database} from "sqlite";
import {PSArticleModel} from "@/quark/atom/common/models/article";
import {encodeBase64String} from "@/quark/atom/common/utils/basex";

export async function bulkInsertOrUpdateArticles(articles: PSArticleModel[]) {
    const db = await openMainDatabase()
    await db.exec('BEGIN TRANSACTION;')
    const stmt = await db.prepare(`INSERT 
            INTO articles (urn, title, header, body, create_time, update_time, creator, keywords, description, 
                cover, owner, channel, partition, path)
            VALUES ($urn, $title, $header, $body, $create_time, $update_time, $creator, $keywords, $description, 
                $cover, $owner, $channel, $partition, $path)
            ON CONFLICT(urn) DO UPDATE SET
                title = excluded.title,
                header = excluded.header,
                body = excluded.body,
                create_time = excluded.create_time,
                update_time = excluded.update_time,
                creator = excluded.creator,
                keywords = excluded.keywords,
                description = excluded.description,
                cover = excluded.cover,
                owner = excluded.owner,
                channel = excluded.channel,
                partition = excluded.partition,
                path = excluded.path
            WHERE articles.urn = excluded.urn;`)
    for (const article of articles) {
        const channelUrn = article.channel as string
        if (!article.uid || !article.title || !article.body) {
            console.log("article invalid", article.title)
            continue
        }
        await stmt.run({
            $urn: article.uid,
            $title: article.title,
            $header: article.header,
            $body: article.body,
            $create_time: article.create_time,
            $update_time: article.update_time,
            $creator: article.creator,
            $keywords: article.keywords,
            $description: article.description,
            $cover: article.cover,
            $owner: article.owner,
            $channel: channelUrn,
            $partition: article.partition,
        });
        await bulkInsertOrUpdateTags(db, channelUrn, article.uid, article.keywords)
    }
    await stmt.finalize()
    await db.exec('COMMIT;')
}


export async function bulkInsertOrUpdateTags(db: Database, channelUrn: string, articleUrn: string, tags: string) {
    const stmt = await db.prepare(`INSERT 
            INTO tags (urn, name, description, article, create_time, update_time, channel)
            VALUES ($urn, $name, $description, $article, $create_time, $update_time, $channel)
            ON CONFLICT(urn) DO UPDATE SET
                name = excluded.name,
                description = excluded.description,
                article = excluded.article,
                update_time = excluded.update_time,
                channel = excluded.channel
            WHERE tags.urn = excluded.urn;`)
    const now = new Date().toISOString()
    const tagList = tags.trim().split(',')
    for (let tag of tagList) {
        tag = tag.trim()
        if (!tag) {
            continue
        }
        await stmt.run({
            $urn: encodeBase64String(tag),
            $name: tag,
            $description: '',
            $article: articleUrn,
            $create_time: now,
            $update_time: now,
            $channel: channelUrn
        });
    }
    await stmt.finalize()
}

