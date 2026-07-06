// ✅ qiankun 注册：子应用组件直接嵌入主应用 DOM 树
// 让我们看 registerMicroApps 的配置和效果

import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'sql-editor',
    entry: '//localhost:8082',  // 子应用开发服务器
    container: '#micro-viewport', // 子应用挂载到哪里
    activeRule: '/dashboard/sql', // 什么路由下激活

    // 子应用渲染后，它的 DOM 直接位于 #micro-viewport 中
    // 与主应用的 Sidebar、Header 在同一个 Document 下
    // 这意味着：
    // 1. 主应用 CSS 变量、字体、Ant Design 主题都对子应用生效
    // 2. 子应用的弹窗/Modal 可以覆盖到主应用全屏
    // 3. 子应用的 ResizeObserver 可以直接响应容器尺寸变化
    // 4. 无需手动同步高度或位置
  },
]);

start();
