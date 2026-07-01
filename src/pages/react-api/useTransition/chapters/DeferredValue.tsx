import React from 'react';
import { Card, Typography, Tag, Table, List, Alert } from 'antd';
import { deferredValueData } from '../data';
import CodeDiff from '@/components/CodeDiff';
import LiveDemo from '../LiveDemo';
import deferredBad from '../demos/deferred.bad.tsx?raw';
import deferredGood from '../demos/deferred.good.tsx?raw';

const { Paragraph, Text } = Typography;

/**
 * 章节三：与 useDeferredValue 对比与组合
 * 讲清两者关系、区别、适用场景和组合用法
 */
const DeferredValue: React.FC = () => {
  return (
    <div style={{ marginBottom: 24 }}>
      <Card
        title={
          <span>
            章节三：与 useDeferredValue 对比与组合 <Tag color="purple">useDeferredValue</Tag>
          </span>
        }
        style={{ marginBottom: 24 }}
      >
        <Card title="一、用法意图" style={{ marginBottom: 16 }}>
          <Paragraph>{deferredValueData.intent}</Paragraph>
        </Card>

        <Card title="二、底层原理" style={{ marginBottom: 16 }}>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{deferredValueData.principle}</Paragraph>
        </Card>

        <Card title="三、对比表格" style={{ marginBottom: 16 }}>
          <Table
            dataSource={deferredValueData.comparison.map((item, index) => ({ ...item, key: index }))}
            columns={[
              { title: '对比维度', dataIndex: 'dimension', key: 'dimension' },
              { title: 'useTransition', dataIndex: 'useTransition', key: 'useTransition' },
              { title: 'useDeferredValue', dataIndex: 'useDeferredValue', key: 'useDeferredValue' },
            ]}
            pagination={false}
            bordered
            size="small"
          />
        </Card>

        <Card title="四、组合用法" style={{ marginBottom: 16 }}>
          <Alert message="组合思路" description={deferredValueData.combination} type="info" showIcon />
        </Card>

        <Card title="五、代码对比" style={{ marginBottom: 16 }}>
          <Paragraph>
            下面展示同一个搜索场景：左侧直接用 input 值驱动列表渲染，右侧用{' '}
            <Text code>useDeferredValue</Text> 延迟驱动列表渲染。
          </Paragraph>
          <CodeDiff
            oldValue={deferredBad}
            newValue={deferredGood}
            leftTitle="❌ 直接驱动"
            rightTitle="✅ useDeferredValue"
            type="error"
            hideDiffMarkers={true}
            language="tsx"
          />
        </Card>

        <Card
          title={
            <span>
              六、互动演示 <Tag color="blue">Live Demo</Tag>
            </span>
          }
          style={{ marginBottom: 16 }}
        >
          <LiveDemo type="deferred" />
        </Card>

        <Card title="七、面试速记" style={{ background: '#f0f5ff' }}>
          <List
            dataSource={[
              'useTransition 控制“何时更新”，useDeferredValue 控制“哪个值被消费”。',
              '两者内部都走 TransitionLane，优先级低于输入事件。',
              '事件回调里优先用 useTransition；从 props 派生延迟值时优先用 useDeferredValue。',
            ]}
            renderItem={(item) => (
              <List.Item>
                <Tag color="blue">Tip</Tag> {item}
              </List.Item>
            )}
          />
        </Card>
      </Card>
    </div>
  );
};

export default DeferredValue;
