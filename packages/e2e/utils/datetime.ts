import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

/**
 * 現在日時のエポックミリ秒を取得する
 *
 * @returns {number}
 */
export const getCurrentUnixTimestampMillis = (): number => dayjs().valueOf();

/**
 * 現在日時の Dayjs オブジェクトを取得する
 *
 * @returns {Dayjs}
 */
export const getCurrentDayjs = (): Dayjs => dayjs();

/**
 * 指定日時が範囲内にあるかどうかを判定する
 *
 * @param {number} target 判定対象日時（エポックミリ秒）
 * @param {Dayjs} start 判定範囲開始日時
 * @param {Dayjs} end 判定範囲終了日時
 * @returns {Boolean}
 */
export const isUnixTimestampMillisBetween = (
  target: number,
  start: Dayjs,
  end: Dayjs,
): Boolean => dayjs(target).isBetween(start, end);

/**
 * 指定の ISO 8601 形式の日時文字列をエポックミリ秒に変換する
 *
 * @param {string} iso8601String - ISO 8601 形式の日時文字列
 * @returns {number} エポックミリ秒
 */
export const convertIso8601StringToUnixTimestampMillis = (
  iso8601String: string,
): number => dayjs(iso8601String).valueOf();
