const webpackConfig = {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader', // 单线程处理，大量文件排队等待
      },
    ],
  },
};
