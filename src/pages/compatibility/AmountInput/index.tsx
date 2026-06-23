import React, { useState } from 'react';
import { Card, Typography, Alert, Divider, Row, Col, Tag, Input, Steps } from 'antd';
import { AmountInputExamples } from './Examples';
import CodeDiff from '@/components/CodeDiff';

const { Title, Paragraph, Text } = Typography;

/**
 * 辅助函数：千分位格式化
 */
const formatMoney = (val: string) => {
  if (!val) return '';
  const clean = val.replace(/[^\d.]/g, '');
  const parts = clean.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
};

/**
 * 互动演示：有 Bug 的组件
 */
const BuggyAmountInput = () => {
  const [value, setValue] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '');
    setValue(formatMoney(raw));
  };
  return (
    <div style={{ padding: '10px', background: '#fff1f0', borderRadius: '4px' }}>
      <Text type="danger">❌ 缺陷演示 (尝试在中间插入数字):</Text>
      <Input value={value} onChange={handleChange} style={{ marginTop: '8px' }} />
    </div>
  );
};

/**
 * 互动演示：修复后的组件
 */
const FixedAmountInput = () => {
  const [value, setValue] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const oldValue = input.value;
    const oldStart = input.selectionStart || 0;

    // 锚点算法：记录左侧数字个数
    const digitsBeforeCursor = oldValue.substring(0, oldStart).replace(/,/g, '').length;

    const raw = oldValue.replace(/,/g, '');
    const formattedValue = formatMoney(raw);
    setValue(formattedValue);

    requestAnimationFrame(() => {
      let newPos = 0;
      let digitCount = 0;
      for (let i = 0; i < formattedValue.length; i++) {
        if (digitCount === digitsBeforeCursor) break;
        if (/[0-9]/.test(formattedValue[i])) digitCount++;
        newPos++;
      }
      input.setSelectionRange(newPos, newPos);
    });
  };
  return (
    <div style={{ padding: '10px', background: '#f6ffed', borderRadius: '4px' }}>
      <Text type="success">✅ 完美方案 (光标自动补偿):</Text>
      <Input value={value} onChange={handleChange} style={{ marginTop: '8px' }} />
    </div>
  );
};

/**
 * 金额输入框重构页面
 */
const AmountInput: React.FC = () => {
  return (
    <div>
      <Title level={2}>{AmountInputExamples.title}</Title>

      {/* 一、 Bug 出现的现象 */}
      <Card title="一、 Bug 出现的现象" style={{ marginBottom: '24px' }}>
        <Paragraph>
          用户在格式化（如带逗号的千分位）输入框中间插入或删除数字时，光标会瞬间“瞬移”到字符串末尾。
        </Paragraph>
        <Alert
          message="交互灾难"
          description={AmountInputExamples.phenomenon}
          type="error"
          showIcon
        />
      </Card>

      {/* 二、 Bug 出现的底层原因 */}
      <Card title="二、 Bug 出现的底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>赋值即替换机制：</Text>
        </Paragraph>
        <Paragraph>{AmountInputExamples.reason}</Paragraph>
        <Paragraph>
          当我们将格式化后的字符串回填给 <Text code>input.value</Text>{' '}
          时，浏览器会认为这是一个全新的值，为了安全，它会重置光标到最后。
        </Paragraph>
      </Card>

      {/* 三、 Bug 如何解决 */}
      <Card title="三、 Bug 如何解决" style={{ marginBottom: '24px' }}>
        <CodeDiff
          oldValue={AmountInputExamples.bad}
          newValue={AmountInputExamples.good}
          leftTitle="❌ 反面教材"
          rightTitle="✅ 最佳实践"
          type="error"
          hideDiffMarkers={true}
        />
      </Card>

      {/* 四、 为什么要这样解决 且互动演示 */}
      <Card
        title={
          <span>
            四、 为什么要这样解决 且互动演示 <Tag color="blue">Live Demo</Tag>
          </span>
        }
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <BuggyAmountInput />
          </Col>
          <Col span={12}>
            <FixedAmountInput />
          </Col>
        </Row>
        <Divider />
        <Steps
          direction="vertical"
          size="small"
          current={3}
          items={[
            { title: '记录锚点', description: '修改前统计光标左侧的纯数字个数。' },
            { title: '异步重排', description: '在渲染后的微任务中重新计算索引。' },
            { title: '精准复位', description: '根据锚点反推物理位置并调用 setSelectionRange。' },
          ]}
        />
      </Card>

      {/* 五、 Bug 能解决的核心原理 */}
      <Card title="五、 Bug 能解决的核心原理" style={{ background: '#f0f5ff' }}>
        <ul>
          <li>
            <Text strong>不变量识别：</Text>
            在格式化输入中，逗号是变量，但数字的相对顺序是不变量。通过锁定“第 N
            个数字”作为锚点，可以绕过格式化带来的字符偏移。
          </li>
          <li>
            <Text strong>Rendering Loop 同步：</Text>
            <Text code>requestAnimationFrame</Text> 确保了我们的光标复位逻辑在浏览器完成 Layout 和
            Paint 之后执行，避免了 React 内部状态更新导致的时序冲突。
          </li>
          <li>
            <Text strong>物理索引重建：</Text>
            算法遍历新字符串，每遇到一个非格式化字符就计一次数，直到达到记录的锚点值，从而完美对齐光标。
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default AmountInput;
