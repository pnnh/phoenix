import React from 'react'
import {MarkdownEditorForm} from '../partials/edit'
import {clientMakeHttpPut} from '@/client/http'
import {PSArticleModel} from "@/atom/common/models/article";

export default function Page() {
    const newModel: PSArticleModel = {
        creator: "",
        uid: '',
        title: '',
        header: 'markdown',
        body: '',
        create_time: '',
        update_time: '',
        keywords: '',
        description: '',
        cover: '',
        discover: 0,
        channel: '',
        partition: '',
        path: '',
        owner: ''
    }

    return <MarkdownEditorForm model={newModel} onSubmit={async (newModel) => {
        const result = await clientMakeHttpPut<PSArticleModel>('/restful/article', newModel)
        console.debug('result', result)
        if (result && result.uid) {
            // router.replace('/console/articles')
            // router.refresh()
        }
    }}/>
}
