// ✅ qiankun 通信：同进程直接调用，类型安全，调试友好

// ---------- 主应用侧 ----------
import { initGlobalState, MicroAppStateActions } from 'qiankun';

// 初始化全局状态，所有子应用都可以订阅
const actions: MicroAppStateActions = initGlobalState({
  user: null,
  theme: 'light',
  token: '',
});

// 主应用可以直接修改状态，子应用立即收到通知
actions.setGlobalState({
  user: { id: 1, name: 'Alice', roles: ['admin'] },
  theme: 'dark',
});

// ---------- 子应用侧 ----------
// 在子应用 mount 生命周期中接收 props
export function mount(props: any) {
  // props 中包含 onGlobalStateChange 和 setGlobalState
  const { onGlobalStateChange, setGlobalState } = props;

  // 订阅全局状态变化，回调同步执行
  // 不需要像 postMessage 那样处理序列化、event.origin 验证
  onGlobalStateChange((state: any, prev: any) => {
    // state.user 是直接引用，不是克隆
    // 主应用和子应用共享同一个对象
    console.log('全局状态变了', state.user);
    // 可以立即更新子应用内部的 context/store
  }, true);

  // 子应用也可以修改全局状态，影响其他子应用
  setGlobalState({ theme: 'light' });
}
