// ✅ 最佳实践：webpack 配置绝对 publicPath
// 构建时统一把 chunk 路径前缀指向子应用真实部署路径或 CDN。
// 这样 JS 内部动态加载 import() 或按需 chunk 也会带上正确前缀。

import { resolve } from 'path';

export default {
  // 其他 webpack 配置省略...

  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].chunk.js',

    // 使用绝对路径或协议相对 URL，确保资源不依赖当前页面 base。
    publicPath: 'https://sql.example.com/sql/',
    // 或协议相对 URL：'//sql.example.com/sql/'
  },
};
