// ✅ 状态检查：getStatus 获取生命周期状态

import { loadMicroApp } from 'qiankun';

const app = loadMicroApp({
  name: 'dashboard',
  entry: '//localhost:8003',
  container: '#dashboard-area',
});

// 刚创建完，尚未开始加载
console.log(app.getStatus()); // "NOT_LOADED"

async function demo() {
  // 开始加载入口
  console.log(app.getStatus()); // "LOADING_SOURCE_CODE"

  // 等待挂载完成
  await app.mount();
  console.log(app.getStatus()); // "MOUNTED"

  // 卸载
  await app.unmount();
  console.log(app.getStatus()); // "NOT_MOUNTED"

  // 重新挂载
  await app.mount();
  console.log(app.getStatus()); // "MOUNTED"
}
