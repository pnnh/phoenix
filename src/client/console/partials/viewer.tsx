import React from 'react'
import {useAtom, useAtomValue} from 'jotai'
import {ArticleContainer} from "@/client/components/console/note";
import './viewer.scss'
import {noteAtom} from "@/client/console/providers/notebook";
import {storeArticleToDatabase} from "@/client/personal/notes";
import {PSArticleModel} from "@/atom/common/models/article";

export function ArticleEditorArea() {
    const [selectedArticle, setSelectedArticle] = useAtom(noteAtom)
    if (!selectedArticle || !selectedArticle.current || !selectedArticle.current.body) {
        return <div>Loading</div>
    }
    const article = selectedArticle.current

    const changeArticle = (article: PSArticleModel) => {
        setSelectedArticle({
            current: article
        })
        storeArticleToDatabase(article).then(() => {
            console.log('ArticleStored', article.uid)
        })
    }

    return <div className={'editorArea'}>
        <div className={'titleCol'}>
            <input value={selectedArticle.current.title} onChange={(event) => {
                changeArticle({
                        ...selectedArticle.current!,
                        title: event.target.value
                    }
                )
            }}/>
        </div>
        <div className={'editCol'}>
            <textarea className={'editText'} value={article.body} onChange={(event) => {
                changeArticle({
                    ...selectedArticle.current!,
                    body: event.target.value
                })
            }}></textarea>
        </div>
        <div className={'previewCol'}>
            <ArticleContainer tocList={[]} header={article.header} body={article.body} assetsUrl={'xxx'}/>
        </div>
    </div>
}
