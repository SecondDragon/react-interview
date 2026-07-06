// 路由驱动 registerMicroApps vs 手动内嵌 loadMicroApp 对比

import { loadMicroApp, registerMicroApps } from 'qiankun';

// ❌ registerMicroApps 方式：只能依赖路由触发
registerMicroApps([
  {
    name: 'sql-editor',
    entry: '//localhost:8001',
    container: '#micro-viewport',
    activeRule: '/dashboard/sql',
  },
]);
// 用户必须访问 /dashboard/sql 才能看到子应用

// ✅ loadMicroApp 方式：可以在任何时间、任何位置加载

function openSqlEditorInModal() {
  const container = document.getElementById('modal-content');
  loadMicroApp({
    name: 'sql-editor',
    entry: '//localhost:8001',
    container,
    props: { mode: 'inline' },
  });
}
// 用户点击按钮时立即加载，不需要路由匹配
