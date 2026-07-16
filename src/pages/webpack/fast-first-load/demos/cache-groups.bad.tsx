// 所有第三方库打包到一起
// 更新 echarts → vendor 整体 hash 变化 → react 缓存也失效
const webpackConfig = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: 10,
        },
      },
    },
  },
};
