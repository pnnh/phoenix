import styles from './page.module.scss'
import React from 'react'
import {Toolbar} from './partials/toolbar'
import {ArticleTable} from './partials/table'
import {PLSelectResult} from "@/atom/common/models/protocol";
import {PSArticleModel} from "@/atom/common/models/article";

export default async function Page({searchParams}: {
    searchParams: Record<string, string>
}) {
    console.debug('searchParams', searchParams)
    const url = '/admin/articles?' + 'page=1&size=20'
    const result = await serverMakeHttpGetV2<PLSelectResult<PSArticleModel>>(url)

    return <div>
        <div className={styles.titleBar}>
            <Toolbar/>
        </div>
        <div className={styles.pageBody}>
            <ArticleTable result={result} search={searchParams}/>
        </div>
    </div>
}
