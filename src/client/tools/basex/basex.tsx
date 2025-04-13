import styles from './basex.module.scss'
import * as React from 'react';
import Button from '@mui/material/Button';
import {encodeBase32String, encodeBase58String, encodeBase64String} from "@/atom/common/utils/basex";
import {CommentsClient} from "@/atom/client/components/comments/comments";
import {useBrowserConfig} from "@/client/config/browser";

export default function BasexPage() {
    const [source, setSource] = React.useState('');
    const [output, setOutput] = React.useState('');

    const encodeBase64 = () => {
        if (!source) {
            return;
        }
        setOutput(encodeBase64String(source));
    }
    const encodeBase32 = () => {
        if (!source) {
            return;
        }
        setOutput(encodeBase32String(source));
    }
    const encodeBase58 = () => {
        if (!source) {
            return;
        }
        setOutput(encodeBase58String(source));
    }
    const browserConfig = useBrowserConfig()
    const portalUrl = browserConfig.PUBLIC_PORTAL_URL

    return <div className={styles.basexPage}>
        <h1>Base64系列编解码工具</h1>
        <textarea className={styles.sourceText} placeholder={'输入文本'} value={source}
                  onChange={(event) => setSource(event.target.value)}/>
        <div className={styles.toolButtons}>
            <Button variant="contained" size={'small'} onClick={encodeBase64}>Base64编码</Button>
            <Button variant="contained" size={'small'} onClick={encodeBase32}>Base32编码</Button>
            <Button variant="contained" size={'small'} onClick={encodeBase58}>Base58编码</Button>

        </div>
        <textarea className={styles.targetText} placeholder={'输出文本'} value={output} onChange={(event) =>
            setOutput(event.target.value)}/>
        <div className={styles.commentsClient}>
            <CommentsClient portalUrl={portalUrl} resource={'cc57d2a7-1729-2d4a-ba6a-def2b8ed4b16'}/>

        </div>
    </div>
}
