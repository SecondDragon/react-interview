import React, { useRef, useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Divider, Alert } from 'antd';
import { renderPhaseErrorExample, renderPhaseFixedExample } from './Examples';

const { Title, Paragraph, Text } = Typography;

/**
 * Refs 最佳实践演示组件
 * 用于说明为什么不能在渲染期间访问 ref.current
 */
const RefsBestPractice: React.FC = () => {
  // 错误用法演示：在渲染期间修改 Ref
  const RenderPhaseIssue = () => {
    const [dummyState, setDummyState] = useState(0);
    const countRef = useRef(0);
    
    // ❌ 错误：在渲染期间修改 ref.current
    // 这会导致组件不纯，且在 Strict Mode 下会执行两次，导致逻辑混乱
    countRef.current = countRef.current + 1;

    return (
      <Card title="❌ 错误示范：Render 中修改 Ref" size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical">
          <Text type="danger">尝试计数的 Ref: {countRef.current}</Text>
          <Paragraph>
            虽然 Ref 在增加，但它不会触发渲染。我们用一个 Dummy State 强行触发更新：
          </Paragraph>
          <Button onClick={() => setDummyState(s => s + 1)}>
            强行重渲染 (已渲染 {dummyState} 次)
          </Button>
        </Space>
      </Card>
    );
  };

  // 正确用法演示：使用 State 处理渲染逻辑
  const RenderPhaseFixed = () => {
    const [count, setCount] = useState(0);

    return (
      <Card title="✅ 正确解法：使用 State 驱动渲染" size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical">
          <Text strong>当前计数 (State): {count}</Text>
          <Button type="primary" onClick={() => setCount(c => c + 1)}>
            增加计数并正常渲染
          </Button>
          <Alert
            message="核心原则"
            description="如果数据用于渲染，请使用 State。如果数据仅用于存储（如 Timer ID），请使用 Ref。"
            type="success"
            showIcon
          />
        </Space>
      </Card>
    );
  };

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Title level={2}>React Refs 最佳实践指南</Title>
      <Paragraph>
        为什么 <Text code>ref.current</Text> 在渲染期间不可读写？
        因为 React 的渲染过程应该是纯净的。Ref 是一个“逃生舱”，它逃离了 React 的单向数据流。
      </Paragraph>

      <Divider orientation="left">实战演示</Divider>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <RenderPhaseIssue />
          <Title level={4}>错误示例代码</Title>
          <Card size="small" style={{ background: '#fff' }}>
             <pre style={{ fontSize: '12px', margin: 0 }}>{renderPhaseErrorExample}</pre>
          </Card>
        </div>
        <div>
          <RenderPhaseFixed />
          <Title level={4}>正确示例代码</Title>
          <Card size="small" style={{ background: '#fff' }}>
             <pre style={{ fontSize: '12px', margin: 0 }}>{renderPhaseFixedExample}</pre>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RefsBestPractice;
