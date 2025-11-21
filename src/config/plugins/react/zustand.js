import { attachComponentToApp } from '../../../services/transforms/react.js';

export default {
  meta: {
    label: 'Zustand',
    description: '轻量状态管理，提供计数器示例。',
    stability: 'beta',
  },
  pkg: { dependencies: { zustand: '^4.5.5' } },
  files: [
    { from: 'snippets/react/zustand-store.js', to: 'src/store/useCounter.js', whenExists: 'skip' },
    { from: 'snippets/react/zustand-component.jsx', to: 'src/components/ZustandCounter.jsx', whenExists: 'skip' },
  ],
  transforms: [
    {
      file: 'src/App.jsx',
      run: attachComponentToApp({
        componentName: 'ZustandCounter',
        importPath: './components/ZustandCounter',
      }),
    },
  ],
};