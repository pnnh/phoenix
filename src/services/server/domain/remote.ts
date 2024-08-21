import {IDomain} from "@/services/server/domain/domain";
import parseURI from "parse-uri"

export class RemoteDomain implements IDomain {
    userUri: parseURI.URI
    baseUrl: string

    constructor(userUri: parseURI.URI) {
        this.userUri = userUri

        this.baseUrl = userUri.source
    }

    async makeGet<T>(urlString: string) {
        urlString = this.baseUrl + urlString

        const response = await fetch(urlString, {
            credentials: 'include',
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        })
        return response.json()
    }

    async makePost<T>(url: string, params: unknown): Promise<T> {
        url = this.baseUrl + url

        const response = await fetch(url, {
            credentials: 'include',
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        })
        return response.json()
    }
}
