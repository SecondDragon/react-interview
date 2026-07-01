// ❌ 反面教材：父应用注册配置错误
// 注册表写错、没调用 start()，子应用永远不会被加载。

import { registerMicroApps } from 'qiankun';

registerMicroApps([
  {
    // 错误：name 和子应用自身的名称不一致，可能导致加载混乱。
    name: 'vue-app',

    // 错误：entry 缺少协议前缀，qiankun 无法正确请求资源。
    entry: 'localhost:8082',

    // 错误：container 选择器和主应用实际 DOM 不一致，qiankun 找不到挂载点。
    container: '#subapp-viewport',

    // 错误：activeRule 和子应用实际路径不匹配，子应用永远不会被激活。
    activeRule: '/micro-vue',
  },
]);

// 错误：没有调用 start()。
// registerMicroApps 只是把配置登记到注册表，start() 才会开始监听路由并加载子应用。
