import sqlite3 from 'sqlite3'
import {Database, open} from 'sqlite'
import {numberVersion} from "@/version";
import {serverConfig} from "@/server/config";
import {MTPictureModel} from "@/atom/common/models/images/image";

const databaseMap: Map<string, Database<sqlite3.Database>> = new Map()

export async function openDatabase(filename: string): Promise<Database<sqlite3.Database>> {
    if (databaseMap.has(filename)) {
        return databaseMap.get(filename) as Database<sqlite3.Database>
    }
    const database = await open({
        filename: filename,
        driver: sqlite3.cached.Database
    })
    databaseMap.set(filename, database)
    return database
}

export async function openMainDatabase() {
    const mainDatabasePath = `${serverConfig.DATA_PATH}/polaris.${numberVersion}.db`
    return openDatabase(mainDatabasePath)
}

export async function bulkInsertOrUpdateArticles(images: MTPictureModel[]) {
    // const db = await openMainDatabase()
    // await db.exec('BEGIN TRANSACTION;')
    // const stmt = await db.prepare(`INSERT OR REPLACE
    //         INTO images ( urn, title, header, body, create_time, update_time, creator, keywords, description,
    //             cover, discover, owner, channel, partition, path)
    //         VALUES ( $urn, $title, $header, $body, $create_time, $update_time, $creator, $keywords, $description,
    //             $cover, $discover, $owner, $channel, $partition, $path);`)
    // for (const article of images) {
    //     await stmt.run({
    //         $urn: article.urn,
    //         $title: article.title,
    //         $create_time: article.create_time,
    //         $update_time: article.update_time,
    //         $description: article.description,
    //         $owner: article.owner,
    //     });
    // }
    // await stmt.finalize()
    // await db.exec('COMMIT;')
}
