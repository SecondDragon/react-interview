import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Typography, Alert, Tag, Button, Space, Badge, Divider, Radio, Input } from 'antd';
import {
  PlayCircleOutlined,
  ReloadOutlined,
  DisconnectOutlined,
  InfoCircleOutlined,
  FireOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import CodeBlock from '@/components/CodeBlock';
import { SSEReconnectEnhancedExamples } from './Examples';

const { Title, Paragraph, Text } = Typography;

interface MessageItem {
  id: string;
  content: string;
  isHistory?: boolean;
}

// ==================== 增强型 EventSource ====================

class EnhancedEventSource {
  url: string;
  options: any;
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  heartbeatInterval: number;
  retryCount: number;
  es: EventSource | null;
  state: string;
  listeners: Map<string, Function[]>;
  heartbeatTimer: ReturnType<typeof setInterval> | null;
  lastMessageTime: number;
  visibilityHandler: (() => void) | null;
  lastEventId: string;

  constructor(url: string, options: any = {}) {
    this.url = url;
    this.options = options;
    this.maxRetries = options.maxRetries ?? 5;
    this.baseDelay = options.baseDelay ?? 1000;
    this.maxDelay = options.maxDelay ?? 30000;
    this.heartbeatInterval = options.heartbeatInterval ?? 15000;

    this.retryCount = 0;
    this.es = null;
    this.state = 'closed';
    this.listeners = new Map();
    this.heartbeatTimer = null;
    this.lastMessageTime = Date.now();
    this.visibilityHandler = null;
    this.lastEventId = '';

    this._setupVisibilityHandler();
  }

  connect() {
    if (this.state === 'open' || this.state === 'connecting') return;
    this._setState('connecting');
    this._connectInternal();
  }

  _connectInternal() {
    this.es?.close();

    const url = this.options.getUrl ? this.options.getUrl() : this.url;
    this.es = new EventSource(url, { withCredentials: false });

    this.es.onopen = () => {
      this.retryCount = 0;
      this.lastMessageTime = Date.now();
      this._setState('open');
      this._startHeartbeat();
      this._emit('open');
    };

    this.es.onmessage = (e) => {
      this.lastMessageTime = Date.now();
      if (e.lastEventId) {
        this.lastEventId = e.lastEventId;
      }
      this._emit('message', e);
    };

    this.es.onerror = () => {
      this._stopHeartbeat();

      if (this.retryCount >= this.maxRetries) {
        this._setState('closed');
        this._emit('fatal', new Error(`重试 ${this.maxRetries} 次后放弃`));
        return;
      }

      const delay = Math.min(this.baseDelay * Math.pow(2, this.retryCount), this.maxDelay);
      const jitter = delay * 0.2 * Math.random();

      this.retryCount++;
      this._setState('reconnecting');
      this._emit('reconnecting', { attempt: this.retryCount, delay: delay + jitter });
    };
  }

  _startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      const elapsed = Date.now() - this.lastMessageTime;
      if (elapsed > this.heartbeatInterval * 2) {
        this._emit('heartbeatTimeout', { elapsed });
        this.es?.close();
      }
    }, this.heartbeatInterval);
  }

  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  _setupVisibilityHandler() {
    this.visibilityHandler = () => {
      if (document.hidden) {
        this._stopHeartbeat();
        this._emit('visibilityChange', 'hidden');
      } else {
        this._emit('visibilityChange', 'visible');
        if (this.state !== 'open') {
          this._emit('visibilityResume');
        }
        this._startHeartbeat();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  _setState(newState: string) {
    this.state = newState;
    this._emit('statechange', newState);
  }

  on(event: string, handler: Function) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(handler);
    return this;
  }

  _emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach((h) => h(data));
  }

  close() {
    this._stopHeartbeat();
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
    this.es?.close();
    this._setState('closed');
    this.listeners.clear();
    this.lastEventId = '';
  }
}

// ==================== 互动演示组件 ====================

const EnhancedReconnectDemo: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [state, setState] = useState('closed');
  const [retryCount, setRetryCount] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [heartbeatStatus, setHeartbeatStatus] = useState('正常');
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const [manualLastId, setManualLastId] = useState('');
  const [endpoint, setEndpoint] = useState('memory');
  const sourceRef = useRef<EnhancedEventSource | null>(null);

  const BASE_URL = 'http://localhost:8080/api';

  const endpointOptions = [
    { label: '内存队列', value: 'memory', icon: <FireOutlined /> },
    { label: 'Redis Stream', value: 'redis', icon: <ThunderboltOutlined /> },
    { label: '数据库+缓存', value: 'hybrid', icon: <DatabaseOutlined /> },
    { label: 'Kafka', value: 'kafka', icon: <ApartmentOutlined /> },
  ];

  const connect = useCallback(
    (withReconnect = false, useManualId = false) => {
      sourceRef.current?.close();

      const streamId = `enhanced-${endpoint}`;
      const effectiveLastId =
        useManualId && manualLastId ? manualLastId : withReconnect ? lastEventId : null;

      let url = `${BASE_URL}/sse/${endpoint}?streamId=${streamId}`;
      if (effectiveLastId) {
        url += `&lastEventId=${encodeURIComponent(effectiveLastId)}`;
      }

      const source = new EnhancedEventSource(url, {
        maxRetries: 5,
        baseDelay: 1000,
        heartbeatInterval: 15000,
      });
      sourceRef.current = source;

      if (withReconnect || useManualId) {
        setRetryCount((c) => c + 1);
      }

      setState('connecting');

      source
        .on('open', () => {
          setState('open');
          setRetryCount(0);
        })
        .on('message', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            if (data.type === 'final') {
              setState('closed');
              source.close();
            } else {
              const msg: MessageItem = {
                id: e.lastEventId || '',
                content: `[${data.table}] ${data.content}`,
                isHistory: effectiveLastId ? true : false,
              };
              setMessages((prev) => [...prev, msg]);
              if (e.lastEventId) {
                setLastEventId(e.lastEventId);
              }
            }
          } catch {
            /* ignore */
          }
        })
        .on('reconnecting', (info: any) => {
          setState('reconnecting');
          setRetryCount(info.attempt);
        })
        .on('heartbeatTimeout', () => {
          setHeartbeatStatus('超时！触发重连');
          setTimeout(() => setHeartbeatStatus('正常'), 2000);
        })
        .on('visibilityChange', (v: string) => {
          setIsHidden(v === 'hidden');
        })
        .on('fatal', (err: Error) => {
          setState('closed');
        });

      source.connect();
    },
    [endpoint, lastEventId, manualLastId]
  );

  const disconnect = useCallback(() => {
    sourceRef.current?.close();
    setState('closed');
  }, []);

  const reconnect = useCallback(() => {
    connect(true, false);
  }, [connect]);

  const reconnectWithManualId = useCallback(() => {
    connect(false, true);
  }, [connect]);

  const reset = useCallback(() => {
    sourceRef.current?.close();
    setMessages([]);
    setState('closed');
    setRetryCount(0);
    setIsHidden(false);
    setHeartbeatStatus('正常');
    setLastEventId(null);
    setManualLastId('');
  }, []);

  useEffect(
    () => () => {
      sourceRef.current?.close();
    },
    []
  );

  const stateConfig: Record<string, { color: string; text: string }> = {
    closed: { color: 'default', text: '已关闭' },
    connecting: { color: 'processing', text: '连接中' },
    open: { color: 'success', text: '已连接' },
    reconnecting: { color: 'warning', text: '重连中' },
  };

  const current = stateConfig[state] || stateConfig.closed;

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        <div>
          <Text strong>选择后端方案：</Text>
          <Radio.Group
            options={endpointOptions.map((o) => ({
              label: (
                <span>
                  {o.icon} {o.label}
                </span>
              ),
              value: o.value,
            }))}
            value={endpoint}
            onChange={(e) => {
              setEndpoint(e.target.value);
              reset();
            }}
            optionType="button"
            buttonStyle="solid"
            disabled={state === 'connecting' || state === 'open'}
          />
        </div>

        <Space>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => connect(false, false)}
            disabled={state === 'connecting' || state === 'open'}
          >
            连接 SSE
          </Button>
          <Button
            danger
            icon={<DisconnectOutlined />}
            onClick={disconnect}
            disabled={state === 'closed'}
          >
            断开
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={reconnect}
            disabled={state !== 'closed' || !lastEventId}
            type="dashed"
          >
            断点续传
          </Button>
          <Button onClick={reset}>重置</Button>
        </Space>

        <Space>
          <Badge status={current.color as any} text={current.text} />
          <Tag>{messages.length} 条消息</Tag>
          {lastEventId && <Tag color="blue">Last-ID: {lastEventId.slice(-12)}</Tag>}
          {retryCount > 0 && <Tag color="orange">重连: {retryCount}</Tag>}
          <Tag color={isHidden ? 'orange' : 'green'}>页面{isHidden ? '隐藏' : '可见'}</Tag>
          <Tag color={heartbeatStatus === '正常' ? 'green' : 'red'}>心跳: {heartbeatStatus}</Tag>
        </Space>

        <Space>
          <Input
            placeholder="手动输入 Last-Event-ID"
            value={manualLastId}
            onChange={(e) => setManualLastId(e.target.value)}
            style={{ width: 220 }}
            disabled={state === 'connecting' || state === 'open'}
          />
          <Button
            onClick={reconnectWithManualId}
            disabled={state !== 'closed' || !manualLastId}
            type="primary"
            ghost
          >
            按手动ID续传
          </Button>
        </Space>
      </Space>

      <Alert
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        message="此演示展示了增强封装：状态机、心跳检测、页面可见性感知，以及断点续传"
        style={{ marginBottom: 16 }}
      />

      <Card title="📡 实时消息流" size="small" style={{ background: '#1e1e1e', color: '#d4d4d4' }}>
        <div style={{ maxHeight: 350, overflowY: 'auto', fontFamily: 'monospace', fontSize: 13 }}>
          {messages.length === 0 && (
            <Text style={{ color: '#9ca3af' }}>等待 SSE 数据... 点击"连接 SSE"开始接收</Text>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{ padding: '2px 0', color: msg.isHistory ? '#6b7280' : '#9cdcfe' }}>
              {msg.isHistory && <span style={{ color: '#fbbf24' }}>[历史] </span>}
              <span style={{ color: '#6b7280', fontSize: 11 }}>{msg.id.slice(-12)}</span>{' '}
              {msg.content}
            </div>
          ))}
          {(state === 'open' || state === 'connecting') && (
            <div style={{ color: '#fbbf24', padding: '2px 0' }}>▌ 接收中...</div>
          )}
        </div>
      </Card>
    </div>
  );
};

// ==================== 主页面 ====================

const SSEReconnectEnhancedPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>{SSEReconnectEnhancedExamples.title}</Title>
      <Paragraph>
        在原生 <Text code>EventSource</Text> 基础上封装一层，保留自动重连能力的同时， 补充
        <strong>页面生命周期感知、心跳检测、状态机</strong>等生产级功能。
      </Paragraph>

      {/* 一、是什么 */}
      <Card title="一、是什么" style={{ marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>
          {SSEReconnectEnhancedExamples.what}
        </Paragraph>
      </Card>

      {/* 二、为什么 */}
      <Card title="二、为什么需要增强封装" style={{ marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>{SSEReconnectEnhancedExamples.why}</Paragraph>
      </Card>

      {/* 三、怎么做 */}
      <Card title="三、怎么做" style={{ marginBottom: 24 }}>
        <Paragraph>
          <Text strong>核心思路：</Text>包装原生 EventSource，添加心跳检测、页面可见性感知、
          最大重试限制，但<strong>让原生自动重连机制继续工作</strong>。
        </Paragraph>
        <CodeBlock
          code={SSEReconnectEnhancedExamples.how}
          title="增强封装实现"
          type="success"
          language="typescript"
        />
      </Card>

      {/* 四、互动演示 */}
      <Card
        title={
          <span>
            四、互动演示 <Tag color="blue">Live Demo</Tag>
          </span>
        }
        style={{ marginBottom: 24 }}
      >
        <Alert
          type="info"
          showIcon
          message="观察状态机流转、心跳检测、页面可见性变化对连接的影响，以及断点续传效果"
          style={{ marginBottom: 16 }}
        />
        <EnhancedReconnectDemo />
      </Card>

      {/* 五、优缺点 */}
      <Card title="五、优缺点" style={{ marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>
          {SSEReconnectEnhancedExamples.prosCons}
        </Paragraph>
      </Card>

      {/* 六、适用场景 */}
      <Card title="六、适用场景" style={{ marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>
          {SSEReconnectEnhancedExamples.whenToUse}
        </Paragraph>
      </Card>

      {/* 七、注意事项 */}
      <Card title="七、注意事项" style={{ background: '#fffbe6', marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>
          {SSEReconnectEnhancedExamples.caveats}
        </Paragraph>
      </Card>

      {/* 八、状态机 */}
      <Card title="八、状态机流转" style={{ background: '#f0f5ff' }}>
        <pre
          style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: 16,
            borderRadius: 6,
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          {SSEReconnectEnhancedExamples.stateMachine}
        </pre>
      </Card>
    </div>
  );
};

export default SSEReconnectEnhancedPage;
