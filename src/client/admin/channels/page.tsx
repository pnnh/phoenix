import styles from './page.module.scss'
import React from 'react'
import {Toolbar} from './partials/toolbar'
import {ChannelTable} from './partials/table'
import {clientMakeHttpGet} from '@/client/http'
import {PLSelectResult} from "@/atom/common/models/protocol";
import {PSChannelModel} from "@/atom/common/models/channel";

export default async function Page() {
    const url = '/admin/channels/?' + 'page=1&size=20'
    const result = await clientMakeHttpGet<PLSelectResult<PSChannelModel>>(url)

    return <div>
        <div className={styles.toolBar}>
            <Toolbar/>
        </div>
        <div>
            <ChannelTable data={result}/>
        </div>
    </div>
}
