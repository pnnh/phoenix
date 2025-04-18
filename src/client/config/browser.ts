import {base58ToString, decodeBase64String} from "@/atom/common/utils/basex";
import {IBrowserConfig} from "@/common/config";

// 仅在本地开发时会使用
function loadConfigFromEnv(): IBrowserConfig {
    console.debug('import.meta', import.meta)
    const rawEnv = useMetaEnv()

    let newEnv = {} as any
    for (const key in rawEnv) {
        console.debug('rawEnv Key', rawEnv[key])
        if (key.startsWith('PUBLIC_')) {
            newEnv[key] = rawEnv[key]
        }
    }
    console.debug('newEnv', newEnv)
    return newEnv
}

export function useBrowserConfig(): IBrowserConfig {
    const configInput = window.document.getElementById('LGEnv') as HTMLInputElement
    if (!configInput) {
        console.warn('Browser config not found')
        return loadConfigFromEnv()
    }
    const base58Config = configInput.value
    if (!base58Config) {
        console.warn('Browser config is empty')
        return loadConfigFromEnv()
    }
    console.debug('Browser config', base58Config)
    const stringConfig = base58ToString(base58Config)
    const jsonConfig = JSON.parse(stringConfig)

    console.debug('jsonConfig', jsonConfig)
    return jsonConfig as IBrowserConfig
}

function useMetaEnv(): any {
    return (import.meta as any).env
}

export function useBaseUrl() {
    const rawEnv = useMetaEnv()
    const baseUrl = rawEnv.BASE_URL
    if (!baseUrl) {
        return ''
    }
    if (baseUrl.endsWith('/')) {
        return baseUrl.substring(0, baseUrl.length - 1)
    }
    return baseUrl
}

export function useBaseUrlWithSuffix(): string {
    const rawEnv = useMetaEnv()
    const baseUrl = rawEnv.BASE_URL
    if (!baseUrl) {
        return '/'
    }
    if (baseUrl.endsWith('/')) {
        return baseUrl
    }
    return baseUrl + '/'
}
