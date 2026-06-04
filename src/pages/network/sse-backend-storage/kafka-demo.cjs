/**
 * Kafka + SSE 本地验证代码
 * 演示如何用 Kafka 作为 SSE 后端消息存储
 *
 * 前置条件：
 * 1. 下载 Kafka: https://archive.apache.org/dist/kafka/3.7.0/kafka_2.13-3.7.0.tgz
 * 2. 启动 Zookeeper: java -cp "libs/*" org.apache.zookeeper.server.quorum.QuorumPeerMain config/zookeeper.properties
 * 3. 启动 Kafka: java -cp "libs/*" kafka.Kafka config/server.properties
 * 4. 创建 topic: java -cp "libs/*" org.apache.kafka.tools.TopicCommand --create --topic sse-messages --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
 */

const { Kafka } = require('kafkajs');

// Kafka 客户端配置
const kafka = new Kafka({
  clientId: 'sse-backend',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'sse-consumer-group' });

// ==================== 生产者：业务系统推送消息 ====================

async function publishMessage(streamId, data) {
  await producer.connect();

  const message = {
    key: streamId,
    value: JSON.stringify({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      streamId,
      data,
      timestamp: Date.now(),
    }),
    headers: {
      'stream-id': streamId,
    },
  };

  await producer.send({
    topic: 'sse-messages',
    messages: [message],
  });

  console.log('Published:', message.value);
  return message;
}

// ==================== 消费者：SSE 后端读取消息 ====================

async function consumeMessages(streamId, lastOffset = -1) {
  await consumer.connect();

  // 订阅 topic
  await consumer.subscribe({ topic: 'sse-messages', fromBeginning: lastOffset < 0 });

  // 如果指定了 offset，seek 到该位置
  if (lastOffset >= 0) {
    const partitions = await consumer.describeGroup();
    // 实际项目中需要根据 partition 分配策略计算
    await consumer.seek({ topic: 'sse-messages', partition: 0, offset: lastOffset + 1 });
  }

  return new Promise((resolve, reject) => {
    const messages = [];

    consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = JSON.parse(message.value.toString());

        // 只返回对应 stream 的消息
        if (data.streamId === streamId) {
          messages.push({
            ...data,
            offset: message.offset,
            partition,
          });
        }

        // 收集 100 条或超时后返回
        if (messages.length >= 100) {
          resolve(messages);
        }
      },
    });

    // 5 秒后返回已收集的消息
    setTimeout(() => resolve(messages), 5000);
  });
}

// ==================== SSE 端点集成示例 ====================

async function sseEndpoint(req, res) {
  const streamId = req.query.stream || 'default';
  const lastOffset = parseInt(req.headers['last-event-offset'] || '-1');

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');

  // 1. 获取历史消息（断点续传）
  const historicalMessages = await consumeMessages(streamId, lastOffset);
  for (const msg of historicalMessages) {
    res.write(`id: ${msg.id}\n`);
    res.write(`data: ${JSON.stringify(msg.data)}\n`);
    res.write(`offset: ${msg.offset}\n\n`);
  }

  // 2. 实时消费新消息
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const data = JSON.parse(message.value.toString());
      if (data.streamId === streamId) {
        res.write(`id: ${data.id}\n`);
        res.write(`data: ${JSON.stringify(data.data)}\n`);
        res.write(`offset: ${message.offset}\n\n`);
      }
    },
  });

  req.on('close', async () => {
    await consumer.disconnect();
  });
}

// ==================== 测试 ====================

async function test() {
  // 发布测试消息
  for (let i = 0; i < 5; i++) {
    await publishMessage('room-1', { text: `Message ${i}`, sender: 'user-1' });
    await new Promise(r => setTimeout(r, 100));
  }

  // 消费消息
  console.log('\nConsuming messages...');
  const messages = await consumeMessages('room-1');
  console.log('Received:', messages.length, 'messages');
  messages.forEach(m => console.log(' -', m.data.text, '(offset:', m.offset, ')'));

  await producer.disconnect();
  await consumer.disconnect();
}

// test().catch(console.error);

module.exports = { publishMessage, consumeMessages, sseEndpoint };
