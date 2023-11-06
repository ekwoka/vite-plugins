/// <reference types="vitest" />
import { defineConfig } from 'vite';
import WorkspaceSource from 'vite-plugin-access-workspace-source';
import dts from 'vite-plugin-dts';
import ExternalDeps from 'vite-plugin-external-deps';
import tsconfigPaths from 'vite-tsconfig-paths';

import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(__dirname),
  plugins: [
    dts({
      entryRoot: resolve(__dirname, 'src'),
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
    }),
    tsconfigPaths(),
    ExternalDeps(),
    WorkspaceSource(),
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
