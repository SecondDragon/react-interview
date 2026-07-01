import React from 'react';
import { Card, Typography, Divider, Tag, List, Alert, Collapse } from 'antd';
import { basicTransitionData } from '../data';
import CodeDiff from '@/components/CodeDiff';
import LiveDemo from '../LiveDemo';
import searchBad from '../demos/search.bad.tsx?raw';
import searchGood from '../demos/search.good.tsx?raw';
import tabBad from '../demos/tab.bad.tsx?raw';
import tabGood from '../demos/tab.good.tsx?raw';

const { Paragraph, Text } = Typography;
const { Panel } = Collapse;

const BasicTransition: React.FC = () => {
  return (
    <div style={{ marginBottom: 24 }}>
      <Card
        title={
          <span>
            章节一：基础用法 <Tag color="blue">startTransition</Tag>
          </span>
        }
        style={{ marginBottom: 24 }}
      >
        <Card title="一、用法意图" style={{ marginBottom: 16 }}>
          <Paragraph>{basicTransitionData.intent}</Paragraph>
          <Alert
            message="核心原则"
            description="受控输入等需要即时反馈的状态必须同步更新；只有依赖输入结果的过滤、搜索、视图切换才适合放入 transition。"
            type="info"
            showIcon
          />
        </Card>

        <Card title="二、底层原理" style={{ marginBottom: 16 }}>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{basicTransitionData.principle}</Paragraph>
        </Card>

        <Collapse defaultActiveKey={['1', '2']}>
          <Panel
            header={
              <span>
                <Tag color="purple" style={{ marginRight: 8 }}>案例 1</Tag>
                搜索框过滤
              </span>
            }
            key="1"
          >
            <Paragraph>
              在搜索框输入时，如果下方列表数据量很大，同步更新 <Text code>searchQuery</Text>{' '}
              会导致输入卡顿。把过滤逻辑放入 transition 后，输入框的响应会优先保证。
            </Paragraph>
            <CodeDiff
              oldValue={searchBad}
              newValue={searchGood}
              leftTitle="❌ 同步更新"
              rightTitle="✅ startTransition"
              type="error"
              hideDiffMarkers={true}
              language="tsx"
            />
            <Card title={<span>互动演示 <Tag color="blue">Live Demo</Tag></span>} style={{ marginTop: 16 }}>
              <LiveDemo type="search" />
            </Card>
          </Panel>

          <Panel
            header={
              <span>
                <Tag color="purple" style={{ marginRight: 8 }}>案例 2</Tag>
                Tab 切换
              </span>
            }
            key="2"
          >
            <Paragraph>
              点击 Tab 时，Tab 高亮应该立即反馈给用户，但复杂内容的渲染可以延迟。用 transition
              把两者解耦，切换体验会更顺滑。
            </Paragraph>
            <CodeDiff
              oldValue={tabBad}
              newValue={tabGood}
              leftTitle="❌ 同步切换"
              rightTitle="✅ 高亮同步 + 内容 transition"
              type="error"
              hideDiffMarkers={true}
              language="tsx"
            />
            <Card title={<span>互动演示 <Tag color="blue">Live Demo</Tag></span>} style={{ marginTop: 16 }}>
              <LiveDemo type="tab" />
            </Card>
          </Panel>
        </Collapse>

        <Card title="三、适用场景" style={{ marginTop: 16, marginBottom: 16 }}>
          <Divider titlePlacement="start">适合使用</Divider>
          <List
            dataSource={basicTransitionData.scenarios.suitable}
            renderItem={(item) => (
              <List.Item>
                <Tag color="green">✓</Tag> {item}
              </List.Item>
            )}
          />
          <Divider titlePlacement="start">不适合使用</Divider>
          <List
            dataSource={basicTransitionData.scenarios.unsuitable}
            renderItem={(item) => (
              <List.Item>
                <Tag color="red">✗</Tag> {item}
              </List.Item>
            )}
          />
          <Divider titlePlacement="start">优缺点</Divider>
          <List
            dataSource={basicTransitionData.prosCons}
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

export default BasicTransition;
