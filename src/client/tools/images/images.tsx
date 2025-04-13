import * as React from "react";
import styles from './images.module.scss';

export function ImagesPage() {
    return <div className={styles.imagesPage}>
        <div className={styles.leftArea}>
            <div className={styles.navItem}>主目录</div>
        </div>
        <div className={styles.rightArea}>
            <div className={styles.imageGrid}>
                <ImageCard/>
                <ImageCard/>
                <ImageCard/>
                <ImageCard/>
                <ImageCard/>
                <ImageCard/>
            </div>
        </div>
    </div>
}

function ImageCard() {
    return <div className={styles.imageCard}>
        <div className={styles.imageIcon}>
            <img src={'/images/tools/files.png'}></img>
        </div>
        <div className={styles.imageName}></div>
    </div>
}

