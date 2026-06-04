/**
 * WebSocket 全双工通信演示 - 代码示例与说明
 *
 * 本文件存放所有与 WebSocket 演示相关的代码示例字符串，
 * 通过 CodeBlock 组件渲染到页面上。
 */

export const WsDemoExamples = {
  title: "WebSocket 全双工通信：实时聊天室 + 服务端主动推送",

  /** 一、现象描述 */
  phenomenon: `传统的 HTTP 请求-响应模型是"一问一答"：
- 客户端不请求，服务端就不能主动发数据
- 即使使用 SSE，也只是服务端单向推送，客户端无法通过同一条连接发送数据

而 WebSocket 建立的是一条"双向管道"：
- 客户端可以随时发消息给服务端
- 服务端也可以随时主动推送消息给客户端
- 两者互不阻塞，真正意义上的"全双工"通信`,

  /** 二、底层原因 */
  rootCause: `WebSocket 全双工的核心在于三层协议设计：

1️⃣ 传输层：TCP 本身就是全双工的
  - TCP 连接的两端各自维护发送缓冲区和接收缓冲区
  - 发送方只管往管道里写数据，接收方只管从管道里读数据
  - 读写操作在同一个 TCP 连接上可以同时进行，互不干扰

2️⃣ 协议层：HTTP Upgrade 升级到 WebSocket 协议
  - 客户端发送 Connection: Upgrade + Upgrade: websocket 请求
  - 服务端回复 101 Switching Protocols，将同一个 TCP 连接"升级"
  - 升级后，双方不再遵循 HTTP 的请求-响应模式，而是自由的帧通信

3️⃣ 帧结构：轻量级帧头实现高效多路复用
  - 每个帧只有 2-14 字节的头部（HTTP 请求头约 800 字节）
  - 通过 opcode 区分文本帧、二进制帧、控制帧（Ping/Pong/Close）
  - 控制帧可以"插队"发送，保证心跳检测的实时性`,

  /** 三、解决方案 — 前端代码示例 */
  frontendCode: [
    '// ========== 前端 WebSocket 连接与通信 ==========',
    '',
    'class ChatRoom {',
    '  private ws: WebSocket | null = null;',
    '  private url: string;',
    '  private reconnectAttempts = 0;',
    '  private maxReconnectAttempts = 5;',
    '',
    '  constructor(room: string = "default") {',
    '    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";',
    '    const host = window.location.host;',
    '    this.url = protocol + "//" + host + "/ws/chat?room=" + room;',
    '  }',
    '',
    '  connect() {',
    '    this.ws = new WebSocket(this.url);',
    '',
    '    // 连接建立时触发',
    '    this.ws.onopen = () => {',
    '      console.log("[WS] 连接已建立");',
    '      this.reconnectAttempts = 0;',
    '    };',
    '',
    '    // 收到消息时触发（服务端 → 客户端）',
    '    this.ws.onmessage = (event) => {',
    '      const data = JSON.parse(event.data);',
    '      // data.type: "chat" | "system" | "userinfo" | "ping"',
    '      this.handleMessage(data);',
    '    };',
    '',
    '    // 连接关闭时触发',
    '    this.ws.onclose = (event) => {',
    '      console.log("[WS] 连接关闭:", event.code);',
    '      this.reconnect();',
    '    };',
    '',
    '    // 连接出错时触发',
    '    this.ws.onerror = (error) => {',
    '      console.error("[WS] 连接错误:", error);',
    '    };',
    '  }',
    '',
    '  // 发送消息（客户端 → 服务端）',
    '  send(content: string) {',
    '    if (this.ws?.readyState === WebSocket.OPEN) {',
    '      this.ws.send(JSON.stringify({ type: "message", content }));',
    '    }',
    '  }',
    '',
    '  // 指数退避重连',
    '  private reconnect() {',
    '    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;',
    '    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);',
    '    console.log(`[WS] ${delay}ms 后重连...`);',
    '    setTimeout(() => {',
    '      this.reconnectAttempts++;',
    '      this.connect();',
    '    }, delay);',
    '  }',
    '',
    '  close() {',
    '    this.ws?.close(1000, "用户主动断开");',
    '  }',
    '}',
  ].join('\n'),

  /** 三、解决方案 — 后端代码示例 */
  backendCode: [
    '// ========== Spring WebFlux WebSocket Handler ==========',
    '',
    'public class ChatWebSocketHandler implements WebSocketHandler {',
    '',
    '    @Override',
    '    public Mono<Void> handle(WebSocketSession session) {',
    '        // 入站消息流（客户端 → 服务端）',
    '        Mono<Void> input = session.receive()',
    '            .map(WebSocketMessage::getPayloadAsText)',
    '            .doOnNext(payload -> {',
    '                // 解析消息，广播到房间所有客户端',
    '                broadcastToRoom(room, buildChatMsg(sender, content));',
    '            })',
    '            .then();',
    '',
    '        // 出站消息流（服务端 → 客户端）',
    '        // 定时推送在线人数和系统通知',
    '        Flux<WebSocketMessage> heartbeat = Flux',
    '            .interval(Duration.ofSeconds(5))',
    '            .map(tick -> session.textMessage(',
    '                buildSystemMsg("在线人数: " + count)));',
    '',
    '        Mono<Void> output = session.send(heartbeat);',
    '',
    '        // ⚡ 全双工核心：input 和 output 同时执行，互不阻塞',
    '        return Mono.when(input, output);',
    '    }',
    '}',
  ].join('\n'),

  /** 五、核心原理 */
  corePrinciples: `1️⃣ 全双工 ≠ 同时收发
  - 严格来说 WebSocket 的帧在单个 TCP 连接上是串行传输的
  - 但在应用层，发送和接收是独立的两个流，互不阻塞
  - 真正的全双工体现在：双方随时可以主动发起通信

2️⃣ WebSocket 与 HTTP/2 的关系
  - HTTP/2 也支持服务端推送，但推送的是"关联响应"
  - WebSocket 是独立的帧协议，自由度更高
  - WebSocket 的帧开销比 HTTP/2 的 Stream 更小

3️⃣ 保活机制的三层保证
  - TCP Keep-Alive（系统层，默认 2 小时）
  - WebSocket Ping/Pong（协议层，可自定义间隔）
  - 应用层心跳（业务层，自定义消息体）

4️⃣ 断线重连不是协议的一部分
  - WebSocket 标准不定义断线重连机制
  - 需要应用层自己实现（指数退避 + 消息去重）
  - 这是 WebSocket 对比 SSE 的一个劣势`,
};
