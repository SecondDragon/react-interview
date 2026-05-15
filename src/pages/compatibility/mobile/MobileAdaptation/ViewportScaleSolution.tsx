import React, { useState } from 'react';
import { Card, Typography, Tag, Space, Radio, Alert } from 'antd';
import { ViewportScaleExamples } from './Examples';
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
                <Tag color="blue">scale = 1/{dpr} = {scale.toFixed(3)}</Tag>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>Layout Viewport：</Text>
                <Tag color="green">{layoutViewport.toFixed(0)}px</Tag>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>不缩放时 1px CSS = </Text>
                <Tag color="purple">{dpr * dpr} 物理像素</Tag>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>缩放后 1px CSS = </Text>
                <Tag color="green">1 物理像素 ✅</Tag>
              </div>
            </div>
          }
          type="info"
        />

        <div style={{ marginTop: 16 }}>
          <Text strong>物理像素网格对比：</Text>
          <div style={{ marginTop: 8, display: 'flex', gap: 24 }}>
            {/* 不缩放 */}
            <div>
              <Text strong style={{ fontSize: 12 }}>不缩放（默认）</Text>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${dpr * 4}, 12px)`,
                  gridTemplateRows: `repeat(${dpr}, 12px)`,
                  gap: 1,
                  marginTop: 4,
                }}
              >
                {Array.from({ length: dpr * dpr * 4 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 12,
                      height: 12,
                      background: i < dpr * dpr ? '#ff4d4f' : '#f0f0f0',
                      border: '1px solid #d9d9d9',
                    }}
                  />
                ))}
              </div>
              <Text type="secondary" style={{ fontSize: 11 }}>
                1px = {dpr}×{dpr} 物理像素（红色）
              </Text>
            </div>

            {/* 缩放后 */}
            <div>
              <Text strong style={{ fontSize: 12 }}>缩放后（scale = 1/{dpr}）</Text>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 12px)',
                  gridTemplateRows: '12px',
                  gap: 1,
                  marginTop: 4,
                }}
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 12,
                      height: 12,
                      background: i === 0 ? '#52c41a' : '#f0f0f0',
                      border: '1px solid #d9d9d9',
                    }}
                  />
                ))}
              </div>
              <Text type="secondary" style={{ fontSize: 11 }}>
                1px = 1 物理像素（绿色）✅
              </Text>
            </div>
          </div>
        </div>
      </Space>
    </Card>
  );
};

/**
 * 方案三：viewport 缩放方案
 */
const ViewportScaleSolution: React.FC = () => {
  return (
    <SolutionSection
      examples={ViewportScaleExamples}
      demo={<ViewportScaleDemo />}
      borderColor="#fa8c16"
      bgColor="#fff7e6"
    />
  );
};

export default ViewportScaleSolution;
