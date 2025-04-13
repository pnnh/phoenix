import {ToolBody} from "@/atom/client/components/tools/uuid/tool";
import {CommentsClient} from "@/atom/client/components/comments/comments";
import styles from './page.module.scss'
import {useBrowserConfig} from "@/client/config/browser";

export function UuidPage() {
    const browserConfig = useBrowserConfig()
    const portalUrl = browserConfig.PUBLIC_PORTAL_URL
    return <div className={styles.uuidPage}>
        <div className={styles.pageBody}>
            <ToolBody lang={'zh'}/>
            <CommentsClient portalUrl={portalUrl} resource={'1efce644-be3b-6380-8e9f-473511aecbe1'}/>
        </div>
    </div>
}
