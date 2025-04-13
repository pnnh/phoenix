import {CodeOk, PLSelectResult} from "@/atom/common/models/protocol";
import {PSFileModel} from "@/atom/common/models/filesystem";
import {uuidV4} from "@/atom/common/utils/uuid";

export interface ISelectFilesOptions {
    directory?: boolean
}

export interface IDirectoryDrive {
    openLocation(): Promise<PSFileModel>

    selectFiles: (parentPath: string, options: ISelectFilesOptions | undefined) => Promise<PLSelectResult<PSFileModel>>
    getImageFileData: (fileUid: string) => Promise<ArrayBuffer>
}

interface IFileHandle {
    kind: string
    name: string
    handle: any
    model: PSFileModel
}

export class BrowserDirectoryDrive implements IDirectoryDrive {
    #rootHandle: IFileHandle | undefined
    #filesMap: Map<string, IFileHandle> = new Map<string, IFileHandle>()

    async openLocation(): Promise<PSFileModel> {
        const directoryHandle = await (window as any).showDirectoryPicker({
            types: [
                {
                    description: 'Markdown files',
                    accept: {
                        'text/md': ['.md'],
                    },
                },
            ],
        })
        console.log('directoryHandle', directoryHandle)
        const rootFileModel = {
            Uid: '123',
            Title: '123',
            Name: directoryHandle.name,
            Keywords: '123',
            Description: '123',
            IsDir: true,
            IsHidden: false,
            IsIgnore: false,
            Size: 123,
            Url: '123',
            CreateTime: "",
            Handle: "",
            Path: "", UpdateTime: ""
        }
        this.#rootHandle = {
            kind: directoryHandle.kind,
            name: directoryHandle.name,
            handle: directoryHandle,
            model: rootFileModel
        }

        return rootFileModel
    }

    async #selectFilesFromHandle(fileHandle: any, currentPath: string, options: ISelectFilesOptions | undefined): Promise<PSFileModel[]> {
        const fileList: PSFileModel[] = []
        const filePath = currentPath + '/' + fileHandle.name
        for await (const item of fileHandle) {
            const [name, handle] = item
            const uid = uuidV4()
            const baseFileModel: PSFileModel = {
                Uid: uid,
                Title: name,
                Name: name,
                Keywords: '123',
                Description: '123',
                IsDir: false,
                IsHidden: false,
                IsIgnore: false,
                Size: 123,
                Url: '123', CreateTime: "", Handle: "", Path: filePath, UpdateTime: ""
            }
            if (handle.kind === 'file') {
                if (options?.directory) {
                    continue
                }
                const fileModel: PSFileModel = baseFileModel
                const fileHandle: IFileHandle = {
                    kind: handle.kind,
                    name: name,
                    handle: handle,
                    model: fileModel
                }
                const file = await handle.getFile()
                const content = new Blob([file], {type: 'image/png'})
                fileModel.Url = URL.createObjectURL(content)
                this.#filesMap.set(uid, fileHandle)
                fileList.push(fileModel)
            } else if (handle.kind === 'directory') {
                const uid = uuidV4()
                const fileModel: PSFileModel = baseFileModel
                fileModel.IsDir = true
                const fileHandle: IFileHandle = {
                    kind: handle.kind,
                    name: name,
                    handle: handle,
                    model: fileModel
                }
                this.#filesMap.set(uid, fileHandle)
                fileList.push(fileModel)
            }
        }

        return fileList
    }

    async #walkFileHandle(parentHandle: any, expectedPath: string, currentPath: string, options: ISelectFilesOptions | undefined): Promise<PSFileModel[]> {
        if (!expectedPath) {
            return this.#selectFilesFromHandle(parentHandle, currentPath, options)
        }
        for await (const item of parentHandle) {
            const [name, handle] = item
            if (handle.kind === 'directory') {
                currentPath = currentPath + '/' + name
                console.log('currentPath', currentPath)
                if (currentPath === expectedPath) {
                    return this.#selectFilesFromHandle(handle, currentPath, options)
                } else {
                    const fileList = await this.#walkFileHandle(handle, expectedPath, currentPath, options)
                    if (fileList.length > 0) {
                        return fileList
                    }
                }
            }
        }
        return []
    }

    async selectFiles(parentUid: string, options: ISelectFilesOptions | undefined): Promise<PLSelectResult<PSFileModel>> {

        if (!this.#rootHandle || !this.#rootHandle.handle) {
            return {
                code: CodeOk,
                message: 'ok',
                data: {
                    range: [],
                    page: 0,
                    size: 0,
                    count: 0
                }
            }
        }
        const rootHandle = this.#rootHandle?.handle
        if (!parentUid) {
            const fileList = await this.#selectFilesFromHandle(rootHandle, '', options)
            return {
                code: CodeOk,
                message: 'ok',
                data: {
                    range: fileList,
                    page: 0,
                    size: 0,
                    count: 0
                }
            }
        }
        const parentHandle = this.#filesMap.get(parentUid)
        if (!parentHandle) {
            return {
                code: CodeOk,
                message: 'ok',
                data: {
                    range: [],
                    page: 0,
                    size: 0,
                    count: 0
                }
            }
        }

        const fileList = await this.#selectFilesFromHandle(parentHandle.handle, parentHandle.model.Path, options)

        console.log('entries', fileList)

        return {
            code: CodeOk,
            message: 'ok',
            data: {
                range: fileList,
                page: 0,
                size: 0,
                count: 0
            }
        }
    }

    async getImageFileData(fileUid: string): Promise<ArrayBuffer> {
        const fileItem = this.#filesMap.get(fileUid)
        if (fileItem) {
            const file = await fileItem.handle.getFile()
            const content = new Blob([file], {type: 'image/png'})
            const url = URL.createObjectURL(content)
            fileItem.model.Url = url
            console.log('fileItem', fileItem, file, content)
            return await file.arrayBuffer()
        }

        return Promise.reject('file not found')
    }

}
