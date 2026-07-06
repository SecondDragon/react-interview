// ✅ 子应用订阅全局状态变化

// 子应用入口文件中

let unsubscribeFromGlobalState: (() => void) | null = null;

export async function mount(props: any) {
  const { onGlobalStateChange, setGlobalState } = props;

  // 订阅全局状态变化
  // 第一个参数：回调函数，接收新状态 (state) 和旧状态 (prev)
  // 第二个参数：fireImmediately，是否注册后立即调用一次
  unsubscribeFromGlobalState = onGlobalStateChange(
    (state: any, prev: any) => {
      console.log('子应用收到全局状态变化：', state, prev);
      console.log('用户信息：', state.user);
      console.log('主题：', state.theme);
      console.log('Token：', state.token);

      // 根据变化更新子应用内部状态
      if (state.theme !== prev.theme) {
        applyTheme(state.theme);
      }
      if (state.user !== prev.user) {
        updateUserInfo(state.user);
      }
    },
    true, // fireImmediately = true：立即获取一次当前状态
  );
}

function applyTheme(theme: string) {
  document.documentElement.setAttribute('data-theme', theme);
}

function updateUserInfo(user: any) {
  // 更新子应用内部的 user store 或 context
}

export async function unmount(props: any) {
  // 取消订阅，防止内存泄漏
  if (unsubscribeFromGlobalState) {
    unsubscribeFromGlobalState();
    unsubscribeFromGlobalState = null;
  }
}
