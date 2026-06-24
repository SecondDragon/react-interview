import React, { useState } from 'react';
import { Card, Typography, Divider, Tag, List } from 'antd';
import { customHookData } from '../data';
import CodeDiff from '@/components/CodeDiff';
import badCode from '../demos/custom-hook.bad.tsx?raw';
import goodCode from '../demos/custom-hook.good.tsx?raw';
import LiveDemo from '../LiveDemo';

const { Title, Paragraph, Text } = Typography;

/**
 * 章节四：自定义 Hook 封装
 * 将观察者模式封装为可复用的 React Hook
 */
const CustomHookChapter: React.FC = () => {
  return (
    <div style={{ marginBottom: 24 }}>
      <Card
        title={
          <span>
            章节四：自定义 Hook 封装 <Tag color="gold">React 进阶</Tag>
          </span>
        }
        style={{ marginBottom: 24 }}
      >
        {/* 一、模式意图 */}
        <Card title="一、模式意图" style={{ marginBottom: 16 }}>
          <Paragraph>{customHookData.intent}</Paragraph>
        </Card>

        {/* 二、结构原理 */}
        <Card title="二、结构原理" style={{ marginBottom: 16 }}>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {customHookData.principle}
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
            dataSource={customHookData.scenarios.suitable}
            renderItem={(item) => (
              <List.Item>
                <Tag color="green">✓</Tag> {item}
              </List.Item>
            )}
          />
          <Divider orientation="left">不适用场景</Divider>
          <List
            dataSource={customHookData.scenarios.unsuitable}
            renderItem={(item) => (
              <List.Item>
                <Tag color="red">✗</Tag> {item}
              </List.Item>
            )}
          />
          <Divider orientation="left">优缺点</Divider>
          <List
            dataSource={customHookData.prosCons}
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
          <LiveDemo type="custom-hook" />
        </Card>

        {/* 六、核心原理 */}
        <Card title="六、核心原理与模式关联" style={{ background: '#f0f5ff' }}>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {customHookData.deepPrinciple}
          </Paragraph>
        </Card>
      </Card>
    </div>
  );
};

export default CustomHookChapter;
