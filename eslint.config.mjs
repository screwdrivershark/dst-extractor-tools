import globals from "globals";
import pluginJs from "@eslint/js";
import stylisticJs from '@stylistic/eslint-plugin-js';


export default [
  { files: ["**/*.js"], languageOptions: { sourceType: "script" }, plugins: { '@stylistic/js': stylisticJs }, rules: { '@stylistic/js/indent': ['error', 4], '@stylistic/js/no-trailing-spaces': 'error' } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
];