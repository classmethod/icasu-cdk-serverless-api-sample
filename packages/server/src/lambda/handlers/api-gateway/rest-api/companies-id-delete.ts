import { Request } from "express";
import * as zod from "zod";

import { CompanyServiceNotExistsError } from "@/lambda/domains/errors/company-service";
import { deleteCompanyService } from "@/lambda/domains/services/delete-company";
import * as HttpUtil from "@/utils/http-response";
import { logger } from "@/utils/logger";

/**
 * DELETE /companies/{id} のパスパラメータの zod スキーマ
 */
const pathScheme = zod.object({
  id: zod.string().uuid(),
});

/**
 * API パスパラメーター /companies/{id} の DELETE メソッドに対応するハンドラー関数
 * @param event イベント
 * @return 正常系：HTTP 204 NoContent レスポンス
 * @return 異常系：HTTP 400 BadRequest レスポンス (リクエストパラメータが不正な場合)
 * @return 異常系：HTTP 404 NotFound レスポンス (指定した ID の会社が存在しない場合)
 * @return 異常系：HTTP 500 InternalServerError レスポンス (サービス内部エラーが発生した場合)
 */
export const companiesIdDeleteHandler = async (
  event: Request,
): Promise<HttpUtil.HttpResponse> => {
  logger.info("event", { event });

  try {
    const path = pathScheme.safeParse(event.params);

    if (!path.success) {
      logger.info("Validation error.", path.error);

      return HttpUtil.badRequest();
    }

    const { id } = path.data;

    await deleteCompanyService(id);

    return HttpUtil.noContent();
  } catch (e) {
    if (e instanceof CompanyServiceNotExistsError) {
      logger.info("Not exists error.");

      return HttpUtil.notFound();
    }
    logger.error("error", e as Error);

    return HttpUtil.internalServerError();
  }
};
