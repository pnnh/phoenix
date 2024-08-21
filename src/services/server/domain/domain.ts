
import {RemoteDomain} from "@/services/server/domain/remote";
import parseUri, {URI} from "parse-uri";
import {serverConfig} from "@/services/server/config";

export interface IDomain {
    makeGet<T>(url: string): Promise<T>

    makePost<T>(url: string, params: unknown): Promise<T>
}

export function trySigninDomain(domainUrl: string): IDomain | undefined {
    // const viewerString = base58ToString(userToken)
    //const viewerUri = stringToUri(viewerString)
    //if (viewerUri.host === 'system') {
    //     const systemDomain = new SystemDomain(parseUri('http://localhost:3000'))
    //     domainMap.set(domainUrl, systemDomain)
    //     return systemDomain
    // } else if (viewerUri.host === 'remote') {
    let remoteUri: URI
        if (domainUrl.startsWith('file://')) {
            remoteUri = parseUri(`${serverConfig.NEXT_PUBLIC_SELF_URL}/restful`)
        } else {
            remoteUri = parseUri(domainUrl)
        }
        const systemDomain = new RemoteDomain(remoteUri)
        return systemDomain
    // }
}

export function signinDomain(): IDomain {
    const initialDomains = serverConfig.INITIAL_DOMAINS
    const domain = trySigninDomain(initialDomains)
    if (!domain) {
        throw new Error('domain not found')
    }
    return domain
}
