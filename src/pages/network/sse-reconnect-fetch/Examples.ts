/**
 * SSE 重连专题 - 方案二：自定义 Fetch + ReadableStream 重连
 * 大厂主流方案（OpenAI/Claude/Gemini）
 * 遵循六维要求
 */

export const SSEReconnectFetchExamples = {
  title: '方案二：自定义 Fetch + ReadableStream 重连',

  // ===== 一、是什么 =====
  what: `使用 fetch() API 手动发起 SSE 请求，通过 ReadableStream 逐帧读取数据，自己实现完整的重连逻辑。

这是目前 AI 流式对话场景的事实标准：
• OpenAI ChatGPT、Anthropic Claude、Google Gemini 都采用此方案
• 支持 POST 请求和自定义请求头（Authorization、Content-Type 等）
• 完全可控的重连策略：指数退避、最大重试次数、错误分类
• 可接入自己的日志、监控、埋点系统

核心流程：
fetch() → response.body.getReader() → reader.read() → 解析 SSE 帧 → 错误时触发重连`,

  // ===== 二、为什么 =====
  why: `原生 EventSource 有两大致命缺陷，无法满足生产需求：

1. 不支持 POST 请求
   AI 对话需要发送对话历史、模型参数、温度等大量数据，GET 查询字符串有长度限制

2. 不支持自定义请求头
   无法携带 Authorization: Bearer <token>，意味着无法做身份认证

3. 重连策略不可控
   固定间隔、无限重试、无错误分类，在弱网和高并发场景下表现极差

大厂选择 fetch + 手写重连，是为了：
• 精确控制每一次重连的时机和间隔
• 区分"可重试错误"（网络断开）和"不可重试错误"（401/403）
• 集成心跳检测，防止 TCP 假死
• 页面不可见时暂停重连，节省资源`,

  // ===== 三、怎么做 =====
  how: `// 核心：fetch + ReadableStream + 指数退避重连
class FetchEventSource {
  constructor(url, options = {}) {
    this.url = url
    this.options = options
    this.maxRetries = options.maxRetries ?? 5
    this.baseDelay = options.baseDelay ?? 1000
    this.maxDelay = options.maxDelay ?? 30000
    this.retryCount = 0
    this.abortController = null
    this.listeners = new Map()
  }

  async connect() {
    this.abortController = new AbortController()

    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${this.options.token}\`,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(this.options.body),
        signal: this.abortController.signal,
      })

      // 错误分类：4xx 不重试，5xx 和网络错误才重试
      if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
          this._emit('error', new Error(\`HTTP \${response.status}: 客户端错误，停止重试\`))
          return
        }
        throw new Error(\`HTTP \${response.status}\`)
      }

      this.retryCount = 0
      this._emit('open')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // 解析 SSE 帧：按 \\n\\n 分割
        const frames = buffer.split('\\n\\n')
        buffer = frames.pop() // 最后一段可能不完整

        for (const frame of frames) {
          const data = this._parseFrame(frame)
          if (data) this._emit('message', data)
        }
      }

      // 正常结束，不重连
      this._emit('close')

    } catch (err) {
      if (err.name === 'AbortError') return
      this._scheduleReconnect(err)
    }
  }

  // 指数退避 + 抖动
  _scheduleReconnect(err) {
    if (this.retryCount >= this.maxRetries) {
      this._emit('fatal', new Error(\`重试 \${this.maxRetries} 次后放弃: \${err.message}\`))
      return
    }

    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.retryCount),
      this.maxDelay
    )
    const jitter = delay * 0.2 * Math.random()
    const finalDelay = delay + jitter

    this.retryCount++
    this._emit('reconnecting', { attempt: this.retryCount, delay: finalDelay })

    setTimeout(() => this.connect(), finalDelay)
  }

  _parseFrame(frame) {
    const lines = frame.split('\\n')
    let data = ''
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        data += line.slice(6)
      }
    }
    return data ? JSON.parse(data) : null
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
    this.abortController?.abort()
    this.listeners.clear()
  }
}

// 使用
const source = new FetchEventSource('/api/chat', {
  token: 'sk-xxx',
  body: { messages: [...], model: 'gpt-4' },
  maxRetries: 5,
})

source
  .on('message', data => console.log('收到:', data))
  .on('reconnecting', ({ attempt, delay }) =>
    console.log(\`第 \${attempt} 次重连，\${delay.toFixed(0)}ms 后尝试...\`)
  )
  .on('fatal', err => console.error('彻底失败:', err))

source.connect()`,

  // ===== 四、优缺点 =====
  prosCons: `优点：
✓ 支持 POST + 自定义请求头（认证、参数传递）
✓ 完全可控的重连策略（间隔、次数、退避算法）
✓ 错误分类处理（4xx 不重试，5xx/网络错误才重试）
✓ 可集成心跳检测、页面生命周期感知
✓ 可接入日志、监控、埋点
✓ 与 HTTP/2 多路复用天然兼容

缺点：
✗ 代码量大：需要自己实现 SSE 帧解析、重连、错误处理
✗ 无内置 Last-Event-ID：断点续传需要手动实现
✗ 浏览器兼容性：ReadableStream 在旧浏览器需 polyfill
✗ 维护成本高：重连逻辑容易出 bug（竞态、内存泄漏）`,

  // ===== 五、适用场景 =====
  whenToUse: `适用：
• AI 流式对话（ChatGPT、Claude、文心一言）—— 必须 POST + 认证
• 移动端弱网环境 —— 需要指数退避
• 高并发场景 —— 需要限制重试次数，保护服务端
• 需要精细监控和埋点的场景

不适用：
• 快速原型/MVP —— 代码量大，开发成本高
• 公开数据推送 —— 用原生 EventSource 更简单
• 浏览器兼容性要求极高的场景（IE11）`,

  // ===== 六、注意事项 =====
  caveats: `1. 必须处理 AbortError
   用户主动关闭时 abortController.abort() 会抛出 AbortError，
   这不是真正的错误，不应触发重连

2. 解析 SSE 帧要注意兼容性
   标准格式是 data: xxx\\n\\n，但有些服务端用 \\r\\n 或单个 \\n
   建议用正则：/\\r?\\n\\r?\\n/

3. 心跳检测不能省
   TCP 连接可能假死（尤其移动端），建议 30-45s 无数据主动重连

4. 页面可见性 API 配合
   document.hidden 时暂停重连计时器，切回前台时立即检查连接

5. 重连时重新获取 token
   token 可能过期，重连前应该先刷新认证凭据

6. 竞态处理
   旧连接的数据不应覆盖新连接的数据，建议用连接 ID 或时间戳做版本控制`,

  // OpenAI 重连策略参考
  openaiStrategy: `// OpenAI SDK 的重连策略（参考实现）
const retryOptions = {
  // 初始延迟 1s，最大 60s
  minTimeout: 1000,
  maxTimeout: 60000,

  // 最多重试 2 次（他们倾向让用户手动重试，避免意外费用）
  retries: 2,

  // 只重试特定错误
  retryCondition: (error) => {
    // 网络错误：重试
    if (error.code === 'ECONNRESET') return true
    if (error.code === 'ETIMEDOUT') return true

    // 5xx 服务端错误：重试
    if (error.status >= 500) return true

    // 429 限流：重试（但需要更长的退避）
    if (error.status === 429) return true

    // 4xx 客户端错误：不重试
    return false
  },

  // 指数退避 + 抖动
  backoff: (attempt) => {
    const base = Math.pow(2, attempt) * 1000
    const jitter = Math.random() * 1000
    return Math.min(base + jitter, 60000)
  }
}`,
};
