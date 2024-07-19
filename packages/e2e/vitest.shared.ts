import path from "path";

export const configShared = {
  test: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
    globalSetup: ["./globalSetup.ts"],
    globals: true,
  },
};
