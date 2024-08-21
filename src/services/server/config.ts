// 解析配置信息
import dotenv from "dotenv";

const result = dotenv.config({path: `.env.${process.env.NODE_ENV ?? 'development'}`})
if (result.error) {
    throw new Error(`解析配置出错: ${result.error}`)
}

interface IServerConfig {
    ENV: string,
    NEXT_PUBLIC_SELF_URL: string,
    CLIENT_ID: string,
    CLIENT_SECRET: string,
    INITIAL_DOMAINS: string,
    PORT: number,
    WORKER_PORT: number,
    DATA_PATH: string,
}

function parseConfig(): IServerConfig {
    const config = {
        ENV: process.env.NODE_ENV || '',
        NEXT_PUBLIC_SELF_URL: process.env.NEXT_PUBLIC_SELF_URL || '',
        CLIENT_ID: process.env.CLIENT_ID || '',
        CLIENT_SECRET: process.env.CLIENT_SECRET || '',
        INITIAL_DOMAINS: process.env.INITIAL_DOMAINS || '',
        PORT: parseInt(process.env.PORT || '8100'),
        WORKER_PORT: parseInt(process.env.WORKER_PORT || '8101'),
        DATA_PATH: process.env.DATA_PATH || '.',
    }
    if (!config.ENV) {
        throw new Error('ENV is required')
    }
    if (!config.NEXT_PUBLIC_SELF_URL) {
        throw new Error('NEXT_PUBLIC_SELF_URL is required')
    }
    if (!config.CLIENT_ID) {
        throw new Error('CLIENT_ID is required')
    }
    if (!config.CLIENT_SECRET) {
        throw new Error('CLIENT_SECRET is required')
    }
    if (!config.INITIAL_DOMAINS) {
        throw new Error('INITIAL_DOMAINS is required')
    }
    if (!config.PORT) {
        throw new Error('PORT is required')
    }
    if (!config.WORKER_PORT) {
        throw new Error('WORKER_PORT is required')
    }
    if (!config.DATA_PATH) {
        throw new Error('DATA_PATH is required')
    }

    return config
}

export const serverConfig = parseConfig()

export function isDev() {
    return serverConfig.ENV === 'development'
}

export function isProd() {
    return serverConfig.ENV === 'production'
}
