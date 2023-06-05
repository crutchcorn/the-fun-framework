module.exports = {
    extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended"
    ],
    parser: "@typescript-eslint/parser",
    plugins: ["prettier"],
    rules: {
        "@typescript-eslint/no-empty-function": "off",
        "prettier/prettier": [
            "error",
            {
                endOfLine: "auto",
            },
        ]
    },
};
