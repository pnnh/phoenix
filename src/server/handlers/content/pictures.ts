import {openMainDatabase} from "@/server/database";
import {Request, Response} from "express";
import {serverConfig} from "@/server/config";
import {SystemPictureService} from "@/server/images/picture";
import {CodeOk, CommonResult, PLSelectResult} from "@/atom/common/models/protocol";
import {createPaginationByPage} from "@/atom/common/utils/pagination";
import {MTPictureModel} from "@/atom/common/models/images/image";

// 查找单个文章
export async function findPicture(request: Request, response: Response) {
    const domainUrl = serverConfig.INITIAL_DOMAINS
    const articleService = new SystemPictureService(domainUrl)

    const {channel, article} = request.params;
    const result = await articleService.getImage(channel, article)
    if (!result) {
        return response.json({status: 404})
    }
    return response.json(result)
}

// 查找某个频道里的文章列表
export async function selectFromChannel(request: Request, response: Response) {
    const domainUrl = serverConfig.INITIAL_DOMAINS
    const articleService = new SystemPictureService(domainUrl)

    const {channel, article} = request.params;
    const result = await articleService.selectArticlesInChannel(channel as string)
    return response.json(result)
}

export async function selectPicturesFromDatabase(
    request: Request,
    response: Response,
) {
    const page = 1;
    const size = 10;
    const db = await openMainDatabase();
    const {limit, offset} = createPaginationByPage(page, size);
    const result = await db.all<MTPictureModel[]>(
        `SELECT * FROM images ORDER BY update_time DESC LIMIT :limit OFFSET :offset`,
        {
            ":limit": limit,
            ":offset": offset,
        },
    );
    const count = await db.get<{ total: number }>(
        "SELECT COUNT(*) AS total FROM images",
    );
    if (!count) {
        throw new Error("查询count失败");
    }

    const selectResult: PLSelectResult<MTPictureModel> = {
        code: CodeOk,
        message: "",
        data: {
            range: result,
            count: count.total,
            page: page,
            size: result.length,
        }
    };
    response.json(selectResult);
}

