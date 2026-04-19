import React from 'react';
import { Card, Typography, Divider, Tag, Alert } from 'antd';
import { OnePixelExamples } from './Examples';
import CodeBlock from '../../../components/CodeBlock';

const { Title, Paragraph, Text } = Typography;

/**
 * 移动端 1px 边框重构页面
 * 严格遵循 GEMINI.md 五点结构规范
 */
const OnePixel: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Title level={2}>移动端 1px 边框问题</Title>
      <Paragraph type="secondary">
        解决在高倍屏（Retina）下，CSS 1px 边框看起来比设计师要求的“更粗”的视觉兼容性问题。
      </Paragraph>

      {/* 一、 Bug 出现的现象 */}
      <Card title="一、 Bug 出现的现象" style={{ marginBottom: '24px' }}>
        <Paragraph>
          在 DPR（Device Pixel Ratio）为 2 或 3 的高清屏上，CSS 中的 <Text code>1px</Text> 会被渲染为 2 个或 3 个物理像素。
        </Paragraph>
        <ul>
          <li><Text strong>视觉表现：</Text>边框显得“虚”、“粗”，无法达到精细设计的质感。</li>
          <li><Text strong>平台差异：</Text>在 Android 和 iOS 的高清屏上普遍存在，普通桌面显示器（DPR=1）则无此问题。</li>
        </ul>
        <Alert 
          message="用户直观感受" 
          description="设计师反馈：‘为什么我画的 1 像素边框在手机上看起来像 2 像素那么宽？’" 
          type="warning" 
          showIcon 
        />
      </Card>

      {/* 二、 Bug 出现的底层原因 */}
      <Card title="二、 Bug 出现的底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>核心原因：逻辑像素 (CSS Pixel) 与 物理像素 (Physical Pixel) 的映射差异。</Text>
        </Paragraph>
        <Paragraph>
          浏览器在渲染时，会将 1 个 CSS 像素映射到 <Text code>window.devicePixelRatio</Text> 个物理像素上。
          当 DPR=2 时，1px 的 CSS 边框在物理屏幕上占据了 2 个发光点。由于人类视网膜对线条精细度的敏感，这多出的 1 个物理像素会让边框看起来明显增厚。
        </Paragraph>
      </Card>

      {/* 三、 Bug 如何解决 */}
      <Card title="三、 Bug 如何解决" style={{ marginBottom: '24px' }}>
        <Paragraph>
          使用 <Text strong>伪元素 + Transform 缩放</Text> 是目前业界公认最稳健的方案。
        </Paragraph>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px' }}>
          <div>
            <Title level={5}>❌ 反面教材 (Bad Practice)</Title>
            <CodeBlock 
              title="直接写 1px"
              code={OnePixelExamples.bad} 
              type="error" 
              language="css" 
            />
          </div>
          <div>
            <Title level={5}>✅ 最佳实践 (Best Practice)</Title>
            <CodeBlock 
              title="伪元素缩放方案"
              code={OnePixelExamples.good} 
              type="success" 
              language="css" 
            />
          </div>
        </div>
      </Card>

      {/* 四、 为什么要这样解决 且新增互动演示 (Live Demo) */}
      <Card 
        title={<span>四、 为什么要这样解决 且互动演示 <Tag color="blue">Live Demo</Tag></span>} 
        style={{ marginBottom: '24px' }}
      >
        <Paragraph>
          选择 <Text code>transform: scale</Text> 的原因在于其具有极高的浏览器兼容性，且不影响布局流（不会触发 Reflow）。
        </Paragraph>
        
        <Divider orientation="left">在线对比 (请在移动端或开启 Chrome DevTools 模拟器观察)</Divider>
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
          <div style={{ marginBottom: '20px' }}>
            <Text type="secondary">1. 普通 1px 边框 (可能显得较粗):</Text>
            <div style={{ 
              marginTop: '8px', 
              height: '40px', 
              background: '#fff', 
              borderBottom: '1px solid #ddd',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '12px'
            }}>
              Standard 1px Border
            </div>
          </div>

          <div>
            <Text type="secondary">2. 修复后的 1px 边框 (通过伪元素 + scaleY(0.5)):</Text>
            <div style={{ 
              marginTop: '8px', 
              height: '40px', 
              background: '#fff', 
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '12px'
            }}>
              Fixed 1px Border
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '1px',
                backgroundColor: '#ddd',
                transform: 'scaleY(0.5)',
                transformOrigin: '0 100%'
              }} />
            </div>
          </div>
        </div>
      </Card>

      {/* 五、 Bug 能解决的核心原理 */}
      <Card title="五、 Bug 能解决的核心原理" style={{ background: '#f0f5ff' }}>
        <Paragraph>
          该方案利用了 CSS 的 <Text strong>硬件加速渲染层</Text>。
        </Paragraph>
        <ul>
          <li>
            <Text strong>坐标系缩放：</Text>
            当设置 <Text code>transform: scaleY(0.5)</Text> 时，浏览器会将该伪元素的渲染坐标系整体缩小一半。
          </li>
          <li>
            <Text strong>亚像素渲染 (Sub-pixel Rendering)：</Text>
            在 DPR=2 的设备上，1px 缩小一半变为 0.5px，这 0.5px 的逻辑像素正好被映射为 <Text strong>1 个物理像素</Text>。
          </li>
          <li>
            <Text strong>transform-origin 的重要性：</Text>
            设置 <Text code>0 100%</Text>（左下角）确保缩放后边框依然紧贴容器底部，不会因为中心缩放而产生缝隙。
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default OnePixel;
