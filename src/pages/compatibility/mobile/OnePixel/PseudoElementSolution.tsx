import React, { useState } from 'react';
import { Card, Typography, Tag, Space, Radio, Alert } from 'antd';
import { PseudoElementScaleExamples } from './Examples';
import SolutionSection from './SolutionSection';

const { Text } = Typography;

/**
 * 互动演示：伪元素 + transform 缩放
 * 对比普通 1px 和修复后的 1px 边框效果
 */
const PseudoElementDemo = () => {
  const [dpr, setDpr] = useState(2);

  const dprOptions = [
    { value: 1, label: 'DPR = 1（标准屏）' },
    { value: 2, label: 'DPR = 2（Retina）' },
    { value: 3, label: 'DPR = 3（Super Retina）' },
  ];

  // 模拟缩放比例
  const scale = dpr === 1 ? 1 : 1 / dpr;
  const physicalPx = dpr;

  return (
    <Card title="📐 伪元素缩放方案演示" size="small">
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
                <Text strong>DPR：</Text>
                <Tag color="red">{dpr}</Tag>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>缩放比例：</Text>
                <Tag color="blue">scaleY({scale.toFixed(3)})</Tag>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>1px CSS 对应物理像素：</Text>
                <Tag color="purple">{physicalPx} 个</Tag>
                <Text type="secondary">（不缩放时）</Text>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>缩放后对应物理像素：</Text>
                <Tag color="green">1 个 ✅</Tag>
              </div>
            </div>
          }
          type="info"
        />

        <div style={{ marginTop: 16 }}>
          <Text strong>效果对比：</Text>
          <div style={{ marginTop: 8, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
            {/* 普通 1px */}
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">1. 普通 1px 边框（视觉上较粗）：</Text>
              <div
                style={{
                  marginTop: 8,
                  height: 40,
                  background: '#fff',
                  borderBottom: `${dpr}px solid #ddd`,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 12,
                }}
              >
                <Text>Standard 1px Border（渲染为 {dpr} 物理像素）</Text>
              </div>
            </div>

            {/* 修复后的 1px */}
            <div>
              <Text type="secondary">2. 修复后的 1px 边框（伪元素 + scale）：</Text>
              <div
                style={{
                  marginTop: 8,
                  height: 40,
                  background: '#fff',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 12,
                }}
              >
                <Text>Fixed 1px Border（渲染为 1 物理像素）</Text>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: dpr,
                    backgroundColor: '#ddd',
                    transform: `scaleY(${scale})`,
                    transformOrigin: '0 100%',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Space>
    </Card>
  );
};

/**
 * 方案一：伪元素 + transform 缩放
 */
const PseudoElementSolution: React.FC = () => {
  return (
    <SolutionSection
      examples={PseudoElementScaleExamples}
      demo={<PseudoElementDemo />}
      borderColor="#1890ff"
      bgColor="#f0f5ff"
    />
  );
};

export default PseudoElementSolution;
