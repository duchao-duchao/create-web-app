import { injectVuexIntoMain } from '../../../services/transforms/vue.js';

export default {
  meta: {
    label: 'Vuex 4',
    description: '集成 Vuex 状态管理，生成基础 store 并挂载。',
    stability: 'stable',
  },
  pkg: {
    dependencies: { vuex: '^4.1.0' },
  },
  files: [
    { from: 'snippets/vue/vuex-store.js', to: 'src/store/index.js', whenExists: 'skip' },
  ],
  transforms: [
    { file: 'src/main.js', run: injectVuexIntoMain },
  ],
};