// ✅ loadMicroApp 动态更新 props
// registerMicroApps 的 props 无法动态更新，但 loadMicroApp 可以

import { loadMicroApp } from 'qiankun';

// 手动加载子应用
const app = loadMicroApp({
  name: 'app1',
  entry: '//localhost:8001',
  container: '#container',
  props: {
    token: 'initial-token',
    user: null,
  },
});

// 稍后登录成功，需要更新 token
app.update({
  props: {
    token: 'new-token-after-login',
    user: { id: 1, name: 'Alice' },
  },
});

// 再次更新
app.update({
  props: {
    token: 'refreshed-token',
  },
});

// 需要注意：update 只会将新 props 合并到旧 props 中
// 不会触发子应用重新 mount，而是通过 qiankun 内部机制通知子应用
