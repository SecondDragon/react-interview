'use client';

import React from 'react';
import styled from 'styled-components';
import { Typography, Card, Space, Divider, Alert, Tag } from 'antd';
import { AudioPlayer } from '../../phone-work-bench/call-center/AudioPlayer';
import CodeBlock from '../../../components/CodeBlock';
import { AudioPlaybackExamples } from './Examples';

const { Title, Paragraph, Text } = Typography;

const DemoContainer = styled.div`
  padding: 24px;
  background: #f9fafb;
  border-radius: 8px;
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const AudioPlaybackDemo: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>自定义音频播放控件 (AudioPlayer)</Title>
      <Paragraph>
        在话务工作台或 CRM 系统中，通话录音的实时预览与精确控制是核心需求。原生 `audio` 标签在不同浏览器下的 UI 表现差异巨大，且难以深度定制。
      </Paragraph>

      <Divider />

      {/* 一、Bug 出现的现象 */}
      <Section>
        <Title level={4}>一、原生播放器的局限性</Title>
        <Paragraph>
          1. <Text strong>样式失控</Text>：不同浏览器（Chrome vs Safari vs Firefox）的 `controls` 样式完全不同，无法融入系统设计语言。
          <br />
          2. <Text strong>交互受限</Text>：无法在进度条上轻松叠加自定义标记（如话术触达点），也难以实现点击特定文本跳转到音频对应时间点的功能。
          <br />
          3. <Text strong>信息显示单一</Text>：通常只显示当前时间，难以同时直观地展示 `已播放 / 总时长` 的对比关系。
        </Paragraph>
      </Section>

      {/* 二、Bug 出现的底层原因 */}
      <Section>
        <Title level={4}>二、底层原因剖析</Title>
        <Paragraph>
          HTML5 的 <Text code>&lt;audio&gt;</Text> 标签是一个受限制的 Shadow DOM 实现。虽然它提供了基本的播放能力，但其内部 UI 是由浏览器厂商硬编码的。为了实现高度一致的跨平台体验，必须将 `controls` 属性设为 `false`，通过 JavaScript 监听音频事件（如 `timeupdate`, `loadedmetadata`, `ended`）来驱动自定义 React 状态。
        </Paragraph>
      </Section>

      {/* 三、Bug 如何解决 */}
      <Section>
        <Title level={4}>三、如何解决</Title>
        <Paragraph>
          通过封装一个 <Tag color="blue">AudioPlayer</Tag> 组件，利用 React 的 `useRef` 持有音频对象，并使用状态管理同步播放进度与总时长。
        </Paragraph>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <CodeBlock
            code={AudioPlaybackExamples.bad}
            title="原生 Audio 控件 (样式不可控)"
            type="error"
          />
          <CodeBlock
            code={AudioPlaybackExamples.good}
            title="自定义 AudioPlayer (高度可定制)"
            type="success"
          />
        </Space>
      </Section>

      {/* 四、互动演示 (Live Demo) */}
      <Section>
        <Title level={4}>四、互动演示 (Live Demo)</Title>
        <Alert
          message="点击下方播放按钮即可开始演示，支持拖动进度条跳转。"
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        <Card title="呼叫中心录音回放模拟" bordered={false} style={{ background: '#fff' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text type="secondary">录音文件 A (短音频)</Text>
              <DemoContainer>
                <AudioPlayer src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" />
              </DemoContainer>
            </div>
            
            <div>
              <Text type="secondary">录音文件 B (模拟长对话音频)</Text>
              <DemoContainer>
                <AudioPlayer src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" />
              </DemoContainer>
            </div>
          </Space>
        </Card>
      </Section>

      {/* 五、核心原理 */}
      <Section>
        <Title level={4}>五、核心原理</Title>
        <Paragraph>
          1. <Text code>Audio 对象管理</Text>：在 `useEffect` 中实例化音频对象，并在组件卸载时调用 `.pause()` 防止内存泄漏。
          <br />
          2. <Text code>loadedmetadata 事件</Text>：这是获取音频真实总时长（duration）的最早可靠时机。
          <br />
          3. <Text code>timeupdate 事件</Text>：音频播放时会高频触发，用于更新进度条状态。
          <br />
          4. <Text code>Slider 跳转</Text>：通过将 `audio.currentTime` 赋值为 Slider 的当前值实现精确跳转。
        </Paragraph>
      </Section>
    </div>
  );
};

export default AudioPlaybackDemo;
