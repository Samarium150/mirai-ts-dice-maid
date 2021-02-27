module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: "./tsconfig.json",
        ecmaVersion: 2020
    },
    plugins: ["@typescript-eslint", "jest"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:jest/recommended"
    ],
    rules: {
        "indent": ["error", 4, {"SwitchCase": 1}],
        "semi": ["error", "always"],
        "linebreak-style": "off",
        "quotes": ["error", "double"]
    }
};
