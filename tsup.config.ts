import { defineConfig } from 'tsup';

// until fixed in tsup
// https://github.com/egoist/tsup/issues/1388#issuecomment-4181041935
export default defineConfig({
  dts: {
    compilerOptions: {
      ignoreDeprecations: '6.0',
    },
  },
});
