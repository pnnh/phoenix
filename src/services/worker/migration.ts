import { openDatabase, openMainDatabase } from "@/services/server/database";

export async function initDatabase() {
    const database = await openMainDatabase()
    await database.exec(`
        CREATE TABLE IF NOT EXISTS channels
        (
            uid TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            image TEXT,
            urn TEXT
        );
        CREATE TABLE IF NOT EXISTS articles
        (
            uid TEXT PRIMARY KEY,
            urn TEXT,
            title TEXT NOT NULL,
            header TEXT,
            body TEXT,
            create_time TEXT,
            update_time TEXT,
            creator TEXT,
            keywords TEXT,
            description TEXT,
            cover TEXT,
            discover INTEGER,
            owner TEXT,
            channel TEXT,
            partition TEXT,
            path TEXT
        );
    `)
}

