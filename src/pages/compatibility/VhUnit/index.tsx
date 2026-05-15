import React, { useState } from 'react';
import { Card, Typography, Alert, Divider, Button, Space, Tag } from 'antd';
import { VhUnitExamples } from './Examples';
import CodeDiff from '@/components/CodeDiff';

const { Title, Paragraph, Text } = Typography;

/**
 * 互动演示组件：模拟 iOS Safari 的 100vh 遮挡
 */
const VhUnitDemo = () => {
  const [showToolbar, setShowToolbar] = useState(true);
  const screenHeight = 240; // 模拟手机屏幕物理高度
  const toolbarHeight = 50;
  
  // 模拟 dvh 的动态计算：屏幕高度 - 工具栏高度
  const dvhHeight = showToolbar ? screenHeight - toolbarHeight : screenHeight;

  return (
    <Card title="📱 互动演示：模拟视口高度差异" size="small" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button onClick={() => setShowToolbar(!showToolbar)} type="primary">
          {showToolbar ? '模拟页面往下滚动 (隐藏工具栏)' : '模拟点击底部/向上滚动 (唤出工具栏)'}
        </Button>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '16px' }}>
          {/* 左侧：传统的 100vh */}
          <div>
            <div style={{ marginBottom: '8px', textAlign: 'center' }}><Text type="danger">❌ height: 100vh</Text></div>
            <div style={{ 
              position: 'relative', 
              height: `${screenHeight}px`, 
              border: '2px solid #ccc',
              overflow: 'hidden',
              background: '#f0f2f5',
              borderRadius: '8px'
            }}>
              <div style={{ 
                height: `${screenHeight}px`, 
                display: 'flex', 
                flexDirection: 'column',
                border: '2px dashed #ff4d4f',
                boxSizing: 'border-box'
              }}>
                <div style={{ padding: '10px', textAlign: 'center', color: '#888' }}>页面可滚动内容区</div>
                <div style={{ 
                  marginTop: 'auto', 
                  background: '#ff4d4f', 
                  color: 'white', 
                  padding: '10px', 
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  提交按钮 (被工具栏盖住了)
                </div>
              </div>

              {/* 模拟浏览器工具栏 */}
              <div style={{ 
                position: 'absolute', 
                bottom: 0, width: '100%', 
                height: `${toolbarHeight}px`, 
                background: 'rgba(0,0,0,0.85)', 
                color: 'white', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: showToolbar ? 'translateY(0)' : `translateY(${toolbarHeight}px)`,
                transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                zIndex: 10
              }}>
                🌐 浏览器地址栏/工具栏
              </div>
            </div>
          </div>

          {/* 右侧：现代的 100dvh */}
          <div>
            <div style={{ marginBottom: '8px', textAlign: 'center' }}><Text type="success">✅ height: 100dvh (自适应)</Text></div>
            <div style={{ 
              position: 'relative', 
              height: `${screenHeight}px`, 
              border: '2px solid #ccc',
              overflow: 'hidden',
              background: '#f0f2f5',
              borderRadius: '8px'
            }}>
              <div style={{ 
                height: `${dvhHeight}px`, 
                display: 'flex', 
                flexDirection: 'column',
                border: '2px dashed #52c41a',
                boxSizing: 'border-box',
                transition: 'height 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
              }}>
                <div style={{ padding: '10px', textAlign: 'center', color: '#888' }}>页面可滚动内容区</div>
                <div style={{ 
                  marginTop: 'auto', 
                  background: '#52c41a', 
                  color: 'white', 
                  padding: '10px', 
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  提交按钮 (永远可见)
                </div>
              </div>

              <div style={{ 
                position: 'absolute', 
                bottom: 0, width: '100%', 
                height: `${toolbarHeight}px`, 
                background: 'rgba(0,0,0,0.85)', 
                color: 'white', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: showToolbar ? 'translateY(0)' : `translateY(${toolbarHeight}px)`,
                transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                zIndex: 10
              }}>
                🌐 浏览器地址栏/工具栏
              </div>
            </div>
          </div>
        </div>
      </Space>
    </Card>
  );
};

/**
 * vh 单位兼容性重构页面
 */
const VhUnit: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Title level={2}>{VhUnitExamples.title}</Title>
      
      {/* 一、 Bug 出现的现象 */}
      <Card title="一、 Bug 出现的现象" style={{ marginBottom: '24px' }}>
        <Alert
          message="移动端底部按钮遮挡"
          description={VhUnitExamples.phenomenon}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        <Paragraph>
          当页面设置 <Text code>height: 100vh</Text> 时，底部按钮会被 Safari 的工具栏完全遮挡，用户必须滚动才能看到。
        </Paragraph>
      </Card>

      {/* 二、 Bug 出现的底层原因 */}
      <Card title="二、 Bug 出现的底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>Safari 的设计权衡：</Text>
        </Paragraph>
        <Paragraph>
          {VhUnitExamples.reason}
        </Paragraph>
        <Paragraph>
          简单来说，<Text code>100vh</Text> 被定义为视口的最大高度，而不是实时变化的可见高度。
        </Paragraph>
      </Card>

      {/* 三、 Bug 如何解决 */}
      <Card title="三、 Bug 如何解决" style={{ marginBottom: '24px' }}>
        <CodeDiff
          oldValue={VhUnitExamples.bad}
          newValue={VhUnitExamples.good}
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
        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
          {VhUnitExamples.whySolveThisWay}
        </Paragraph>
        <Divider />
        <VhUnitDemo />
      </Card>

      {/* 五、 Bug 能解决的核心原理 */}
      <Card title="五、 Bug 能解决的核心原理" style={{ background: '#f0f5ff' }}>
        <ul>
          <li>
            <Text strong>dvh (Dynamic Viewport Height)：</Text>
            浏览器会在布局计算阶段，根据当前是否有 UI 组件（如地址栏）动态计算视口高度，确保其始终代表“真实可见”的垂直空间。
          </li>
          <li>
            <Text strong>JS 变量注入：</Text>
            通过 <Text code>window.innerHeight</Text> 获取到的物理像素值是排除了工具栏的。将其除以 100 存入 CSS 变量，可以实现一个比原生 vh 更精准的单位。
          </li>
          <li>
            <Text strong>Layout Tree 响应：</Text>
            当 CSS 变量改变时，所有依赖该变量的元素会自动重新计算高度，而不需要 JS 手动去遍历 DOM 修改样式。
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default VhUnit;
