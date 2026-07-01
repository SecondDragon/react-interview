// ✅ 最佳实践：父应用注册 qiankun 子应用

import { registerMicroApps, start } from 'qiankun';

// 这是一个辅助函数，用于 hash 路由模式下判断当前 URL 是否以某个 hash 开头。
// 如果主应用使用 history 模式，也可以直接把 activeRule 写成字符串或正则。
const getActiveRule = (hash) => (location) => location.hash.startsWith(hash);

registerMicroApps([
  {
    // name 必须全局唯一，且最好与子应用自身的名称保持一致。
    // qiankun 会用 name 做缓存 key、DOM 隔离前缀、错误提示等。
    name: 'vue-app',

    // entry 是子应用的入口地址，qiankun 默认使用 HTML Entry。
    // 使用 "//localhost:8082" 这种协议相对 URL，可以自动跟随父应用的 http/https 协议。
    entry: '//localhost:8082',

    // container 是子应用挂载的 DOM 容器选择器，必须在主应用布局中真实存在。
    container: '#micro-viewport',

    // activeRule 决定什么 URL 下激活该子应用。
    // 这里主应用使用 hash 路由，所以用函数判断 hash 是否以 "#/dashboard/micro-vue" 开头。
    activeRule: getActiveRule('#/dashboard/micro-vue'),
  },
]);

// 调用 start() 后，qiankun 才会开始监听路由变化并加载子应用。
// 可以在这里配置 prefetch、sandbox、singular 等选项。
start({
  // 预加载其他子应用资源，提升切换体验。
  prefetch: true,
});
