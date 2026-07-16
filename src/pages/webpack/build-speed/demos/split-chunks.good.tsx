const webpackConfig = {
  optimization: {
    splitChunks: {
      chunks: 'all',               // 同步 + 异步 Chunk 都参与拆分
      minSize: 20000,              // 最小 20KB 才拆分
      minChunks: 2,                // 被 >= 2 个 Chunk 引用才提取
      cacheGroups: {
        vendor: {                   // 第三方库提取到 vendor
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: 10,
        },
        common: {                   // 业务公共模块提取到 common
          name: 'common',
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
