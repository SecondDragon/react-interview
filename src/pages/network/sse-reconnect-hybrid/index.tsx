import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Typography, Alert, Tag, Button, Space, Badge, Divider, Row, Col } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, InfoCircleOutlined, ThunderboltOutlined, NotificationOutlined } from '@ant-design/icons';
import CodeBlock from '@/components/CodeBlock';
import { SSEReconnectHybridExamples } from './Examples';

const { Title, Paragraph, Text } = Typography;

// ==================== 简化演示：模拟双通道 ====================

const HybridReconnectDemo: React.FC = () => {
  const [wsState, setWsState] = useState('closed');
  const [sseState, setSseState] = useState('closed');
  const [wsMessages, setWsMessages] = useState<string[]>([]);
  const [sseMessages, setSseMessages] = useState<string[]>([]);
  const [wsRetry, setWsRetry] = useState(0);
  const [sseRetry, setSseRetry] = useState(0);
  const wsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    // 模拟 WebSocket 连接
    setWsState('connecting');
    setWsMessages([]);
    setWsRetry(0);

    const connectWs = (attempt: number) => {
      if (attempt > 3) {
        setWsState('open');
        setWsMessages(prev => [...prev, '✅ WebSocket 连接成功']);
        // 模拟高频消息
        const interval = setInterval(() => {
          setWsMessages(prev => [...prev, `⚡ 实时操作: ${new Date().toLocaleTimeString()}`]);
        }, 2000);
        wsTimerRef.current = interval as any;
        return;
      }
      if (attempt > 0) {
        setWsRetry(attempt);
        setWsMessages(prev => [...prev, `🔄 WS 第 ${attempt} 次重试...`]);
      }
      setTimeout(() => connectWs(attempt + 1), 1000 * attempt + 500);
    };
    connectWs(0);

    // 模拟 SSE 连接
    setSseState('connecting');
    setSseMessages([]);
    setSseRetry(0);

    const connectSse = (attempt: number) => {
      if (attempt > 2) {
        setSseState('open');
        setSseMessages(prev => [...prev, '✅ SSE 连接成功']);
        // 模拟低频通知
        const interval = setInterval(() => {
          setSseMessages(prev => [...prev, `📢 系统通知: 用户${Math.floor(Math.random() * 100)} 上线`]);
        }, 4000);
        sseTimerRef.current = interval as any;
        return;
      }
      if (attempt > 0) {
        setSseRetry(attempt);
        setSseMessages(prev => [...prev, `🔄 SSE 第 ${attempt} 次重试...`]);
      }
      setTimeout(() => connectSse(attempt + 1), 1500 * attempt + 800);
    };
    connectSse(0);
  }, []);

  const disconnect = useCallback(() => {
    if (wsTimerRef.current) clearInterval(wsTimerRef.current);
    if (sseTimerRef.current) clearInterval(sseTimerRef.current);
    setWsState('closed');
    setSseState('closed');
    setWsMessages(prev => [...prev, '❌ WebSocket 断开']);
    setSseMessages(prev => [...prev, '❌ SSE 断开']);
  }, []);

  useEffect(() => () => {
    if (wsTimerRef.current) clearInterval(wsTimerRef.current);
    if (sseTimerRef.current) clearInterval(sseTimerRef.current);
  }, []);

  const stateColor = (s: string) => ({
    closed: 'default',
    connecting: 'processing',
    open: 'success',
    reconnecting: 'warning',
  } as any)[s] || 'default';

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlayCircleOutlined />} onClick={connect} disabled={wsState === 'open' || sseState === 'open'}>
          连接双通道
        </Button>
        <Button danger icon={<PauseCircleOutlined />} onClick={disconnect} disabled={wsState === 'closed' && sseState === 'closed'}>
          断开
        </Button>
      </Space>

      <Alert
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        message="演示 WebSocket（高频双向）和 SSE（低频单向）的混合使用"
        style={{ marginBottom: 16 }}
      />

      <Row gutter={16}>
        <Col span={12}>
          <Card
            title={<span><ThunderboltOutlined /> WebSocket 通道（高频双向）</span>}
            size="small"
            style={{ background: '#1e1e1e', color: '#d4d4d4' }}
          >
            <div style={{ marginBottom: 8 }}>
              <Badge status={stateColor(wsState)} text={wsState} />
              <Tag color="blue" style={{ marginLeft: 8 }}>重试: {wsRetry}</Tag>
            </div>
            <div style={{ maxHeight: 250, overflowY: 'auto' }}>
              {wsMessages.map((msg, i) => (
                <div key={i} style={{ padding: '3px 0', borderBottom: '1px solid #333', fontSize: '0.8rem', color: '#f0a0a0' }}>
                  {msg}
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title={<span><NotificationOutlined /> SSE 通道（低频单向）</span>}
            size="small"
            style={{ background: '#1e1e1e', color: '#d4d4d4' }}
          >
            <div style={{ marginBottom: 8 }}>
              <Badge status={stateColor(sseState)} text={sseState} />
              <Tag color="blue" style={{ marginLeft: 8 }}>重试: {sseRetry}</Tag>
            </div>
            <div style={{ maxHeight: 250, overflowY: 'auto' }}>
              {sseMessages.map((msg, i) => (
                <div key={i} style={{ padding: '3px 0', borderBottom: '1px solid #333', fontSize: '0.8rem', color: '#a0c0f0' }}>
                  {msg}
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// ==================== 主页面 ====================

const SSEReconnectHybridPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>{SSEReconnectHybridExamples.title}</Title>
      <Paragraph>
        在同一个应用中<strong>同时使用 WebSocket 和 SSE</strong>，
        根据数据特征选择最合适的传输通道，两者共享统一的重连基础设施。
      </Paragraph>

      {/* 一、是什么 */}
      <Card title="一、是什么" style={{ marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>{SSEReconnectHybridExamples.what}</Paragraph>
      </Card>

      {/* 二、为什么 */}
      <Card title="二、为什么需要混合方案" style={{ marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>{SSEReconnectHybridExamples.why}</Paragraph>
      </Card>

      {/* 三、怎么做 */}
      <Card title="三、怎么做" style={{ marginBottom: 24 }}>
        <Paragraph>
          <Text strong>核心思路：</Text>统一连接管理器，按消息类型自动路由到对应通道，
          重连策略、心跳检测等基础设施共享。
        </Paragraph>
        <CodeBlock code={SSEReconnectHybridExamples.how} title="混合架构实现" type="success" language="typescript" />
      </Card>

      {/* 四、互动演示 */}
      <Card
        title={<span>四、互动演示 <Tag color="blue">Live Demo</Tag></span>}
        style={{ marginBottom: 24 }}
      >
        <Alert
          type="info"
          showIcon
          message="观察 WebSocket（高频）和 SSE（低频）两条通道的独立重连行为"
          style={{ marginBottom: 16 }}
        />
        <HybridReconnectDemo />
      </Card>

      {/* 五、优缺点 */}
      <Card title="五、优缺点" style={{ marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>{SSEReconnectHybridExamples.prosCons}</Paragraph>
      </Card>

      {/* 六、适用场景 */}
      <Card title="六、适用场景" style={{ marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>{SSEReconnectHybridExamples.whenToUse}</Paragraph>
      </Card>

      {/* 七、注意事项 */}
      <Card title="七、注意事项" style={{ background: '#fffbe6', marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>{SSEReconnectHybridExamples.caveats}</Paragraph>
      </Card>

      {/* 八、架构图 */}
      <Card title="八、整体架构" style={{ background: '#f0f5ff' }}>
        <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 6, fontSize: 13, lineHeight: 1.6 }}>
          {SSEReconnectHybridExamples.architecture}
        </pre>
      </Card>
    </div>
  );
};

export default SSEReconnectHybridPage;
