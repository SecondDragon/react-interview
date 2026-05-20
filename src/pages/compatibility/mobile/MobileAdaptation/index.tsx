import React, { useState } from 'react';
import { Card, Typography, Divider, Tag, Space, Slider, Alert, Table } from 'antd';
import { MobileAdaptationMeta } from './Examples';
import CodeDiff from '@/components/CodeDiff';

// 各方案独立组件
import RemSolution from './RemSolution';
import VwSolution from './VwSolution';
import ViewportScaleSolution from './ViewportScaleSolution';
import ModernCssSolution from './ModernCssSolution';

const { Title, Paragraph, Text } = Typography;

/* ============================================================
 * 综合对比：rem vs vw 数学等价性演示
 * ============================================================ */

const ComparisonDemo = () => {
  const [deviceWidth, setDeviceWidth] = useState(375);
  const designWidth = 750;
  const designPx = 150;

  // rem 计算
  const remBase = designWidth / 10;
  const rootFontSize = deviceWidth / 10;
  const remValue = designPx / remBase;
  const remActualPx = remValue * rootFontSize;

  // vw 计算
  const vwValue = (designPx / designWidth) * 100;
  const vwActualPx = (vwValue / 100) * deviceWidth;

  const devices = [
    { name: 'iPhone SE', width: 375 },
    { name: 'iPhone 14', width: 390 },
    { name: 'iPhone 14 Pro Max', width: 430 },
    { name: 'Android', width: 360 },
  ];

  return (
    <Card title="⚖️ rem vs vw 数学等价性演示" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>模拟设备宽度：</Text>
          <Slider
            min={320}
            max={450}
            value={deviceWidth}
            onChange={setDeviceWidth}
            marks={{ 320: '320', 375: '375', 390: '390', 430: '430', 450: '450' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {devices.map((d) => (
            <Tag
              key={d.width}
              color={deviceWidth === d.width ? 'green' : 'default'}
              style={{ cursor: 'pointer' }}
              onClick={() => setDeviceWidth(d.width)}
            >
              {d.name}
            </Tag>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          {/* rem 方案 */}
          <div style={{ flex: 1 }}>
            <Tag color="blue">rem 方案</Tag>
            <div
              style={{
                width: `${deviceWidth * 0.4}px`,
                maxWidth: '100%',
                height: 50,
                border: '2px solid #1890ff',
                borderRadius: 4,
                marginTop: 8,
                background: '#f0f5ff',
              }}
            >
              <div
                style={{
                  width: `${(remActualPx / deviceWidth) * 100}%`,
                  height: '100%',
                  background: '#1890ff',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 11,
                }}
              >
                {remActualPx.toFixed(1)}px
              </div>
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {designPx}px → {remValue.toFixed(3)}rem → {remActualPx.toFixed(1)}px
            </Text>
          </div>

          {/* vw 方案 */}
          <div style={{ flex: 1 }}>
            <Tag color="green">vw 方案</Tag>
            <div
              style={{
                width: `${deviceWidth * 0.4}px`,
                maxWidth: '100%',
                height: 50,
                border: '2px solid #52c41a',
                borderRadius: 4,
                marginTop: 8,
                background: '#f6ffed',
              }}
            >
              <div
                style={{
                  width: `${vwValue}%`,
                  height: '100%',
                  background: '#52c41a',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 11,
                }}
              >
                {vwActualPx.toFixed(1)}px
              </div>
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {designPx}px → {vwValue.toFixed(2)}vw → {vwActualPx.toFixed(1)}px
            </Text>
          </div>
        </div>

        <Alert
          message={
            <Text>
              <Text strong>结论：</Text>
              两种方案数学上等价！rem 通过 JS 设置根字体，vw 直接利用 CSS 视口单位。
              最终渲染结果相同：{remActualPx.toFixed(1)}px = {vwActualPx.toFixed(1)}px ✅
            </Text>
          }
          type="success"
          showIcon
        />
      </Space>
    </Card>
  );
};

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
  { title: 'rem', dataIndex: 'rem', key: 'rem' },
  { title: 'vw', dataIndex: 'vw', key: 'vw' },
  { title: 'viewport 缩放', dataIndex: 'scale', key: 'scale' },
  { title: '现代 CSS', dataIndex: 'modern', key: 'modern' },
];

const comparisonData = [
  {
    key: '1',
    dimension: '是否需要 JS',
    rem: '✅ 需要',
    vw: '❌ 不需要',
    scale: '✅ 需要',
    modern: '❌ 不需要',
  },
  {
    key: '2',
    dimension: '浏览器兼容',
    rem: 'IE9+',
    vw: '现代浏览器',
    scale: 'IE9+',
    modern: '较新浏览器',
  },
  {
    key: '3',
    dimension: '1px 边框',
    rem: '需特殊处理',
    vw: '需特殊处理',
    scale: '✅ 天然解决',
    modern: '需特殊处理',
  },
  {
    key: '4',
    dimension: 'SSR 支持',
    rem: '需处理',
    vw: '✅ 天然支持',
    scale: '需处理',
    modern: '✅ 天然支持',
  },
  {
    key: '5',
    dimension: '代码可读性',
    rem: '一般',
    vw: '较差',
    scale: '一般',
    modern: '✅ 最好',
  },
  {
    key: '6',
    dimension: '工具链成熟度',
    rem: '✅ 最成熟',
    vw: '✅ 成熟',
    scale: '一般',
    modern: '新兴',
  },
  {
    key: '7',
    dimension: '推荐场景',
    rem: '传统项目',
    vw: '现代项目首选',
    scale: '了解即可',
    modern: '未来趋势',
  },
];

/* ============================================================
 * 主页面组件
 * ============================================================ */

const MobileAdaptation: React.FC = () => {
  return (
    <div>
      {/* 页面标题 */}
      <Title level={2}>{MobileAdaptationMeta.title}</Title>
      <Paragraph type="secondary">{MobileAdaptationMeta.description}</Paragraph>

      {/* 引言：现象与原因总述 */}
      <Card title="📱 移动端适配问题概述" style={{ marginBottom: 32 }}>
        <Alert
          message="核心矛盾"
          description={MobileAdaptationMeta.phenomenon}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Paragraph>{MobileAdaptationMeta.reason}</Paragraph>
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
            设计稿 750px（固定）
          </Tag>
          <Text strong style={{ fontSize: 20 }}>
            →
          </Text>
          <Tag color="red" style={{ fontSize: 14, padding: '4px 12px' }}>
            转换层（rem/vw/scale）
          </Tag>
          <Text strong style={{ fontSize: 20 }}>
            →
          </Text>
          <Tag color="green" style={{ fontSize: 14, padding: '4px 12px' }}>
            设备 320~430px（动态）
          </Tag>
        </div>
      </Card>

      {/* 四种方案独立组件 */}
      <RemSolution />
      <VwSolution />
      <ModernCssSolution />
      <ViewportScaleSolution />

      {/* 综合对比 */}
      <Card
        title="📊 四种方案综合对比"
        style={{ marginBottom: 32, borderLeft: '4px solid #13c2c2' }}
      >
        <Table
          columns={comparisonColumns}
          dataSource={comparisonData}
          pagination={false}
          size="small"
          bordered
        />

        <Divider />

        <Title level={5}>⚖️ 数学等价性验证</Title>
        <ComparisonDemo />
      </Card>

      {/* 工程选型建议 */}
      <Card
        title="🛠️ 工程选型建议"
        style={{ marginBottom: 32, borderLeft: '4px solid #eb2f96' }}
      >
        <CodeDiff code={MobileAdaptationMeta.recommendation} type="info" title="参考代码" />
      </Card>

      {/* 错误 vs 正确 */}
      <Card
        title="❌ vs ✅ 代码对比"
        style={{ marginBottom: 32, borderLeft: '4px solid #f5222d' }}
      >
        <CodeDiff
          oldValue={MobileAdaptationMeta.bad}
          newValue={MobileAdaptationMeta.good}
          leftTitle="❌ 反面教材"
          rightTitle="✅ 最佳实践"
          type="error"
          hideDiffMarkers={true}
        />
      </Card>

      {/* 面试高频问题 */}
      <Card title="🎓 面试高频问题" style={{ borderLeft: '4px solid #2f54eb' }}>
        <Paragraph style={{ whiteSpace: 'pre-line' }}>
          {MobileAdaptationMeta.interviewQA}
        </Paragraph>
      </Card>
    </div>
  );
};

export default MobileAdaptation;
