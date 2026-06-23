import React, { useState } from 'react';
import { Card, Typography, Tag, Space, Slider, Alert } from 'antd';
import { VwAdaptationExamples } from './Examples';
import SolutionSection from './SolutionSection';

const { Text } = Typography;

/**
 * 互动演示：vw 方案原理
 * 展示 vw 值在不同设备上的实际像素
 */
const VwDemo = () => {
  const [deviceWidth, setDeviceWidth] = useState(375);
  const designWidth = 750;
  const designPx = 150;
  const vwValue = (designPx / designWidth) * 100;
  const actualPx = (vwValue / 100) * deviceWidth;

  const devices = [
    { name: 'iPhone SE', width: 375 },
    { name: 'iPhone 14', width: 390 },
    { name: 'iPhone 14 Pro Max', width: 430 },
    { name: 'Android 标准', width: 360 },
    { name: 'Android 大屏', width: 414 },
  ];

  return (
    <Card title="📐 vw 适配原理演示" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>设计稿宽度：</Text>
          <Tag color="blue">{designWidth}px</Tag>
          <Text strong style={{ marginLeft: 16 }}>
            1vw ={' '}
          </Text>
          <Tag color="blue">{deviceWidth / 100}px</Tag>
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
                <Text strong>设计稿元素：</Text>
                <Text code>{designPx}px</Text>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>vw 转换：</Text>
                <Text code>
                  {designPx} / {designWidth} × 100 = {vwValue.toFixed(3)}vw
                </Text>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>实际渲染：</Text>
                <Text code>
                  {vwValue.toFixed(3)}vw × {deviceWidth}px / 100 = {actualPx.toFixed(1)}px
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
 * 方案二：vw 适配方案
 */
const VwSolution: React.FC = () => {
  return (
    <SolutionSection
      examples={VwAdaptationExamples}
      demo={<VwDemo />}
      borderColor="#52c41a"
      bgColor="#f6ffed"
    />
  );
};

export default VwSolution;
