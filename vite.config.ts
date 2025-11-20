import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from 'vite-plugin-svgr';
import * as path from "node:path";

export default defineConfig({
  plugins: [react(), tsconfigPaths(), svgr()],
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
});
