import React, { useState } from 'react';
import { Card, Typography, Divider, Table, Radio, Space, Input, Tag, Alert } from 'antd';
import { FontRenderingExamples } from './Examples';
import CodeDiff from '@/components/CodeDiff';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

/**
 * 跨平台字体栈重构页面
 */
const FontFamily: React.FC = () => {
  const [currentFontStack, setCurrentFontStack] = useState('best-practice');

  const fontOptions = [
    {
      label: '🚫 错误示范',
      value: 'bad',
      stack: '"Microsoft YaHei", sans-serif',
    },
    {
      label: '🍎 系统默认',
      value: 'apple',
      stack: '-apple-system, BlinkMacSystemFont, sans-serif',
    },
    {
      label: '🚀 最佳实践',
      value: 'best-practice',
      stack: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", "Source Han Sans CN", sans-serif',
    }
  ];

  const currentOption = fontOptions.find(opt => opt.value === currentFontStack) || fontOptions[2];

  const dataSource = [
    { key: '1', platform: 'iOS/macOS', fonts: 'PingFang SC (平方)' },
    { key: '2', platform: 'Windows', fonts: 'Microsoft YaHei (微软雅黑)' },
    { key: '3', platform: '信创/国产 Linux', fonts: 'Source Han Sans CN (思源黑体)' },
  ];

  const columns = [
    { title: '平台', dataIndex: 'platform', key: 'platform' },
    { title: '推荐首选字体', dataIndex: 'fonts', key: 'fonts' },
  ];

  return (
    <div>
      <Title level={2}>跨平台字体栈 (Font Family) 最佳实践</Title>

      {/* 一、 Bug 出现的现象 */}
      <Card title="一、 Bug 出现的现象" style={{ marginBottom: '24px' }}>
        <Paragraph>
          同样的网页，在不同操作系统下视觉体验差异巨大。
        </Paragraph>
        <ul>
          <li><Text strong>Windows 锯齿感：</Text>由于 ClearType 渲染机制，部分字体在 Windows 下显得生硬。</li>
          <li><Text strong>信创系统回退：</Text>国产 Linux 系统由于缺少微软雅黑，常回退到极难看的宋体，导致排版错位。</li>
          <li><Text strong>Emoji 乱码：</Text>缺乏跨平台字体栈会导致表情包显示为方块。</li>
        </ul>
      </Card>

      {/* 二、 Bug 出现的底层原因 */}
      <Card title="二、 Bug 出现的底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>系统预装差异与回退链失效：</Text>
        </Paragraph>
        <Paragraph>
          每个操作系统都有自己的“亲儿子”字体。如果 CSS 只写死一种字体，在不具备该字体的平台上，浏览器会随机选择一种系统字体，彻底破坏 UI 的一致性。
        </Paragraph>
        <Table dataSource={dataSource} columns={columns} pagination={false} size="small" bordered />
      </Card>

      {/* 三、 Bug 如何解决 */}
      <Card title="三、 Bug 如何解决" style={{ marginBottom: '24px' }}>
        <Paragraph>
          建立“阶梯式”回退机制，确保每一类设备都能用到其最优字体。
        </Paragraph>
        <CodeDiff
          oldValue={FontRenderingExamples.bad}
          newValue={FontRenderingExamples.good}
          leftTitle="❌ 反面教材"
          rightTitle="✅ 最佳实践"
          type="error"
          hideDiffMarkers={true}
        />
      </Card>

      {/* 四、 为什么要这样解决 且互动演示 */}
      <Card
        title={<span>四、 为什么要这样解决 且互动演示 <Tag color="blue">Live Demo</Tag></span>}
        style={{ marginBottom: '24px', border: '2px solid #1890ff' }}
      >
        <div style={{ marginBottom: '16px' }}>
          <Radio.Group value={currentFontStack} onChange={e => setCurrentFontStack(e.target.value)} buttonStyle="solid">
            {fontOptions.map(opt => <Radio.Button key={opt.value} value={opt.value}>{opt.label}</Radio.Button>)}
          </Radio.Group>
        </div>
        <div style={{
          padding: '20px',
          background: '#fff',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          fontFamily: currentOption.stack,
        }}>
          <Title level={4}>中西文排版对比测试：Hello Font! 12345</Title>
          <TextArea
            defaultValue="测试文字：微软雅黑 vs 平方 vs 思源黑体。你可以修改这段文字，观察不同字体栈下的渲染细节。"
            variant="borderless"
            style={{ fontFamily: 'inherit', fontSize: '16px', color: '#1890ff' }}
          />
        </div>
      </Card>

      {/* 五、 Bug 能解决的核心原理 */}
      <Card title="五、 Bug 能解决的核心原理" style={{ background: '#f0f5ff' }}>
        <ul>
          <li>
            <Text strong>字符级回退 (Character-level Fallback)：</Text>
            这是核心！浏览器在渲染每个字符时，会按顺序遍历字体栈。将英文字体（如 Arial）排在前面，中文（如微软雅黑）排在后面，可以实现“英文用 Arial，中文自动回退到微软雅黑”的完美效果。
          </li>
          <li>
            <Text strong>系统变量 (Magic Keywords)：</Text>
            像 <Text code>-apple-system</Text> 是浏览器的“暗号”，它告诉引擎直接调用操作系统当前默认的、经过高度优化的 UI 字体。
          </li>
          <li>
            <Text strong>无衬线兜底 (sans-serif)：</Text>
            作为最后的防线，确保在没有任何匹配字体时，也能以现代风格的黑体（而非报纸风格的宋体）进行展示。
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default FontFamily;
