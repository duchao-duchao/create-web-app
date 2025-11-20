import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.js'],
  format: ['esm'],
  splitting: false,
  clean: true,
  dts: false,
  target: 'node18',
});
