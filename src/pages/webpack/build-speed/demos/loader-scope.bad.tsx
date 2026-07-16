const webpackConfig = {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        // 没有 include/exclude — 整个项目+node_modules 全部过一遍 babel
      },
    ],
  },
};
