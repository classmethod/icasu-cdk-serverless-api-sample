import dayjs from "dayjs";

/**
 * ICASU_NOTE: JavaScript 標準の Date オブジェクトはフォーマットや日時操作が特殊なため、日付ライブラリは次のいずれかを採用することを推奨します。状況に応じて cdate や Temporal などの使用を検討してください。
 *
 *             Luxon: 北米で高シェアの日時ライブラリ
 *             @see https://moment.github.io/luxon
 *
 *             Day.js: 日本を含むアジアで高シェアの日時ライブラリ
 *             @see https://day.js.org/
 *
 *             本プロジェクトでは Day.js を採用しています。
 */

/**
 * 現在日時の エポックミリ秒を取得する
 * @return エポックミリ秒
 */
export const getCurrentUnixTimestampMillis = (): number => dayjs().valueOf();

/**
 * 指定の ISO 8601 形式の日時文字列を エポックミリ秒に変換する
 * @param iso8601String - ISO 8601 形式の日時文字列
 * @return エポックミリ秒
 */
export const convertIso8601StringToUnixTimestampMillis = (
  iso8601String: string,
): number => dayjs(iso8601String).valueOf();
