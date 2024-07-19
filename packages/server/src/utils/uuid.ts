import * as Uuid from "uuid";

/**
 * UUID v4 の生成
 * @return UUID v4
 */
export const generateUuidV4 = (): string => Uuid.v4();
