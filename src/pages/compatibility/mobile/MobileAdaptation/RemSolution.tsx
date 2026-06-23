import React, { useState } from 'react';
import { Card, Typography, Tag, Space, Slider, Alert } from 'antd';
import { RemAdaptationExamples } from './Examples';
import SolutionSection from './SolutionSection';

const { Text } = Typography;

/**
 * 互动演示：rem 方案原理
 * 展示不同设备宽度下 rem 与 px 的对应关系
 */
const RemDemo = () => {
  const [deviceWidth, setDeviceWidth] = useState(375);
  const designWidth = 750;
  const remBase = designWidth / 10; // 75px = 1rem
  const rootFontSize = deviceWidth / 10; // 设备宽度 / 10
  const designPx = 150;
  const remValue = designPx / remBase;
  const actualPx = remValue * rootFontSize;

  const devices = [
    { name: 'iPhone SE', width: 375 },
    { name: 'iPhone 14', width: 390 },
    { name: 'iPhone 14 Pro Max', width: 430 },
    { name: 'Android 标准', width: 360 },
    { name: 'Android 大屏', width: 414 },
  ];

  return (
    <Card title="📐 rem 适配原理演示" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>设计稿宽度：</Text>
          <Tag color="blue">{designWidth}px</Tag>
          <Text strong style={{ marginLeft: 16 }}>
            1rem 基准：
          </Text>
          <Tag color="blue">{remBase}px</Tag>
        </div>

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
              {d.name} ({d.width}px)
            </Tag>
          ))}
        </div>

        <Alert
          message={
            <div>
              <div>
                <Text strong>根字体：</Text>
                <Text code>
                  html {'{'} font-size: {rootFontSize}px; {'}'}
                </Text>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>设计稿元素：</Text>
                <Text code>
                  {designPx}px = {remValue.toFixed(3)}rem
                </Text>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>实际渲染：</Text>
                <Text code>
                  {remValue.toFixed(3)}rem × {rootFontSize}px = {actualPx.toFixed(1)}px
                </Text>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>占屏幕比例：</Text>
                <Text code>{((actualPx / deviceWidth) * 100).toFixed(1)}%</Text>
                <Text type="secondary">
                  （设计意图：{((designPx / designWidth) * 100).toFixed(1)}%）
                </Text>
              </div>
            </div>
          }
          type="info"
        />

        <div style={{ marginTop: 16 }}>
          <Text strong>可视化：</Text>
          <div
            style={{
              width: `${deviceWidth * 0.8}px`,
              maxWidth: '100%',
              height: 60,
              border: '2px solid #1890ff',
              borderRadius: 4,
              marginTop: 8,
              background: '#f0f5ff',
            }}
          >
            <div
              style={{
                width: `${(actualPx / deviceWidth) * 100}%`,
                height: '100%',
                background: '#1890ff',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 12,
                fontWeight: 'bold',
              }}
            >
              {actualPx.toFixed(1)}px
            </div>
          </div>
        </div>
      </Space>
    </Card>
  );
};

/**
 * 方案一：rem 适配方案
 */
const RemSolution: React.FC = () => {
  return (
    <SolutionSection
      examples={RemAdaptationExamples}
      demo={<RemDemo />}
      borderColor="#1890ff"
      bgColor="#f0f5ff"
    />
  );
};

export default RemSolution;
