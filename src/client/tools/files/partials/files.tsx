import React from 'react'
import {useEffect, useState} from 'react'
import styles from './files.module.scss'
import {PLSelectResult} from "@/atom/common/models/protocol";
import {PSFileModel} from "@/atom/common/models/filesystem";
import {useAtom} from "jotai/index";
import {currentPathAtom, filesViewAtom, ViewTable} from "@/client/tools/files/partials/state";
import {FilesTreeView} from "@/client/tools/files/partials/table";
import {FilesGridView} from "@/client/tools/files/partials/grid";
import {selectFiles} from "@/client/tools/files/files";

export function FilesContainer() {
    const [filesState, setFilesState] = useState<PLSelectResult<PSFileModel>>()
    const [currentPath, setCurrentPath] = useAtom(currentPathAtom)
    const [view, setView] = useAtom(filesViewAtom)

    useEffect(() => {
        selectFiles('', {}).then(selectResult => {
            setFilesState(selectResult)
        })
    }, [currentPath])

    if (!filesState || !filesState.data || !filesState.data.range || filesState.data.range.length <= 0) {
        return <div>Empty</div>
    }
    return <div className={styles.filesContainer}>
        {view === ViewTable ? <FilesTreeView filesState={filesState}/> : <FilesGridView filesState={filesState}/>}
    </div>
}
