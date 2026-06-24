import React, { useState } from 'react';
import { Card, Typography, Divider, Tag, List, Alert } from 'antd';
import { basicObserverData } from '../data';
import CodeDiff from '@/components/CodeDiff';
import badCode from '../demos/basic.bad.tsx?raw';
import goodCode from '../demos/basic.good.tsx?raw';
import LiveDemo from '../LiveDemo';

const { Title, Paragraph, Text } = Typography;

/**
 * 章节一：基础观察者实现
 * 手写 Subject + Observer 类，展示最原始的观察者模式实现
 */
const BasicObserver: React.FC = () => {
  return (
    <div style={{ marginBottom: 24 }}>
      <Card
        title={
          <span>
            章节一：基础观察者实现 <Tag color="blue">经典实现</Tag>
          </span>
        }
        style={{ marginBottom: 24 }}
      >
        {/* 一、模式意图 */}
        <Card title="一、模式意图" style={{ marginBottom: 16 }}>
          <Paragraph>{basicObserverData.intent}</Paragraph>
          <Alert
            message="解决的痛点"
            description="避免组件间直接耦合，当状态变化时不需要手动调用每个组件的更新方法。"
            type="info"
            showIcon
          />
        </Card>

        {/* 二、结构原理 */}
        <Card title="二、结构原理" style={{ marginBottom: 16 }}>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {basicObserverData.principle}
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
            dataSource={basicObserverData.scenarios.suitable}
            renderItem={(item) => (
              <List.Item>
                <Tag color="green">✓</Tag> {item}
              </List.Item>
            )}
          />
          <Divider orientation="left">不适用场景</Divider>
          <List
            dataSource={basicObserverData.scenarios.unsuitable}
            renderItem={(item) => (
              <List.Item>
                <Tag color="red">✗</Tag> {item}
              </List.Item>
            )}
          />
          <Divider orientation="left">优缺点</Divider>
          <List
            dataSource={basicObserverData.prosCons}
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
          <LiveDemo type="basic" />
        </Card>

        {/* 六、核心原理 */}
        <Card title="六、核心原理与模式关联" style={{ background: '#f0f5ff' }}>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {basicObserverData.deepPrinciple}
          </Paragraph>
        </Card>
      </Card>
    </div>
  );
};

export default BasicObserver;
