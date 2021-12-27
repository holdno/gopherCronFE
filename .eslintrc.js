module.exports = {
	env: {
		browser: true,
		es2021: true,
		'vue/setup-compiler-macros': true
	},
	extends: [
		'plugin:vue/vue3-recommended',
		'standard',
		'prettier'
	],
	parser: "vue-eslint-parser",
	parserOptions: {
		parser: '@typescript-eslint/parser',
		sourceType: 'module'
	},
	plugins: [
		'vue',
		'@typescript-eslint'
	],
	rules: {
	}
}
