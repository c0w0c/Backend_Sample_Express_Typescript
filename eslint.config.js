import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";


export default defineConfig([
    {
        ignores: [
            "node_modules/**",
            "dist/**",
        ]
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        plugins: { js },
        extends: ["js/recommended"],
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },
    },
    tseslint.configs.recommended,
    {
        rules: {
            "max-len": ["error", {
                "code": 120,           // 每行最大字數
                "tabWidth": 4,         // tab 寬度
                "ignoreUrls": true,    // 忽略 URL
                "ignoreStrings": true, // 忽略字符串
                "ignoreTemplateLiterals": true, // 忽略模板字符串
                "ignoreRegExpLiterals": true, // 忽略正則表達式
            }],
        },
    },
]);
