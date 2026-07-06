// ✅ 更新 props：app.update 动态通知子应用

import { loadMicroApp } from 'qiankun';

const app = loadMicroApp({
  name: 'dashboard',
  entry: '//localhost:8003',
  container: '#dashboard-area',
  props: { theme: 'light', filters: {} },
});

// 用户切换主题 → 通知子应用
function onThemeChange(theme: string) {
  app.update({ props: { theme } });
}

// 用户修改筛选条件 → 通知子应用
function onFilterChange(filters: Record<string, any>) {
  app.update({ props: { filters } });
}
