// 最佳实践：自定义 Hook 封装观察者模式

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react';

// 外部状态存储（模拟 Redux/Zustand）
class ExternalStore<T> {
  private state: T;
  private listeners: Set<() => void> = new Set();

  constructor(initialState: T) {
    this.state = initialState;
  }

  getState(): T {
    return this.state;
  }

  setState(updater: (prev: T) => T): void {
    this.state = updater(this.state);
    this.emit();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener());
  }
}

// 创建全局 store
const userStore = new ExternalStore({ name: '张三', age: 25, email: 'zhangsan@example.com' });

// 自定义 Hook：使用 useSyncExternalStore（React 18 推荐）
function useExternalStore<T>(
  store: ExternalStore<T>,
  selector?: (state: T) => any
) {
  const getSnapshot = useCallback(() => {
    const state = store.getState();
    return selector ? selector(state) : state;
  }, [store, selector]);

  return useSyncExternalStore(
    (callback) => store.subscribe(callback),
    getSnapshot,
    getSnapshot
  );
}

// 自定义 Hook：带选择器的订阅
function useUserSelector<R>(selector: (state: { name: string; age: number; email: string }) => R): R {
  return useExternalStore(userStore, selector);
}

// 自定义 Hook：订阅整个状态
function useUser() {
  return useExternalStore(userStore);
}

// 自定义 Hook：自动管理订阅生命周期
function useObserver<T>(
  subject: { subscribe: (fn: (data: T) => void) => () => void },
  initialValue: T
): T {
  const [state, setState] = useState<T>(initialValue);

  useEffect(() => {
    const unsubscribe = subject.subscribe((data) => {
      setState(data);
    });
    return unsubscribe;
  }, [subject]);

  return state;
}

// 组件中使用
function UserProfile1() {
  // 只订阅 name 字段，age 变化不会触发重渲染
  const name = useUserSelector((state) => state.name);

  return <div>用户名: {name}</div>;
}

function UserProfile2() {
  // 只订阅 age 字段
  const age = useUserSelector((state) => state.age);

  return <div>年龄: {age}岁</div>;
}

function UserSettings() {
  const user = useUser();

  const handleUpdate = useCallback(() => {
    userStore.setState((prev) => ({
      ...prev,
      name: prev.name === '张三' ? '李四' : '张三',
    }));
  }, []);

  return (
    <div>
      <div>当前用户: {user.name}</div>
      <button onClick={handleUpdate}>切换用户</button>
    </div>
  );
}

// 优势：
// 1. 逻辑复用：useExternalStore 和 useUserSelector 可在多个组件复用
// 2. 自动清理：useEffect 的 cleanup 函数确保组件卸载时取消订阅
// 3. 选择器优化：只订阅需要的字段，避免不必要的重渲染
// 4. useSyncExternalStore：React 18 官方推荐，解决并发渲染 tearing 问题
// 5. 类型安全：完整的 TypeScript 泛型支持
// 6. 测试友好：ExternalStore 可以独立测试，不依赖 React
