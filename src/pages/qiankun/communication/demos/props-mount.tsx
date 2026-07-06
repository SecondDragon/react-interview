// ✅ 子应用 mount 生命周期接收 props
// props 包含两部分：registerMicroApps 传入的 props + qiankun 自动注入的全局状态接口

// 子应用入口文件
// 以下声明用于类型安全演示（实际 Vue 项目通过 vue 包导入）
declare function createApp(app: any): { config: { globalProperties: Record<string, any> }; mount: (el: Element | null) => void; unmount: () => void };
const App: any = {};
let appInstance: ReturnType<typeof createApp> | null = null;

export async function mount(props: any) {
  // props 的结构如下：
  // {
  //   token: 'xxx',                        // registerMicroApps 传入的
  //   user: { id: 1, name: 'Alice' },      // registerMicroApps 传入的
  //   onLogout: () => {},                   // registerMicroApps 传入的函数回调
  //   container: document.querySelector('#container'), // qiankun 自动注入的挂载容器
  //   onGlobalStateChange: fn,              // qiankun 自动注入的全局状态订阅
  //   setGlobalState: fn,                   // qiankun 自动注入的全局状态修改
  // }

  const { container, token, user, onLogout } = props;

  // 使用 props 中的 container 作为挂载点
  const rootElement = container
    ? container.querySelector('#app')
    : document.getElementById('app');

  appInstance = createApp(App);
  appInstance.config.globalProperties.$token = token;
  appInstance.config.globalProperties.$user = user;
  appInstance.config.globalProperties.$onLogout = onLogout;
  appInstance.mount(rootElement);
}

export async function unmount(props: any) {
  const { container } = props;
  if (appInstance) {
    appInstance.unmount();
    appInstance = null;
  }
}
