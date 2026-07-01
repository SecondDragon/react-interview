// ❌ 反面教材：没有 qiankun 插件的 Vite 配置
// 普通 Vite Vue 项目直接这样写，在 qiankun 环境下会加载失败。

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  // 只使用了 vue 插件，没有 vite-plugin-qiankun。
  // 这意味着打包产物不会自动导出 qiankun 需要生命周期，
  // 父应用通过 HTML Entry 加载时，子应用无法被正确挂载和卸载。
  plugins: [vue()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  server: {
    // 没有配置 CORS 头。
    // 在开发环境下，父应用（如 localhost:5173）通过 fetch 请求子应用（localhost:8082）的 HTML 入口时，
    // 浏览器会触发跨域限制，导致 qiankun 无法获取子应用资源。
    port: 8082,
  },

  // 没有配置 build.lib / rollupOptions。
  // 生产环境打包出来的可能是 ES Module 格式，qiankun 沙箱执行时无法拿到子应用暴露的生命周期函数，
  // 从而出现 ReferenceError 或白屏。
});
