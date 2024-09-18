import {PSArticleModel} from "@pnnh/polaris-business";
import {openMainDatabase} from "@/services/server/database";

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
        await stmt.run({
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
            $owner: article.owner,
            $channel: article.channel,
            $partition: article.partition,
        });
    }
    await stmt.finalize()
    await db.exec('COMMIT;')
}
