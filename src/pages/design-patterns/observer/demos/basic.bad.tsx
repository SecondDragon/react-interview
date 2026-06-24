// 反面教材：直接修改全局状态，组件间强耦合
// 状态变更后手动通知每个依赖组件

let globalState = { count: 0 };
const listeners: Function[] = [];

function addListener(fn: Function) {
  listeners.push(fn);
}

function updateState(newCount: number) {
  globalState.count = newCount;
  // 手动遍历通知每个监听器
  listeners.forEach((fn) => fn(globalState.count));
}

// 组件 A
function ComponentA() {
  const [count, setCount] = useState(globalState.count);

  useEffect(() => {
    addListener((newCount: number) => setCount(newCount));
  }, []);

  return <div>组件A: {count}</div>;
}

// 组件 B
function ComponentB() {
  const [count, setCount] = useState(globalState.count);

  useEffect(() => {
    addListener((newCount: number) => setCount(newCount));
  }, []);

  return <div>组件B: {count}</div>;
}

// 问题：
// 1. 全局变量污染，难以维护
// 2. 每个组件都要手动注册监听器
// 3. 没有类型安全
// 4. 无法移除监听器，导致内存泄漏
// 5. 组件与状态管理逻辑强耦合
