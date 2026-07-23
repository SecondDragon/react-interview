import React, { useState, useEffect } from 'react';
import { Card, Input, Typography, Space, Tag, Alert } from 'antd';

const { Paragraph, Text } = Typography;

const DEFAULT_HTML = '<p><strong>HTML 文本</strong> 可以包含 <em>斜体</em>、<a href="#">链接</a> 和换行。<br/>如果内容很复杂，就必须在真实 DOM 中渲染后才能测量。</p>';

const HtmlHeightDemo: React.FC = () => {
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.visibility = 'hidden';
    el.style.width = `${width}px`;
    el.style.padding = '8px';
    el.style.boxSizing = 'border-box';
    el.innerHTML = html;
    document.body.appendChild(el);
    const measuredHeight = el.getBoundingClientRect().height;
    document.body.removeChild(el);
    setHeight(measuredHeight);
  }, [html, width]);

  return (
    <Card title="HTML 文本高度测量：必须依赖真实 DOM" style={{ marginTop: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message="为什么 HTML 文本更难测量？"
          description="HTML 包含块级元素、内联样式、嵌套标签、图片等。Canvas 无法直接处理这些，必须构造一个真实的 DOM 元素并测量。"
          type="warning"
          showIcon
        />

        <Input.TextArea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={3}
          placeholder="输入 HTML"
        />

        <Space>
          <div>
            <Text type="secondary">容器宽度</Text>
            <Input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              style={{ width: 120 }}
            />
          </div>
        </Space>

        <div>
          <Tag color="purple">真实 DOM 测量高度: {Math.round(height)}px</Tag>
        </div>

        <div
          style={{
            width,
            padding: 8,
            border: '1px dashed #722ed1',
            borderRadius: 4,
            backgroundColor: '#f9f0ff',
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Space>
    </Card>
  );
};

export default HtmlHeightDemo;
