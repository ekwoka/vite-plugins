/// <reference types="vitest" />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url)).toString(),
);

export default defineConfig({
  root: resolve(__dirname),
  plugins: [
    dts({
      entryRoot: resolve(__dirname, 'src'),
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
    }),
    tsconfigPaths(),
    {
      name: 'externalize deps',
      apply: 'build',
      enforce: 'pre',
      resolveId(id) {
        if (
          id.startsWith('node:') ||
          import.meta.resolve?.(id).includes('node_modules')
        ) {
          return { id, external: true };
        }
        return null;
      },
    },
  ],
  define: {
    'import.meta.vitest': 'undefined',
    'import.meta.DEBUG': 'false',
  },
  build: {
    target: 'esnext',
    outDir: resolve(__dirname, 'dist'),
    lib: {
      entry: resolve(__dirname, 'src', 'index.ts'),
      formats: ['es'],
    },
    minify: false,
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: ({ name: fileName }) => {
          return `${fileName}.js`;
        },
        sourcemap: true,
      },
    },
  },
  test: {
    globals: true,
    include: ['./**/*{.spec,.test}.{ts,tsx}'],
    includeSource: ['./**/*.{ts,tsx}'],
    reporters: ['dot'],
    deps: {},
    useAtomics: true,
    passWithNoTests: true,
  },
});
