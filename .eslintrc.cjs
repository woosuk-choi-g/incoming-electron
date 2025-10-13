module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // any 타입 사용을 허용
    '@typescript-eslint/no-explicit-any': 'off',
    // 사용하지 않는 변수 허용
    '@typescript-eslint/no-unused-vars': 'off',
    'no-unused-vars': 'off',
    // 콘솔 사용 허용
    'no-console': 'off',
  },
};
