import React, { useState } from 'react';
import { Card, Typography, Divider, Tag, List } from 'antd';
import { eventEmitterData } from '../data';
import CodeDiff from '@/components/CodeDiff';
import badCode from '../demos/event-emitter.bad.tsx?raw';
import goodCode from '../demos/event-emitter.good.tsx?raw';
import LiveDemo from '../LiveDemo';

const { Title, Paragraph, Text } = Typography;

/**
 * 章节二：EventEmitter 发布订阅模式
 * Node.js 风格的 EventEmitter 在前端的应用
 */
const EventEmitterChapter: React.FC = () => {
  return (
    <div style={{ marginBottom: 24 }}>
      <Card
        title={
          <span>
            章节二：EventEmitter 发布订阅 <Tag color="purple">进阶实现</Tag>
          </span>
        }
        style={{ marginBottom: 24 }}
      >
        {/* 一、模式意图 */}
        <Card title="一、模式意图" style={{ marginBottom: 16 }}>
          <Paragraph>{eventEmitterData.intent}</Paragraph>
        </Card>

        {/* 二、结构原理 */}
        <Card title="二、结构原理" style={{ marginBottom: 16 }}>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {eventEmitterData.principle}
          </Paragraph>
        </Card>

        {/* 三、代码实现 */}
        <Card title="三、代码实现" style={{ marginBottom: 16 }}>
          <CodeDiff
            oldValue={badCode}
            newValue={goodCode}
            leftTitle="❌ 反面教材"
            rightTitle="✅ 最佳实践"
            type="error"
            hideDiffMarkers={true}
          />
        </Card>

        {/* 四、前端实战场景 */}
        <Card title="四、前端实战场景" style={{ marginBottom: 16 }}>
          <Divider orientation="left">适用场景</Divider>
          <List
            dataSource={eventEmitterData.scenarios.suitable}
            renderItem={(item) => (
              <List.Item>
                <Tag color="green">✓</Tag> {item}
              </List.Item>
            )}
          />
          <Divider orientation="left">不适用场景</Divider>
          <List
            dataSource={eventEmitterData.scenarios.unsuitable}
            renderItem={(item) => (
              <List.Item>
                <Tag color="red">✗</Tag> {item}
              </List.Item>
            )}
          />
          <Divider orientation="left">优缺点</Divider>
          <List
            dataSource={eventEmitterData.prosCons}
            renderItem={(item) => (
              <List.Item>
                <Tag color={item.type === 'pro' ? 'green' : 'red'}>
                  {item.type === 'pro' ? '优点' : '缺点'}
                </Tag>{' '}
                {item.text}
              </List.Item>
            )}
          />
        </Card>

        {/* 五、Live Demo */}
        <Card
          title={
            <span>
              五、互动演示 <Tag color="blue">Live Demo</Tag>
            </span>
          }
          style={{ marginBottom: 16 }}
        >
          <LiveDemo type="event-emitter" />
        </Card>

        {/* 六、核心原理 */}
        <Card title="六、核心原理与模式关联" style={{ background: '#f0f5ff' }}>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {eventEmitterData.deepPrinciple}
          </Paragraph>
        </Card>
      </Card>
    </div>
  );
};

export default EventEmitterChapter;
