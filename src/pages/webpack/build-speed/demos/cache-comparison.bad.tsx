// Webpack 4 — 每个编译全部重来，无缓存
const webpackConfig = {
  // 没有任何 cache 配置
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
      },
    ],
  },
};
