import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api/steam-charts': {
        target: 'https://api.steampowered.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/steam-charts/, ''),
      },
      '/api/steam-store': {
        target: 'https://store.steampowered.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/steam-store/, ''),
      },
    },
  },
});
