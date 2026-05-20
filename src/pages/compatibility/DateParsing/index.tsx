import React, { useState } from 'react';
import { Card, Typography, Alert, Divider, Button, Space, message, Tag } from 'antd';
import { DateParsingExamples } from './Examples';
import CodeDiff from '@/components/CodeDiff';

const { Title, Paragraph, Text } = Typography;

/**
 * 互动演示：日期解析对比
 */
const DateParsingDemo = () => {
  const [result, setResult] = useState<string>('');

  const handleBadParse = () => {
    const dateStr = '2023-10-10 12:00:00';
    const timestamp = new Date(dateStr).getTime();
    if (isNaN(timestamp)) {
      setResult('解析失败：NaN (Invalid Date)');
      message.error('Safari 解析失败！');
    } else {
      setResult(`解析成功：${timestamp} (当前浏览器已兼容，但在 Safari 中必挂)`);
      message.warning('当前环境已兼容，但在 Safari 下仍有白屏风险！');
    }
  };

  const handleGoodParse = () => {
    const dateStr = '2023-10-10 12:00:00';
    const safeDateStr = dateStr.replace(/-/g, '/');
    const timestamp = new Date(safeDateStr).getTime();
    setResult(`解析成功：${timestamp} (通用安全格式 '2023/10/10')`);
    message.success('完美解析！');
  };

  return (
    <Card title="💻 互动演示：解析测试 '2023-10-10 12:00:00'" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Button onClick={handleBadParse} danger>直接解析 (存在 Safari 风险)</Button>
          <Button onClick={handleGoodParse} type="primary">替换为 '/' 后解析 (稳健)</Button>
        </Space>
        {result && <Alert message={`运行结果: ${result}`} type={result.includes('NaN') || result.includes('必挂') ? 'error' : 'success'} showIcon />}
      </Space>
    </Card>
  );
};

/**
 * 日期解析重构页面
 */
const DateParsing: React.FC = () => {
  return (
    <div>
      <Title level={2}>{DateParsingExamples.title}</Title>

      {/* 一、 Bug 出现的现象 */}
      <Card title="一、 Bug 出现的现象" style={{ marginBottom: '24px' }}>
        <Paragraph>
          在 Chrome 上运行良好的日期转换逻辑，在 iPhone (Safari) 上却显示为 <Text code>NaN</Text> 或 <Text code>Invalid Date</Text>。
        </Paragraph>
        <Alert message="典型后果" description="倒计时组件白屏、订单创建时间显示异常、财务报表无法展示。" type="error" showIcon />
      </Card>

      {/* 二、 Bug 出现的底层原因 */}
      <Card title="二、 Bug 出现的底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>严格的标准遵循：</Text>
        </Paragraph>
        <Paragraph>
          {DateParsingExamples.reason}
        </Paragraph>
        <Paragraph>
          Chrome 的 V8 引擎对非标格式做了“私下兼容”，而 Safari 的 JavaScriptCore 引擎则严格要求符合 ISO 8601。
        </Paragraph>
      </Card>

      {/* 三、 Bug 如何解决 */}
      <Card title="三、 Bug 如何解决" style={{ marginBottom: '24px' }}>
        <CodeDiff
          oldValue={DateParsingExamples.bad}
          newValue={DateParsingExamples.good}
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
          {DateParsingExamples.whySolveThisWay}
        </Paragraph>
        <Divider />
        <DateParsingDemo />
      </Card>

      {/* 五、 Bug 能解决的核心原理 */}
      <Card title="五、 Bug 能解决的核心原理" style={{ background: '#f0f5ff' }}>
        <ul>
          <li>
            <Text strong>ISO 8601 规范限制：</Text>
            标准规定日期分隔符应为 <Text code>-</Text>，但必须伴随 <Text code>T</Text> 和时区标志。如果只写 <Text code>2023-10-10</Text> 且带空格，则超出了规范定义范围。
          </li>
          <li>
            <Text strong>斜杠格式的历史兼容性：</Text>
            使用 <Text code>/</Text> 分隔日期（如 <Text code>2023/10/10</Text>）是早期浏览器事实上的准标准。所有引擎都保留了对该格式的稳定解析逻辑。
          </li>
          <li>
            <Text strong>dayjs 的预处理机制：</Text>
            第三方库通过复杂的正则嗅探，自动将各种异构日期字符串归一化为标准格式，从而抹平了引擎间的差异。
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default DateParsing;
