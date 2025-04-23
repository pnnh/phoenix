// 解析配置信息
import dotenv from "dotenv";
import {IBrowserConfig} from "@/common/config";

const result = dotenv.config({path: `.env.${process.env.RUN_MODE ?? 'development'}`})
if (result.error) {
    throw new Error(`解析配置出错: ${result.error}`)
}

interface IServerConfig {
    PUBLIC_SELF_URL: string,
    INITIAL_DOMAINS: string,
    PORT: number,
    DATA_PATH: string,
}

function parseConfig(): IServerConfig {
    const config = {
        PUBLIC_SELF_URL: process.env.PUBLIC_SELF_URL || '',
        INITIAL_DOMAINS: process.env.INITIAL_DOMAINS || '',
        PORT: parseInt(process.env.PORT || '7101'),
        DATA_PATH: process.env.DATA_PATH || '.',
    }
    if (!config.PUBLIC_SELF_URL) {
        throw new Error('PUBLIC_SELF_URL is required')
    }
    if (!config.INITIAL_DOMAINS) {
        throw new Error('INITIAL_DOMAINS is required')
    }
    if (!config.PORT) {
        throw new Error('PORT is required')
    }
    if (!config.DATA_PATH) {
        throw new Error('DATA_PATH is required')
    }

    return config
}

export function usePublicConfig(): IBrowserConfig {
    const selfUrl = process.env.PUBLIC_SELF_URL || ''
    if (!selfUrl) {
        throw new Error('PUBLIC_SELF_URL is required')
    }
    const turnstile = process.env.PUBLIC_TURNSTILE || ''
    if (!turnstile) {
        throw new Error('PUBLIC_TURNSTILE is required')
    }
    const portalUrl = process.env.PUBLIC_PORTAL_URL || ''
    if (!portalUrl) {
        throw new Error('PUBLIC_PORTAL_URL is required')
    }
    const runMode = process.env.RUN_MODE || 'development'
    if (!runMode) {
        throw new Error('RUN_MODE is required')
    }
    return {
        PUBLIC_SELF_URL: selfUrl,
        PUBLIC_MODE: runMode,
        PUBLIC_TURNSTILE: turnstile,
        PUBLIC_PORTAL_URL: portalUrl,
    }
}

export const serverConfig = parseConfig()


export function isDev() {
    return !process.env.RUN_MODE || process.env.RUN_MODE === 'development'
}

export function isTest() {
    return process.env.RUN_MODE === 'test'
}

export function isProd() {
    return process.env.RUN_MODE === 'production'
}
