import ESLintJS from "@eslint/js";
import ESLintTS from "typescript-eslint";
import UnoCSS from "@unocss/eslint-config/flat";
import Prettier from "eslint-config-prettier";

/** @type { import("eslint").Linter.Config } */
export default [
  ESLintJS.configs.recommended,
  ...ESLintTS.configs.recommendedTypeChecked,
  UnoCSS,
  Prettier,
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          caughtErrorsIgnorePattern: "^_$",
        }
      ],
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        project: ["tsconfig.json", "tsconfig.node.json", "tsconfig.cjs.json"]
      }
    }
  }, {
    ignores: [
      "dist/**/*",
      "node_modules/**/*"
    ]
  }, {
    files: [
      ".stylelintrc.cjs",
      "postcss.config.cjs"
    ], 
    languageOptions: {
      sourceType: "commonjs"
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  }
];

