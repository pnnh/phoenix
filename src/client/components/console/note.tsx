import React from "react";
import {TocItem} from "@/atom/common/models/toc";
import {ArticleComponent} from "@/atom/client/article";
import {BuildBodyHtml} from "@/atom/server/article";


export function ArticleContainer({tocList, header, body, assetsUrl}: {
    tocList: Array<TocItem>, header: string, body: unknown,
    assetsUrl: string
}) {
    return (
        <ArticleComponent>
            <BuildBodyHtml tocList={tocList} header={header} body={body}
                           assetsUrl={assetsUrl}/>
        </ArticleComponent>
    )
}
