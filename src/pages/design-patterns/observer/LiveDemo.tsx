import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, Input, Tag, Divider, Row, Col, Statistic } from 'antd';

/**
 * 观察者模式 Live Demo 组件
 * 根据 type 展示不同的互动演示
 */
interface LiveDemoProps {
  type: 'basic' | 'event-emitter' | 'react-context' | 'custom-hook';
}

// 基础观察者演示 - Subject 类定义在组件外部
class BasicSubject {
  private observers: Array<{ id: number; callback: (msg: string) => void }> = [];

  attach(id: number, callback: (msg: string) => void) {
    this.observers.push({ id, callback });
  }

  detach(id: number) {
    this.observers = this.observers.filter((o) => o.id !== id);
  }

  notify(msg: string) {
    this.observers.forEach((o) => o.callback(msg));
  }

  getObserverCount() {
    return this.observers.length;
  }
}

const BasicObserverDemo: React.FC = () => {
  const [subject] = useState(() => new BasicSubject());
  const [observers, setObservers] = useState<string[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [observerId, setObserverId] = useState(0);

  const addObserver = () => {
    const id = observerId;
    setObserverId((prev) => prev + 1);
    setObservers((prev) => [...prev, `观察者-${id}`]);
    subject.attach(id, (msg) => {
      setMessages((prev) => [`观察者-${id} 收到: ${msg}`, ...prev].slice(0, 10));
    });
  };

  const removeObserver = (name: string) => {
    const id = parseInt(name.split('-')[1]);
    subject.detach(id);
    setObservers((prev) => prev.filter((o) => o !== name));
  };

  const sendMessage = () => {
    subject.notify(`消息 ${Date.now()}`);
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Button type="primary" onClick={addObserver} block>
            添加观察者
          </Button>
        </Col>
        <Col span={8}>
          <Button onClick={sendMessage} block>
            发送通知
          </Button>
        </Col>
        <Col span={8}>
          <Statistic title="当前观察者数" value={subject.getObserverCount()} />
        </Col>
      </Row>

      <div style={{ marginBottom: 16 }}>
        {observers.map((name) => (
          <Tag
            key={name}
            closable
            onClose={() => removeObserver(name)}
            color="blue"
            style={{ marginBottom: 4 }}
          >
            {name}
          </Tag>
        ))}
      </div>

      <Card title="消息记录" size="small">
        <div style={{ maxHeight: 200, overflow: 'auto' }}>
          {messages.length === 0 ? (
            <div style={{ color: '#999' }}>暂无消息</div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                {msg}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

// EventEmitter 演示 - 类定义在组件外部
class DemoEventEmitter {
  private listeners: Map<string, Array<{ id: number; callback: Function }>> = new Map();

  on(event: string, id: number, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push({ id, callback });
  }

  off(event: string, id: number) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      this.listeners.set(
        event,
        callbacks.filter((cb) => cb.id !== id)
      );
    }
  }

  emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb.callback(data));
    }
  }
}

const EventEmitterDemo: React.FC = () => {
  const [events] = useState(() => new DemoEventEmitter());
  const [listeners, setListeners] = useState<{ event: string; id: number }[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [eventName, setEventName] = useState('user:login');
  const [listenerId, setListenerId] = useState(0);

  const addListener = () => {
    const id = listenerId;
    setListenerId((prev) => prev + 1);
    setListeners((prev) => [...prev, { event: eventName, id }]);
    events.on(eventName, id, (data: any) => {
      setMessages((prev) =>
        [`[${eventName}] 监听器-${id} 收到: ${JSON.stringify(data)}`, ...prev].slice(0, 10)
      );
    });
  };

  const removeListener = (event: string, id: number) => {
    events.off(event, id);
    setListeners((prev) => prev.filter((l) => !(l.event === event && l.id === id)));
  };

  const emitEvent = () => {
    events.emit(eventName, { time: Date.now(), message: '测试消息' });
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="事件名称"
            addonBefore="事件名"
          />
        </Col>
        <Col span={6}>
          <Button type="primary" onClick={addListener} block>
            添加监听
          </Button>
        </Col>
        <Col span={6}>
          <Button onClick={emitEvent} block>
            触发事件
          </Button>
        </Col>
      </Row>

      <div style={{ marginBottom: 16 }}>
        {listeners.map((l) => (
          <Tag
            key={`${l.event}-${l.id}`}
            closable
            onClose={() => removeListener(l.event, l.id)}
            color="purple"
            style={{ marginBottom: 4 }}
          >
            {l.event} #{l.id}
          </Tag>
        ))}
      </div>

      <Card title="事件记录" size="small">
        <div style={{ maxHeight: 200, overflow: 'auto' }}>
          {messages.length === 0 ? (
            <div style={{ color: '#999' }}>暂无事件</div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                {msg}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

// React Context 演示
const ReactContextDemo: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState({ name: '张三' });
  const [renderCount, setRenderCount] = useState({ theme: 0, user: 0, combined: 0 });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    setRenderCount((prev) => ({ ...prev, theme: prev.theme + 1 }));
  };

  const updateUser = () => {
    setUser((prev) => ({ name: prev.name === '张三' ? '李四' : '张三' }));
    setRenderCount((prev) => ({ ...prev, user: prev.user + 1 }));
  };

  const updateBoth = () => {
    toggleTheme();
    updateUser();
    setRenderCount((prev) => ({ ...prev, combined: prev.combined + 1 }));
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Button onClick={toggleTheme} block>
            切换主题 ({theme})
          </Button>
        </Col>
        <Col span={8}>
          <Button onClick={updateUser} block>
            更新用户
          </Button>
        </Col>
        <Col span={8}>
          <Button type="primary" onClick={updateBoth} block>
            同时更新
          </Button>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Card size="small" title="主题组件">
            <div
              style={{
                padding: 20,
                background: theme === 'light' ? '#fff' : '#333',
                color: theme === 'light' ? '#333' : '#fff',
                borderRadius: 8,
              }}
            >
              当前主题: {theme}
            </div>
            <div style={{ marginTop: 8, color: '#999' }}>
              渲染次数: {renderCount.theme}
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" title="用户组件">
            <div style={{ padding: 20, background: '#f0f5ff', borderRadius: 8 }}>
              用户名: {user.name}
            </div>
            <div style={{ marginTop: 8, color: '#999' }}>
              渲染次数: {renderCount.user}
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" title="综合组件">
            <div style={{ padding: 20, background: '#f6ffed', borderRadius: 8 }}>
              <div>主题: {theme}</div>
              <div>用户: {user.name}</div>
            </div>
            <div style={{ marginTop: 8, color: '#999' }}>
              渲染次数: {renderCount.combined}
            </div>
          </Card>
        </Col>
      </Row>

      <Divider />
      <div style={{ color: '#666', fontSize: 13 }}>
        演示说明：点击"切换主题"只有主题组件和综合组件会重新渲染，用户组件不受影响。
        这展示了拆分 Context 的优化效果。
      </div>
    </div>
  );
};

// 自定义 Hook 演示 - Store 类定义在组件外部
class DemoStore {
  private state: any;
  private listeners: Set<Function> = new Set();

  constructor(initialState: any) {
    this.state = initialState;
  }

  getState() {
    return this.state;
  }

  setState(updater: (prev: any) => any) {
    this.state = updater(this.state);
    this.listeners.forEach((fn) => fn());
  }

  subscribe(fn: Function) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

const CustomHookDemo: React.FC = () => {
  const [store] = useState(() => new DemoStore({ name: '张三', age: 25, email: 'zs@example.com' }));
  const [name, setName] = useState(store.getState().name);
  const [age, setAge] = useState(store.getState().age);
  const [email, setEmail] = useState(store.getState().email);
  const [renderLog, setRenderLog] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      setName(state.name);
      setAge(state.age);
      setEmail(state.email);
      setRenderLog((prev) => [`Store 更新: ${JSON.stringify(state)}`, ...prev].slice(0, 8));
    });
    return unsubscribe;
  }, [store]);

  const updateName = () => {
    store.setState((prev: any) => ({ ...prev, name: prev.name === '张三' ? '李四' : '张三' }));
  };

  const updateAge = () => {
    store.setState((prev: any) => ({ ...prev, age: prev.age + 1 }));
  };

  const updateEmail = () => {
    store.setState((prev: any) => ({
      ...prev,
      email: prev.email === 'zs@example.com' ? 'ls@example.com' : 'zs@example.com',
    }));
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Button onClick={updateName} block>
            更新姓名
          </Button>
        </Col>
        <Col span={8}>
          <Button onClick={updateAge} block>
            更新年龄
          </Button>
        </Col>
        <Col span={8}>
          <Button onClick={updateEmail} block>
            更新邮箱
          </Button>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small">
            <div>姓名: {name}</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <div>年龄: {age}</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <div>邮箱: {email}</div>
          </Card>
        </Col>
      </Row>

      <Card title="更新日志" size="small">
        <div style={{ maxHeight: 150, overflow: 'auto' }}>
          {renderLog.length === 0 ? (
            <div style={{ color: '#999' }}>暂无更新</div>
          ) : (
            renderLog.map((msg, i) => (
              <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0', fontSize: 12 }}>
                {msg}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

const LiveDemo: React.FC<LiveDemoProps> = ({ type }) => {
  switch (type) {
    case 'basic':
      return <BasicObserverDemo />;
    case 'event-emitter':
      return <EventEmitterDemo />;
    case 'react-context':
      return <ReactContextDemo />;
    case 'custom-hook':
      return <CustomHookDemo />;
    default:
      return <div>未知的演示类型</div>;
  }
};

export default LiveDemo;
