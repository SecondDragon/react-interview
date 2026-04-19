import React, { useRef, useState } from 'react';
import { Card, Typography, Alert, Table, Divider, Tag, Collapse, Steps, Badge, List, Input } from 'antd';
import { IMEInputExamples } from './Examples';
import CodeBlock from '../../../components/CodeBlock';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

/**
 * 互动演示：IME 锁效果对比
 */
const IMEDemo = () => {
  const [standardVal, setStandardVal] = useState('');
  const [imeLockedVal, setImeLockedVal] = useState('');
  const isComposing = useRef(false);

  const handleStandardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStandardVal(e.target.value);
  };

  const handleImeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isComposing.current) {
      setImeLockedVal(e.target.value);
    }
  };

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = (e: any) => {
    isComposing.current = false;
    // 保底触发：处理 Chromium 内核 Input 先于 End 的情况
    setImeLockedVal(e.target.value);
  };

  return (
    <Card title="⌨️ 互动演示：尝试输入中文拼音" size="small">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <Text strong>1. 普通 Input (无锁):</Text>
          <Input 
            placeholder="输入拼音试试..." 
            onChange={handleStandardInput} 
            style={{ marginTop: '8px' }}
          />
          <div style={{ marginTop: '8px' }}>
            实时值: <Tag color="red">{standardVal || '(空)'}</Tag>
          </div>
          <Text type="secondary" size="small">现象：拼音字母也会被实时记录</Text>
        </div>
        <div>
          <Text strong>2. IME 锁定 Input:</Text>
          <Input 
            placeholder="输入拼音试试..." 
            onInput={handleImeInput}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            style={{ marginTop: '8px' }}
          />
          <div style={{ marginTop: '8px' }}>
            确定值: <Tag color="green">{imeLockedVal || '(空)'}</Tag>
          </div>
          <Text type="secondary" size="small">现象：只有汉字上屏后才更新</Text>
        </div>
      </div>
    </Card>
  );
};

/**
 * IME 兼容性重构页面
 */
const IMEInput: React.FC = () => {
  const kernelDataSource = [
    {
      key: '1',
      kernel: 'Chromium / Webkit (Chrome, Safari)',
      sequence: 'input → compositionend',
      behavior: '需在 End 中手动补触发',
    },
    {
      key: '2',
      kernel: 'Gecko (Firefox)',
      sequence: 'compositionend → input',
      behavior: '自然触发',
    },
  ];

  const columns = [
    { title: '内核', dataIndex: 'kernel', key: 'kernel' },
    { title: '时序', dataIndex: 'sequence', key: 'sequence' },
    { title: '特征', dataIndex: 'behavior', key: 'behavior' },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>中文输入法 (IME) 组合输入兼容性</Title>
      
      {/* 一、 Bug 出现的现象 */}
      <Card title="一、 Bug 出现的现象" style={{ marginBottom: '24px' }}>
        <Paragraph>
          当用户使用中文输入法（IME）输入拼音时，浏览器会频繁触发 <Text code>input</Text> 事件，导致“拼音碎片”进入业务逻辑。
        </Paragraph>
        <ul>
          <li><Text strong>数据污染：</Text>搜索框会拿着拼音去请求接口，造成无效流量和后端压力。</li>
          <li><Text strong>光标跳变：</Text>在 React 受控模式下， setState 会强制重刷 DOM，导致正在输入的拼音被截断或光标跳到末尾。</li>
        </ul>
      </Card>

      {/* 二、 Bug 出现的底层原因 */}
      <Card title="二、 Bug 出现的底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>缓冲区暴露：</Text>
          现代浏览器为了响应速度，将 IME 的“虚拟缓冲区”变动也视为有效的 Input。更糟糕的是，W3C 对 <Text code>compositionend</Text> 和最后一次 <Text code>input</Text> 的触发顺序没有严格规定，导致了跨内核的时序混乱。
        </Paragraph>
        <Table 
          dataSource={kernelDataSource} 
          columns={columns} 
          pagination={false} 
          size="small" 
          bordered 
        />
      </Card>

      {/* 三、 Bug 如何解决 */}
      <Card title="三、 Bug 如何解决" style={{ marginBottom: '24px' }}>
        <Paragraph>
          利用“标志位锁”拦截合成阶段的所有事件，并在合成结束时进行保底触发。
        </Paragraph>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
          <CodeBlock title="❌ 导致跳跃的受控模式" code={IMEInputExamples.cursorJumping.bad} type="error" />
          <CodeBlock title="✅ 工业级完整实现" code={IMEInputExamples.ultimatePlan} type="success" />
        </div>
      </Card>

      {/* 四、 为什么要这样解决 且互动演示 */}
      <Card 
        title={<span>四、 为什么要这样解决 且互动演示 <Tag color="blue">Live Demo</Tag></span>} 
        style={{ marginBottom: '24px' }}
      >
        <Paragraph>
          这种方案不仅解决了数据污染，更重要的是它通过“物理拦截”确保了 React 的渲染周期不会打断输入法的内部状态，是金融级输入框的标配。
        </Paragraph>
        <Divider />
        <IMEDemo />
      </Card>

      {/* 五、 Bug 能解决的核心原理 */}
      <Card title="五、 Bug 能解决的核心原理" style={{ background: '#f0f5ff' }}>
        <ul>
          <li>
            <Text strong>isComposing 标志位：</Text>
            通过 <Text code>compositionstart</Text> 将锁闭合，在此期间的所有 <Text code>input</Text> 事件均被 return，停止向下分发。
          </li>
          <li>
            <Text strong>时序对齐 (保底触发)：</Text>
            在 <Text code>compositionend</Text> 触发时，意味着汉字已经确定。此时手动调用一次业务逻辑（如搜索），可以完美抹平 Chromium 内核下 input 先于 end 触发导致的“最后一字丢失”问题。
          </li>
          <li>
            <Text strong>AbortController 竞态控制：</Text>
            结合网络层的取消机制，确保只有最后一次确定的输入（而非中间过程）能生效，从根本上解决回包乱序。
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default IMEInput;
