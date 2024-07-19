import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    exclude: ["./tsc-cache"],
    globals: true,
    env: {
      COMPANIES_TABLE_NAME: "dummy-companiesTableName",
      COMPANIES_TABLE_INDUSTRY_CREATED_AT_INDEX_NAME:
        "dummy-companiesTableIndustryCreatedAtIndexName",
    },
  },
});
