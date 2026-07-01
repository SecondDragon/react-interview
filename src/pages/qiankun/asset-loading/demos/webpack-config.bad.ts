// ❌ 反面教材：publicPath 固定写死或缺失
// 这种配置在独立部署到域名根目录时没问题，但在子应用路径或 qiankun 中会出现资源 404。

import { resolve } from 'path';

export default {
  // 其他 webpack 配置省略...

  output: {
    // 没有设置 publicPath，webpack 默认使用 ""。
    // 这意味着所有动态加载的 chunk、图片、字体等 URL 都会以当前页面路径为 base 拼接。
    // 当子应用被 qiankun 嵌入到 /dashboard/sql 时，
    // 请求 ./js/chunk-xxx.js 会被解析为 /dashboard/sql/js/chunk-xxx.js，
    // 而不是子应用真实部署路径 /sql/js/chunk-xxx.js。
    path: resolve(__dirname, 'dist'),
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].chunk.js',
  },

  // 即使设置了 publicPath: '/'，也会假设子应用部署在域名根目录。
  // 在 /sql/ 路径下访问时，所有资源都会从 /js/xxx 请求，而不是 /sql/js/xxx。
  // publicPath: '/',
};
