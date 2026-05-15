import React, { useState, useEffect } from 'react';
import { Card, Typography, Alert, Divider, Radio, Button, Modal, Row, Col, Tag, Table, Space } from 'antd';
import { ScrollbarExamples } from './Examples';
import CodeDiff from '@/components/CodeDiff';

const { Title, Paragraph, Text } = Typography;

/**
 * 跨平台滚动条样式重构页面
 */
const ScrollbarStyle: React.FC = () => {
  const [demoMode, setDemoMode] = useState<'default' | 'gutter' | 'beautify' | 'overlay'>('default');
  const [showLargeContent, setShowLargeContent] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleContent = () => setShowLargeContent(!showLargeContent);

  // 动态注入 Webkit 美化样式
  useEffect(() => {
    const styleId = 'scrollbar-demo-style';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    
    styleTag.innerHTML = `
      .scrollbar-demo-container.mode-beautify::-webkit-scrollbar {
        width: 8px;
      }
      .scrollbar-demo-container.mode-beautify::-webkit-scrollbar-thumb {
        background: rgba(24, 144, 255, 0.3);
        border-radius: 10px;
        border: 2px solid transparent;
        background-clip: content-box;
      }
      .scrollbar-demo-container.mode-beautify::-webkit-scrollbar-thumb:hover {
        background: rgba(24, 144, 255, 0.5);
        background-clip: content-box;
      }
      .scrollbar-demo-container.mode-beautify::-webkit-scrollbar-track {
        background: #f0f2f5;
      }
    `;
    return () => {
      styleTag?.remove();
    };
  }, []);

  const dataSource = [
    { key: '1', os: 'Windows / Linux', type: '独占式 (Classic)', width: '12px ~ 17px', impact: '高 (导致 Layout Shift)' },
    { key: '2', os: 'macOS (默认)', type: '悬浮式 (Overlay)', width: '0px (不占位)', impact: '极低' },
    { key: '3', os: 'Android / iOS', type: '悬浮式', width: '0px', impact: '无' },
  ];

  const columns = [
    { title: '操作系统', dataIndex: 'os', key: 'os' },
    { title: '滚动条类型', dataIndex: 'type', key: 'type' },
    { title: '占据宽度', dataIndex: 'width', key: 'width' },
    { title: '布局影响', dataIndex: 'impact', key: 'impact', render: (text: string) => (
      <Tag color={text.includes('高') ? 'red' : 'green'}>{text}</Tag>
    )},
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>{ScrollbarExamples.title}</Title>
      <Paragraph type="secondary">
        解决 Windows 系统下滚动条出现/消失导致的页面整体水平跳动问题，以及跨平台视觉一致性美化。
      </Paragraph>

      {/* 一、 Bug 出现的现象 */}
      <Card title="一、 Bug 出现的现象" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>典型表现：</Text>
          <ul>
            <li>在 Windows 系统中，当页面内容从不足一屏变为超过一屏时，滚动条会突然出现并挤压内容区。</li>
            <li>打开 Modal 弹窗时，UI 库通常会给 <Text code>body</Text> 加上 <Text code>overflow: hidden</Text>，导致滚动条瞬间消失，页面内容向右猛然平移 17px。</li>
            <li>固定定位的 Header 或返回顶部按钮在滚动条切换时会发生错位。</li>
          </ul>
        </Paragraph>
        <Alert 
          message="注意：如果你在 Mac 上开发且未连接外接鼠标，你可能永远无法察觉这个 bug，因为 macOS 默认隐藏不占位的滚动条。" 
          type="warning" 
          showIcon 
        />
      </Card>

      {/* 二、 Bug 出现的底层原因 */}
      <Card title="二、 Bug 出现的底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>操作系统视口机制差异：</Text>
        </Paragraph>
        <Paragraph>
          Windows 系统的滚动条默认作为窗口的一部分存在，会“挤压”内容区（Classic Scrollbars）。而 macOS 和移动端默认使用“悬浮式”滚动条（Overlay Scrollbars），不占据物理空间。
        </Paragraph>
        <Table 
          dataSource={dataSource} 
          columns={columns} 
          pagination={false} 
          size="small" 
          bordered 
        />
      </Card>

      {/* 三、 Bug 如何解决 */}
      <Card title="三、 Bug 如何解决" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px' }}>
          <div>
            <Title level={5}>✅ 方案 A：现代 CSS (解决抖动)</Title>
            <CodeDiff code={ScrollbarExamples.solutionA} type="success" title="scrollbar-gutter" />
          </div>
          <div>
            <Title level={5}>✅ 方案 B：全局美化 (视觉一致)</Title>
            <CodeDiff code={ScrollbarExamples.solutionB} type="info" title="WebKit 伪元素" />
          </div>
        </div>
        <Divider />
        <Title level={5}>🚀 方案 C：Overlay 进阶方案 (终极抹平)</Title>
        <CodeDiff code={ScrollbarExamples.solutionC} type="warning" title="OverlayScrollbars" />
      </Card>

      {/* 四、 为什么要这样解决 且互动演示 */}
      <Card 
        title={<span>四、 为什么要这样解决 且互动演示 <Tag color="blue">Live Demo</Tag></span>} 
        style={{ marginBottom: '24px', border: '2px solid #1890ff' }}
      >
        <Row gutter={24}>
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio.Group 
                value={demoMode} 
                onChange={e => setDemoMode(e.target.value)}
                buttonStyle="solid"
                size="small"
              >
                <Space direction="vertical">
                  <Radio value="default">🚫 默认 (会抖动)</Radio>
                  <Radio value="gutter">✅ Gutter (稳如磐石)</Radio>
                  <Radio value="beautify">🎨 Webkit (精美样式)</Radio>
                </Space>
              </Radio.Group>
              <Button block type="primary" onClick={toggleContent}>
                {showLargeContent ? '减少内容' : '增加内容'}
              </Button>
              <Button block onClick={() => setIsModalOpen(true)}>
                弹出 Modal (触发锁定)
              </Button>
            </Space>
          </Col>
          <Col span={16}>
            <div 
              className={`scrollbar-demo-container mode-${demoMode}`}
              style={{ 
                height: '200px', 
                border: '2px dashed #d9d9d9', 
                overflowY: 'auto',
                padding: '20px',
                scrollbarGutter: demoMode === 'gutter' ? 'stable' : 'auto'
              }}
            >
              <Title level={4}>内容容器</Title>
              <div style={{ background: '#1890ff', color: '#fff', padding: '10px', width: '80%', margin: '0 auto' }}>居中元素</div>
              {showLargeContent && [...Array(10)].map((_, i) => <Paragraph key={i}>填充内容 {i+1}...</Paragraph>)}
            </div>
          </Col>
        </Row>
      </Card>

      {/* 五、 Bug 能解决的核心原理 */}
      <Card title="五、 Bug 能解决的核心原理" style={{ background: '#f0f5ff' }}>
        <ul>
          <li>
            <Text strong>scrollbar-gutter: stable：</Text>
            这是 W3C 专门为解决此问题设计的属性。它强制浏览器在盒模型计算阶段就为滚动条预留出固定的宽度空间，无论内容是否溢出，容器的可用宽度始终保持一致，从而消除了 Layout Shift。
          </li>
          <li>
            <Text strong>亚像素抗锯齿与伪元素渲染：</Text>
            通过 <Text code>::-webkit-scrollbar</Text> 系列伪元素，我们可以改写浏览器默认的滚动条渲染树。通过 <Text code>background-clip: content-box</Text> 配合透明边框，可以在视觉上实现滚动条的“内边距”效果，使其更具高级感。
          </li>
          <li>
            <Text strong>JS 模拟滚动 (Overlay)：</Text>
            JS 库通过监听 <Text code>wheel</Text> 事件并手动修改 <Text code>scrollTop</Text>，并配合一个完全 <Text code>absolute</Text> 定位的自定义 DOM 节点作为滚动条。这样它完全脱离了文档流，不会引起任何重排抖动。
          </li>
        </ul>
      </Card>

      <Modal title="Body 锁定测试" open={isModalOpen} onOk={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)}>
        <Paragraph>观察背景页面在 Modal 弹出（Body 锁死）时是否发生了位移。</Paragraph>
      </Modal>
    </div>
  );
};

export default ScrollbarStyle;
