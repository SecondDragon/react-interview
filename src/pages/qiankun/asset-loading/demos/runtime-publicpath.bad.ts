// ❌ 反面教材：运行时未设置 __webpack_public_path__
// 这种代码在独立运行时没问题，但被 qiankun 嵌入时，动态加载的 chunk 会从错误路径请求。

// 子应用入口文件中没有设置 __webpack_public_path__，
// 完全依赖构建时 output.publicPath 的值。
// 当子应用部署路径变化或被子应用加载时，就会出错。

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');
