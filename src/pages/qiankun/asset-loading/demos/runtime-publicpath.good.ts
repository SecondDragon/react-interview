// ✅ 最佳实践：运行时动态设置 __webpack_public_path__
// 这样可以在 qiankun 注入的路径和独立运行路径之间自动切换。

// qiankun 在加载子应用时，会把子应用的 entry URL 注入到
// window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ 中。
// 独立运行时该变量不存在，使用默认值。
// 注意：__webpack_public_path__ 必须在使用任何动态 import 或加载 chunk 之前设置。
__webpack_public_path__ =
  window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ ||
  (process.env.NODE_ENV === 'production' ? '/sql/' : '/');

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');
