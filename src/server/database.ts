import sqlite3 from 'sqlite3'
import {Database, open} from 'sqlite'
import {numberVersion} from "@/version";
import {serverConfig} from "@/server/config";
import fs from 'fs'

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

function ensureDirectoryExistence(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true});
    }
}

export async function openMainDatabase() {
    const cachePath = `${serverConfig.DATA_PATH}/cache`
    ensureDirectoryExistence(cachePath)
    const mainDatabasePath = `${cachePath}/polaris.${numberVersion}.db`
    return openDatabase(mainDatabasePath)
}
