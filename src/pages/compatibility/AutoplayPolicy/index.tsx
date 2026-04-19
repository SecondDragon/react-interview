import React, { useRef, useState } from 'react';
import { Card, Typography, Alert, Divider, Tag, List, Badge, Button, Space } from 'antd';
import { AutoplayExamples } from './Examples';
import CodeBlock from '../../../components/CodeBlock';

const { Title, Paragraph, Text } = Typography;

/**
 * 互动演示：模拟自动播放限制
 */
const AutoplayDemo = () => {
  const [status, setStatus] = useState<'idle' | 'playing' | 'blocked'>('idle');
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlay = () => {
    if (!audioRef.current) return;
    audioRef.current.play()
      .then(() => setStatus('playing'))
      .catch(() => setStatus('blocked'));
  };

  const handleMutedPlay = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = true;
    audioRef.current.play()
      .then(() => setStatus('playing'))
      .catch(() => setStatus('blocked'));
  };

  return (
    <Card title="🎵 互动演示：自动播放测试" size="small">
      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" />
      <Space>
        <Button onClick={handlePlay} type="primary">直接播放 (有声)</Button>
        <Button onClick={handleMutedPlay}>静音播放 (Muted)</Button>
        <Button onClick={() => { if(audioRef.current) audioRef.current.pause(); setStatus('idle'); }}>重置</Button>
      </Space>
      <div style={{ marginTop: '16px' }}>
        状态: 
        {status === 'playing' && <Tag color="success">正在播放</Tag>}
        {status === 'blocked' && <Tag color="error">被拦截 (NotAllowedError)</Tag>}
        {status === 'idle' && <Tag>等待测试</Tag>}
      </div>
      {status === 'blocked' && (
        <Alert 
          style={{ marginTop: '10px' }}
          message="拦截原因" 
          description="浏览器检测到当前操作不是由用户直接点击触发的同步行为（或参与度分数不足），拒绝了有声媒体的播放请求。" 
          type="warning" 
        />
      )}
    </Card>
  );
};

/**
 * 自动播放限制重构页面
 */
const AutoplayPolicy: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Title level={2}>多端媒体自动播放限制</Title>
      
      {/* 一、 Bug 出现的现象 */}
      <Card title="一、 Bug 出现的现象" style={{ marginBottom: '24px' }}>
        <Paragraph>
          在移动端或刷新页面后，背景音乐（BGM）或视频无法自动播放。
        </Paragraph>
        <Alert message="典型报错" description="Uncaught (in promise) DOMException: play() failed because the user didn't interact with the document first." type="error" showIcon />
      </Card>

      {/* 二、 Bug 出现的底层原因 */}
      <Card title="二、 Bug 出现的底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>现代浏览器的“防骚扰”机制：</Text>
        </Paragraph>
        <Paragraph>
          {AutoplayExamples.reason}
        </Paragraph>
        <Paragraph>
          浏览器通过“用户激活门槛（User Activation Gate）”来保护用户体验，防止消耗流量和突如其来的噪音。
        </Paragraph>
      </Card>

      {/* 三、 Bug 如何解决 */}
      <Card title="三、 Bug 如何解决" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px' }}>
          <CodeBlock title="❌ 危险做法" code={AutoplayExamples.bad} type="error" />
          <CodeBlock title="✅ 稳健方案" code={AutoplayExamples.good} type="success" />
        </div>
      </Card>

      {/* 四、 为什么要这样解决 且互动演示 */}
      <Card 
        title={<span>四、 为什么要这样解决 且互动演示 <Tag color="blue">Live Demo</Tag></span>} 
        style={{ marginBottom: '24px' }}
      >
        <Paragraph>
          方案的核心是“优雅降级”。通过捕获 Reject 异常，我们可以给用户一个明确的交互提示（如静音按钮），通过用户的一次真实点击来解锁整个页面的音频权限。
        </Paragraph>
        <Divider />
        <AutoplayDemo />
      </Card>

      {/* 五、 Bug 能解决的核心原理 */}
      <Card title="五、 Bug 能解决的核心原理" style={{ background: '#f0f5ff' }}>
        <ul>
          <li>
            <Text strong>MEI (Media Engagement Index)：</Text>
            浏览器内部维护的一个分数。如果你经常在某个网站手动播放音频，该分数会增加，最终浏览器可能会在该网站放开自动播放限制。
          </li>
          <li>
            <Text strong>用户交互传播 (Interaction Propagation)：</Text>
            一次用户点击产生的“瞬时权限”可以向后传递。例如，在点击事件的同步调用链中启动音频，浏览器会将其视为合法的“用户意图”。
          </li>
          <li>
            <Text strong>AudioContext 解锁：</Text>
            Web Audio API 允许在未解锁状态下创建 Context，但其 <Text code>state</Text> 为 <Text code>suspended</Text>。只需在第一次用户交互时调用 <Text code>resume()</Text>，即可解锁后续所有音频。
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default AutoplayPolicy;
