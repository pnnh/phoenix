import {PSChannelModel} from "@pnnh/polaris-business";

export interface PSArticleModel {
    uid: string
    urn: string
    name: string
    title: string
    header: string
    body: string
    create_time: string
    update_time: string
    creator: string
    keywords: string
    description: string
    cover: string
    discover: number
    owner: string
    channel: string | PSChannelModel
    partition: string
    path: string
}

export interface PSArticleFileModel {
    name: string
    path: string
    type: string
}