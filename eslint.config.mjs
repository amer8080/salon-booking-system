import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  // Base JavaScript config
  js.configs.recommended,
  
  // TypeScript config
  ...tseslint.configs.recommended,
  
  // Global settings
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      // TypeScript specific
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      
      // General rules
      "no-console": "off",
      "prefer-const": "error",
      "no-var": "error"
    }
  },
  
  // Ignore patterns
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",
      "coverage/**",
      ".git/**",
      "src/generated/**"
    ]
  }
];
