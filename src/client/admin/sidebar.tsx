'use client'

import styles from './sidebar.module.scss'

export function ConsoleSidebar() {
    return <div className={styles.sidebar}>
        <div className={styles.sidebarItem}>
            <a
                href="/admin"
            >
                管理首页
            </a>
        </div>
        <div className={styles.sidebarItem}>
            <a
                href="/admin/channels"
            >
                频道列表
            </a>
        </div>
        <div className={styles.sidebarItem}>
            <a
                href="/admin/articles"
            >
                文章列表
            </a>
        </div>
    </div>
}
