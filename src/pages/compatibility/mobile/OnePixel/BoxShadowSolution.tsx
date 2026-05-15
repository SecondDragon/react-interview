import React, { useState } from 'react';
import { Card, Typography, Tag, Space, Slider, Alert } from 'antd';
import { BoxShadowExamples } from './Examples';
import SolutionSection from './SolutionSection';

const { Text } = Typography;

/**
 * 互动演示：box-shadow 模拟细线边框
 */
const BoxShadowDemo = () => {
  const [shadowWidth, setShadowWidth] = useState(0.5);
  const [hasRadius, setHasRadius] = useState(false);

  return (
    <Card title="🎨 box-shadow 模拟细线边框演示" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>阴影宽度：</Text>
          <Slider
            min={0.3}
            max={2}
            step={0.1}
            value={shadowWidth}
            onChange={setShadowWidth}
            marks={{ 0.3: '0.3', 0.5: '0.5', 1: '1', 2: '2' }}
          />
        </div>

        <div>
          <Text strong>圆角：</Text>
          <Tag
            color={hasRadius ? 'green' : 'default'}
            style={{ cursor: 'pointer' }}
            onClick={() => setHasRadius(!hasRadius)}
          >
            {hasRadius ? '✅ 开启圆角' : '❌ 关闭圆角'}
          </Tag>
        </div>

        <Alert
          message={
            <div>
              <div>
                <Text strong>CSS：</Text>
                <Text code>
                  box-shadow: 0 0 0 {shadowWidth}px #ddd inset;
                </Text>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>渲染效果：</Text>
                <Text>
                  {shadowWidth < 0.5
                    ? '亚像素渲染，可能较淡'
                    : shadowWidth === 0.5
                    ? 'DPR=2 设备上约 1 物理像素 ✅'
                    : '较粗的边框效果'}
                </Text>
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
                borderRadius: hasRadius ? 12 : 0,
                boxShadow: `0 0 0 ${shadowWidth}px #ddd inset`,
                textAlign: 'center',
              }}
            >
              <Text strong>box-shadow 模拟边框</Text>
              <br />
              <Text type="secondary">
                shadow-width: {shadowWidth}px | 圆角: {hasRadius ? '12px' : '无'}
              </Text>
            </div>
          </div>
        </div>
      </Space>
    </Card>
  );
};

/**
 * 方案三：box-shadow 模拟方案
 */
const BoxShadowSolution: React.FC = () => {
  return (
    <SolutionSection
      examples={BoxShadowExamples}
      demo={<BoxShadowDemo />}
      borderColor="#52c41a"
      bgColor="#f6ffed"
    />
  );
};

export default BoxShadowSolution;
