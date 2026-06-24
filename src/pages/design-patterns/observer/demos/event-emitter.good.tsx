// 最佳实践：类型安全的 EventEmitter 实现

type EventMap = {
  'user:updated': { id: number; name: string };
  'user:deleted': { id: number };
  'app:theme-changed': { theme: 'light' | 'dark' };
};

type EventKey = keyof EventMap;

class TypedEventEmitter {
  private listeners: {
    [K in EventKey]?: Array<(data: EventMap[K]) => void>;
  } = {};

  on<K extends EventKey>(
    event: K,
    callback: (data: EventMap[K]) => void
  ): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(callback);

    // 返回取消订阅函数
    return () => this.off(event, callback);
  }

  off<K extends EventKey>(
    event: K,
    callback: (data: EventMap[K]) => void
  ): void {
    const callbacks = this.listeners[event];
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit<K extends EventKey>(event: K, data: EventMap[K]): void {
    const callbacks = this.listeners[event];
    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }

  once<K extends EventKey>(
    event: K,
    callback: (data: EventMap[K]) => void
  ): () => void {
    const onceWrapper = (data: EventMap[K]) => {
      this.off(event, onceWrapper);
      callback(data);
    };
    return this.on(event, onceWrapper);
  }

  removeAllListeners(event?: EventKey): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}

// 创建单例
const eventBus = new TypedEventEmitter();

// 组件中使用
function UserForm() {
  useEffect(() => {
    const unsubscribe = eventBus.on('user:updated', (user) => {
      console.log('用户更新:', user.name);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = () => {
    // TypeScript 会检查事件名和参数类型
    eventBus.emit('user:updated', { id: 1, name: '张三' });
  };

  return <button onClick={handleSubmit}>提交</button>;
}

function UserProfile() {
  useEffect(() => {
    const unsubscribe = eventBus.on('user:updated', (user) => {
      console.log('用户资料更新:', user.id);
    });

    return () => unsubscribe();
  }, []);

  return <div>用户资料</div>;
}

// 优势：
// 1. 类型安全：事件名和参数类型都有 TypeScript 约束
// 2. 自动清理：返回 unsubscribe 函数，配合 useEffect 清理
// 3. 命名空间：使用 "domain:event" 格式避免冲突
// 4. 调试友好：可以添加日志中间件追踪事件流向
