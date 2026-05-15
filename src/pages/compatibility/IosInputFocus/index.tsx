import React from 'react';
import { Card, Typography, Alert, Divider, List, Badge, Tag } from 'antd';
import { IosFocusExamples } from './Examples';
import CodeDiff from '@/components/CodeDiff';

const { Title, Paragraph, Text } = Typography;

/**
 * iOS 聚焦跳转重构页面
 */
const IosInputFocus: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Title level={2}>iOS 聚焦跳转与滚动穿透</Title>
      
      {/* 一、 Bug 出现的现象 */}
      <Card title="一、 Bug 出现的现象" style={{ marginBottom: '24px' }}>
        <Paragraph>
          在 iOS Safari 中，点击弹窗内的输入框聚焦时，原本居中的弹窗会突然发生剧烈位移，或者在滑动弹窗内容时，背后的主页面也跟着滚动。
        </Paragraph>
        <Alert 
          message="Bug 特征" 
          description={
            <List size="small">
              <List.Item><Badge status="error" text="坐标崩溃：" /> 聚焦时，浏览器强制滚动导致 position: fixed 元素瞬间错位。</List.Item>
              <List.Item><Badge status="error" text="背景失控：" /> 滚动穿透导致用户体验混乱，操作反馈滞后。</List.Item>
            </List>
          } 
          type="error" 
          showIcon 
        />
      </Card>

      {/* 二、 Bug 出现的底层原因 */}
      <Card title="二、 Bug 出现的底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>WebKit 的“视觉优化”副作用：</Text>
        </Paragraph>
        <Paragraph>
          {IosFocusExamples.reason}
        </Paragraph>
        <Paragraph>
          iOS Safari 会尝试将聚焦的 Input 移动到键盘上方，但这个移动不是真正的 DOM 滚动，而是一种“视口偏移”。这种偏移会导致传统的 <Text code>overflow: hidden</Text> 锁定背景方案在 iOS 上完全失效。
        </Paragraph>
      </Card>

      {/* 三、 Bug 如何解决 */}
      <Card title="三、 Bug 如何解决" style={{ marginBottom: '24px' }}>
        <Paragraph>
          最稳健的方法是利用 <Text strong>Fixed 动态锚定法</Text>：在弹窗开启时，将 Body 转化为 Fixed 状态，强行阻止其位移。
        </Paragraph>
        <CodeDiff code={IosFocusExamples.good} type="success" title="✅ 工业级 Body 锁定函数" />
      </Card>

      {/* 四、 为什么要这样解决 且现状模拟 */}
      <Card 
        title={<span>四、 为什么要这样解决 且现状模拟 <Tag color="blue">Live Simulation</Tag></span>} 
        style={{ marginBottom: '24px' }}
      >
        <Paragraph>
          虽然社区有很多尝试（如监听 <Text code>touchmove</Text> 并 <Text code>preventDefault</Text>），但这些方案在涉及复杂滚动组件时极易冲突。Fixed 锚定法是目前侵入性最小、兼容性最强的“全家桶”式方案。
        </Paragraph>
        <Divider orientation="left">锁定流程拆解</Divider>
        <List size="small" bordered>
          <List.Item>1. 记录当前 <Text code>window.scrollY</Text> (如 500px)。</List.Item>
          <List.Item>2. 设置 <Text code>body.style.position = 'fixed'</Text> 且 <Text code>top = '-500px'</Text>。</List.Item>
          <List.Item>3. 弹窗关闭后，恢复 body 并立刻 <Text code>scrollTo(0, 500)</Text>。</List.Item>
        </List>
      </Card>

      {/* 五、 Bug 能解决的核心原理 */}
      <Card title="五、 Bug 能解决的核心原理" style={{ background: '#f0f5ff' }}>
        <ul>
          <li>
            <Text strong>打破文档流联动：</Text>
            通过 <Text code>fixed</Text> 定位，我们将 body 元素从标准的“文档流滚动区域”中抽离出来。此时，无论视口如何偏移，body 的内容相对于视口顶部的物理位置是恒定的。
          </li>
          <li>
            <Text strong>坐标系补偿：</Text>
            设置 <Text code>top</Text> 值为负的滚动高度，是为了保证在 body 变为 fixed 的一瞬间，页面内容看起来仍然停留在原来的位置，不会产生视觉上的突跳。
          </li>
          <li>
            <Text strong>Passive Event 绕过：</Text>
            该方案不依赖于拦截滚动事件，因此完全避开了现代浏览器对移动端 Passive 事件监听器的优化限制。
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default IosInputFocus;
