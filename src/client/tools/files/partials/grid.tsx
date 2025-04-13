import {PLSelectResult} from "@/atom/common/models/protocol";
import {PSFileModel} from "@/atom/common/models/filesystem";
import React, {useEffect, useState} from "react";
import styles from './grid.module.scss'
import {isImageType} from "@/atom/common/utils/mime";

export function FilesGridView({filesState}: { filesState: PLSelectResult<PSFileModel> }) {
    return <div className={styles.fileGrid}>
        {
            filesState.data.range.map(item => {
                return <FileList key={item.Uid} item={item} filesResult={filesState} level={0}/>
            })
        }
    </div>
}

function FileList({item, filesResult, level}: {
    item: PSFileModel,
    filesResult: PLSelectResult<PSFileModel>, level: number
}) {
    return <div className={styles.fileCard}>
        {isImageType(item.Name) ? <ImageItem item={item}/> : item.Name}
    </div>
}

function ImageItem({item}: { item: PSFileModel }) {
    return <div className={styles.fileIcon}>
        <img src={item.Url} alt={item.Name}></img>
    </div>
}

