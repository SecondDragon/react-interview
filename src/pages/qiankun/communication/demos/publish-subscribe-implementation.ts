// 手写发布订阅模式 —— 理解 initGlobalState 的内部实现原理

type Callback = (state: any, prev: any) => void;

interface GlobalStateActions {
  onGlobalStateChange: (callback: Callback, fireImmediately?: boolean) => () => void;
  setGlobalState: (newState: Record<string, any>) => void;
  offGlobalStateChange: () => void;
}

function initGlobalState(initialState: Record<string, any>): GlobalStateActions {
  // 内部状态
  let currentState = { ...initialState };

  // 订阅者列表，使用 Map 可以给每个订阅者分配唯一 id
  let observerId = 0;
  const observers = new Map<number, Callback>();

  return {
    // 订阅全局状态变化
    onGlobalStateChange(callback: Callback, fireImmediately?: boolean) {
      const id = ++observerId;
      observers.set(id, callback);

      // fireImmediately: 注册后立即以当前状态执行一次回调
      if (fireImmediately) {
        // 深度克隆，避免 callback 直接修改 state
        callback({ ...currentState }, { ...currentState });
      }

      // 返回 unsubscribe 函数
      return () => {
        observers.delete(id);
      };
    },

    // 修改全局状态
    setGlobalState(newState: Record<string, any>) {
      const prevState = { ...currentState };

      // 合并新状态
      currentState = {
        ...currentState,
        ...newState,
      };

      // 通知所有订阅者
      observers.forEach((callback) => {
        callback({ ...currentState }, prevState);
      });
    },

    // 取消所有订阅
    offGlobalStateChange() {
      observers.clear();
    },
  };
}

// 使用示例
const actions = initGlobalState({ user: null, theme: 'light' });

const unsubscribe = actions.onGlobalStateChange((state, prev) => {
  console.log('state changed:', prev, '→', state);
}, true);

actions.setGlobalState({ theme: 'dark' });
actions.setGlobalState({ user: { name: 'Alice' } });

unsubscribe(); // 取消订阅
