import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@zhimao/shared-types': fileURLToPath(
        new URL('../../packages/shared-types/src/index.ts', import.meta.url)
      )
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-ui': ['naive-ui'],
          'vendor-utils': ['axios', '@vueuse/core', 'dayjs']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['naive-ui', 'vue', 'pinia']
  }
})
