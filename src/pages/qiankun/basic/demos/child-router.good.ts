// ✅ 最佳实践：根据运行环境切换路由 base

import { createRouter, createWebHistory } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

const routes = [
  { path: '/', redirect: '/micro-vue/list' },
  { path: '/micro-vue/list', component: () => import('./views/List.vue') },
  { path: '/micro-vue/detail', component: () => import('./views/Detail.vue') },
];

// 判断当前是否运行在 qiankun 环境中。
// __POWERED_BY_QIANKUN__ 是 qiankun 注入到子应用 window 上的标识。
const isInQiankun = qiankunWindow.__POWERED_BY_QIANKUN__;

// 在 qiankun 环境下，base 必须和主应用为该子应用分配的 activeRule 路径前缀一致。
// 这样 Vue Router 的 history 对象才能正确解析 "/dashboard/micro-vue/xxx" 这样的 URL。
// 独立运行时使用 "/"，不影响本地开发。
const base = isInQiankun ? '/dashboard/micro-vue' : '/';

const router = createRouter({
  history: createWebHistory(base),
  routes,
});

export default router;
