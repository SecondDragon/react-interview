import React from 'react';
import { Card, Typography, Alert, Divider, List, Badge, Tag } from 'antd';
import { FontCenteringExamples } from './Examples';
import CodeDiff from '@/components/CodeDiff';

const { Title, Paragraph, Text } = Typography;

/**
 * 跨平台垂直居中重构页面
 */
const VerticalCentering: React.FC = () => {
  return (
    <div style={{ padding: '24px', margin: '0 auto' }}>
      <Title level={2}>跨平台字体垂直居中偏差</Title>

      {/* 一、 Bug 出现的现象 */}
      <Card title="一、 Bug 出现的现象" style={{ marginBottom: '24px' }}>
        <Paragraph>
          同样的 CSS 代码，按钮里的文字在 iOS 上完美居中，但在某些 Android 机型上却显得整体偏上 1px，产生视觉上的不和谐。
        </Paragraph>
        <Alert
          message="渲染引擎差异"
          description={
            <List size="small">
              <List.Item><Badge status="success" text="iOS (CoreText):" /> 默认对基线处理非常优雅。</List.Item>
              <List.Item><Badge status="warning" text="Android (FreeType):" /> 渲染时对中文字体上下间距分配不均。</List.Item>
            </List>
          }
          type="info"
          showIcon
        />
      </Card>

      {/* 二、 Bug 出现的底层原因 */}
      <Card title="二、 Bug 出现的底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>基线 (Baseline) 与 Leading 值的算法差异：</Text>
        </Paragraph>
        <Paragraph>
          {FontCenteringExamples.reason}
        </Paragraph>
        <Paragraph>
          传统的 <Text code>line-height</Text> 是基于字体的排版参数来计算空间的。由于不同系统的渲染引擎对这些“隐藏参数”的解析逻辑不同，导致了即便高度相同，文字在盒子里的物理偏移量也不一致。
        </Paragraph>
      </Card>

      {/* 三、 Bug 如何解决 */}
      <Card title="三、 Bug 如何解决" style={{ marginBottom: '24px' }}>
        <CodeDiff
          oldValue={FontCenteringExamples.bad}
          newValue={FontCenteringExamples.good}
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
          Flexbox 是目前解决该问题的“银弹”。它通过 CSS 布局算法强行干预了渲染层，使其不再依赖不稳定的字体基线。
        </Paragraph>
        <Divider />
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', background: '#f5f5f5', padding: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '120px', height: '40px', background: '#1890ff', color: '#fff', lineHeight: '40px' }}>
              Line-height
            </div>
            <Text type="secondary" size="small">可能偏上</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '120px',
              height: '40px',
              background: '#52c41a',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              Flexbox
            </div>
            <Text type="secondary" size="small">物理级垂直居中</Text>
          </div>
        </div>
      </Card>

      {/* 五、 Bug 能解决的核心原理 */}
      <Card title="五、 Bug 能解决的核心原理" style={{ background: '#f0f5ff' }}>
        <ul>
          <li>
            <Text strong>几何中心算法：</Text>
            Flexbox 居中不关心字体的内部参数。它计算的是 <Text code>Content Box</Text> 的剩余空间，并将其平分到上下两侧，这是一种纯数学的几何分配。
          </li>
          <li>
            <Text strong>解除字体绑定：</Text>
            通过取消 <Text code>line-height</Text> 对行高的撑开作用，文字的渲染高度变回了由字号决定的自然高度，从而规避了 Leading 值带来的不均。
          </li>
          <li>
            <Text strong>亚像素对齐补吸附：</Text>
            在开启硬件加速的情况下，Flex 引擎会配合 GPU 进行亚像素对齐，确保即使在非 Retina 屏幕上，文字边缘也能尽可能贴合中轴线。
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default VerticalCentering;
