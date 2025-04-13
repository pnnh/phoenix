import {IAppConfig} from "@/common/config";
import {PSFileModel} from "@/atom/common/models/filesystem";
import {PSArticleModel} from "@/atom/common/models/article";
import * as React from 'react';
import {LightningHighlightAttributes} from "@/client/tools/highlight/client";

declare module '*.module.css' {
    const classes: { [key: string]: string };
    export default classes;
}

declare module '*.module.scss' {
    const classes: { [key: string]: string };
    export default classes;
}

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "lightning-highlight": LightningHighlightAttributes;
        }
    }
}
declare global {
    interface Window {
        turnstile: any;
        turnstileSuccessCallback: any;
        BridgeAPI: {
            getAppConfig: () => Promise<IAppConfig>
            storeArticle: (article: PSArticleModel) => Promise<void>
            addLocation: () => Promise<PSFileModel>
            selectLocation: (parentPath: string) => Promise<PLSelectResult<PSFileModel>>
            getImageFileData: (fileUid: string) => Promise<ArrayBuffer>
            selectFiles: (parentPath: string, options: ISelectFilesOptions | undefined) => Promise<PLSelectResult<PSFileModel>>
        }
    }
}
