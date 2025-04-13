import {atom} from 'jotai'
import {PSArticleModel} from "@/atom/common/models/article";
import {PSNotebookModel} from "@/atom/common/models/personal/notebook";
import {PSLibraryModel} from "@/atom/common/models/personal/library";

const directoryAtom = atom('')

const noteAtom = atom<{
    current: PSArticleModel | undefined,
}>({
    current: undefined,
})

const notebookAtom = atom<{
    models: PSNotebookModel[],
    current: PSNotebookModel | undefined,
}>({
    models: [],
    current: undefined,
})

const libraryAtom = atom<{
    models: PSLibraryModel[],
    current: PSLibraryModel | undefined,
}>({
    models: [],
    current: undefined,
})

export {noteAtom, directoryAtom, notebookAtom, libraryAtom}
