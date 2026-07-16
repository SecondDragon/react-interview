// Webpack 5 — 内置持久化缓存，一行配置
const webpackConfig = {
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
};
