const webpackConfig = {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          { loader: 'thread-loader', options: { workers: 3 } },
          'babel-loader',
        ],
      },
    ],
  },
};
