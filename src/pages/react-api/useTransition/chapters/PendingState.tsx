import React from 'react';
import { Card, Typography, Divider, Tag, List, Collapse } from 'antd';
import { pendingStateData } from '../data';
import CodeDiff from '@/components/CodeDiff';
import LiveDemo from '../LiveDemo';
import pendingBadgeBad from '../demos/pending-badge.bad.tsx?raw';
import pendingBadgeGood from '../demos/pending-badge.good.tsx?raw';
import pendingSkeletonBad from '../demos/pending-skeleton.bad.tsx?raw';
import pendingSkeletonGood from '../demos/pending-skeleton.good.tsx?raw';

const { Paragraph, Text } = Typography;
const { Panel } = Collapse;

const PendingState: React.FC = () => {
  return (
    <div style={{ marginBottom: 24 }}>
      <Card
        title={
          <span>
            章节二：isPending 状态反馈 <Tag color="green">isPending</Tag>
          </span>
        }
        style={{ marginBottom: 24 }}
      >
        <Card title="一、用法意图" style={{ marginBottom: 16 }}>
          <Paragraph>{pendingStateData.intent}</Paragraph>
        </Card>

        <Card title="二、底层原理" style={{ marginBottom: 16 }}>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{pendingStateData.principle}</Paragraph>
        </Card>

        <Collapse defaultActiveKey={['1', '2']}>
          <Panel
            header={
              <span>
                <Tag color="purple" style={{ marginRight: 8 }}>案例 1</Tag>
                Pending 徽标
              </span>
            }
            key="1"
          >
            <Paragraph>
              用户点击按钮触发复杂计算时，如果没有反馈会怀疑是否点击成功。用{' '}
              <Text code>isPending</Text> 可以自动展示“处理中”状态。
            </Paragraph>
            <CodeDiff
              oldValue={pendingBadgeBad}
              newValue={pendingBadgeGood}
              leftTitle="❌ 无反馈"
              rightTitle="✅ isPending 徽标"
              type="error"
              hideDiffMarkers={true}
              language="tsx"
            />
            <Card title={<span>互动演示 <Tag color="blue">Live Demo</Tag></span>} style={{ marginTop: 16 }}>
              <LiveDemo type="pending-badge" />
            </Card>
          </Panel>

          <Panel
            header={
              <span>
                <Tag color="purple" style={{ marginRight: 8 }}>案例 2</Tag>
                骨架屏
              </span>
            }
            key="2"
          >
            <Paragraph>
              切换复杂视图时，与其白屏等待，不如在 <Text code>isPending</Text>{' '}
              期间展示骨架屏，提升用户感知性能。
            </Paragraph>
            <CodeDiff
              oldValue={pendingSkeletonBad}
              newValue={pendingSkeletonGood}
              leftTitle="❌ 白屏等待"
              rightTitle="✅ 骨架屏过渡"
              type="error"
              hideDiffMarkers={true}
              language="tsx"
            />
            <Card title={<span>互动演示 <Tag color="blue">Live Demo</Tag></span>} style={{ marginTop: 16 }}>
              <LiveDemo type="pending-skeleton" />
            </Card>
          </Panel>
        </Collapse>

        <Card title="三、适用场景与权衡" style={{ marginTop: 16, marginBottom: 16 }}>
          <Divider titlePlacement="start">适合使用</Divider>
          <List
            dataSource={pendingStateData.scenarios.suitable}
            renderItem={(item) => (
              <List.Item>
                <Tag color="green">✓</Tag> {item}
              </List.Item>
            )}
          />
          <Divider titlePlacement="start">不适合使用</Divider>
          <List
            dataSource={pendingStateData.scenarios.unsuitable}
            renderItem={(item) => (
              <List.Item>
                <Tag color="red">✗</Tag> {item}
              </List.Item>
            )}
          />
          <Divider titlePlacement="start">优缺点</Divider>
          <List
            dataSource={pendingStateData.prosCons}
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
      </Card>
    </div>
  );
};

export default PendingState;
