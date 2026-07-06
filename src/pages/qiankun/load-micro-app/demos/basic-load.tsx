// ✅ 基本加载：loadMicroApp 替代 registerMicroApps

import { loadMicroApp } from 'qiankun';

// 手动加载一个子应用到指定容器
const app = loadMicroApp({
  name: 'sql-editor',
  entry: '//localhost:8001',
  container: '#preview-area',
  props: {
    token: 'xxx',
    mode: 'readonly',
  },
});

// 需要卸载时
// app.unmount();
