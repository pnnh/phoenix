'use client'

import './table.scss'
import React from 'react'
import {channelName, PSArticleModel} from "@/atom/common/models/article";
import {PLSelectResult} from "@/atom/common/models/protocol";
import {calcPagination} from "@/atom/common/utils/pagination";
import {replaceSearchParams} from "@/atom/common/utils/query";
import {formatRfc3339} from "@/atom/common/utils/datetime";

export function ArticleTable(props: {
    result: PLSelectResult<PSArticleModel>,
    search: Record<string, string>
}) {
    const result = props.result
    const pagination = calcPagination(result.data.page, result.data.count, result.data.size)
    return <>
        <div className={'tableContainer'}>
            <table className={'articleTable'}>
                <thead>
                <tr>
                    <th className={'columnCheck'}>
                        <label>
                            <input type="checkbox" className="checkbox"/>
                        </label>
                    </th>
                    <th>文章</th>
                    <th>频道</th>
                    <th className={'columnTime'}>修改时间</th>
                </tr>
                </thead>
                <tbody>
                {
                    props.result.data.range.map((item, index) => {
                        return <ArticleTableRow key={index} model={item}/>
                    })
                }

                </tbody>
            </table>
        </div>
        <PaginationPartial pagination={pagination}
                           calcUrl={(page) => replaceSearchParams(props.search, 'page', page.toString())}/>

    </>
}

function ArticleTableRow({model}: { model: PSArticleModel }) {
    const updateTimeString = formatRfc3339(model.update_time)
    return <tr className={'articleRow'}>
        <td>
            <label>
                <input type="checkbox" className="checkbox"/>
            </label>
        </td>
        <td className={'articleTitle'}>
            {model.title}
        </td>
        <td className={'channelTitle'}>
            <a href={'/'}>{channelName(model.channel)}</a>
        </td>
        <td>
            {updateTimeString}
        </td>
    </tr>
}
