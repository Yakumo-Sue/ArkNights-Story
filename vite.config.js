import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 单页应用：所有页面路由由 React Router 处理。
// 生产部署时需把未知路径回退到 index.html（见 README 的部署说明）。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5188,
    strictPort: false,
  },
  build: {
    outDir: 'docs',
    chunkSizeWarningLimit: 1200,
  },
})
