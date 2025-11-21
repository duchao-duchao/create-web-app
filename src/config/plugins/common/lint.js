export default {
  meta: {
    label: 'ESLint + Prettier',
    description: '启用基础 ESLint 规则与 Prettier 格式化。',
    stability: 'stable',
  },
  pkg: {
    devDependencies: {
      eslint: '^9.11.0',
      'eslint-config-prettier': '^9.1.0',
      prettier: '^3.3.3',
      'lint-staged': '^15.2.0',
      husky: '^9.0.11',
    },
    scripts: {
      prepare: 'husky install',
    },
    'lint-staged': {
      '*.{js,jsx,ts,tsx,vue}': [
        'eslint --fix --max-warnings=0',
        'prettier --write',
      ],
      '*.{css,scss,md,json}': ['prettier --write'],
    },
  },
  files: [
    { from: 'snippets/common/eslintrc.json', to: '.eslintrc.json', whenExists: 'skip' },
    { from: 'snippets/common/prettierrc.json', to: '.prettierrc', whenExists: 'skip' },
    { from: 'snippets/common/husky-pre-commit.sh', to: '.husky/pre-commit', whenExists: 'skip' },
  ],
};