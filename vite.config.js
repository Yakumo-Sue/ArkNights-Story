import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Pages 项目站点使用仓库子路径；本地开发及其他生产构建仍从 / 提供。
export default defineConfig(({ mode }) => ({
  base: mode === 'github-pages' ? '/ArkNights-Story/' : '/',
  plugins: [react()],
  server: {
    port: 5188,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
  },
}))
