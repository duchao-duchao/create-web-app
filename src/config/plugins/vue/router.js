import { injectVueRouterIntoMain } from '../../../services/transforms/vue.js';

export default {
  meta: {
    label: 'Vue Router',
    description: '集成 vue-router 4，创建基础路由配置。',
    stability: 'stable',
  },
  pkg: {
    dependencies: { 'vue-router': '^4.4.3' },
  },
  files: [
    { from: 'snippets/vue/router.js', to: 'src/router.js', whenExists: 'skip' },
    { from: 'snippets/vue/home.vue', to: 'src/views/Home.vue', whenExists: 'skip' },
  ],
  transforms: [
    { file: 'src/main.js', run: injectVueRouterIntoMain },
  ],
};