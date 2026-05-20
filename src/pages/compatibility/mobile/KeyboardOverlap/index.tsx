import React, { useState } from 'react';
import { Card, Typography, Alert, Divider, Tag, Badge, List, Space, Button } from 'antd';
import { KeyboardOverlapExamples } from './Examples';
import CodeDiff from '@/components/CodeDiff';

const { Title, Paragraph, Text } = Typography;

/**
 * 互动演示：模拟软键盘遮挡
 */
const KeyboardDemo = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isAdapted, setIsAdapted] = useState(false);

  return (
    <Card title="📱 互动演示：模拟 iOS 键盘遮挡" size="small">
      <Space style={{ marginBottom: '16px' }}>
        <Button onClick={() => setIsKeyboardOpen(!isKeyboardOpen)} type="primary" danger={isKeyboardOpen}>
          {isKeyboardOpen ? '关闭模拟键盘' : '点击激活键盘'}
        </Button>
        <Button onClick={() => setIsAdapted(!isAdapted)}>
          {isAdapted ? '取消适配' : '开启 VisualViewport 适配'}
        </Button>
      </Space>

      <div style={{
        position: 'relative',
        width: '280px',
        height: '350px',
        border: '8px solid #333',
        borderRadius: '20px',
        margin: '0 auto',
        overflow: 'hidden',
        background: '#f0f2f5'
      }}>
        {/* 模拟页面内容 */}
        <div style={{ padding: '15px' }}>
          <div style={{ height: '40px', background: '#fff', borderRadius: '4px', marginBottom: '10px' }} />
          <div style={{ height: '40px', background: '#fff', borderRadius: '4px', marginBottom: '10px' }} />
          <div style={{ height: '40px', background: '#fff', borderRadius: '4px' }} />
        </div>

        {/* 模拟输入框 (底部) */}
        <div style={{
          position: 'absolute',
          bottom: isAdapted && isKeyboardOpen ? '120px' : '0',
          left: 0,
          right: 0,
          height: '50px',
          background: '#fff',
          borderTop: '1px solid #ddd',
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          transition: 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 5
        }}>
          <div style={{ flex: 1, height: '30px', border: '1px solid #1890ff', borderRadius: '15px' }} />
        </div>

        {/* 模拟键盘 */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '120px',
          background: '#d1d5db',
          transform: isKeyboardOpen ? 'translateY(0)' : 'translateY(120px)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}>
          ⌨️ 系统软键盘
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <Text type={isAdapted || !isKeyboardOpen ? 'success' : 'danger'}>
          {isAdapted && isKeyboardOpen ? '✅ 适配成功：输入框自动上浮' : isKeyboardOpen ? '❌ 适配失败：输入框被键盘盖住' : '等待输入...'}
        </Text>
      </div>
    </Card>
  );
};

/**
 * 键盘遮挡重构页面
 */
const KeyboardOverlap: React.FC = () => {
  return (
    <div>
      <Title level={2}>移动端软键盘遮挡输入框</Title>

      {/* 一、 Bug 出现的现象 */}
      <Card title="一、 Bug 出现的现象" style={{ marginBottom: '24px' }}>
        <Paragraph>
          在移动端（尤其是 iOS Safari）中，当用户点击输入框唤起软键盘时，键盘会直接覆盖在视口上方。
        </Paragraph>
        <ul>
          <li><Text strong>Android:</Text> 窗口高度变小，触发 resize，内容自动挤压上移。</li>
          <li><Text strong>iOS:</Text> 窗口高度不变，键盘像一个透明层一样覆盖上来，导致位于底部的输入框完全不可见。</li>
        </ul>
        <Alert message="用户体验痛点" description="用户在打字时看不见自己输入了什么，必须手动滑动页面才能露出输入框。" type="error" showIcon />
      </Card>

      {/* 二、 Bug 出现的底层原因 */}
      <Card title="二、 Bug 出现的底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>布局视口 vs 视觉视口：</Text>
        </Paragraph>
        <Paragraph>
          {KeyboardOverlapExamples.reason}
        </Paragraph>
        <Paragraph>
          iOS 的设计理念是尽量不改变 DOM 布局高度以保证滚动性能。但它引入了“视觉视口”的概念，键盘弹起仅改变可见区域，而不改变 HTML 根节点的高度，导致 <Text code>fixed</Text> 定位失效。
        </Paragraph>
      </Card>

      {/* 三、 Bug 如何解决 */}
      <Card title="三、 Bug 如何解决" style={{ marginBottom: '24px' }}>
        <CodeDiff
          oldValue={KeyboardOverlapExamples.bad}
          newValue={KeyboardOverlapExamples.good}
          leftTitle="❌ 反面教材"
          rightTitle="✅ 最佳实践"
          type="error"
          hideDiffMarkers={true}
        />
      </Card>

      {/* 四、 为什么要这样解决 且互动演示 */}
      <Card
        title={<span>四、 为什么要这样解决 且互动演示 <Tag color="blue">Live Demo</Tag></span>}
        style={{ marginBottom: '24px' }}
      >
        <Paragraph>
          使用 <Text code>VisualViewport API</Text> 是唯一的工业级解法。它能实时监听“可见区域”的变化，而不是笨拙地监听窗口 Resize。
        </Paragraph>
        <Divider />
        <KeyboardDemo />
      </Card>

      {/* 五、 Bug 能解决的核心原理 */}
      <Card title="五、 Bug 能解决的核心原理" style={{ background: '#f0f5ff' }}>
        <ul>
          <li>
            <Text strong>VisualViewport 对象：</Text>
            该 API 提供了一个独立于标准 <Text code>window</Text> 的视口描述对象。它的 <Text code>height</Text> 代表了排除键盘、缩放后的真实净空高度。
          </li>
          <li>
            <Text strong>高度差计算补偿：</Text>
            通过 <Text code>window.innerHeight - window.visualViewport.height</Text>，我们可以精准计算出当前键盘在屏幕上占据的物理高度。
          </li>
          <li>
            <Text strong>Offset 动态注入：</Text>
            将计算出的高度差作为 <Text code>padding-bottom</Text> 或 <Text code>bottom</Text> 偏移量应用给容器，从而将输入组件顶出键盘区域。
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default KeyboardOverlap;
