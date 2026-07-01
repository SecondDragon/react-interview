// ✅ 最佳实践：使用 vite-plugin-qiankun 改造 Vite 配置

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';
import { resolve } from 'path';

export default defineConfig({
  // vite-plugin-qiankun 会在构建阶段注入 qiankun 子应用所需的生命周期与沙箱兼容代码。
  // 第一个参数 'micro-vue' 是子应用名称，需要与父应用 registerMicroApps 中的 name 保持一致。
  plugins: [
    vue(),
    qiankun('micro-vue', {
      // useDevMode 为 true 时，开发环境下直接使用 vite-plugin-qiankun 的 helper 暴露生命周期，
      // 不需要手动写 UMD/IIFE 包装。生产环境请勿开启，应使用 build.lib 输出标准格式。
      useDevMode: true,
    }),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  server: {
    port: 8082,
    // 开发环境下必须允许跨域，否则父应用无法通过 fetch 请求子应用资源。
    // 生产环境通常由 Nginx/CDN 统一配置，这里只针对本地开发。
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },

  // 生产环境建议配置：
  // build: {
  //   lib: {
  //     name: 'micro-vue',
  //     entry: 'src/main.js',
  //     formats: ['iife'],
  //     fileName: 'micro-vue',
  //   },
  //   rollupOptions: {
  //     // 避免把 vue 打进子应用，应由父应用或 CDN 提供公共依赖。
  //     external: ['vue'],
  //   },
  // },
});
