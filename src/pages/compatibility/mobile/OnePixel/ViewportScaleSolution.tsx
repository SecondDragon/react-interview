import React, { useState } from 'react';
import { Card, Typography, Tag, Space, Radio, Alert } from 'antd';
import { ViewportScaleOnePixelExamples } from './Examples';
import SolutionSection from './SolutionSection';

const { Text } = Typography;

/**
 * 互动演示：viewport 缩放方案
 * 展示不同 DPR 下缩放的效果
 */
const ViewportScaleDemo = () => {
  const [dpr, setDpr] = useState(2);
  const deviceWidth = 375;
  const scale = 1 / dpr;
  const layoutViewport = deviceWidth / scale;

  const dprOptions = [
    { value: 1, label: 'DPR = 1' },
    { value: 2, label: 'DPR = 2' },
    { value: 3, label: 'DPR = 3' },
  ];

  return (
    <Card title="🔍 viewport 缩放原理演示" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Radio.Group value={dpr} onChange={(e) => setDpr(e.target.value)} buttonStyle="solid">
          {dprOptions.map((opt) => (
            <Radio.Button key={opt.value} value={opt.value}>
              {opt.label}
            </Radio.Button>
          ))}
        </Radio.Group>

        <Alert
          message={
            <div>
              <div>
                <Text strong>设备 DIP：</Text>
                <Tag>{deviceWidth}px</Tag>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>DPR：</Text>
                <Tag color="red">{dpr}</Tag>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>缩放比例：</Text>
                <Tag color="blue">
                  scale = 1/{dpr} = {scale.toFixed(3)}
                </Tag>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>Layout Viewport：</Text>
                <Tag color="green">{layoutViewport.toFixed(0)}px</Tag>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>1px CSS = </Text>
                <Tag color="green">1 物理像素 ✅</Tag>
              </div>
            </div>
          }
          type="info"
        />

        <div style={{ marginTop: 16 }}>
          <Text strong>效果模拟：</Text>
          <div style={{ marginTop: 8, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
            <div
              style={{
                padding: 12,
                background: '#fff',
                border: '1px solid #ddd',
                transform: `scale(${scale})`,
                transformOrigin: '0 0',
                width: `${100 / scale}%`,
              }}
            >
              <Text>此元素模拟 viewport 缩放后的效果</Text>
              <br />
              <Text type="secondary">scale = {scale.toFixed(3)}，1px 边框精确对应 1 物理像素</Text>
            </div>
          </div>
        </div>
      </Space>
    </Card>
  );
};

/**
 * 方案二：viewport 缩放方案
 */
const ViewportScaleSolution: React.FC = () => {
  return (
    <SolutionSection
      examples={ViewportScaleOnePixelExamples}
      demo={<ViewportScaleDemo />}
      borderColor="#fa8c16"
      bgColor="#fff7e6"
    />
  );
};

export default ViewportScaleSolution;
