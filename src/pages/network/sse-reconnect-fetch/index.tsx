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
import { SSEReconnectFetchExamples } from './Examples';

const { Title, Paragraph, Text } = Typography;

interface MessageItem {
  id: string;
  content: string;
  isHistory?: boolean;
}

// ==================== 核心类：Fetch + ReadableStream + 重连 ====================

class FetchEventSource {
  url: string;
  options: any;
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryCount: number;
  abortController: AbortController | null;
  listeners: Map<string, Function[]>;
  timer: ReturnType<typeof setTimeout> | null;
  lastEventId: string;

  constructor(url: string, options: any = {}) {
    this.url = url;
    this.options = options;
    this.maxRetries = options.maxRetries ?? 5;
    this.baseDelay = options.baseDelay ?? 1000;
    this.maxDelay = options.maxDelay ?? 30000;
    this.retryCount = 0;
    this.abortController = null;
    this.listeners = new Map();
    this.timer = null;
    this.lastEventId = '';
  }

  async connect() {
    this.abortController = new AbortController();

    const headers: Record<string, string> = {
      Accept: 'text/event-stream',
    };
    if (this.lastEventId) {
      headers['Last-Event-ID'] = this.lastEventId;
    }

    try {
      const response = await fetch(this.url, {
        method: 'GET',
        headers,
        signal: this.abortController.signal,
      });

      // 错误分类：4xx 不重试
      if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
          this._emit('error', new Error(`HTTP ${response.status}: 客户端错误，停止重试`));
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      this.retryCount = 0;
      this._emit('open');

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 解析 SSE 帧（按双换行分割）
        const frames = buffer.split(/\r?\n\r?\n/);
        buffer = frames.pop() || '';

        for (const frame of frames) {
          const result = this._parseFrame(frame);
          if (result) {
            this._emit('message', result);
            if (result.id) {
              this.lastEventId = result.id;
            }
          }
        }
      }

      this._emit('close');
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      this._scheduleReconnect(err);
    }
  }

  // 指数退避 + 抖动
  _scheduleReconnect(err: Error) {
    if (this.retryCount >= this.maxRetries) {
      this._emit('fatal', new Error(`重试 ${this.maxRetries} 次后放弃: ${err.message}`));
      return;
    }

    const delay = Math.min(this.baseDelay * Math.pow(2, this.retryCount), this.maxDelay);
    const jitter = delay * 0.2 * Math.random();
    const finalDelay = delay + jitter;

    this.retryCount++;
    this._emit('reconnecting', { attempt: this.retryCount, delay: finalDelay, error: err.message });

    this.timer = setTimeout(() => this.connect(), finalDelay);
  }

  _parseFrame(frame: string): { data: any; id?: string } | null {
    const lines = frame.split(/\r?\n/);
    let data = '';
    let id = '';
    for (const line of lines) {
      if (line.startsWith('data:')) {
        data += line.slice(5).trim();
      } else if (line.startsWith('id:')) {
        id = line.slice(3).trim();
      }
    }
    try {
      return data ? { data: JSON.parse(data), id: id || undefined } : null;
    } catch {
      return null;
    }
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
    if (this.timer) clearTimeout(this.timer);
    this.abortController?.abort();
    this.listeners.clear();
    this.lastEventId = '';
  }
}

// ==================== 互动演示组件 ====================

const FetchReconnectDemo: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [connected, setConnected] = useState(false);
  const [done, setDone] = useState(false);
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [manualLastId, setManualLastId] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'connecting' | 'connected' | 'reconnecting' | 'fatal'
  >('idle');
  const [endpoint, setEndpoint] = useState('memory');
  const sourceRef = useRef<FetchEventSource | null>(null);

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

      const streamId = `fetch-${endpoint}`;
      const effectiveLastId =
        useManualId && manualLastId ? manualLastId : withReconnect ? lastEventId : null;

      let url = `${BASE_URL}/sse/${endpoint}?streamId=${streamId}`;
      if (effectiveLastId) {
        url += `&lastEventId=${encodeURIComponent(effectiveLastId)}`;
      }

      const source = new FetchEventSource(url, {
        maxRetries: 5,
        baseDelay: 1000,
        maxDelay: 10000,
      });
      sourceRef.current = source;

      if (withReconnect || useManualId) {
        setReconnectCount((c) => c + 1);
      }

      setStatus('connecting');
      setConnected(true);
      setDone(false);

      source
        .on('open', () => {
          setConnected(true);
          setStatus('connected');
        })
        .on('message', (result: { data: any; id?: string }) => {
          const data = result.data;
          if (data.type === 'final') {
            setConnected(false);
            setDone(true);
            setStatus('idle');
            source.close();
          } else {
            const msg: MessageItem = {
              id: result.id || '',
              content: `[${data.table}] ${data.content}`,
              isHistory: effectiveLastId ? true : false,
            };
            setMessages((prev) => [...prev, msg]);
            if (result.id) {
              setLastEventId(result.id);
            }
          }
        })
        .on('reconnecting', (info: any) => {
          setConnected(false);
          setStatus('reconnecting');
          setReconnectCount((c) => c + 1);
        })
        .on('fatal', (err: Error) => {
          setConnected(false);
          setStatus('fatal');
          setDone(true);
        })
        .on('error', (err: Error) => {
          setConnected(false);
          setStatus('idle');
          setDone(true);
        });

      source.connect();
    },
    [endpoint, lastEventId, manualLastId]
  );

  const disconnect = useCallback(() => {
    sourceRef.current?.close();
    setConnected(false);
    setDone(true);
    setStatus('idle');
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
    setConnected(false);
    setDone(false);
    setLastEventId(null);
    setReconnectCount(0);
    setManualLastId('');
    setStatus('idle');
  }, []);

  useEffect(
    () => () => {
      sourceRef.current?.close();
    },
    []
  );

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
            disabled={connected}
          />
        </div>

        <Space>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => connect(false, false)}
            disabled={connected}
          >
            连接 SSE
          </Button>
          <Button danger icon={<DisconnectOutlined />} onClick={disconnect} disabled={!connected}>
            断开
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={reconnect}
            disabled={connected || !lastEventId}
            type="dashed"
          >
            断点续传
          </Button>
          <Button onClick={reset}>重置</Button>
        </Space>

        <Space>
          <Badge
            status={
              done
                ? 'success'
                : connected
                  ? 'processing'
                  : status === 'reconnecting'
                    ? 'warning'
                    : 'default'
            }
            text={
              done ? '完成' : connected ? '接收中' : status === 'reconnecting' ? '重连中' : '未连接'
            }
          />
          <Tag>{messages.length} 条消息</Tag>
          {lastEventId && <Tag color="blue">Last-ID: {lastEventId.slice(-12)}</Tag>}
          {reconnectCount > 0 && <Tag color="orange">重连: {reconnectCount}</Tag>}
        </Space>

        <Space>
          <Input
            placeholder="手动输入 Last-Event-ID"
            value={manualLastId}
            onChange={(e) => setManualLastId(e.target.value)}
            style={{ width: 220 }}
            disabled={connected}
          />
          <Button
            onClick={reconnectWithManualId}
            disabled={connected || !manualLastId}
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
        message="此演示使用 fetch + ReadableStream 手动实现 SSE 读取和指数退避重连"
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
          {connected && <div style={{ color: '#fbbf24', padding: '2px 0' }}>▌ 接收中...</div>}
        </div>
      </Card>
    </div>
  );
};

// ==================== 主页面 ====================

const SSEReconnectFetchPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>{SSEReconnectFetchExamples.title}</Title>
      <Paragraph>
        这是目前 <Text strong>AI 流式对话场景的事实标准</Text>。 OpenAI、Anthropic、Google
        等大厂都采用 <Text code>fetch + ReadableStream</Text> 方案， 因为它支持 POST
        请求、自定义认证头，以及完全可控的重连策略。
      </Paragraph>

      {/* 一、是什么 */}
      <Card title="一、是什么" style={{ marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>{SSEReconnectFetchExamples.what}</Paragraph>
      </Card>

      {/* 二、为什么 */}
      <Card title="二、为什么不用原生 EventSource" style={{ marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>{SSEReconnectFetchExamples.why}</Paragraph>
      </Card>

      {/* 三、怎么做 */}
      <Card title="三、怎么做" style={{ marginBottom: 24 }}>
        <Paragraph>
          <Text strong>核心思路：</Text>用 fetch 发起请求，手动读取 ReadableStream， 自己实现 SSE
          帧解析和指数退避重连。
        </Paragraph>
        <CodeBlock
          code={SSEReconnectFetchExamples.how}
          title="完整实现"
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
          message="观察 fetch + ReadableStream 方案的重连行为，注意指数退避的延迟变化"
          style={{ marginBottom: 16 }}
        />
        <FetchReconnectDemo />
      </Card>

      {/* 五、优缺点 */}
      <Card title="五、优缺点" style={{ marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>
          {SSEReconnectFetchExamples.prosCons}
        </Paragraph>
      </Card>

      {/* 六、适用场景 */}
      <Card title="六、适用场景" style={{ marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>
          {SSEReconnectFetchExamples.whenToUse}
        </Paragraph>
      </Card>

      {/* 七、注意事项 */}
      <Card title="七、注意事项" style={{ background: '#fffbe6', marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>
          {SSEReconnectFetchExamples.caveats}
        </Paragraph>
      </Card>

      {/* 八、大厂参考 */}
      <Card title="八、大厂参考：OpenAI 重连策略" style={{ background: '#f0f5ff' }}>
        <CodeBlock
          code={SSEReconnectFetchExamples.openaiStrategy}
          title="OpenAI SDK 重连配置"
          type="info"
          language="typescript"
        />
      </Card>
    </div>
  );
};

export default SSEReconnectFetchPage;
