import React, { useState } from 'react';
import { Card, Typography, Divider, Tag, List } from 'antd';
import { reactContextData } from '../data';
import CodeDiff from '@/components/CodeDiff';
import badCode from '../demos/react-context.bad.tsx?raw';
import goodCode from '../demos/react-context.good.tsx?raw';
import LiveDemo from '../LiveDemo';

const { Title, Paragraph, Text } = Typography;

/**
 * 章节三：React Context 订阅
 * React 中跨层级组件通信
 */
const ReactContextChapter: React.FC = () => {
  return (
    <div style={{ marginBottom: 24 }}>
      <Card
        title={
          <span>
            章节三：React Context 订阅 <Tag color="cyan">React 原生</Tag>
          </span>
        }
        style={{ marginBottom: 24 }}
      >
        {/* 一、模式意图 */}
        <Card title="一、模式意图" style={{ marginBottom: 16 }}>
          <Paragraph>{reactContextData.intent}</Paragraph>
        </Card>

        {/* 二、结构原理 */}
        <Card title="二、结构原理" style={{ marginBottom: 16 }}>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {reactContextData.principle}
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
            dataSource={reactContextData.scenarios.suitable}
            renderItem={(item) => (
              <List.Item>
                <Tag color="green">✓</Tag> {item}
              </List.Item>
            )}
          />
          <Divider orientation="left">不适用场景</Divider>
          <List
            dataSource={reactContextData.scenarios.unsuitable}
            renderItem={(item) => (
              <List.Item>
                <Tag color="red">✗</Tag> {item}
              </List.Item>
            )}
          />
          <Divider orientation="left">优缺点</Divider>
          <List
            dataSource={reactContextData.prosCons}
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
          <LiveDemo type="react-context" />
        </Card>

        {/* 六、核心原理 */}
        <Card title="六、核心原理与模式关联" style={{ background: '#f0f5ff' }}>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {reactContextData.deepPrinciple}
          </Paragraph>
        </Card>
      </Card>
    </div>
  );
};

export default ReactContextChapter;
