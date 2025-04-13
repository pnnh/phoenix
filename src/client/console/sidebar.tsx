import React from 'react'
import {LibrarySelector} from "@/client/console/partials/library";
import {NotebookList} from "@/client/console/partials/notebook";
import './sidebar.scss'

export function NotebookBar() {
    return <div className={'stylesSidebar'}>
        <LibrarySelector></LibrarySelector>
        <NotebookList/>
    </div>
}
