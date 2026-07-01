// ❌ 反面教材：普通 Vue 3 入口，没有 qiankun 生命周期
// 这样写子应用可以独立运行，但无法被 qiankun 正确加载和卸载。

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// 直接创建并挂载 Vue 应用。
// 在 qiankun 环境下，这段代码会立即执行并把 #app 挂载到 document.body 上，
// 而不是父应用指定的 container 中，导致子应用跳出沙箱控制。
const app = createApp(App);
app.use(router);
app.mount('#app');

// 问题：
// 1. 没有暴露 bootstrap / mount / unmount / update 生命周期，qiankun 无法调度；
// 2. 切换主应用菜单时，子应用不会自动卸载，DOM 和事件监听可能残留；
// 3. 无法接收父应用传递的 container，子应用不知道应该渲染到哪个 DOM 节点。
