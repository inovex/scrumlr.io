import {defineConfig, type ViteUserConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from 'vite-plugin-svgr';
import * as path from "node:path";

export default defineConfig({
  plugins: [react(), tsconfigPaths(), svgr({
    svgrOptions: {
      exportType: 'default',
      ref: true,
      svgo: false,
      titleProp: true,
    },
    include: '**/*.svg',
  })] as ViteUserConfig['plugins'],
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [path.resolve(__dirname, 'src'),
        ]

      },
    },
  },
  build: {
    outDir: 'build',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
    coverage: {
      provider: 'v8', // This uses @vitest/coverage-v8
      reporter: ['text', 'json', 'html'],
    },
  },
});
