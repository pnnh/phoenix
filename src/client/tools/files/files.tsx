import styles from './files.module.scss'
import * as React from "react";
import {useState} from "react";
import {FilesContainer} from "./partials/files";
import {LocationBar} from "./partials/library";
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import GridOnIcon from '@mui/icons-material/GridOn';
import {useAtom} from "jotai";
import {filesViewAtom, ViewGrid, ViewTable} from "./partials/state";
import {PSArticleModel} from "@/atom/common/models/article";
import {BrowserDirectoryDrive, ISelectFilesOptions} from "@/client/drive";
import {CodeOk, PLSelectResult} from "@/atom/common/models/protocol";
import {PSFileModel} from "@/atom/common/models/filesystem";
import {IAppConfig} from "@/common/config";


export function FilesPage() {
    const [view, setView] = useAtom(filesViewAtom)

    return <div className={styles.imageFilesPage}>
        <div className={styles.leftArea}>
            <LocationBar></LocationBar>
        </div>
        <div className={styles.rightArea}>
            <div className={styles.rightToolbar}>
                <AccountTreeIcon onClick={() => setView(ViewTable)}/>
                <GridOnIcon onClick={() => setView(ViewGrid)}/>
            </div>
            <FilesContainer></FilesContainer>
        </div>
    </div>
}


export function storeArticle(article: PSArticleModel): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        // window.BridgeAPI.storeArticle(article).then(() => {
        //     resolve()
        // }).catch((error) => {
        //     reject(error)
        // })
    })
}


const fileDrive = new BrowserDirectoryDrive()

export function selectFiles(parentPath: string, options: ISelectFilesOptions | undefined): Promise<PLSelectResult<PSFileModel>> {
    const files = fileDrive.selectFiles(parentPath, options)

    return files;
}

export function getAppConfig(): Promise<IAppConfig> {
    return new Promise<IAppConfig>((resolve, reject) => {
        // window.BridgeAPI.getAppConfig().then((config) => {
        //     resolve(config)
        // }).catch((error) => {
        //     reject(error)
        // })
    })
}

export function selectLocation(parentPath: string): Promise<PLSelectResult<PSFileModel>> {
    return new Promise<PLSelectResult<PSFileModel>>((resolve, reject) => {
        const selectResult: PLSelectResult<PSFileModel> = {
            code: CodeOk,
            message: 'ok',
            data: {
                range: [],
                page: 0,
                size: 0,
                count: 0
            }
        }
        resolve(selectResult)
    })
}

export async function addLocation(): Promise<PSFileModel> {
    const rootDir = await fileDrive.openLocation()

    console.log('rootDir', rootDir)
    return rootDir
}
