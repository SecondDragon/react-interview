// 反面教材：使用全局变量传递事件，事件名硬编码，无类型安全

// 全局事件对象
const globalEvents: Record<string, Function[]> = {};

function on(event: string, callback: Function) {
  if (!globalEvents[event]) {
    globalEvents[event] = [];
  }
  globalEvents[event].push(callback);
}

function emit(event: string, ...args: any[]) {
  if (globalEvents[event]) {
    globalEvents[event].forEach((cb) => cb(...args));
  }
}

// 组件中使用
function UserForm() {
  useEffect(() => {
    // 硬编码事件名，容易出错
    on('user-updated', (user: any) => {
      console.log('用户更新:', user);
    });
  }, []);

  const handleSubmit = () => {
    // 事件名可能拼写错误，编译期无法发现
    emit('user-updatd', { name: '张三' });
  };

  return <button onClick={handleSubmit}>提交</button>;
}

function UserProfile() {
  useEffect(() => {
    on('user-updated', (user: any) => {
      console.log('用户资料更新:', user);
    });
    // 问题：没有清理监听器，组件卸载后仍然保留引用
  }, []);

  return <div>用户资料</div>;
}

// 问题：
// 1. 全局变量污染
// 2. 事件名硬编码，无类型检查
// 3. 内存泄漏：没有移除监听器
// 4. 无法追踪事件流向，调试困难
// 5. 没有命名空间，事件名冲突风险
