// ❌ 反面教材：子应用路由 base 固定为 "/"
// 独立运行时没问题，但嵌入 qiankun 后会出现路由不匹配或 URL 污染。

import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/micro-vue/list' },
  { path: '/micro-vue/list', component: () => import('./views/List.vue') },
  { path: '/micro-vue/detail', component: () => import('./views/Detail.vue') },
];

// 独立运行时 base 为 "/" 是正确的。
// 但在 qiankun 中，子应用挂载在主应用的 "/dashboard/micro-vue" 下，
// 此时子应用仍然以 "/" 为 base，会错误解析主应用的 URL，导致路由跳转异常。
const router = createRouter({
  history: createWebHistory('/'),
  routes,
});

export default router;
