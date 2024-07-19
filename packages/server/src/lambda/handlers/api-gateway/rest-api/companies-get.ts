import { Request } from "express";
import * as zod from "zod";

import { queryCompaniesService } from "@/lambda/domains/services/query-companies";
import { scanCompaniesService } from "@/lambda/domains/services/scan-companies";
import * as HttpUtil from "@/utils/http-response";
import { logger } from "@/utils/logger";

/**
 * GET /companies のクエリパラメータの zod スキーマ
 */
const queryScheme = zod
  .object({
    industry: zod.union([
      zod.literal("IT"),
      zod.literal("Manufacturing"),
      zod.literal("Finance"),
      zod.literal("Medical"),
      zod.literal("Other"),
      zod.undefined(),
    ]),
    created_after: zod
      .union([zod.string(), zod.undefined()])
      .transform((val) => (val === undefined ? undefined : Number(val)))
      .refine((num) => num === undefined || num > 0, {
        message: "正の数値を指定してください",
      })
      .refine((num) => num === undefined || num.toString().length === 13, {
        message: "13桁の整数（エポックミリ秒）を指定してください",
      }),
    created_before: zod
      .union([zod.string(), zod.undefined()])
      .transform((val) => (val === undefined ? undefined : Number(val)))
      .refine((num) => num === undefined || num > 0, {
        message: "正の数値を指定してください",
      })
      .refine((num) => num === undefined || num.toString().length === 13, {
        message: "13桁の整数（エポックミリ秒）を指定してください",
      }),
    max_items: zod
      .union([zod.string(), zod.undefined()])
      .default("3")
      .refine((val) => val === undefined || /^(?!0)\d+$/.test(val), {
        message: "正の整数の文字列を指定してください",
      })
      .transform((val) => (val === undefined ? undefined : Number(val)))
      .refine((num) => num === undefined || num <= 5, {
        message: "1以上5以下の数値を指定してください",
      }),
  })
  .refine(
    (data) => {
      if ((data.created_after || data.created_before) && !data.industry) {
        return false;
      }
      return true;
    },
    {
      message:
        "created_after または created_before を指定している場合は、industry を指定してください",
    },
  )
  .refine(
    (data) => {
      if (
        data.created_after &&
        data.created_before &&
        data.created_after >= data.created_before
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "created_after および created_before の両方を指定している場合は、created_after が created_before より小さくなるようにしてください",
    },
  );

/**
 * API パスパラメーター /companies の GET メソッドに対応するハンドラー関数
 * @param event イベント
 * @return 正常系：取得した会社の配列を本文に含む HTTP 200 OK レスポンス
 * @return 異常系：HTTP 400 BadRequest レスポンス (リクエストパラメータが不正な場合)
 * @return 異常系：HTTP 500 InternalServerError レスポンス (サービス内部エラーが発生した場合)
 */
export const companiesGetHandler = async (
  event: Request,
): Promise<HttpUtil.HttpResponse> => {
  logger.info("event", { event });

  try {
    const query = queryScheme.safeParse(event.query);

    if (!query.success) {
      logger.info("Validation error.", query.error);

      return HttpUtil.badRequest();
    }

    const { industry, created_after, created_before, max_items } = query.data;

    let companies;

    if (industry) {
      companies = await queryCompaniesService(
        industry,
        created_after,
        created_before,
        max_items,
      );
    } else {
      companies = await scanCompaniesService({ maxItems: max_items }); // TODO: オブジェクト引数ではなく、queryCompaniesService と同様に位置引数で渡すように修正。引数の情報は JSDoc で補完する
    }

    return HttpUtil.ok(JSON.stringify(companies), {
      "Content-Type": "application/json",
    });
  } catch (e) {
    logger.error("error", e as Error);

    return HttpUtil.internalServerError();
  }
};
