/**
 * SSE 重连专题 - 方案三：EventSource 增强封装重连
 * 适用于单向推送场景，在原生基础上增强
 * 遵循六维要求
 */

export const SSEReconnectEnhancedExamples = {
  title: '方案三：EventSource 增强封装重连',

  // ===== 一、是什么 =====
  what: `在原生 EventSource 基础上封装一层，保留其自动重连能力的同时，
补充原生缺失的生产级功能：

• 页面生命周期感知：切后台暂停重连，回前台立即恢复
• 智能重连控制：最大重试次数、自定义退避算法
• 心跳检测：防止 TCP 连接假死
• 认证刷新：重连前自动更新 Token
• 连接状态管理：连接中/已连接/重连中/已关闭的完整状态机
• 优雅关闭：组件卸载时清理所有定时器，避免内存泄漏

这个方案适合：需要 EventSource 的简洁性，但又需要一些生产级增强的场景。`,

  // ===== 二、为什么 =====
  why: `原生 EventSource 自动重连虽然方便，但在生产环境有诸多问题：

1. 无限重连问题
   服务端宕机时，浏览器会无限重连，产生大量无效请求

2. 页面后台浪费资源
   用户切到其他 Tab 后，SSE 仍在后台不断重连，消耗电量和带宽

3. 认证 Token 过期
   长连接过程中 Token 可能过期，重连时需要用新 Token

4. 连接假死
   TCP 连接在代理层（如 Nginx）超时后可能处于半开状态，
   浏览器以为还连着，实际上数据早已不通

5. 无状态反馈
   前端无法知道当前是"连接中"还是"重连中"，用户体验差

增强封装就是在保留原生自动重连的基础上，解决上述问题。`,

  // ===== 三、怎么做 =====
  how: `class EnhancedEventSource {
  constructor(url, options = {}) {
    this.url = url
    this.options = options
    this.maxRetries = options.maxRetries ?? 10
    this.baseDelay = options.baseDelay ?? 1000
    this.maxDelay = options.maxDelay ?? 30000
    this.heartbeatInterval = options.heartbeatInterval ?? 45000

    this.retryCount = 0
    this.es = null
    this.state = 'closed' // closed | connecting | open | reconnecting
    this.listeners = new Map()
    this.heartbeatTimer = null
    this.lastMessageTime = Date.now()
    this.reconnectTimer = null

    // 页面可见性监听
    this._setupVisibilityHandler()
  }

  connect() {
    if (this.state === 'open' || this.state === 'connecting') return

    this._setState('connecting')
    this._connectInternal()
  }

  _connectInternal() {
    // 关闭旧连接
    this.es?.close()

    // 可选：重连前刷新 Token
    const url = this.options.getUrl
      ? this.options.getUrl()  // 动态获取 URL（可刷新 token）
      : this.url

    this.es = new EventSource(url)

    this.es.onopen = () => {
      this.retryCount = 0
      this.lastMessageTime = Date.now()
      this._setState('open')
      this._startHeartbeat()
      this._emit('open')
    }

    this.es.onmessage = (e) => {
      this.lastMessageTime = Date.now()
      this._emit('message', e)
    }

    // 自定义事件透传
    for (const event of (this.options.events || [])) {
      this.es.addEventListener(event, (e) => {
        this.lastMessageTime = Date.now()
        this._emit(event, e)
      })
    }

    // 错误处理：原生会自动重连，但我们加了一层控制
    this.es.onerror = (e) => {
      this._stopHeartbeat()

      if (this.retryCount >= this.maxRetries) {
        this._setState('closed')
        this._emit('fatal', new Error(\`重试 \${this.maxRetries} 次后放弃\`))
        return
      }

      // 指数退避
      const delay = Math.min(
        this.baseDelay * Math.pow(2, this.retryCount),
        this.maxDelay
      )
      const jitter = delay * 0.2 * Math.random()

      this.retryCount++
      this._setState('reconnecting')
      this._emit('reconnecting', { attempt: this.retryCount, delay: delay + jitter })

      // 注意：这里不手动重连！让原生 EventSource 自己重连
      // 我们只是记录状态和次数
    }
  }

  // 心跳检测：防止连接假死
  _startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      const elapsed = Date.now() - this.lastMessageTime
      if (elapsed > this.heartbeatInterval * 2) {
        // 超过 90s 没收到消息，认为连接已死
        this._emit('heartbeatTimeout', { elapsed })
        this.es.close()
        // 触发 onerror → 原生自动重连
      }
    }, this.heartbeatInterval)
  }

  _stopHeartbeat() {
    clearInterval(this.heartbeatTimer)
  }

  // 页面可见性处理
  _setupVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // 切后台：暂停心跳检测（省资源）
        this._stopHeartbeat()
      } else {
        // 切回前台：检查连接状态
        if (this.state !== 'open') {
          this._emit('visibilityResume')
          // 如果连接已断，原生 EventSource 应该已经在重连了
          // 如果处于假死状态，心跳检测会在下次触发时处理
        }
        this._startHeartbeat()
      }
    })
  }

  _setState(newState) {
    this.state = newState
    this._emit('statechange', newState)
  }

  on(event, handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, [])
    this.listeners.get(event).push(handler)
    return this
  }

  _emit(event, data) {
    this.listeners.get(event)?.forEach(h => h(data))
  }

  close() {
    this._stopHeartbeat()
    clearTimeout(this.reconnectTimer)
    this.es?.close()
    this._setState('closed')
    this.listeners.clear()
  }
}`,

  // ===== 四、优缺点 =====
  prosCons: `优点：
✓ 保留原生自动重连：Last-Event-ID 断点续传无需额外实现
✓ 代码量适中：比 fetch 方案少很多，比原生多一些
✓ 页面生命周期感知：切后台省资源，回前台快速恢复
✓ 心跳检测：防止连接假死
✓ 完整状态机：UI 可以精确展示连接状态

缺点：
✗ 仍不支持 POST 和自定义请求头
✗ 重连间隔仍受浏览器限制（只能通过 retry 字段调整）
✗ 原生重连和自定义重连可能冲突（需要仔细设计）
✗ 心跳检测与原生重连的时序需要仔细处理`,

  // ===== 五、适用场景 =====
  whenToUse: `适用：
• 内部通知推送（钉钉、飞书类应用）—— 单向推送，需要认证但可用 query string 传 token
• 实时数据看板 —— 需要心跳检测防止假死
• 股票行情/体育比分 —— 页面生命周期感知很重要
• 需要断点续传但不需要 POST 的场景

不适用：
• AI 流式对话 —— 必须 POST + Authorization Header
• 需要精确控制重连间隔的场景 —— 原生 retry 字段粒度太粗`,

  // ===== 六、注意事项 =====
  caveats: `1. 原生重连和自定义重连不要重复
   原生 EventSource 已经在后台自动重连了，
   你的封装层只负责"监控"和"增强"，不要手动再创建新连接

2. 心跳检测间隔要合理
   • 太短：频繁检查，浪费资源
   • 太长：假死发现不及时
   • 建议：心跳间隔 30-45s，超时阈值 90s（2倍间隔）

3. visibilitychange 不是 100% 可靠
   某些浏览器在后台仍可能冻结 JavaScript 执行，
   回前台后建议主动检查连接健康状态

4. Token 刷新要异步
   getUrl() 可能是异步的（需要请求新 token），
   确保在拿到新 URL 后再创建 EventSource

5. 内存泄漏防护
   组件卸载时务必调用 close()，清理：
   • EventSource 实例
   • 心跳定时器
   • visibilitychange 监听器
   • 所有自定义事件监听器`,

  // 状态机图示
  stateMachine: `状态流转：

  ┌─────────┐    connect()     ┌───────────┐
  │  closed │ ───────────────→ │ connecting│
  └─────────┘                  └─────┬─────┘
       ↑                             │ onopen
       │                             ▼
       │ close()              ┌───────────┐
       └───────────────────── │   open    │
                              └─────┬─────┘
                                    │ onerror
                                    ▼
                              ┌───────────┐
                              │reconnecting│ ← 原生自动重连中
                              └─────┬─────┘
                                    │ 超过 maxRetries
                                    ▼
                              ┌───────────┐
                              │   fatal   │
                              └───────────┘`,
};
