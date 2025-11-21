import { injectReactRouterIntoMain } from '../../../services/transforms/react.js';

export default {
  meta: {
    label: 'React Router',
    description: '集成 react-router-dom 6，支持浏览器路由。',
    stability: 'stable',
  },
  pkg: {
    dependencies: { 'react-router-dom': '^6.25.1' },
  },
  files: [
    { from: 'snippets/react/router.jsx', to: 'src/router.jsx', whenExists: 'skip' },
  ],
  transforms: [
    { file: 'src/main.jsx', run: injectReactRouterIntoMain },
  ],
};