import { defineConfig } from 'tsdown';

export default defineConfig({
  format: ['commonjs'],
  platform: 'neutral',
  fixedExtension: false,
  sourcemap: true,
  dts: true,
});
