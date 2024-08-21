import {PSArticleModel} from "@/models/article";
import {openMainDatabase} from "@/services/server/database";

export async function bulkInsertOrUpdateArticles(articles: PSArticleModel[]) {
    const db = await openMainDatabase()
    await db.exec('BEGIN TRANSACTION;')
    const stmt = await db.prepare(`INSERT OR REPLACE
            INTO articles (uid, urn, title, header, body, create_time, update_time, creator, keywords, description, 
                cover, discover, owner, channel, partition, path)
            VALUES ($uid, $urn, $title, $header, $body, $create_time, $update_time, $creator, $keywords, $description, 
                $cover, $discover, $owner, $channel, $partition, $path);`)
    for (const article of articles) {
        await stmt.run({
            $uid: article.uid,
            $urn: article.urn,
            $title: article.title,
            $header: article.header,
            $body: article.body,
            $create_time: article.create_time,
            $update_time: article.update_time,
            $creator: article.creator,
            $keywords: article.keywords,
            $description: article.description,
            $cover: article.cover,
            $discover: article.discover,
            $owner: article.owner,
            $channel: article.channel,
            $partition: article.partition,
        });
    }
    await stmt.finalize()
    await db.exec('COMMIT;')
}
