import {RemoteDomain} from "@/server/domain/remote";
import parseUri, {URI} from "parse-uri";
import {serverConfig} from "@/server/config";

export interface IDomain {
    makeGet<T>(url: string): Promise<T>

    makePost<T>(url: string, params: unknown): Promise<T>
}

