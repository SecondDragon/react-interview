// ✅ 最佳实践：子应用入口通过 renderWithQiankun 暴露生命周期

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

let app = null;

/**
 * 渲染函数
 * @param {Object} props - qiankun 传入的参数
 * @param {HTMLElement} props.container - 父应用提供的挂载容器
 */
function render(props) {
  // 如果存在 container，说明子应用运行在 qiankun 环境下，
  // 必须在父应用提供的容器内查找 #app 节点，而不是直接挂载到 document。
  const { container } = props;
  const target = container ? container.querySelector('#app') : '#app';

  app = createApp(App);
  app.use(router);
  app.mount(target);
}

// 通过 renderWithQiankun 暴露 qiankun 约定的生命周期函数。
renderWithQiankun({
  // bootstrap 在子应用第一次加载前执行，适合做一次性初始化。
  bootstrap() {
    console.log('[micro-vue] bootstrap');
  },

  // mount 在子应用被激活时执行。qiankun 会把 props 传进来，其中包含 container。
  mount(props) {
    console.log('[micro-vue] mount', props);
    render(props);
  },

  // unmount 在子应用切换走时执行。必须彻底清理 Vue 实例和引用，否则会造成内存泄漏。
  unmount(props) {
    console.log('[micro-vue] unmount', props);
    app?.unmount();
    app = null;
  },

  // update 在父应用调用 microApp.update(props) 时触发。
  // 简单场景可以留空实现，但建议保留，避免父应用传参时触发异常。
  update(props) {
    console.log('[micro-vue] update', props);
  },
});

// 独立运行判断：如果没有被 qiankun 加载，则直接渲染。
// 这样本地开发 npm run dev 时仍然可以独立访问子应用。
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
}
