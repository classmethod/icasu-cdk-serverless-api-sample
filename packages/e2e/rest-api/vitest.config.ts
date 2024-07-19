import { defineConfig } from "vitest/config";
import { configShared } from "../vitest.shared";

export default defineConfig({
  test: {
    ...configShared.test,
  },
});
