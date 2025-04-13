import * as React from "react";
import styles from './welcome.module.scss'
import {useNavigate} from "react-router-dom";
import {useBaseUrl} from "@/client/config/browser";

export function WelcomePage() {
    const navigate = useNavigate();
    const baseUrl = useBaseUrl()
    return <div className={styles.welcomePage}>
        <h1>欢迎使用</h1>
        <div className={styles.toolGrid}>
            <div className={styles.toolCard}>
                <div className={styles.toolIcon}>
                    <img src={`${baseUrl}/images/tools/files.png`}></img>
                </div>
                <div>文件管理</div>
            </div>
            {/*<div className={styles.toolCard}>*/}
            {/*    <div className={styles.toolIcon}>*/}
            {/*        <img src={`${baseUrl}/images/tools/notes.png`}></img>*/}
            {/*    </div>*/}
            {/*    <div className={styles.toolName}>笔记管理</div>*/}
            {/*</div>*/}
            {/*<div className={styles.toolCard} onClick={() => navigate("/images")}>*/}
            {/*    <div className={styles.toolIcon}>*/}
            {/*        <a href={`${baseUrl}/images`}>*/}
            {/*            <img src={`${baseUrl}/images/tools/images.png`}></img>*/}
            {/*        </a>*/}
            {/*    </div>*/}
            {/*    <div className={styles.toolName}>图片管理</div>*/}
            {/*</div>*/}
            <div className={styles.toolCard}>
                <div className={styles.toolIcon}>
                    <a href={`${baseUrl}/password`}>
                        <img src={`${baseUrl}/images/tools/password.png`}></img>
                    </a>
                </div>
                <div className={styles.toolName}>密码生成</div>
            </div>
            <div className={styles.toolCard}>
                <div className={styles.toolIcon}>
                    <a href={`${baseUrl}/uuid`}>
                        <img src={`${baseUrl}/images/tools/uuid.png`}></img>
                    </a>
                </div>
                <div className={styles.toolName}>UUID生成</div>
            </div>
            <div className={styles.toolCard}>
                <div className={styles.toolIcon}>
                    <a href={`${baseUrl}/basex`}>
                        <img src={`${baseUrl}/images/tools/uuid.png`}></img>
                    </a>
                </div>
                <div className={styles.toolName}>Base64系列工具</div>
            </div>
            <div className={styles.toolCard}>
                <div className={styles.toolIcon}>
                    <a href={`${baseUrl}/highlight`}>
                        <img src={`${baseUrl}/images/tools/uuid.png`}></img>
                    </a>
                </div>
                <div className={styles.toolName}>源代码高亮</div>
            </div>
        </div>
    </div>
}

