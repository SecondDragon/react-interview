/**
 * SSE 后端数据存储设计专题
 * 四种方案：内存队列、Redis Stream、数据库+缓存、Kafka 消息总线
 * 遵循六维要求
 */

export const SSEBackendStorageExamples = {
  title: 'SSE 后端数据存储与断点续传设计',

  // ===== 一、是什么 =====
  what: `SSE 断点续传需要后端存储两类数据：

1. 消息本身：id + content + timestamp（按流标识分组）
2. 用户消费进度：userId + streamId + lastMessageId

核心问题：用户断开重连时，后端必须知道"他已经收到了哪条"，
才能只推送断点之后的消息。`,

  // ===== 二、为什么 =====
  why: `没有后端存储配合，重连就是假的：

• 前端重连时带上 Last-Event-ID
• 后端收到后，必须能从存储中查出该 ID 之后的消息
• 如果查不到 → 要么重复推送全部，要么直接丢失

四种存储方案的选择依据：
• 内存队列：单实例、低并发、可接受重启丢失
• Redis Stream：分布式、中等并发、消息量可控
• 数据库+缓存：高并发、需要审计、消息量大
• Kafka 消息总线：高吞吐、削峰填谷、消息广播`,

  // ===== 方案 A：内存队列 =====
  memoryQueue: `class InMemoryMessageStore {
  constructor() {
    this.messages = []            // 所有消息
    this.userProgress = new Map() // userId -> lastEventId
    this.maxSize = 1000           // 最多存 1000 条
  }

  add(message) {
    const id = Date.now().toString()
    this.messages.push({ id, ...message, time: Date.now() })

    // 超出限制时淘汰旧消息
    if (this.messages.length > this.maxSize) {
      this.messages.shift()
    }
    return id
  }

  getAfter(userId, lastId) {
    let startIndex = 0
    if (lastId) {
      startIndex = this.messages.findIndex(m => m.id === lastId) + 1
      if (startIndex === 0) startIndex = this.messages.length
    }
    return this.messages.slice(startIndex)
  }

  updateProgress(userId, lastId) {
    this.userProgress.set(userId, lastId)
  }
}

// SSE 端点
app.get('/api/sse', (req, res) => {
  const userId = req.user.id
  const lastId = req.headers['last-event-id']

  res.setHeader('Content-Type', 'text/event-stream')

  // 1. 推送历史消息（断点续传）
  const missed = store.getAfter(userId, lastId)
  for (const msg of missed) {
    res.write(\`id: \${msg.id}\\n\`)
    res.write(\`data: \${JSON.stringify(msg.data)}\\n\\n\`)
  }

  // 2. 推送新消息
  const listener = (msg) => {
    res.write(\`id: \${msg.id}\\n\`)
    res.write(\`data: \${JSON.stringify(msg.data)}\\n\\n\`)
    store.updateProgress(userId, msg.id)
  }
  eventEmitter.on('newMessage', listener)

  req.on('close', () => {
    eventEmitter.off('newMessage', listener)
  })
})`,

  // ===== 方案 B：Redis Stream =====
  redisStream: `const Redis = require('ioredis')
const redis = new Redis()

// 1. 生产者：推送消息到 Stream
async function publishMessage(streamId, data) {
  const id = await redis.xadd(
    \`sse:\${streamId}\`,    // stream key
    '*',                    // 自动生成 ID（时间戳-序列号）
    'data', JSON.stringify(data),
    'type', data.type,
    'time', Date.now()
  )
  return id
}

// 2. 消费者：读取断点之后的消息
async function getMessagesAfter(streamId, lastId) {
  if (!lastId) {
    return redis.xrange(\`sse:\${streamId}\`, '-', '+', 'COUNT', 100)
  }
  return redis.xrange(\`sse:\${streamId}\`, \`(\${lastId}\`, '+', 'COUNT', 100)
}

// 3. SSE 端点
app.get('/api/sse', async (req, res) => {
  const userId = req.user.id
  const streamId = req.query.stream || 'default'
  const lastId = req.headers['last-event-id']

  res.setHeader('Content-Type', 'text/event-stream')

  // 推送历史消息
  const messages = await getMessagesAfter(streamId, lastId)
  for (const [id, fields] of messages) {
    const data = fields[fields.indexOf('data') + 1]
    res.write(\`id: \${id}\\n\`)
    res.write(\`data: \${data}\\n\\n\`)
  }

  // 订阅新消息（Redis Pub/Sub）
  const sub = new Redis()
  sub.subscribe(\`sse:channel:\${streamId}\`)
  sub.on('message', (channel, message) => {
    const { id, data } = JSON.parse(message)
    res.write(\`id: \${id}\\n\`)
    res.write(\`data: \${JSON.stringify(data)}\\n\\n\`)
  })

  req.on('close', () => sub.unsubscribe())
})

// 4. 过期策略：限制 Stream 长度
async function trimStream(streamId) {
  await redis.xtrim(\`sse:\${streamId}\`, 'MAXLEN', '~', 10000)
}`,

  // ===== 方案 C：数据库 + Redis 缓存 =====
  databaseCache: `-- 1. 消息表
CREATE TABLE sse_messages (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    stream_id       VARCHAR(50) NOT NULL,
    message_id      VARCHAR(50) NOT NULL,
    data            JSON NOT NULL,
    type            VARCHAR(50) DEFAULT 'message',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_stream_time (stream_id, created_at),
    INDEX idx_message_id (message_id)
);

-- 2. 用户消费进度表
CREATE TABLE sse_user_progress (
    user_id         VARCHAR(50) NOT NULL,
    stream_id       VARCHAR(50) NOT NULL,
    last_message_id VARCHAR(50) NOT NULL,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, stream_id)
);

-- 3. 定时清理（保留最近 7 天）
-- DELETE FROM sse_messages WHERE created_at < NOW() - INTERVAL 7 DAY;`,

  databaseCacheCode: `class PersistentMessageStore {
  constructor(mysqlPool, redis) {
    this.db = mysqlPool
    this.redis = redis
  }

  async publish(streamId, data) {
    const messageId = \`\${Date.now()}-\${this.seq++}\`

    // 1. 写入数据库
    await this.db.execute(
      'INSERT INTO sse_messages (stream_id, message_id, data, type) VALUES (?, ?, ?, ?)',
      [streamId, messageId, JSON.stringify(data), data.type]
    )

    // 2. 写入 Redis 缓存（最近 100 条）
    await this.redis.xadd(\`sse:msg:\${streamId}\`, '*', 'data', JSON.stringify(data), 'id', messageId)
    await this.redis.xtrim(\`sse:msg:\${streamId}\`, 'MAXLEN', '~', 100)

    // 3. Pub/Sub 通知在线连接
    await this.redis.publish(\`sse:channel:\${streamId}\`, JSON.stringify({ id: messageId, data }))

    return messageId
  }

  async getMessagesAfter(streamId, lastId) {
    // 1. 先查 Redis（热数据）
    const cached = await this.redis.xrange(
      \`sse:msg:\${streamId}\`, lastId ? \`(\${lastId}\` : '-', '+', 'COUNT', 100
    )
    if (cached.length > 0) {
      return cached.map(([id, fields]) => ({
        id, data: JSON.parse(fields[fields.indexOf('data') + 1])
      }))
    }

    // 2. Redis 没有，查数据库（冷数据）
    const [rows] = await this.db.execute(
      \`SELECT message_id as id, data FROM sse_messages
       WHERE stream_id = ? AND message_id > ? ORDER BY message_id LIMIT 100\`,
      [streamId, lastId || '0']
    )
    return rows
  }

  async updateProgress(userId, streamId, lastId) {
    await this.db.execute(
      \`INSERT INTO sse_user_progress (user_id, stream_id, last_message_id)
       VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE last_message_id = ?\`,
      [userId, streamId, lastId, lastId]
    )
    await this.redis.setex(\`sse:progress:\${userId}:\${streamId}\`, 3600, lastId)
  }
}`,

  // ===== 方案 D：Kafka 消息总线 =====
  kafkaCode: `const { Kafka } = require('kafkajs')
const kafka = new Kafka({ clientId: 'sse-server', brokers: ['localhost:9092'] })
const producer = kafka.producer()

// 1. 生产者：发送消息到 topic
async function publishToKafka(streamId, data) {
  const messageId = \`\${Date.now()}-\${Math.random().toString(36).slice(2)}\`
  await producer.send({
    topic: 'sse-messages',
    messages: [{
      key: streamId,
      value: JSON.stringify({ id: messageId, data, time: Date.now() })
    }]
  })
  return messageId
}

// 2. SSE 端点：Consumer 实时消费
app.get('/api/sse', async (req, res) => {
  const streamId = req.query.stream || 'default'
  const lastId = req.headers['last-event-id']

  res.setHeader('Content-Type', 'text/event-stream')

  // 断点续传：从内存缓存查历史（简化版）
  const history = getFromCache(streamId, lastId)
  for (const msg of history) {
    res.write(\`id: \${msg.id}\\n\`)
    res.write(\`data: \${JSON.stringify(msg.data)}\\n\\n\`)
  }

  // 创建 Consumer 消费实时消息
  const consumer = kafka.consumer({ groupId: \`sse-group-\${streamId}\` })
  await consumer.connect()
  await consumer.subscribe({ topic: 'sse-messages', fromBeginning: false })

  await consumer.run({
    eachMessage: async ({ message }) => {
      const { id, data } = JSON.parse(message.value.toString())
      res.write(\`id: \${id}\\n\`)
      res.write(\`data: \${JSON.stringify(data)}\\n\\n\`)
    }
  })

  req.on('close', async () => {
    await consumer.disconnect()
  })
})`,

  // ===== 四、优缺点 =====
  prosCons: `内存队列：
✓ 简单、零依赖、延迟最低
✗ 重启丢失、无法扩展、无 ACK

Redis Stream：
✓ 原生有序、自动 ID、支持消费者组
✗ 内存限制、无持久化（需配合 AOF）

数据库+缓存：
✓ 容量大、可审计、冷热分离
✗ 实现复杂、有延迟、需要维护

Kafka 消息总线：
✓ 高吞吐、削峰填谷、持久化、可回放
✗ 延迟稍高、Consumer 管理复杂、不适合随机查询`,

  // ===== 五、适用场景 =====
  whenToUse: `内存队列：内部工具、演示环境、单实例部署
Redis Stream：中等规模、分布式、消息量 < 百万级
数据库+缓存：生产环境、高并发、需要审计、消息量大
Kafka 消息总线：超高并发、多消费者、需要消息回放、削峰场景`,

  // ===== 六、注意事项 =====
  caveats: `1. 消息 ID 格式：时间戳-序列号，天然有序可比较
2. 缓存穿透：Redis 查不到时查数据库，但要防止大量请求同时打穿
3. 过期策略：不能无限存，按时间或数量淘汰
4. 多实例同步：用 Redis Pub/Sub 或消息队列广播
5. 连接级进度：每个 Tab 独立连接，进度按连接 ID 而非用户 ID
6. 消息顺序：单分区有序，多分区需要全局序列号
7. Kafka 注意：Consumer Group 与 SSE 连接需一对一映射，避免消费冲突`,

  // 架构图
  architecture: `┌─────────────────────────────────────────────────────────────┐
│                        生产者（业务系统）                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ publish(streamId, data)
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
┌──────────┐   ┌──────────────┐   ┌──────────────┐
│  MySQL   │   │ Redis Stream │   │ Redis Pub/Sub│
│持久化存储 │   │  热缓存      │   │  实时通知    │
│(7天过期) │   │(最近100条)   │   │             │
└──────────┘   └──────────────┘   └──────┬───────┘
       ▲               ▲                 │
       │               │                 │
       └───────────────┴─────────────────┘
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
┌──────────────┐              ┌────────────────┐
│  断线重连    │              │   在线推送     │
│ getAfter()   │              │   实时接收     │
│ 查缓存→查库  │              │                │
└──────────────┘              └────────────────┘`,
};
