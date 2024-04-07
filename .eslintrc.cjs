module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "@unocss",
    "plugin:prettier/recommended"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["tsconfig.json", "tsconfig.node.json"],
    tsconfigRootDir: __dirname
  },
  ignorePatterns: [".eslintrc.cjs", "postcss.config.cjs"],
  rules: {
    "@typescript-eslint/consistent-type-imports": "error"
  }
};
