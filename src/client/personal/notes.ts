import {clientSigninDomain} from "@/client/domain";
import {openIndexedDB} from "@/client/database";
import {PLSelectResult} from "@/atom/common/models/protocol";
import {PSArticleModel} from "@/atom/common/models/article";
import {storeArticle} from "@/client/tools/files/files";

export async function selectNotes(libraryUrn: string, notebookUrn: string, queryString: string = '') {
    const domain = await clientSigninDomain()
    const url = `/personal/libraries/${libraryUrn}/notebooks/${notebookUrn}/notes?${queryString}`
    return await domain.makeGet<PLSelectResult<PSArticleModel>>(url)
}

interface DatabaseArticleItem {
    article: PSArticleModel;
    timestamp: number;
}

export async function storeArticleToDatabase(article: PSArticleModel) {
    const db = await openIndexedDB('articles', 1);
    const tx = db.transaction('keyVal', 'readwrite');
    const store = tx.objectStore('keyVal');

    const dbKey = 'article-' + article.uid;
    const nowValue = await store.get(dbKey) as DatabaseArticleItem;
    const nowDate = new Date();

    const newValue: DatabaseArticleItem = {
        article: article,
        timestamp: nowDate.getTime(),
    };
    await store.put(newValue, dbKey);
    await tx.done;
    if (nowValue) {
        if (nowValue.timestamp <= nowDate.getTime() - 1000) {
            // 每一秒向服务端同步一次文章状态
            await storeArticle(article)
        }
    }
}
