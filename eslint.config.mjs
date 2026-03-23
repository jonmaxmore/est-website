import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // ═══ Code Quality Rules ═══
  {
    rules: {
      // File size limits: warn at 500, error at 1000
      "max-lines": ["warn", { max: 500, skipBlankLines: true, skipComments: true }],
      // Function size limits: warn at 80 lines
      "max-lines-per-function": ["warn", { max: 80, skipBlankLines: true, skipComments: true }],
      // Max parameters per function
      "max-params": ["warn", 5],
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**",
  ]),
]);

export default eslintConfig;
