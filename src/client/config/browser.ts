function useMetaEnv(): any {
    return (import.meta as any).env
}

export function useBrowserConfig() {
    console.debug('import.meta', import.meta)
    const rawEnv = useMetaEnv()

    let newEnv = {} as any
    for (const key in rawEnv) {
        console.debug('rawEnv Key', rawEnv[key])
        if (key.startsWith('VITE_')) {
            const newKey = key.replace('VITE_', '')
            newEnv[newKey] = rawEnv[key]
        }
    }
    console.debug('newEnv', newEnv)
    return newEnv
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
