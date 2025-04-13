import {Outlet} from "react-router";
import styles from './layout.module.scss'
import {useBaseUrl} from "@/client/config/browser";

export default function ToolsLayout() {
    const baseUrl = useBaseUrl()
    return <div>
        <div className={styles.navToolbar}>
            <a href={`${baseUrl}`}>
                <img src={`${baseUrl}/images/logo.png`} alt='logo'/>
            </a>
        </div>
        <div className={styles.outletContainer}>
            <Outlet/>

        </div>
    </div>
}
