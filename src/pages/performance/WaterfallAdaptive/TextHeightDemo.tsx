import React, { useState, useEffect, useRef } from 'react';
import { Card, InputNumber, Input, Typography, Space, Tag } from 'antd';

const { Paragraph, Text } = Typography;

const DEFAULT_TEXT = '这是一段中文文本。It also contains some English words. 如果容器宽度很窄，它就会换行。';

const measureTextHeight = (
  text: string,
  fontSize: number,
  maxWidth: number,
  lineHeight: number
): { height: number; lineCount: number } => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return { height: 0, lineCount: 0 };

  ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;

  const words = text.split('');
  let line = '';
  let lineCount = 1;

  for (const word of words) {
    const testLine = line + word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      lineCount++;
      line = word;
    } else {
      line = testLine;
    }
  }

  return {
    height: lineCount * lineHeight,
    lineCount,
  };
};

const TextHeightDemo: React.FC = () => {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [fontSize, setFontSize] = useState(14);
  const [maxWidth, setMaxWidth] = useState(200);
  const [lineHeight, setLineHeight] = useState(20);
  const [result, setResult] = useState({ height: 0, lineCount: 0 });

  useEffect(() => {
    setResult(measureTextHeight(text, fontSize, maxWidth, lineHeight));
  }, [text, fontSize, maxWidth, lineHeight]);

  return (
    <Card title="纯文本高度测量（Canvas 模拟 Pretext 思路）" style={{ marginTop: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Paragraph>
          纯文本可以通过 Canvas <Text code>measureText</Text> 在指定宽度下逐字/逐词模拟换行，从而提前计算高度。这正是 Pretext 的核心思路。
        </Paragraph>

        <Input.TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="输入文本"
        />

        <Space>
          <div>
            <Text type="secondary">字体大小</Text>
            <InputNumber value={fontSize} onChange={(v) => setFontSize(v ?? 14)} min={10} max={32} />
          </div>
          <div>
            <Text type="secondary">容器宽度</Text>
            <InputNumber value={maxWidth} onChange={(v) => setMaxWidth(v ?? 200)} min={100} max={500} />
          </div>
          <div>
            <Text type="secondary">行高</Text>
            <InputNumber value={lineHeight} onChange={(v) => setLineHeight(v ?? 20)} min={16} max={40} />
          </div>
        </Space>

        <div>
          <Tag color="blue">预估行数: {result.lineCount}</Tag>
          <Tag color="green">预估高度: {Math.round(result.height)}px</Tag>
        </div>

        <div
          style={{
            width: maxWidth,
            padding: 8,
            border: '1px dashed #1890ff',
            borderRadius: 4,
            fontSize,
            lineHeight: `${lineHeight}px`,
            backgroundColor: '#f6ffed',
          }}
        >
          {text}
        </div>
      </Space>
    </Card>
  );
};

export default TextHeightDemo;
