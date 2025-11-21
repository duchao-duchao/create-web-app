import { wrapAppWithReduxProvider, attachComponentToApp } from '../../../services/transforms/react.js';

export default {
  meta: {
    label: 'Redux Toolkit',
    description: '注入 Redux Toolkit + react-redux，适合复杂状态场景。',
    stability: 'stable',
  },
  pkg: {
    dependencies: {
      '@reduxjs/toolkit': '^2.2.7',
      'react-redux': '^9.1.2',
    },
  },
  files: [
    { from: 'snippets/react/redux-store.js', to: 'src/store/store.js', whenExists: 'skip' },
    { from: 'snippets/react/redux-component.jsx', to: 'src/components/ReduxCounter.jsx', whenExists: 'skip' },
  ],
  transforms: [
    { file: 'src/main.jsx', run: wrapAppWithReduxProvider },
    {
      file: 'src/App.jsx',
      run: attachComponentToApp({
        componentName: 'ReduxCounter',
        importPath: './components/ReduxCounter',
      }),
    },
  ],
};