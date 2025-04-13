import React from "react";
import styles from './page.module.scss';
import './client'
import {CommentsClient} from "@/atom/client/components/comments/comments";
import {useBrowserConfig} from "@/client/config/browser";

export function HighlightPage() {
    const browserConfig = useBrowserConfig()
    const portalUrl = browserConfig.PUBLIC_PORTAL_URL
    return <div className={styles.highlightPage}>
        <div className={styles.pageBody}>
            <lightning-highlight/>
            <CommentsClient portalUrl={portalUrl} resource={'953703b3-c8ef-da01-bddd-4312720f4d61'}/>
        </div>
    </div>
}
