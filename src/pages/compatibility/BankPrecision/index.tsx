import React, { useState } from 'react';
import { Card, Typography, Alert, Divider, InputNumber, Space, Tag } from 'antd';
import { BankPrecisionExamples } from './Examples';
import CodeDiff from '@/components/CodeDiff';
import Big from 'big.js';

const { Title, Paragraph, Text } = Typography;

/**
 * 互动演示：浮点数精度测试
 */
const PrecisionDemo = () => {
  const [val1, setVal1] = useState(0.1);
  const [val2, setVal2] = useState(0.2);

  const nativeSum = val1 + val2;
  const bigSum = new Big(val1).plus(val2).toNumber();

  return (
    <Card title="💰 互动演示：计算 0.1 + 0.2" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          数值 1: <InputNumber value={val1} onChange={(v) => setVal1(v || 0)} step={0.1} />
          数值 2: <InputNumber value={val2} onChange={(v) => setVal2(v || 0)} step={0.1} />
        </Space>
        <Divider />
        <div>
          <Text strong>原生 JS 结果 (a + b):</Text> <Text type="danger">{nativeSum}</Text>
          <div style={{ fontSize: '12px', color: '#888' }}>由于二进制截断，产生了微小的尾数误差。</div>
        </div>
        <div style={{ marginTop: '10px' }}>
          <Text strong>Big.js 修复结果:</Text> <Text type="success">{bigSum}</Text>
          <div style={{ fontSize: '12px', color: '#888' }}>模拟十进制计算，无精度损失。</div>
        </div>
      </Space>
    </Card>
  );
};

/**
 * 金融精度重构页面
 */
const BankPrecision: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Title level={2}>{BankPrecisionExamples.title}</Title>

      {/* 一、 Bug 出现的现象 */}
      <Card title="一、 Bug 出现的现象" style={{ marginBottom: '24px' }}>
        <Paragraph>
          在处理金额加减乘除时，会出现看似荒谬的结果，如 <Text code>0.1 + 0.2 = 0.30000000000000004</Text>。
        </Paragraph>
        <Alert message="对账风险" description={BankPrecisionExamples.phenomenon} type="error" showIcon />
      </Card>

      {/* 二、 Bug 出现的底层原因 */}
      <Card title="二、 Bug 出现的底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>IEEE 754 浮点数陷阱：</Text>
        </Paragraph>
        <Paragraph>
          {BankPrecisionExamples.reason}
        </Paragraph>
        <Paragraph>
          十进制中的 0.1 在二进制下是 <Text code>0.0001100110011...</Text> 无限循环。计算机在存储时不得不进行四舍五入，这微小的误差在多步运算后会累积成可见的错误。
        </Paragraph>
      </Card>

      {/* 三、 Bug 如何解决 */}
      <Card title="三、 Bug 如何解决" style={{ marginBottom: '24px' }}>
        <CodeDiff
          oldValue={BankPrecisionExamples.bad}
          newValue={BankPrecisionExamples.good}
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
          在银行和电商项目中，通常推荐将所有金额乘以 100 转化为“分”进行整数计算，最后展示时再还原。或者直接引入成熟的库如 <Text code>big.js</Text>。
        </Paragraph>
        <Divider />
        <PrecisionDemo />
      </Card>

      {/* 五、 Bug 能解决的核心原理 */}
      <Card title="五、 Bug 能解决的核心原理" style={{ background: '#f0f5ff' }}>
        <ul>
          <li>
            <Text strong>串行十进制计算：</Text>
            <Text code>big.js</Text> 内部将数字拆解为数组（如 <Text code>[0, 1]</Text>），模拟人类手工列算式的过程进行逐位计算，完全避开了 CPU 的二进制浮点运算器。
          </li>
          <li>
            <Text strong>固定精度截断：</Text>
            由于是手动模拟，库可以精确控制保留的小数位数，确保每一位都在可控范围内，不会产生不可预期的溢出。
          </li>
          <li>
            <Text strong>整数化避险：</Text>
            将 <Text code>0.1 + 0.2</Text> 转化为 <Text code>(1 + 2) / 10</Text>，利用了整数运算在计算机中是绝对精确（只要不溢出）的这一物理特性。
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default BankPrecision;
