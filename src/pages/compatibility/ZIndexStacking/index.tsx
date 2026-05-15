import React, { useState } from 'react';
import { Card, Typography, Alert, Divider, Tag, Button } from 'antd';
import { ZIndexExamples } from './Examples';
import CodeDiff from '@/components/CodeDiff';

const { Title, Paragraph, Text } = Typography;

/**
 * 互动演示：层叠上下文模拟
 */
const ZIndexDemo = () => {
  const [useFix, setUseFix] = useState(false);

  return (
    <Card title="🪜 互动演示：层叠陷阱测试" size="small">
      <div style={{ marginBottom: '16px' }}>
        <Button onClick={() => setUseFix(!useFix)} type={useFix ? 'primary' : 'default'}>
          {useFix ? '✅ 已修复 (Portal 挂载到 Body)' : '❌ 存在陷阱 (父级有 transform)'}
        </Button>
      </div>

      <div style={{ position: 'relative', height: '150px', background: '#eee', padding: '20px', overflow: 'hidden' }}>
        {/* 背景层：z-index 比较大 */}
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '20px', 
          width: '200px', 
          height: '100px', 
          background: '#ff4d4f', 
          zIndex: 10,
          color: '#fff',
          padding: '10px'
        }}>
          我是背景层 (z-index: 10)
        </div>

        {/* 陷阱父层：设置了 transform，触发了新的层叠上下文 */}
        <div style={{ 
          transform: 'translateZ(0)', 
          position: 'relative', 
          zIndex: 1, 
          background: 'rgba(24, 144, 255, 0.2)',
          padding: '40px'
        }}>
          {/* 目标子层：虽然 z-index: 999，但在 transform 父层里它只能排第 1 */}
          <div style={{ 
            position: useFix ? 'fixed' : 'absolute', 
            top: useFix ? '50%' : '10px', 
            left: useFix ? '50%' : '100px',
            transform: useFix ? 'translate(-50%, -50%)' : 'none',
            width: '100px', 
            height: '60px', 
            background: '#52c41a', 
            zIndex: 999,
            color: '#fff',
            padding: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            {useFix ? '我是 Portal (全局层级)' : '我是子层 (z-index: 999)'}
          </div>
          <Text size="small" type="secondary">父层 (z-index: 1 + transform)</Text>
        </div>
      </div>
    </Card>
  );
};

/**
 * z-index 层叠重构页面
 */
const ZIndexStacking: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Title level={2}>z-index 层叠上下文陷阱</Title>
      
      {/* 一、 Bug 出现的现象 */}
      <Card title="一、 Bug 出现的现象" style={{ marginBottom: '24px' }}>
        <Paragraph>
          开发者给一个弹窗或 Loading 遮罩层设置了 <Text code>z-index: 9999</Text>，但在页面上它仍然被一个 <Text code>z-index: 10</Text> 的普通侧边栏挡住了。
        </Paragraph>
        <Alert message="无效的权重" description="在某些特殊的 CSS 属性干扰下，全局的 z-index 比较机制会发生失效。" type="error" showIcon />
      </Card>

      {/* 二、 Bug 出现的底层原因 */}
      <Card title="二、 Bug 出现的底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>层叠上下文 (Stacking Context) 的隔离性：</Text>
        </Paragraph>
        <Paragraph>
          {ZIndexExamples.reason}
        </Paragraph>
        <Paragraph>
          当父元素设置了 <Text code>transform</Text>、<Text code>opacity</Text>、<Text code>filter</Text> 等属性时，它会强行开辟一个独立的渲染层。在这个层内部，所有的子元素都在比高低，但对于层外部来说，这一层所有的东西都被整体视为一个单一的原子层级。
        </Paragraph>
      </Card>

      {/* 三、 Bug 如何解决 */}
      <Card title="三、 Bug 如何解决" style={{ marginBottom: '24px' }}>
        <CodeDiff
          oldValue={ZIndexExamples.bad}
          newValue={ZIndexExamples.good}
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
          <Text code>Portal</Text> 的本质是“物理搬家”。它让组件在逻辑上仍然属于当前的组件树，但在物理 DOM 结构上却被挂载到了 <Text code>body</Text> 下。这样它就彻底逃离了父级复杂的 CSS 环境限制。
        </Paragraph>
        <Divider />
        <ZIndexDemo />
      </Card>

      {/* 五、 Bug 能解决的核心原理 */}
      <Card title="五、 Bug 能解决的核心原理" style={{ background: '#f0f5ff' }}>
        <ul>
          <li>
            <Text strong>三维渲染树 (Painting Order)：</Text>
            浏览器在生成渲染位图时，并不是从头到尾画一遍。它会根据 Stacking Context 将页面拆成多个层。每一层都是一个封闭的坐标系。
          </li>
          <li>
            <Text strong>原子化层叠：</Text>
            一旦形成新的上下文，该容器及其所有后代将被视为整体进行混合。这类似于“行政区划”，本区最高长官无法直接对跨区职员下达指令。
          </li>
          <li>
            <Text strong>DOM 根节点逃逸：</Text>
            通过将 DOM 节点挂载到根部（Body），该组件便直接成为了根级层叠上下文的直接子元素。在这一层，它的 <Text code>z-index: 9999</Text> 才是真正面向全站有效的全局最高权重。
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default ZIndexStacking;
