import React from 'react';
import { Card, Typography, Divider, Tag, Alert, Table } from 'antd';
import { OnePixelMeta } from './Examples';
import CodeDiff from '@/components/CodeDiff';

// 各方案独立组件
// import PseudoElementSolution from './PseudoElementSolution';
import ViewportScaleSolution from './ViewportScaleSolution';
import BoxShadowSolution from './BoxShadowSolution';
import SvgBackgroundSolution from './SvgBackgroundSolution';
import PostcssPluginSolution from './PostcssPluginSolution';

const { Title, Paragraph, Text } = Typography;

/* ============================================================
 * 综合对比表格
 * ============================================================ */

const comparisonColumns = [
  {
    title: '对比维度',
    dataIndex: 'dimension',
    key: 'dimension',
    render: (text: string) => <Text strong>{text}</Text>,
  },
  { title: '伪元素缩放', dataIndex: 'pseudo', key: 'pseudo' },
  { title: 'viewport缩放', dataIndex: 'scale', key: 'scale' },
  { title: 'box-shadow', dataIndex: 'shadow', key: 'shadow' },
  { title: 'SVG 背景', dataIndex: 'svg', key: 'svg' },
  { title: 'PostCSS插件', dataIndex: 'postcss', key: 'postcss' },
];

const comparisonData = [
  {
    key: '1',
    dimension: '兼容性',
    pseudo: '✅ 最好',
    scale: '好',
    shadow: '较好',
    svg: '一般',
    postcss: '依赖方案',
  },
  {
    key: '2',
    dimension: '代码复杂度',
    pseudo: '中',
    scale: '低',
    shadow: '低',
    svg: '高',
    postcss: '最低',
  },
  {
    key: '3',
    dimension: '圆角支持',
    pseudo: '需处理',
    scale: '天然',
    shadow: '天然',
    svg: '天然',
    postcss: '依赖方案',
  },
  {
    key: '4',
    dimension: '工程化程度',
    pseudo: '手动',
    scale: '手动',
    shadow: '手动',
    svg: '手动',
    postcss: '✅ 自动',
  },
  {
    key: '5',
    dimension: '性能影响',
    pseudo: '小',
    scale: '中',
    shadow: '小',
    svg: '中',
    postcss: '构建时',
  },
  {
    key: '6',
    dimension: '推荐场景',
    pseudo: '通用首选',
    scale: '了解即可',
    shadow: '圆角场景',
    svg: '复杂样式',
    postcss: '大型项目',
  },
];

/* ============================================================
 * 主页面组件
 * ============================================================ */

const OnePixel: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* 页面标题 */}
      <Title level={2}>{OnePixelMeta.title}</Title>
      <Paragraph type="secondary">{OnePixelMeta.description}</Paragraph>

      {/* 引言：现象与原因总述 */}
      <Card title="📱 1px 边框问题概述" style={{ marginBottom: 32 }}>
        <Alert
          message="设计师的困惑"
          description={OnePixelMeta.phenomenon}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Paragraph>{OnePixelMeta.reason}</Paragraph>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 16,
            background: '#fff2f0',
            borderRadius: 8,
            marginTop: 16,
          }}
        >
          <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
            CSS 1px
          </Tag>
          <Text strong style={{ fontSize: 20 }}>
            × DPR(2/3)
          </Text>
          <Text strong style={{ fontSize: 20 }}>
            =
          </Text>
          <Tag color="red" style={{ fontSize: 14, padding: '4px 12px' }}>
            2~3 物理像素 ❌
          </Tag>
        </div>
      </Card>

      {/* 五种方案独立组件 */}
      {/*<PseudoElementSolution />*/}
      <ViewportScaleSolution />
      <BoxShadowSolution />
      <SvgBackgroundSolution />
      <PostcssPluginSolution />

      {/* 综合对比 */}
      <Card
        title="📊 五种方案综合对比"
        style={{ marginBottom: 32, borderLeft: '4px solid #13c2c2' }}
      >
        <Table
          columns={comparisonColumns}
          dataSource={comparisonData}
          pagination={false}
          size="small"
          bordered
        />
      </Card>

      {/* 工程选型建议 */}
      <Card
        title="🛠️ 工程选型建议"
        style={{ marginBottom: 32, borderLeft: '4px solid #eb2f96' }}
      >
        <CodeDiff code={OnePixelMeta.recommendation} type="info" title="工程选型建议" />
      </Card>

      {/* 面试高频问题 */}
      <Card title="🎓 面试高频问题" style={{ borderLeft: '4px solid #2f54eb' }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>
          {OnePixelMeta.interviewQA}
        </Paragraph>
      </Card>
    </div>
  );
};

export default OnePixel;
