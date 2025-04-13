import {clientSigninDomain} from "@/client/domain";
import {PLSelectResult} from "@/atom/common/models/protocol";
import {PSLibraryModel} from "@/atom/common/models/personal/library";

export async function selectLibraries() {
    const domain = await clientSigninDomain()
    const pageSize = 64
    const url = '/personal/libraries?' + `page=1&size=${pageSize}`
    return await domain.makeGet<PLSelectResult<PSLibraryModel>>(url)
}
