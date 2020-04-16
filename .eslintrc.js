module.exports = {
    extends: ['airbnb', 'plugin:@typescript-eslint/recommended', 'prettier'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier'],
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
            typescript: {},
        },
    },
    rules: {
        'prettier/prettier': 'error',
        'no-console': 0,
        '@typescript-eslint/indent': [2, 2],
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/no-non-null-assertion': 0,
        'react/prop-types': 0,
        'react/jsx-props-no-spreading': 0,
        'react/jsx-wrap-multilines': 0,
        'react/jsx-filename-extension': [2, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
        'import/extensions': 0,
        'import/no-named-as-default': 0,
        'import/no-extraneous-dependencies': [2, { devDependencies: ['**/test.tsx', '**/test.ts'] }],
        'import/order': 0
    },
    env: {
        browser: true,
        jest: true
    },
    globals: {
        cy: true
    },
    ignorePatterns: [
        "node_modules",
        "build"
    ]
};
