/**
 * SSE 重连专题 - 方案一：原生 EventSource 自动重连
 * 遵循六维要求：是什么、为什么、怎么做、优缺点、适用场景、注意事项
 */

export const SSEReconnectNativeExamples = {
  title: '方案一：原生 EventSource 自动重连',

  // ===== 一、是什么 =====
  what: `原生 EventSource 是浏览器内置的 SSE 客户端 API，它自带了一套自动重连机制：

• 当连接异常断开（网络故障、服务端崩溃、超时）时，浏览器会自动尝试重新连接
• 重连时会自动携带 Last-Event-ID 请求头（如果服务端之前发送过 id 字段）
• 服务端可以通过 retry 字段控制重连间隔
• 如果服务端返回 HTTP 204，浏览器会停止重连`,

  // ===== 二、为什么 =====
  why: `SSE 连接在以下场景会断开：

1. 网络波动：WiFi 切换、4G/5G 切换、弱网环境
2. 服务端重启：部署更新、服务崩溃、负载均衡切换
3. 代理层超时：Nginx 默认 60s 无数据会断开连接
4. 客户端休眠：移动端锁屏、电脑休眠后 TCP 连接被回收

没有重连机制意味着：用户看到一半的内容突然停止，必须手动刷新页面才能恢复。`,

  // ===== 三、怎么做 =====
  how: `// 1. 基础用法：浏览器自动处理重连
const es = new EventSource('/api/sse')

es.onmessage = (e) => {
  console.log('收到:', e.data)
}

es.onerror = (e) => {
  // 连接断开时会触发，但浏览器会自动重连
  // 这里只用于状态展示，不需要手动重连
  console.log('连接异常，浏览器正在自动重连...')
}

// 2. 服务端控制重连间隔
res.write(\`retry: 5000\\n\`)  // 告诉浏览器 5 秒后再试
res.write(\`id: 42\\n\`)       // 设置消息 ID，用于断点续传
res.write(\`data: hello\\n\\n\`)

// 3. 服务端主动停止重连（返回 204）
// 浏览器收到 204 后，不会再尝试重连`,

  // ===== 四、优缺点 =====
  prosCons: `优点：
✓ 零代码实现：浏览器自动处理，前端无需编写重连逻辑
✓ 自动断点续传：重连时自动带上 Last-Event-ID
✓ 标准兼容：所有现代浏览器都支持

缺点：
✗ 重连间隔不可控：默认约 3 秒，只能通过服务端 retry 调整
✗ 无最大重试次数：会无限重连，服务端压力大时雪上加霜
✗ 无指数退避：固定间隔，不适合网络抖动场景
✗ 无法自定义请求头：不能带 Authorization Token
✗ 只支持 GET 请求：不能 POST 传参
✗ 无错误分类：4xx 和 5xx 都触发重连，浪费资源`,

  // ===== 五、适用场景 =====
  whenToUse: `适用：
• 公开数据推送（股票行情、天气、新闻）—— 无需认证
• 内部工具/管理后台 —— 网络环境稳定
• 快速原型/MVP —— 不想花时间写重连逻辑

不适用：
• AI 流式对话（需要 POST + Authorization）
• 移动端弱网环境（需要指数退避）
• 高并发场景（无限重连会压垮服务端）`,

  // ===== 六、注意事项 =====
  caveats: `1. 消息必须带 id 字段
   否则 Last-Event-ID 不会生效，重连后会收到重复消息

2. retry 字段单位是毫秒
   res.write('retry: 5000\\n')  // 5秒，不是5毫秒

3. 204 停止重连 vs 200 正常推送
   • 返回 204 → 浏览器永久停止重连
   • 返回 200 但无数据 → 浏览器会在 retry 时间后重连

4. onerror 里不要做手动重连
   浏览器已经在后台自动重连了，手动再连会导致重复连接

5. 组件卸载时记得 close()
   useEffect(() => () => es.close(), [])`,

  // 演示代码
  demoCode: `// 原生 EventSource 自动重连演示
const es = new EventSource('/api/sse')

let reconnectCount = 0

es.onopen = () => {
  reconnectCount = 0
  console.log('连接成功')
}

es.onmessage = (e) => {
  console.log('收到消息:', e.data)
}

es.onerror = (e) => {
  reconnectCount++
  console.log(\`第 \${reconnectCount} 次自动重连中...\`)
  // 注意：这里不需要手动重连！浏览器会自动处理
}`,

  // 服务端配合代码
  serverCode: `// Node.js 服务端：支持断点续传
app.get('/api/sse', (req, res) => {
  const lastId = req.headers['last-event-id']

  res.setHeader('Content-Type', 'text/event-stream')
  res.write('retry: 3000\\n')  // 告诉浏览器 3 秒后重试

  let messages = getAllMessages()

  // 断点续传：只发送 lastId 之后的消息
  if (lastId) {
    const idx = messages.findIndex(m => m.id === lastId)
    messages = messages.slice(idx + 1)
  }

  let id = lastId ? parseInt(lastId) : 0

  for (const msg of messages) {
    res.write(\`id: \${++id}\\n\`)
    res.write(\`data: \${JSON.stringify(msg)}\\n\\n\`)
  }

  // 继续推送新消息...
})`,
};
