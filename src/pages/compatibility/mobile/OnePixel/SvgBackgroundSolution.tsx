import React, { useState } from 'react';
import { Card, Typography, Tag, Space, Radio, Alert } from 'antd';
import { SvgBackgroundExamples } from './Examples';
import SolutionSection from './SolutionSection';

const { Text } = Typography;

/**
 * 互动演示：SVG 背景图方案
 */
const SvgBackgroundDemo = () => {
  const [borderType, setBorderType] = useState<'solid' | 'gradient' | 'dashed'>('solid');

  // SVG Data URI 生成
  const getSvgUri = (type: string) => {
    const colors: Record<string, string> = {
      solid: '%23ddd',
      gradient: 'url(%23g)',
      dashed: '%23ddd',
    };

    if (type === 'gradient') {
      return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='0%25'%3E%3Cstop offset='0%25' stop-color='%231890ff'/%3E%3Cstop offset='100%25' stop-color='%2352c41a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='none' stroke='url(%23g)' stroke-width='1' vector-effect='non-scaling-stroke'/%3E%3C/svg%3E")`;
    }

    return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='none' stroke='${colors[type]}' stroke-width='1' ${type === 'dashed' ? 'stroke-dasharray=\'4 4\'' : ''} vector-effect='non-scaling-stroke'/%3E%3C/svg%3E")`;
  };

  const borderTypeOptions = [
    { value: 'solid', label: '实线边框' },
    { value: 'gradient', label: '渐变边框' },
    { value: 'dashed', label: '虚线边框' },
  ];

  return (
    <Card title="🎨 SVG 背景图方案演示" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Radio.Group
          value={borderType}
          onChange={(e) => setBorderType(e.target.value)}
          buttonStyle="solid"
        >
          {borderTypeOptions.map((opt) => (
            <Radio.Button key={opt.value} value={opt.value}>
              {opt.label}
            </Radio.Button>
          ))}
        </Radio.Group>

        <Alert
          message={
            <div>
              <div>
                <Text strong>当前类型：</Text>
                <Tag color="blue">
                  {borderType === 'solid' && '实线'}
                  {borderType === 'gradient' && '渐变'}
                  {borderType === 'dashed' && '虚线'}
                </Tag>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>核心属性：</Text>
                <Text code>vector-effect="non-scaling-stroke"</Text>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>原理：</Text>
                <Text>SVG 矢量渲染，线条宽度不随元素缩放变化</Text>
              </div>
            </div>
          }
          type="info"
        />

        <div style={{ marginTop: 16 }}>
          <Text strong>效果预览：</Text>
          <div style={{ marginTop: 8, padding: 24, background: '#f5f5f5', borderRadius: 8 }}>
            <div
              style={{
                padding: 16,
                background: '#fff',
                borderRadius: 8,
                backgroundImage: getSvgUri(borderType),
                backgroundSize: '100% 100%',
                textAlign: 'center',
              }}
            >
              <Text strong>SVG 背景边框</Text>
              <br />
              <Text type="secondary">
                {borderType === 'solid' && '实线：精确 1px 细线'}
                {borderType === 'gradient' && '渐变：蓝到绿的渐变边框'}
                {borderType === 'dashed' && '虚线：4px 线段 + 4px 间隔'}
              </Text>
            </div>
          </div>
        </div>
      </Space>
    </Card>
  );
};

/**
 * 方案四：SVG 背景图方案
 */
const SvgBackgroundSolution: React.FC = () => {
  return (
    <SolutionSection
      examples={SvgBackgroundExamples}
      demo={<SvgBackgroundDemo />}
      borderColor="#722ed1"
      bgColor="#f9f0ff"
    />
  );
};

export default SvgBackgroundSolution;
