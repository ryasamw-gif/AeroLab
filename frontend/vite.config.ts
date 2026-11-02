import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/cesium/Build/Cesium/**',
          dest: 'cesium',
        },
      ],
    }),
  ],
  optimizeDeps: {
    include: ['cesium'],
  },
});
