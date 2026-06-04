import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Typography, Alert, Tag, Tabs, Table, Divider, Button, Space, Badge, Radio, Input, Form } from 'antd';
import { DatabaseOutlined, FireOutlined, ThunderboltOutlined, InfoCircleOutlined, ApartmentOutlined, PlayCircleOutlined, ReloadOutlined, DisconnectOutlined, SendOutlined } from '@ant-design/icons';
import CodeBlock from '@/components/CodeBlock';
import { SSEBackendStorageExamples } from './Examples';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

// ==================== 实时演示组件 ====================

interface StreamChunk {
  type: string;
  table: string;
  content: string;
}

interface MessageItem {
  id: string;
  content: string;
  isHistory?: boolean;
}

const SSELiveDemo: React.FC = () => {
  const [endpoint, setEndpoint] = useState('memory');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [connected, setConnected] = useState(false);
  const [done, setDone] = useState(false);
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [manualLastId, setManualLastId] = useState('');
  const [sendContent, setSendContent] = useState('');
  const [sendTable, setSendTable] = useState('React');
  const abortRef = useRef<AbortController | null>(null);

  const BASE_URL = 'http://localhost:8080/api';

  const connect = useCallback(async (withReconnect = false, useManualId = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const streamId = `demo-${endpoint}`;
    const effectiveLastId = useManualId && manualLastId ? manualLastId : (withReconnect ? lastEventId : null);

    const url = `${BASE_URL}/sse/${endpoint}?streamId=${streamId}`;
    const headers: Record<string, string> = {
      'Accept': 'text/event-stream',
    };
    if (effectiveLastId) {
      headers['Last-Event-ID'] = effectiveLastId;
    }

    setConnected(true);
    setDone(false);

    if (withReconnect || useManualId) {
      setReconnectCount(c => c + 1);
    }

    try {
      const response = await fetch(url, { headers, signal: controller.signal });
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (!reader) return;

      while (true) {
        const { done: readerDone, value } = await reader.read();
        if (readerDone) break;

        buffer += decoder.decode(value, { stream: true });

        // 按双换行分割 SSE 帧（支持 \n\n 和 \r\n\r\n）
        const frames = buffer.split(/\r?\n\r?\n/);
        buffer = frames.pop() || '';

        for (const frame of frames) {
          const lines = frame.split(/\r?\n/);
          let currentId = '';
          let currentData = '';

          for (const line of lines) {
            if (line.startsWith('id:')) {
              currentId = line.slice(3).trim();
            } else if (line.startsWith('data:')) {
              currentData = line.slice(5).trim();
            }
          }

          if (currentData) {
            try {
              const chunk: StreamChunk = JSON.parse(currentData);
              const msg: MessageItem = {
                id: currentId,
                content: `[${chunk.table}] ${chunk.content}`,
                isHistory: effectiveLastId ? true : false,
              };
              setMessages(prev => [...prev, msg]);
              if (currentId) {
                setLastEventId(currentId);
              }
            } catch { /* ignore */ }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('SSE error:', err);
      }
    } finally {
      setConnected(false);
      setDone(true);
    }
  }, [endpoint, lastEventId, manualLastId]);

  const disconnect = useCallback(() => {
    abortRef.current?.abort();
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
    abortRef.current?.abort();
    setMessages([]);
    setConnected(false);
    setDone(false);
    setLastEventId(null);
    setReconnectCount(0);
    setManualLastId('');
  }, []);

  const sendMessage = useCallback(async () => {
    if (!sendContent.trim()) return;

    const chunk: StreamChunk = {
      type: 'answer',
      table: sendTable,
      content: sendContent,
    };

    try {
      const response = await fetch(`${BASE_URL}/sse/${endpoint}/send?streamId=demo-${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk),
      });
      const id = await response.text();
      console.log('Sent message, id:', id);
      setSendContent('');
    } catch (err) {
      console.error('Send failed:', err);
    }
  }, [endpoint, sendContent, sendTable]);

  useEffect(() => () => { abortRef.current?.abort() }, []);

  const endpointOptions = [
    { label: '内存队列', value: 'memory' },
    { label: 'Redis Stream', value: 'redis' },
    { label: '数据库+缓存', value: 'hybrid' },
    { label: 'Kafka', value: 'kafka' },
  ];

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        <div>
          <Text strong>选择后端方案：</Text>
          <Radio.Group
            options={endpointOptions}
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
            连接 SSE (GET)
          </Button>
          <Button
            icon={<DisconnectOutlined />}
            onClick={disconnect}
            disabled={!connected}
            danger
          >
            断开
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={reconnect}
            disabled={connected || !lastEventId}
            type="dashed"
          >
            断点续传 (自动ID)
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

        {/* 手动输入 Last-Event-ID 断点续传 */}
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

        {/* POST 发送消息 */}
        <Card size="small" title="📤 POST 发送消息到当前方案" style={{ background: '#f6ffed' }}>
          <Space>
            <Input
              placeholder="table"
              value={sendTable}
              onChange={(e) => setSendTable(e.target.value)}
              style={{ width: 100 }}
            />
            <Input
              placeholder="输入消息内容"
              value={sendContent}
              onChange={(e) => setSendContent(e.target.value)}
              style={{ width: 240 }}
              onPressEnter={sendMessage}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={sendMessage}
              disabled={!sendContent.trim()}
            >
              POST 发送
            </Button>
          </Space>
        </Card>
      </Space>

      <Card
        title="📡 实时消息流"
        size="small"
        style={{ background: '#1e1e1e', color: '#d4d4d4' }}
      >
        <div style={{ maxHeight: 350, overflowY: 'auto', fontFamily: 'monospace', fontSize: 13 }}>
          {messages.length === 0 && (
            <Text style={{ color: '#9ca3af' }}>等待 SSE 数据... 点击"连接 SSE"或 POST 发送消息</Text>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{ padding: '2px 0', color: msg.isHistory ? '#6b7280' : '#9cdcfe' }}>
              {msg.isHistory && <span style={{ color: '#fbbf24' }}>[历史] </span>}
              <span style={{ color: '#6b7280', fontSize: 11 }}>{msg.id.slice(-12)}</span>{' '}
              {msg.content}
            </div>
          ))}
          {connected && (
            <div style={{ color: '#fbbf24', padding: '2px 0' }}>
              ▌ 接收中...
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// ==================== 主页面 ====================

const SSEBackendStoragePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const comparisonData = [
    { scheme: '内存队列', delay: '最低', capacity: '1000条', persist: '否', distribute: '否', suited: '演示/内部工具' },
    { scheme: 'Redis Stream', delay: '低', capacity: '万级', persist: '可选(AOF)', distribute: '是', suited: '中等规模分布式' },
    { scheme: '数据库+缓存', delay: '中', capacity: '无上限', persist: '是', distribute: '是', suited: '生产环境高并发' },
    { scheme: 'Kafka 消息总线', delay: '中低', capacity: '百万级+', persist: '是', distribute: '是', suited: '超高并发/削峰' },
  ];

  const columns = [
    { title: '方案', dataIndex: 'scheme', key: 'scheme' },
    { title: '延迟', dataIndex: 'delay', key: 'delay' },
    { title: '容量', dataIndex: 'capacity', key: 'capacity' },
    { title: '持久化', dataIndex: 'persist', key: 'persist' },
    { title: '分布式', dataIndex: 'distribute', key: 'distribute' },
    { title: '适用场景', dataIndex: 'suited', key: 'suited' },
  ];

  const tabItems = [
    {
      key: 'overview',
      label: '方案概述',
      children: (
        <div>
          <Paragraph style={{ whiteSpace: 'pre-line' }}>{SSEBackendStorageExamples.what}</Paragraph>
          <Divider />
          <Paragraph style={{ whiteSpace: 'pre-line' }}>{SSEBackendStorageExamples.why}</Paragraph>
          <Divider />
          <Title level={4}>方案对比</Title>
          <Table dataSource={comparisonData} columns={columns} pagination={false} size="small" />
        </div>
      ),
    },
    {
      key: 'demo',
      label: <span><PlayCircleOutlined /> 实时演示</span>,
      children: (
        <div>
          <Alert
            type="info"
            showIcon
            message="连接后端四种 SSE 存储方案，体验断点续传"
            description={
              <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                <li><strong>GET 连接 SSE</strong>：接收流式消息，自动记录 Last-Event-ID</li>
                <li><strong>POST 发送消息</strong>：主动发送消息到当前方案，所有连接的客户端都能收到</li>
                <li><strong>断点续传</strong>：断开后再连接，只收到断点之后的消息（历史消息标记为灰色）</li>
                <li><strong>手动 ID 续传</strong>：输入任意消息 ID，验证后端能否正确返回后续消息</li>
              </ul>
            }
            style={{ marginBottom: 16 }}
          />
          <SSELiveDemo />
        </div>
      ),
    },
    {
      key: 'memory',
      label: <span><FireOutlined /> 内存队列</span>,
      children: (
        <div>
          <Alert type="info" showIcon message="适用：单实例、低并发、可接受重启丢失" style={{ marginBottom: 16 }} />
          <CodeBlock code={SSEBackendStorageExamples.memoryQueue} title="内存队列实现" type="warning" language="javascript" />
        </div>
      ),
    },
    {
      key: 'redis',
      label: <span><ThunderboltOutlined /> Redis Stream</span>,
      children: (
        <div>
          <Alert type="info" showIcon message="适用：分布式、中等并发、消息量可控" style={{ marginBottom: 16 }} />
          <CodeBlock code={SSEBackendStorageExamples.redisStream} title="Redis Stream 实现" type="success" language="javascript" />
        </div>
      ),
    },
    {
      key: 'db',
      label: <span><DatabaseOutlined /> 数据库+缓存</span>,
      children: (
        <div>
          <Alert type="info" showIcon message="适用：高并发、需要审计、消息量大" style={{ marginBottom: 16 }} />
          <CodeBlock code={SSEBackendStorageExamples.databaseCache} title="SQL 表设计" type="info" language="sql" />
          <Divider />
          <CodeBlock code={SSEBackendStorageExamples.databaseCacheCode} title="Node.js 实现" type="success" language="javascript" />
        </div>
      ),
    },
    {
      key: 'kafka',
      label: <span><ApartmentOutlined /> Kafka 消息总线</span>,
      children: (
        <div>
          <Alert type="info" showIcon message="适用：超高并发、削峰填谷、多消费者、消息回放" style={{ marginBottom: 16 }} />
          <CodeBlock code={SSEBackendStorageExamples.kafkaCode} title="Kafka 实现" type="warning" language="javascript" />
        </div>
      ),
    },
    {
      key: 'architecture',
      label: '架构图',
      children: (
        <div>
          <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 6, fontSize: 13, lineHeight: 1.6 }}>
            {SSEBackendStorageExamples.architecture}
          </pre>
        </div>
      ),
    },
    {
      key: 'caveats',
      label: '注意事项',
      children: (
        <div>
          <Paragraph style={{ whiteSpace: 'pre-line' }}>{SSEBackendStorageExamples.caveats}</Paragraph>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>{SSEBackendStorageExamples.title}</Title>
      <Paragraph>
        SSE 断点续传的核心是<strong>数据存储设计</strong>。前端重连时带上 <Text code>Last-Event-ID</Text>，
        后端必须能从存储中查出该 ID 之后的消息。四种方案各有适用场景。
      </Paragraph>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>
    </div>
  );
};

export default SSEBackendStoragePage;
