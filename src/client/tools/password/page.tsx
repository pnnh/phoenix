import styles from './page.module.scss';

import RandomPasswordPage from "@/atom/client/components/tools/password/random-password";
import {CommentsClient} from "@/atom/client/components/comments/comments";
import {useBrowserConfig} from "@/client/config/browser";

export function PasswordPage() {
    const browserConfig = useBrowserConfig()
    const portalUrl = browserConfig.PUBLIC_PORTAL_URL
    return <div className={styles.passwordPage}>
        <div className={styles.pageBody}>
            <RandomPasswordPage/>
            <CommentsClient portalUrl={portalUrl} resource={'c26b810d-92c6-5632-a546-3e509e585b96'}/>
        </div>
    </div>
}
