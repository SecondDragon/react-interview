import React, { useState } from 'react';
import { Card, Typography, Divider, Tag, Space, Switch } from 'antd';
import { SafeAreaExamples } from './Examples';
import CodeBlock from '../../../components/CodeBlock';

const { Title, Paragraph, Text } = Typography;

/**
 * 互动演示：模拟 iPhone 安全区域
 */
const SafeAreaDemo = () => {
  const [isAdapted, setIsAdapted] = useState(false);

  return (
    <Card title="📱 互动演示：模拟 iPhone 底部适配" size="small">
      <div style={{ marginBottom: '16px' }}>
        <Space>
          <span>开启安全区域适配:</span>
          <Switch checked={isAdapted} onChange={setIsAdapted} />
        </Space>
      </div>

      <div style={{ 
        position: 'relative', 
        width: '300px', 
        height: '150px', 
        border: '8px solid #333', 
        borderRadius: '30px', 
        margin: '0 auto',
        overflow: 'hidden',
        background: '#fff'
      }}>
        {/* 模拟页面内容 */}
        <div style={{ padding: '10px', fontSize: '12px' }}>
          这是页面内容区域...
        </div>

        {/* 模拟底部固定条 */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: isAdapted ? '50px' : '30px',
          background: '#1890ff',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: isAdapted ? '20px' : '0', // 模拟 env(safe-area-inset-bottom)
          transition: 'all 0.3s'
        }}>
          底部操作栏
        </div>

        {/* 模拟 iOS Home Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '5px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100px',
          height: '4px',
          background: '#000',
          borderRadius: '2px',
          opacity: 0.8
        }} />
      </div>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <Text type={isAdapted ? 'success' : 'danger'}>
          {isAdapted ? '✅ 已避开 Home Indicator' : '❌ 内容与操作条重叠'}
        </Text>
      </div>
    </Card>
  );
};

/**
 * iOS 安全区域重构页面
 */
const SafeArea: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Title level={2}>iOS 安全区域 (Safe Area) 适配</Title>
      
      {/* 一、 Bug 出现的现象 */}
      <Card title="一、 Bug 出现的现象" style={{ marginBottom: '24px' }}>
        <Paragraph>
          在全屏显示的移动应用中（如 iPhone X 及后续机型），由于底部存在 Home Indicator（操作条），传统的 <Text code>bottom: 0</Text> 布局会导致按钮与操作条重叠。
        </Paragraph>
        <ul>
          <li><Text strong>交互干扰：</Text>用户点击按钮时容易误触回到主屏幕。</li>
          <li><Text strong>视觉缺陷：</Text>内容紧贴边缘，缺乏呼吸感，不符合 iOS 设计规范。</li>
        </ul>
      </Card>

      {/* 二、 Bug 出现的底层原因 */}
      <Card title="二、 Bug 出现的底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>硬件与系统的融合：</Text>
        </Paragraph>
        <Paragraph>
          Apple 为了实现全面屏，取消了物理 Home 键，取而代之的是系统级的虚拟操作条。为了不让网页内容被遮挡，W3C 引入了 <Text code>viewport-fit=cover</Text> 属性和 <Text code>env()</Text> 函数，允许开发者获取这些不可用的屏幕区域大小。
        </Paragraph>
      </Card>

      {/* 三、 Bug 如何解决 */}
      <Card title="三、 Bug 如何解决" style={{ marginBottom: '24px' }}>
        <Paragraph>
          1. 首先在 <Text code>meta</Text> 标签中开启适配。
        </Paragraph>
        <CodeBlock 
          title="HTML 配置"
          code='<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">' 
          type="info" 
          language="html" 
        />
        
        <Divider />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px' }}>
          <div>
            <Title level={5}>❌ 错误做法</Title>
            <CodeBlock code={SafeAreaExamples.bad} type="error" language="css" />
          </div>
          <div>
            <Title level={5}>✅ 推荐做法</Title>
            <CodeBlock code={SafeAreaExamples.good} type="success" language="css" />
          </div>
        </div>
      </Card>

      {/* 四、 为什么要这样解决 且互动演示 */}
      <Card 
        title={<span>四、 为什么要这样解决 且互动演示 <Tag color="blue">Live Demo</Tag></span>} 
        style={{ marginBottom: '24px' }}
      >
        <Paragraph>
          使用 <Text code>env()</Text> 的优势在于它是声明式的，由系统自动注入。这意味着即便未来 Apple 改变了 Home Indicator 的尺寸，你的页面也能自动适应，无需修改代码。
        </Paragraph>
        <Divider />
        <SafeAreaDemo />
      </Card>

      {/* 五、 Bug 能解决的核心原理 */}
      <Card title="五、 Bug 能解决的核心原理" style={{ background: '#f0f5ff' }}>
        <ul>
          <li>
            <Text strong>环境变量注入：</Text>
            当浏览器设置了 <Text code>viewport-fit=cover</Text>，WebKit 引擎会向 CSS 运行环境注入四个变量：<Text code>safe-area-inset-top/bottom/left/right</Text>。
          </li>
          <li>
            <Text strong>fallback 机制：</Text>
            <Text code>env(safe-area-inset-bottom, 20px)</Text> 支持第二个参数作为默认值，增强了老旧设备的鲁棒性。
          </li>
          <li>
            <Text strong>复合计算：</Text>
            由于 <Text code>env()</Text> 是具体的长度值，它可以与 <Text code>calc()</Text> 完美配合，实现复杂的 UI 适配逻辑。
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default SafeArea;
