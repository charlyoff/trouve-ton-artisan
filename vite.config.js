import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), {
    name: 'local-figma-capture', apply: 'serve',
    transformIndexHtml() {
      if (process.env.FIGMA_CAPTURE !== '1') return [];
      return [{ tag: 'script', attrs: { src: 'https://mcp.figma.com/mcp/html-to-design/capture.js', async: true }, injectTo: 'head' }];
    },
  }],
  server: { host: '127.0.0.1', port: 5173, strictPort: true, proxy: { '/api': 'http://127.0.0.1:3000' } },
  css: { preprocessorOptions: { scss: { silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'] } } },
});
