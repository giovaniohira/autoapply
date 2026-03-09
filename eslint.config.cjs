"use strict";

const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const importPlugin = require("eslint-plugin-import");
const prettierConfig = require("eslint-config-prettier");

const nodeAndBrowserGlobals = {
	// Node
	process: "readonly",
	Buffer: "readonly",
	__dirname: "readonly",
	__filename: "readonly",
	module: "readonly",
	require: "readonly",
	// Browser / extension
	chrome: "readonly",
	document: "readonly",
	window: "readonly",
	setTimeout: "readonly",
	clearTimeout: "readonly",
	setInterval: "readonly",
	clearInterval: "readonly",
	console: "readonly",
	fetch: "readonly",
	MutationObserver: "readonly",
	Element: "readonly",
	HTMLElement: "readonly",
	HTMLInputElement: "readonly",
	HTMLTextAreaElement: "readonly",
	HTMLSelectElement: "readonly",
	HTMLButtonElement: "readonly",
	HTMLAnchorElement: "readonly",
	Event: "readonly",
	CSS: "readonly",
};

module.exports = [
	{
		ignores: [
			"**/dist/**",
			"**/node_modules/**",
			"**/build/**",
			"**/*.config.js",
			"**/*.config.cjs",
			"**/*.config.ts",
			".eslintrc.cjs",
			"**/scripts/**",
		],
	},
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
			},
			globals: nodeAndBrowserGlobals,
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
			import: importPlugin,
		},
		rules: {
			...tsPlugin.configs.recommended.rules,
			"import/order": "off",
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
			"@typescript-eslint/no-explicit-any": "warn",
			"no-undef": "off",
		},
	},
	prettierConfig,
];
