import React from 'react';
import { Card, Typography, Tag, List, Alert } from 'antd';
import { pitfallsData } from '../data';
import CodeDiff from '@/components/CodeDiff';
import LiveDemo from '../LiveDemo';
import pitfallSyncReadBad from '../demos/pitfall-sync-read.bad.tsx?raw';
import pitfallSyncReadGood from '../demos/pitfall-sync-read.good.tsx?raw';

const { Paragraph, Text } = Typography;

/**
 * 章节四：错误用法与边界
 * 明确 transition 不能做什么，以及常见踩坑
 */
const Pitfalls: React.FC = () => {
  return (
    <div style={{ marginBottom: 24 }}>
      <Card
        title={
          <span>
            章节四：错误用法与边界 <Tag color="red">避坑指南</Tag>
          </span>
        }
        style={{ marginBottom: 24 }}
      >
        <Card title="一、用法意图" style={{ marginBottom: 16 }}>
          <Paragraph>{pitfallsData.intent}</Paragraph>
        </Card>

        <Card title="二、常见踩坑" style={{ marginBottom: 16 }}>
          <List
            dataSource={pitfallsData.pitfalls}
            renderItem={(item) => (
              <List.Item>
                <div style={{ width: '100%' }}>
                  <Text strong>{item.title}</Text>
                  <div style={{ color: '#ff4d4f' }}>❌ {item.bad}</div>
                  <div style={{ color: '#52c41a' }}>✅ {item.good}</div>
                </div>
              </List.Item>
            )}
          />
        </Card>

        <Card title="三、代码对比：同步读取 DOM" style={{ marginBottom: 16 }}>
          <Paragraph>
            在 transition 中调用 <Text code>setExpanded</Text> 后立刻读取 DOM，拿到的是旧高度；
            正确做法是在 <Text code>useEffect</Text> 中读取，等 React 提交新布局后再获取。
          </Paragraph>
          <CodeDiff
            oldValue={pitfallSyncReadBad}
            newValue={pitfallSyncReadGood}
            leftTitle="❌ transition 内同步读取"
            rightTitle="✅ useEffect 中读取"
            type="error"
            hideDiffMarkers={true}
            language="tsx"
          />
        </Card>

        <Card
          title={
            <span>
              四、互动演示 <Tag color="blue">Live Demo</Tag>
            </span>
          }
          style={{ marginBottom: 16 }}
        >
          <LiveDemo type="pitfall-sync-read" />
        </Card>

        <Card title="五、边界总结" style={{ background: '#fff2f0' }}>
          <Alert
            message="不要放进 transition 的三种更新"
            description={
              <ul>
                <li>需要即时反馈的受控输入状态</li>
                <li>更新后需要立刻读取 DOM 的场景</li>
                <li>需要同步执行的副作用（如 alert、DOM 操作）</li>
              </ul>
            }
            type="warning"
            showIcon
          />
        </Card>
      </Card>
    </div>
  );
};

export default Pitfalls;
