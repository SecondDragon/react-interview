import React from 'react';
import { Card, Typography, Divider, Alert, Tag } from 'antd';
import { BrowserDimensionsMeta } from './Examples';
import CodeDiff from '@/components/CodeDiff';
import DimensionTable from './DimensionTable';
import LiveDemo from './LiveDemo';
import UseCases from './UseCases';

const { Title, Paragraph, Text } = Typography;

/**
 * 浏览器的各种尺寸 - 主页面
 * 遵循 Five Dimensions 结构
 */
const BrowserDimensions: React.FC = () => {
  return (
    <div>
      {/* 页面标题 */}
      <Title level={2}>{BrowserDimensionsMeta.title}</Title>
      <Paragraph type="secondary">{BrowserDimensionsMeta.description}</Paragraph>

      {/* 一、现象描述 */}
      <Card title="一、Bug 出现的现象" style={{ marginBottom: '24px' }}>
        <Alert
          message="尺寸 API 混淆导致的常见问题"
          description={<div style={{ whiteSpace: 'pre-wrap' }}>{BrowserDimensionsMeta.phenomenon}</div>}
          type="warning"
          showIcon
        />
      </Card>

      {/* 二、底层原因 */}
      <Card title="二、Bug 出现的底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>核心原因：浏览器有三套坐标系，不同 API 基于不同的坐标系。</Text>
        </Paragraph>
        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
          {BrowserDimensionsMeta.reason}
        </Paragraph>

        <Divider orientation="left">三套坐标系对比</Divider>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <Card size="small" title={<Tag color="blue">CSS 像素坐标系</Tag>}>
            <Text>前端开发最常用的逻辑像素</Text>
            <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '13px' }}>
              <li><Text code>innerWidth</Text></li>
              <li><Text code>clientWidth</Text></li>
              <li><Text code>offsetWidth</Text></li>
              <li><Text code>getBoundingClientRect()</Text></li>
            </ul>
            <Alert message="viewport 缩放会改变 CSS 像素的尺寸" type="info" showIcon style={{ marginTop: '8px' }} />
          </Card>

          <Card size="small" title={<Tag color="green">设备独立像素（DIP）</Tag>}>
            <Text>操作系统抽象的逻辑单位</Text>
            <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '13px' }}>
              <li><Text code>screen.width</Text></li>
              <li><Text code>screen.height</Text></li>
              <li><Text code>screen.availWidth</Text></li>
            </ul>
            <Alert message="不受浏览器缩放影响，只与设备硬件有关" type="success" showIcon style={{ marginTop: '8px' }} />
          </Card>

          <Card size="small" title={<Tag color="purple">视觉视口坐标系</Tag>}>
            <Text>用户实际看到的区域</Text>
            <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '13px' }}>
              <li><Text code>visualViewport.width</Text></li>
              <li><Text code>visualViewport.height</Text></li>
              <li><Text code>visualViewport.scale</Text></li>
            </ul>
            <Alert message="缩放时动态变化，反映用户实际可见区域" type="warning" showIcon style={{ marginTop: '8px' }} />
          </Card>
        </div>
      </Card>

      {/* 三、解决方案 */}
      <Card title="三、Bug 如何解决" style={{ marginBottom: '24px' }}>
        <Paragraph>
          系统理解每个 API 的精确含义，根据场景选择合适的 API。
        </Paragraph>

        <CodeDiff
          oldValue={BrowserDimensionsMeta.bad}
          newValue={BrowserDimensionsMeta.good}
          leftTitle="❌ 反面教材"
          rightTitle="✅ 最佳实践"
          type="error"
          hideDiffMarkers={true}
        />
      </Card>

      {/* 四、互动演示 */}
      <Card
        title={<span>四、为什么要这样解决 且互动演示 <Tag color="blue">Live Demo</Tag></span>}
        style={{ marginBottom: '24px' }}
      >
        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
          {BrowserDimensionsMeta.whySolveThisWay}
        </Paragraph>

        <Divider />

        {/* 核心对比表格 */}
        <DimensionTable />

        <Divider />

        {/* 实时尺寸监控 */}
        <LiveDemo />

        <Divider />

        {/* 实际应用场景 */}
        <UseCases />
      </Card>

      {/* 五、核心原理 */}
      <Card title="五、Bug 能解决的核心原理" style={{ background: '#f0f5ff' }}>
        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
          {BrowserDimensionsMeta.principle}
        </Paragraph>

        <Divider />

        <Title level={5}>面试高频考点</Title>
        <ul>
          <li>
            <Text strong>clientWidth、offsetWidth、scrollWidth 的区别？</Text>
            <Paragraph type="secondary">
              clientWidth = 内容区 + 内边距；offsetWidth = 内容区 + 内边距 + 边框 + 滚动条；scrollWidth = 所有内容的总宽度（含溢出）。
            </Paragraph>
          </li>
          <li>
            <Text strong>innerWidth 和 clientWidth 有什么区别？</Text>
            <Paragraph type="secondary">
              innerWidth 是窗口级别（含滚动条），clientWidth 是元素级别（不含滚动条）。document.documentElement.clientWidth 约等于 innerWidth 减去滚动条宽度。
            </Paragraph>
          </li>
          <li>
            <Text strong>为什么缩放页面后 innerWidth 变了，screen.width 没变？</Text>
            <Paragraph type="secondary">
              innerWidth 基于 CSS 像素坐标系，缩放会改变 CSS 像素的"尺寸"；screen.width 基于 DIP 坐标系，只与设备硬件有关，不受浏览器缩放影响。
            </Paragraph>
          </li>
          <li>
            <Text strong>getBoundingClientRect() 有什么性能问题？</Text>
            <Paragraph type="secondary">
              会触发强制重排（forced reflow），频繁调用会影响性能。现代浏览器推荐使用 IntersectionObserver 替代。
            </Paragraph>
          </li>
          <li>
            <Text strong>移动端键盘弹出时，应该用哪个 API 检测？</Text>
            <Paragraph type="secondary">
              优先使用 visualViewport API（如果支持），因为它专门反映用户实际看到的区域。兼容性方案可以用 innerHeight 的变化作为兜底。
            </Paragraph>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default BrowserDimensions;
