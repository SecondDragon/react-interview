// ✅ 最佳实践：按环境注入 publicPath

import { resolve } from 'path';

// 定义不同环境对应的 publicPath。
// 开发环境通常是 /，独立部署到 /sql/ 时用 /sql/，
// 如果通过 qiankun 加载，则由运行时 __webpack_public_path__ 覆盖。
const PUBLIC_PATH_MAP = {
  development: '/',
  test: '/sql-test/',
  production: '/sql/',
};

export default {
  // 其他 webpack 配置省略...

  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].chunk.js',

    // 静态 publicPath：根据构建环境变量注入。
    // 注意：这里只能处理 webpack 自己生成的 chunk 路径，
    // 对 Monaco Worker、CodeMirror mode 等"非 webpack 模块系统"加载的资源无效。
    publicPath: PUBLIC_PATH_MAP[process.env.NODE_ENV] || '/',
  },
};
