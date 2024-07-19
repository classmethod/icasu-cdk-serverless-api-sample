import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Vitest v1 導入時に発生するエラーのワークアラウンド
    // @see https://github.com/aws/aws-cdk/issues/20873#issuecomment-1847529085
    pool: "forks",
  },
});
