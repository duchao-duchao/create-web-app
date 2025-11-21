import { injectPiniaIntoMain } from '../../../services/transforms/vue.js';

export default {
  meta: {
    label: 'Pinia',
    description: '集成 Pinia 状态管理，在入口中挂载。',
    stability: 'stable',
  },
  pkg: {
    dependencies: { pinia: '^2.2.4' },
  },
  transforms: [
    { file: 'src/main.js', run: injectPiniaIntoMain },
  ],
};