import { Request } from "express";
import * as zod from "zod";

import { createCompanyService } from "@/lambda/domains/services/create-company";
import { CompaniesTableAlreadyExistsError } from "@/lambda/infrastructures/errors/companies-table";
import * as HttpUtil from "@/utils/http-response";
import { logger } from "@/utils/logger";

/**
 * POST /companies のリクエストボディの zod スキーマ
 */
const eventBodySchema = zod.object({
  name: zod.string(),
});

/**
 * API パスパラメーター /companies の POST メソッドに対応するハンドラー関数
 * @param event イベント
 * @return 正常系：作成した会社の Location をヘッダーにを含む HTTP 201 Created レスポンス
 * @return 異常系：HTTP 400 BadRequest レスポンス (リクエストパラメータが不正な場合)
 * @return 異常系：HTTP 409 Conflict レスポンス (作成を試みた ID の会社が既に存在する場合)
 * @return 異常系：HTTP 500 InternalServerError レスポンス (サービス内部エラーが発生した場合)
 */
export const companiesIdPostHandler = async (
  event: Request,
): Promise<HttpUtil.HttpResponse> => {
  logger.info("event", { event });

  try {
    if (!event.body) {
      logger.info("Validation error.", { body: event.body });

      return HttpUtil.badRequest();
    }

    const body = eventBodySchema.safeParse(event.body);

    if (!body.success) {
      logger.info("Validation error.", body.error);

      return HttpUtil.badRequest();
    }

    const { name } = body.data;

    const createdCompany = await createCompanyService({ name: name });

    return HttpUtil.created(JSON.stringify(createdCompany), {
      Location: `/companies/${createdCompany.id}`,
      "Content-Type": "application/json",
    });
  } catch (e) {
    logger.error("error", e as Error);

    if (e instanceof CompaniesTableAlreadyExistsError) {
      return HttpUtil.conflict();
    }

    return HttpUtil.internalServerError();
  }
};
