/**
 * Asset Hash の変更を無視するための Serializer
 * @see https://zenn.dev/junkor/articles/3674f576c6f4c0
 */
export const ignoreAssetHashSerializer = {
  test: (val: unknown) => typeof val === "string",
  serialize: (val: string) => {
    return `"${val.replace(/([A-Fa-f0-9]{64}.zip)/, "HASH-REPLACED.zip")}"`;
  },
};
