import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Typography, Alert, Divider, Tag, Button, Space, Badge, Input } from 'antd';
import {
  SendOutlined,
  PlayCircleOutlined,
  StopOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import CodeBlock from '@/components/CodeBlock';
import { WsDemoExamples } from './Examples';

const { Title, Paragraph, Text } = Typography;

// ==================== 消息类型定义 ====================

interface ChatMessage {
  type: 'chat' | 'system' | 'userinfo' | 'ping';
  sender?: string;
  content: string;
  timestamp: string;
  userId?: number;
  direction?: 'sent' | 'received';
}

// ==================== 互动演示组件 ====================

const WsChatDemo: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [userNick, setUserNick] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [reconnectCount, setReconnectCount] = useState(0);
  const msgContainerRef = useRef<HTMLDivElement>(null);
  const reconnectAttemptsRef = useRef(0);
  const wsRef = useRef<WebSocket | null>(null);

  // 仅滚动消息容器，不影响外层页面
  const scrollToBottom = () => {
    const el = msgContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const connectWs = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const url = protocol + '//' + host + '/ws/chat?room=demo-room';

    const socket = new WebSocket(url);
    wsRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      reconnectAttemptsRef.current = 0;
      setReconnectCount(0);
      addMessage({
        type: 'system',
        content: '✅ 已连接到 WebSocket 服务',
        timestamp: new Date().toLocaleTimeString(),
        direction: 'received',
      });
    };

    socket.onmessage = (event) => {
      try {
        const d = JSON.parse(event.data);
        if (d.type === 'userinfo') {
          setUserNick(d.nick);
          addMessage({
            type: 'system',
            content: '你的身份: ' + d.nick,
            timestamp: d.timestamp,
            direction: 'received',
          });
        } else if (d.type === 'chat') {
          addMessage({
            type: 'chat',
            sender: d.sender,
            content: d.content,
            timestamp: d.timestamp,
            direction: 'received',
          });
        } else if (d.type === 'system') {
          const m = d.content.match(/在线.*?(\d+)/);
          if (m) setOnlineCount(parseInt(m[1]));
          addMessage({
            type: 'system',
            content: d.content,
            timestamp: d.timestamp,
            direction: 'received',
          });
        }
      } catch {
        addMessage({
          type: 'system',
          content: event.data,
          timestamp: new Date().toLocaleTimeString(),
          direction: 'received',
        });
      }
    };

    socket.onclose = (event) => {
      setConnected(false);
      if (event.code !== 1000) {
        const attempt = reconnectAttemptsRef.current + 1;
        reconnectAttemptsRef.current = attempt;
        setReconnectCount(attempt);
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        addMessage({
          type: 'system',
          content: '🔌 连接断开 (code: ' + event.code + ')，' + Math.round(delay / 1000) + 's 后重连...',
          timestamp: new Date().toLocaleTimeString(),
          direction: 'received',
        });
        setTimeout(() => {
          if (wsRef.current?.readyState !== WebSocket.OPEN) {
            connectWs();
          }
        }, delay);
      } else {
        addMessage({
          type: 'system',
          content: '👋 已主动断开连接',
          timestamp: new Date().toLocaleTimeString(),
          direction: 'received',
        });
      }
    };

    socket.onerror = () => {
      addMessage({
        type: 'system',
        content: '❌ 连接错误',
        timestamp: new Date().toLocaleTimeString(),
        direction: 'received',
      });
    };
  }, [addMessage]);

  const disconnectWs = useCallback(() => {
    wsRef.current?.close(1000, 'user-disconnect');
    wsRef.current = null;
    setConnected(false);
  }, []);

  const sendMessage = useCallback(() => {
    const content = inputVal.trim();
    if (!content || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({ type: 'message', content }));

    addMessage({
      type: 'chat',
      sender: '我',
      content,
      timestamp: new Date().toLocaleTimeString(),
      direction: 'sent',
    });
    setInputVal('');
  }, [inputVal, addMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button type="primary" icon={<PlayCircleOutlined />} onClick={connectWs} disabled={connected}>
          连接 WebSocket
        </Button>
        <Button danger icon={<StopOutlined />} onClick={disconnectWs} disabled={!connected}>
          断开连接
        </Button>
        <Badge
          status={connected ? 'success' : 'default'}
          text={connected ? '已连接' : '未连接'}
        />
        {userNick && <Tag icon={<TeamOutlined />} color="blue">{userNick}</Tag>}
        {onlineCount > 0 && <Tag color="green">在线: {onlineCount} 人</Tag>}
        {reconnectCount > 0 && <Tag color="orange">重连: {reconnectCount} 次</Tag>}
      </Space>

      <Alert
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        message={
          <span>
            输入消息发送到服务端，观察服务端广播和主动推送。
            <Text strong>试试发送 "ping"、"时间"、"websocket"</Text> 触发自动回复。
          </span>
        }
        style={{ marginBottom: 16 }}
      />

      {/* 消息列表 —— 用 ref 精确定位滚动容器 */}
      <div
        ref={msgContainerRef}
        style={{
          height: 350,
          overflowY: 'auto',
          background: '#fafafa',
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
          border: '1px solid #e8e8e8',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', marginTop: 120 }}>
            点击「连接 WebSocket」开始演示
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              padding: '6px 12px',
              borderRadius: 12,
              maxWidth: msg.type === 'system' ? '90%' : '70%',
              wordBreak: 'break-word',
              background:
                msg.direction === 'sent'
                  ? '#1677ff'
                  : msg.type === 'system'
                    ? '#f0f0f0'
                    : '#f6f8fa',
              color:
                msg.direction === 'sent'
                  ? '#fff'
                  : msg.type === 'system'
                    ? '#666'
                    : '#333',
              alignSelf:
                msg.direction === 'sent'
                  ? 'flex-end'
                  : msg.type === 'system'
                    ? 'center'
                    : 'flex-start',
              borderBottomRightRadius: msg.direction === 'sent' ? 4 : 12,
              borderBottomLeftRadius:
                msg.direction === 'received' && msg.type !== 'system' ? 4 : 12,
              fontSize: msg.type === 'system' ? '0.8rem' : 'inherit',
            }}
          >
            {msg.type === 'chat' && msg.sender && (
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  marginBottom: 2,
                  color: msg.direction === 'sent' ? 'rgba(255,255,255,0.85)' : '#1677ff',
                }}
              >
                {msg.sender}
              </div>
            )}
            <div>{msg.content}</div>
            <div
              style={{
                fontSize: '0.65rem',
                opacity: 0.6,
                textAlign: 'right',
                marginTop: 2,
              }}
            >
              {msg.timestamp}
            </div>
          </div>
        ))}
      </div>

      <Space.Compact style={{ width: '100%' }}>
        <Input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={connected ? '输入消息回车发送...' : '请先连接 WebSocket'}
          disabled={!connected}
          style={{ flex: 1 }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={sendMessage}
          disabled={!connected || !inputVal.trim()}
        >
          发送
        </Button>
      </Space.Compact>

      <div style={{ marginTop: 12, fontSize: '0.75rem', color: '#999' }}>
        ⬆️ 蓝色气泡 = 你发送的消息 | ⬇️ 灰色气泡 = 服务端推送的消息 | 浅灰色 = 系统通知
        <br />
        💡 服务端每隔 5 秒自动推送在线人数和知识提示
      </div>
    </div>
  );
};

// ==================== 方向对比图 ====================

const DirectionDiagram: React.FC = () => {
  const lines = [
    '┌─────────────────────────────────────────────────────────────────┐',
    '│                    HTTP 请求-响应（半双工）                       │',
    '│                                                                 │',
    '│  客户端 ──────►  服务端（只有客户端请求后才有响应）              │',
    '│  客户端 ◄──────  服务端                                         │',
    '│                    ▲                                            │',
    '│                    └── 客户端不请求，服务端不能主动发            │',
    '├─────────────────────────────────────────────────────────────────┤',
    '│                    WebSocket（全双工）                            │',
    '│                                                                 │',
    '│  客户端 ◄══════════════════════════════► 服务端                  │',
    '│       ↕  WebSocket Frame                   ↕                    │',
    '│                                                                 │',
    '│  ① 客户端随时发: "你好"     ──────────────►                    │',
    '│  ②                   ◄────── 广播: "用户1说: 你好"             │',
    '│  ③                   ◄────── 系统: "当前在线 3 人"              │',
    '│  ④ 客户端随时发: "ping"    ──────────────►                    │',
    '│  ⑤                   ◄────── 系统: "🏓 pong！"                 │',
    '│                                                                 │',
    '│  ⚡ ②和③是服务端主动推送，不需要客户端发起请求！                 │',
    '└─────────────────────────────────────────────────────────────────┘',
  ].join('\n');

  return (
    <div
      style={{
        background: '#1e1e1e',
        color: '#d4d4d4',
        padding: 20,
        borderRadius: 8,
        fontFamily: 'monospace',
        fontSize: 13,
        lineHeight: 1.8,
        overflowX: 'auto',
      }}
    >
      <pre style={{ margin: 0 }}>{lines}</pre>
    </div>
  );
};

// ==================== 帧结构图 ====================

const FrameDiagram: React.FC = () => {
  const lines = [
    ' 0                   1                   2                   3',
    ' 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1',
    '+-+-+-+-+-------+-+-------------+-------------------------------+',
    '|F|R|R|R| opcode|M| Payload len |    Extended payload length    |',
    '|I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |',
    '|N|V|V|V|       |S|             |   (if payload len==126/127)   |',
    '| |1|2|3|       |K|             |                               |',
    '+-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +',
    '|               Extended payload length continued                |',
    '+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +',
    '| Masking-key (if MASK set to 1)                                 |',
    '+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +',
    ':               Payload Data (可变长度)                          :',
    '+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +',
    '',
    '关键字段说明:',
    '  FIN     : 1 bit，标记是否为消息的最后一帧（分片标志）',
    '  opcode  : 4 bits，帧类型（0x1=文本, 0x2=二进制, 0x9=Ping, 0xA=Pong）',
    '  MASK    : 1 bit，客户端→服务端必须为 1（4 字节掩码防缓存污染）',
    '  Payload : 7/16/64 bits，数据长度，<=125 直接存，126 读 2 字节，127 读 8 字节',
  ].join('\n');

  return (
    <div
      style={{
        background: '#1e1e1e',
        color: '#d4d4d4',
        padding: 20,
        borderRadius: 8,
        fontFamily: 'monospace',
        fontSize: 13,
        lineHeight: 1.6,
        overflowX: 'auto',
      }}
    >
      <pre style={{ margin: 0 }}>{lines}</pre>
    </div>
  );
};

// ==================== 主页面 ====================

const WebSocketDemoPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>{WsDemoExamples.title}</Title>
      <Paragraph>
        WebSocket 是 HTML5 引入的<strong>全双工通信协议</strong>，在单个 TCP 连接上提供双向实时通信能力。
        本页面通过与后端的实时聊天演示，直观展示 WebSocket 的<strong>全双工特性</strong>：
        客户端和服务端可随时主动发送消息。
      </Paragraph>

      {/* 一、现象描述 */}
      <Card title="一、现象描述" style={{ marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>{WsDemoExamples.phenomenon}</Paragraph>
        <Divider />
        <DirectionDiagram />
      </Card>

      {/* 二、底层原因 */}
      <Card title="二、底层原因" style={{ marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>{WsDemoExamples.rootCause}</Paragraph>
        <Divider />
        <FrameDiagram />
      </Card>

      {/* 三、解决方案 */}
      <Card title="三、解决方案" style={{ marginBottom: 24 }}>
        <Title level={4}>前端 WebSocket 客户端实现</Title>
        <CodeBlock
          code={WsDemoExamples.frontendCode}
          title="ChatRoom 类 — 封装 WebSocket 连接、发送、重连"
          type="success"
          language="typescript"
        />
        <Divider />
        <Title level={4}>后端 Spring WebFlux WebSocket Handler</Title>
        <CodeBlock
          code={WsDemoExamples.backendCode}
          title="ChatWebSocketHandler — 全双工核心：入站 + 出站同时执行"
          type="success"
          language="java"
        />
      </Card>

      {/* 四、互动演示 + 权衡 */}
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
          icon={<ThunderboltOutlined />}
          message={
            <span>
              通过实时聊天演示 WebSocket 全双工通信。
              <Text strong>需要同时启动后端 (java-sse-backend)</Text>。
              输入消息后观察服务端广播和自动回复。
            </span>
          }
          style={{ marginBottom: 16 }}
        />
        <WsChatDemo />
      </Card>

      {/* 五、核心原理 */}
      <Card title="五、核心原理" style={{ background: '#f0f5ff' }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>{WsDemoExamples.corePrinciples}</Paragraph>
      </Card>
    </div>
  );
};

export default WebSocketDemoPage;
