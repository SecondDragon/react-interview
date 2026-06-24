// 反面教材：每个组件重复实现订阅逻辑，内存泄漏

function UserProfile1() {
  const [user, setUser] = useState({ name: '张三', age: 25 });

  useEffect(() => {
    // 直接订阅全局事件
    window.addEventListener('user:updated', (e: any) => {
      setUser(e.detail);
    });
    // 问题：没有清理事件监听器，组件卸载时内存泄漏
  }, []);

  return <div>{user.name} - {user.age}岁</div>;
}

function UserProfile2() {
  const [user, setUser] = useState({ name: '张三', age: 25 });

  useEffect(() => {
    window.addEventListener('user:updated', (e: any) => {
      setUser(e.detail);
    });
    // 同样的问题：没有清理
  }, []);

  return <div>{user.name} - {user.age}岁</div>;
}

function UserSettings() {
  const [user, setUser] = useState({ name: '张三', age: 25 });

  useEffect(() => {
    window.addEventListener('user:updated', (e: any) => {
      setUser(e.detail);
    });
    // 同样的问题：没有清理
  }, []);

  const handleUpdate = () => {
    window.dispatchEvent(new CustomEvent('user:updated', {
      detail: { name: '李四', age: 30 }
    }));
  };

  return (
    <div>
      <div>{user.name}</div>
      <button onClick={handleUpdate}>更新用户</button>
    </div>
  );
}

// 问题：
// 1. 每个组件都重复实现相同的订阅逻辑
// 2. 忘记清理事件监听器，导致内存泄漏
// 3. 没有类型安全，事件数据结构不明确
// 4. 组件与事件系统强耦合，难以测试
// 5. 无法精确控制订阅粒度（只能监听整个 user 对象）
