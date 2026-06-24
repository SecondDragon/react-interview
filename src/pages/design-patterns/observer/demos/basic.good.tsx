// 最佳实践：使用 Subject + Observer 类实现观察者模式

interface Observer {
  update(data: any): void;
}

class Subject {
  private observers: Observer[] = [];

  attach(observer: Observer): void {
    this.observers.push(observer);
  }

  detach(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(data: any): void {
    this.observers.forEach((observer) => observer.update(data));
  }
}

// 具体观察者：React 组件包装器
class ReactObserver implements Observer {
  private setState: (data: any) => void;

  constructor(setState: (data: any) => void) {
    this.setState = setState;
  }

  update(data: any): void {
    this.setState(data);
  }
}

// 具体主题：计数器状态
class CounterSubject extends Subject {
  private state = { count: 0 };

  getState() {
    return { ...this.state };
  }

  setCount(count: number): void {
    this.state = { count };
    this.notify(this.state);
  }
}

// 使用示例
const counterSubject = new CounterSubject();

function ComponentA() {
  const [state, setState] = useState(counterSubject.getState());

  useEffect(() => {
    const observer = new ReactObserver(setState);
    counterSubject.attach(observer);
    return () => counterSubject.detach(observer);
  }, []);

  return <div>组件A: {state.count}</div>;
}

function ComponentB() {
  const [state, setState] = useState(counterSubject.getState());

  useEffect(() => {
    const observer = new ReactObserver(setState);
    counterSubject.attach(observer);
    return () => counterSubject.detach(observer);
  }, []);

  return <div>组件B: {state.count}</div>;
}

// 优势：
// 1. 松耦合：组件只依赖 Observer 接口，不依赖具体实现
// 2. 可扩展：新增观察者无需修改 Subject 代码
// 3. 生命周期管理：组件卸载时自动取消订阅
// 4. 类型安全：TypeScript 接口约束
