/**
 * SSE 重连专题 - 方案四：WebSocket + SSE 混合重连
 * 分层推送策略，两者共享重连基础设施
 * 遵循六维要求
 */

export const SSEReconnectHybridExamples = {
  title: '方案四：WebSocket + SSE 混合重连',

  // ===== 一、是什么 =====
  what: `在同一个应用中同时使用 WebSocket 和 SSE，根据数据特征选择最合适的传输通道：

• WebSocket：负责高频、双向、实时性要求极高的操作
  - 用户输入、协作编辑光标、实时游戏操作
  - 需要客户端主动推送的场景

• SSE：负责低频、单向、可容忍延迟的通知
  - 系统通知、状态变更、日志推送
  - 服务端主动推送、客户端只需接收的场景

两者共享同一套重连基础设施：
  - 统一的指数退避策略
  - 统一的心跳检测
  - 统一的连接状态管理
  - 统一的错误分类处理`,

  // ===== 二、为什么 =====
  why: `单一方案各有局限：

WebSocket 的问题：
• 连接成本高：需要 Upgrade 握手，代理/防火墙可能拦截
• 心跳维护复杂：需要双向 ping/pong，代码量大
• 重连后状态恢复困难：需要重新同步完整状态
• 移动端耗电：保持长连接需要频繁心跳

SSE 的问题：
• 单向-only：客户端无法主动推送
• 浏览器并发限制：HTTP/1.1 下每个域名最多 6 个连接
• 无二进制支持：只能传文本

混合方案的优势：
• WebSocket 只做它擅长的事（高频双向）
• SSE 做它擅长的事（低频单向推送）
• 两者互补，避免各自的短板
• 共享重连逻辑，减少代码重复`,

  // ===== 三、怎么做 =====
  how: `// 统一的连接管理器
class ConnectionManager {
  constructor(options) {
    this.options = options
    this.ws = null        // WebSocket 实例
    this.sse = null       // SSE 实例
    this.reconnectPolicy = new ReconnectPolicy(options)
    this.state = { ws: 'closed', sse: 'closed' }
  }

  // 同时连接两种通道
  async connect() {
    // WebSocket：高频双向通道
    this.ws = new RobustWebSocket(this.options.wsUrl, {
      reconnectPolicy: this.reconnectPolicy,
      heartbeatInterval: 30000,  // 30s 心跳
      onMessage: (data) => this._handleWsMessage(data),
      onStateChange: (s) => this._updateState('ws', s),
    })

    // SSE：低频单向通知通道
    this.sse = new RobustEventSource(this.options.sseUrl, {
      reconnectPolicy: this.reconnectPolicy,
      heartbeatInterval: 45000,  // 45s 心跳（SSE 可更宽松）
      onMessage: (data) => this._handleSseMessage(data),
      onStateChange: (s) => this._updateState('sse', s),
    })

    await Promise.all([
      this.ws.connect(),
      this.sse.connect(),
    ])
  }

  // 统一的消息路由
  _handleWsMessage(data) {
    switch (data.type) {
      case 'cursor':      // 协作光标 → WebSocket
      case 'edit':        // 实时编辑 → WebSocket
      case 'typing':      // 正在输入 → WebSocket
        this.emit('realtime', data)
        break
    }
  }

  _handleSseMessage(data) {
    switch (data.type) {
      case 'notification': // 系统通知 → SSE
      case 'status':       // 状态变更 → SSE
      case 'log':          // 日志推送 → SSE
        this.emit('notification', data)
        break
    }
  }

  // 发送消息：根据类型自动选择通道
  send(data) {
    if (data.priority === 'high' || data.expectReply) {
      // 高优先级或需要回复 → WebSocket
      this.ws.send(data)
    } else {
      // 普通通知 → 用 HTTP POST（不占用 WebSocket）
      fetch('/api/notify', { method: 'POST', body: JSON.stringify(data) })
    }
  }
}

// 共享的重连策略
class ReconnectPolicy {
  constructor(options) {
    this.maxRetries = options.maxRetries ?? 10
    this.baseDelay = options.baseDelay ?? 1000
    this.maxDelay = options.maxDelay ?? 30000
  }

  getDelay(attempt) {
    const delay = Math.min(
      this.baseDelay * Math.pow(2, attempt),
      this.maxDelay
    )
    const jitter = delay * 0.2 * Math.random()
    return delay + jitter
  }

  shouldRetry(error, attempt) {
    if (attempt >= this.maxRetries) return false

    // WebSocket 错误码判断
    if (error.code === 1006) return true  // 异常关闭
    if (error.code === 1001) return false // 正常关闭

    // HTTP 错误码判断
    if (error.status >= 500) return true
    if (error.status === 429) return true
    if (error.status >= 400) return false

    // 网络错误
    if (error.type === 'network') return true

    return false
  }
}`,

  // ===== 四、优缺点 =====
  prosCons: `优点：
✓ 各取所长：WebSocket 做高频双向，SSE 做低频单向
✓ 代码复用：重连策略、心跳检测、状态管理统一实现
✓ 容错增强：一条通道故障时，另一条仍可工作（降级）
✓ 资源优化：SSE 心跳更宽松，减少移动端耗电
✓ 防火墙友好：SSE 走标准 HTTP，穿透性更好

缺点：
✗ 架构复杂：需要维护两套连接和路由逻辑
✗ 状态同步：两条通道的消息顺序需要协调
✗ 调试困难：问题定位时需要区分是哪条通道的问题
✗ 过度设计：简单场景下增加不必要的复杂度`,

  // ===== 五、适用场景 =====
  whenToUse: `适用：
• 实时协作编辑（飞书文档、Notion、Google Docs）
  - WebSocket：光标位置、实时输入
  - SSE：评论通知、权限变更、版本更新

• 在线游戏/直播
  - WebSocket：玩家操作、弹幕发送
  - SSE：系统公告、礼物通知、在线人数

• 金融交易系统
  - WebSocket：订单提交、成交回报
  - SSE：行情推送、风险预警、系统通知

• 大型 SaaS 平台
  - WebSocket：实时配置同步
  - SSE：全局通知、审计日志

不适用：
• 简单聊天应用 —— 单一 WebSocket 就够了
• 纯数据看板 —— 单一 SSE 就够了
• 资源受限的嵌入式设备 —— 维护两套连接开销大`,

  // ===== 六、注意事项 =====
  caveats: `1. 消息顺序保证
   WebSocket 和 SSE 是独立通道，消息到达顺序可能不一致。
   需要全局时间戳或序列号来排序。

2. 连接状态一致性
   WebSocket 已连接但 SSE 断开时，应用处于"半可用"状态。
   UI 需要精确展示每条通道的状态。

3. 避免重复推送
   如果两条通道订阅了同一类消息，可能收到重复数据。
   建议按消息类型明确划分通道职责。

4. 重连风暴
   两条通道同时断开时，如果同时重连可能产生请求峰值。
   建议加随机抖动，或让两条通道错峰重连。

5. 移动端电池优化
   WebSocket 心跳 30s，SSE 心跳 45s，
   页面后台时暂停 WebSocket 心跳（SSE 可保持）。

6. 优雅降级
   WebSocket 连接失败时，关键操作应降级到 HTTP POST，
   而不是完全不可用。`,

  // 架构图
  architecture: `┌─────────────────────────────────────────────────────────────┐
│                    应用层（统一消息接口）                      │
│  connection.send(data) → 自动路由到合适通道                   │
│  connection.on('realtime', handler)                         │
│  connection.on('notification', handler)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
┌──────────────┐              ┌────────────────┐
│  WebSocket   │              │      SSE       │
│   通道       │              │     通道       │
├──────────────┤              ├────────────────┤
│ • 高频双向   │              │ • 低频单向     │
│ • 实时编辑   │              │ • 系统通知     │
│ • 用户输入   │              │ • 状态变更     │
│ • 协作光标   │              │ • 日志推送     │
└──────┬───────┘              └───────┬────────┘
       │                              │
       └──────────────┬───────────────┘
                      │
       ┌──────────────┴───────────────┐
       ▼                              ▼
┌──────────────────┐      ┌──────────────────┐
│   重连策略       │      │   心跳检测       │
│ • 指数退避       │      │ • 30s WS 心跳    │
│ • 错误分类       │      │ • 45s SSE 心跳   │
│ • 最大重试       │      │ • 超时自动重连   │
└──────────────────┘      └──────────────────┘`,
};
