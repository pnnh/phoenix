import {PLSelectResult} from "@/atom/common/models/protocol";
import {PSFileModel} from "@/atom/common/models/filesystem";
import React, {useState} from "react";
import './table.scss'
import {selectFiles} from "@/client/tools/files/files";

export function FilesTreeView({filesState}: { filesState: PLSelectResult<PSFileModel> }) {
    return <div className={'fileListContainer'}>
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

    const [childrenFilesState, setChildrenFilesState] = useState<PLSelectResult<PSFileModel>>()

    return <div className={'fileList'}>
        <div className={'directorySelf'} style={{paddingLeft: level.toString() + 'rem'}}>
            <div className={'openIcon'}>
                {
                    item.IsDir &&
                    <img src={!childrenFilesState ? '/icons/console/triangle-right-fill.png' :
                        '/icons/console/triangle-down-fill.png'} alt={'open'}
                         onClick={() => {
                             if (!childrenFilesState) {
                                 selectFiles(item.Uid, undefined).then(selectResult => {
                                     setChildrenFilesState(selectResult)
                                 })
                             } else {
                                 setChildrenFilesState(undefined)
                             }
                         }}/>
                }
            </div>
            <div className={'directoryName'}>
                {item.Name}
            </div>
        </div>
        <div className={'childrenFileList'}>
            {childrenFilesState && childrenFilesState.data && childrenFilesState.data.range && childrenFilesState.data.range.length > 0 &&
                childrenFilesState.data.range.map(((item, index) => {
                    return <FileList key={item.Uid} item={item} filesResult={childrenFilesState}
                                     level={level + 1}/>
                }))
            }
        </div>
    </div>
}
