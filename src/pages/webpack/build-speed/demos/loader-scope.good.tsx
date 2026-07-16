const path = require('path');

const webpackConfig = {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: path.resolve(__dirname, 'src'), // 只处理 src/
        exclude: /node_modules/,                  // 明确跳过依赖
        use: 'babel-loader',
      },
    ],
  },
};
