import React from 'react'
import {useEffect, useState} from 'react'
import {useAtom, useAtomValue} from 'jotai'
import {selectLibraries} from '@/client/personal/library'
import './library.scss'
import {libraryAtom} from "@/client/console/providers/notebook";

export function LibrarySelector() {
    const [notebookDropdown, setLibraryDropdown] = useState<boolean>(false)
    const [libraryState, setLibraryState] = useAtom(libraryAtom)

    useEffect(() => {
        selectLibraries().then(selectResult => {
            if (selectResult && selectResult.data.range && selectResult.data.range.length > 0) {
                setLibraryState({
                    models: selectResult.data.range,
                    current: selectResult.data.range[0]
                })
            }
        })
    }, [])

    if (!libraryState || !libraryState.models || libraryState.models.length <= 0 || !libraryState.current) {
        return <div>暂无笔记本</div>
    }
    const defaultLibrary = libraryState.current
    return <>
        <div className={'notebookSelector'}>
            <div className={'notebookTitle'}>
                <span>{defaultLibrary.name}</span>
                <img src='/icons/console/down-arrow.png' alt='选择笔记本' width={24} height={24}
                     onClick={() => setLibraryDropdown(!notebookDropdown)}></img>
            </div>
            <div className={'notebookAction'}>
                <img src='/icons/console/new-file-fill.png' alt='创建笔记' width={16} height={16}></img>
                <img src='/icons/console/new-folder-fill.png' alt='创建目录' width={16} height={16}></img>
            </div>
        </div>
        {
            notebookDropdown && <div className={'libraryContainer'}>
                <div className={'libraryList'}>
                    {
                        libraryState.models.map(item => {
                            return <div key={item.urn} className={'notebookItem'} onClick={() => {
                                setLibraryDropdown(!notebookDropdown)
                                setLibraryState({
                                    models: libraryState.models,
                                    current: item
                                })
                            }}>
                                <span className={'notebookName'}>{item.name}</span>
                            </div>
                        })
                    }
                </div>
                <div className={'newLibrary'}>新增资料库</div>
            </div>
        }
    </>
}
