// ✅ registerMicroApps 传入 props
// 主应用通过 props 向子应用传递初始数据和回调函数

import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:8001',
    container: '#container',
    activeRule: '/app1',
    // props 字段：在子应用 mount 时，这些数据会作为 props 参数传入
    props: {
      // 可以传普通数据
      token: 'xxx',
      user: { id: 1, name: 'Alice' },
      // 可以传函数回调
      onLogout: () => {
        window.location.href = '/login';
      },
      // 可以传 Ant Design 主题配置
      theme: { colorPrimary: '#1677ff', borderRadius: 6 },
    },
  },
  {
    name: 'app2',
    entry: '//localhost:8002',
    container: '#container',
    activeRule: '/app2',
    // 不同子应用可以传入不同的 props
    props: {
      token: 'yyy',
      user: { id: 2, name: 'Bob' },
      baseUrl: '/api/v2',
    },
  },
]);

start();
