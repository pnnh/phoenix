import {atom} from 'jotai'
import {PSFileModel} from "@/atom/common/models/filesystem";

export const currentPathAtom = atom<PSFileModel>()


export const ViewTable = 'table'
export const ViewGrid = 'grid'

export const filesViewAtom = atom<string>(ViewTable)
