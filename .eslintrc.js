module.exports = {
  extends: ["@classmethod"],
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
    sourceType: "module",
    ecmaVersion: 2015,
  },
  ignorePatterns: ["**/*.js"],
  parser: "@typescript-eslint/parser",
};
