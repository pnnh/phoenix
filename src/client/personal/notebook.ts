import {clientSigninDomain} from "@/client/domain";
import {PLSelectResult} from "@/atom/common/models/protocol";
import {PSNotebookModel} from "@/atom/common/models/personal/notebook";

export async function selectNotebooks(libraryUrn: string, queryString: string = '') {
    const domain = await clientSigninDomain()
    const url = `/personal/libraries/${libraryUrn}/notebooks?${queryString}`
    const result = await domain.makeGet<PLSelectResult<PSNotebookModel>>(url)
    return result
}
