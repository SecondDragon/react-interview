import React from 'react';
import { Card, Typography, Alert, List, Tag } from 'antd';
import {
  UseTransitionMeta,
  overviewData,
  interviewQuestions,
} from './data';
import BasicTransition from './chapters/BasicTransition';
import PendingState from './chapters/PendingState';
import DeferredValue from './chapters/DeferredValue';
import Pitfalls from './chapters/Pitfalls';
import Principle from './chapters/Principle';

const { Title, Paragraph, Text } = Typography;

/**
 * useTransition 学习页面主入口
 * 组合所有章节，提供总览和面试速记
 */
const UseTransitionPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>{UseTransitionMeta.title}</Title>
      <Paragraph type="secondary">{UseTransitionMeta.description}</Paragraph>

      {/* API 总览 */}
      <Card title="API 总览" style={{ marginBottom: 24 }}>
        <Paragraph>
          <Text strong>定义：</Text>
          {overviewData.definition}
        </Paragraph>

        <List
          dataSource={overviewData.features}
          renderItem={(feature) => (
            <List.Item>
              <Text code>{feature.name}</Text>
              <Text type="secondary"> — {feature.desc}</Text>
            </List.Item>
          )}
        />

        <Alert
          message="学习路径"
          description="建议按顺序阅读：基础用法 → isPending 反馈 → useDeferredValue 对比 → 错误用法 → 实现原理。每个章节都包含可交互的 Live Demo。"
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Card>

      {/* 章节一：基础用法 */}
      <BasicTransition />

      {/* 章节二：isPending 状态反馈 */}
      <PendingState />

      {/* 章节三：与 useDeferredValue 对比与组合 */}
      <DeferredValue />

      {/* 章节四：错误用法与边界 */}
      <Pitfalls />

      {/* 章节五：实现原理 */}
      <Principle />

      {/* 面试速记 */}
      <Card title="面试高频考点" style={{ background: '#f0f5ff', marginTop: 24 }}>
        <List
          dataSource={interviewQuestions}
          renderItem={(item, index) => (
            <List.Item>
              <div style={{ width: '100%' }}>
                <Text strong>
                  <Tag color="blue">Q{index + 1}</Tag> {item.q}
                </Text>
                <Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 8 }}>
                  {item.a}
                </Paragraph>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default UseTransitionPage;
