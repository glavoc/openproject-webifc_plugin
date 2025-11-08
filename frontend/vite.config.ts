import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: '../app/assets/javascripts/openproject_webifc_plugin',
    lib: {
      entry: path.resolve(__dirname, 'src/viewer.ts'),
      name: 'WebifcViewer',
      fileName: 'viewer',
      formats: ['es']
    },
    rollupOptions: {
      output: {
        assetFileNames: 'viewer.[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
});
