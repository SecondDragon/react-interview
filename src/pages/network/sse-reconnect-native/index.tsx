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
import { SSEReconnectNativeExamples } from './Examples';

const { Title, Paragraph, Text } = Typography;

interface MessageItem {
  id: string;
  content: string;
  isHistory?: boolean;
}

// ==================== 互动演示组件 ====================

const NativeReconnectDemo: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [connected, setConnected] = useState(false);
  const [done, setDone] = useState(false);
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [manualLastId, setManualLastId] = useState('');
  const [endpoint, setEndpoint] = useState('memory');
  const esRef = useRef<EventSource | null>(null);

  const BASE_URL = 'http://localhost:8080/api';

  const endpointOptions = [
    { label: '内存队列', value: 'memory', icon: <FireOutlined /> },
    { label: 'Redis Stream', value: 'redis', icon: <ThunderboltOutlined /> },
    { label: '数据库+缓存', value: 'hybrid', icon: <DatabaseOutlined /> },
    { label: 'Kafka', value: 'kafka', icon: <ApartmentOutlined /> },
  ];

  const connect = useCallback(
    (withReconnect = false, useManualId = false) => {
      esRef.current?.close();

      const streamId = `native-${endpoint}`;
      const effectiveLastId =
        useManualId && manualLastId ? manualLastId : withReconnect ? lastEventId : null;

      let url = `${BASE_URL}/sse/${endpoint}?streamId=${streamId}`;
      // EventSource 不支持自定义 headers，Last-Event-ID 只能由浏览器自动在重连时带上
      // 首次连接带 Last-Event-ID 需要通过 query param 模拟
      if (effectiveLastId) {
        url += `&lastEventId=${encodeURIComponent(effectiveLastId)}`;
      }

      const es = new EventSource(url);
      esRef.current = es;

      if (withReconnect || useManualId) {
        setReconnectCount((c) => c + 1);
      }

      setConnected(true);
      setDone(false);

      es.onopen = () => {
        setReconnectCount(0);
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'final') {
            setConnected(false);
            setDone(true);
            es.close();
          } else {
            const msg: MessageItem = {
              id: event.lastEventId || '',
              content: `[${data.table}] ${data.content}`,
              isHistory: effectiveLastId ? true : false,
            };
            setMessages((prev) => [...prev, msg]);
            if (event.lastEventId) {
              setLastEventId(event.lastEventId);
            }
          }
        } catch {
          /* ignore */
        }
      };

      // 原生重连：onerror 触发后浏览器自动重连（会自动带 Last-Event-ID）
      es.onerror = () => {
        setReconnectCount((prev) => prev + 1);
        setConnected(false);
      };
    },
    [endpoint, lastEventId, manualLastId]
  );

  const disconnect = useCallback(() => {
    esRef.current?.close();
    setConnected(false);
    setDone(true);
  }, []);

  const reconnect = useCallback(() => {
    connect(true, false);
  }, [connect]);

  const reconnectWithManualId = useCallback(() => {
    connect(false, true);
  }, [connect]);

  const reset = useCallback(() => {
    esRef.current?.close();
    setMessages([]);
    setConnected(false);
    setDone(false);
    setLastEventId(null);
    setReconnectCount(0);
    setManualLastId('');
  }, []);

  useEffect(
    () => () => {
      esRef.current?.close();
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
            status={done ? 'success' : connected ? 'processing' : 'default'}
            text={done ? '完成' : connected ? '接收中' : '未连接'}
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
        message="原生 EventSource 在断线后浏览器会自动重连（约3秒间隔），并自动带上 Last-Event-ID"
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

const SSEReconnectNativePage: React.FC = () => {
  return (
    <div>
      <Title level={2}>{SSEReconnectNativeExamples.title}</Title>
      <Paragraph>
        原生 <Text code>EventSource</Text> 自带自动重连机制，是 SSE 最简单但也最受限的使用方式。
        理解它的工作原理和局限性，是选择更高级方案的基础。
      </Paragraph>

      {/* 一、是什么 */}
      <Card title="一、是什么" style={{ marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>{SSEReconnectNativeExamples.what}</Paragraph>
      </Card>

      {/* 二、为什么 */}
      <Card title="二、为什么需要重连" style={{ marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>{SSEReconnectNativeExamples.why}</Paragraph>
      </Card>

      {/* 三、怎么做 */}
      <Card title="三、怎么做" style={{ marginBottom: 24 }}>
        <Paragraph>
          <Text strong>核心原则：</Text>前端几乎不需要写重连代码，浏览器自动处理。
          重点在于服务端如何配合。
        </Paragraph>
        <CodeBlock
          code={SSEReconnectNativeExamples.how}
          title="前端代码"
          type="success"
          language="typescript"
        />
        <Divider />
        <CodeBlock
          code={SSEReconnectNativeExamples.serverCode}
          title="服务端配合（Node.js）"
          type="warning"
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
          message="观察原生 EventSource 的自动重连行为，以及断点续传效果"
          style={{ marginBottom: 16 }}
        />
        <NativeReconnectDemo />
      </Card>

      {/* 五、优缺点 */}
      <Card title="五、优缺点" style={{ marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>
          {SSEReconnectNativeExamples.prosCons}
        </Paragraph>
      </Card>

      {/* 六、适用场景 */}
      <Card title="六、适用场景" style={{ marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>
          {SSEReconnectNativeExamples.whenToUse}
        </Paragraph>
      </Card>

      {/* 七、注意事项 */}
      <Card title="七、注意事项" style={{ background: '#fffbe6' }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>
          {SSEReconnectNativeExamples.caveats}
        </Paragraph>
      </Card>
    </div>
  );
};

export default SSEReconnectNativePage;
