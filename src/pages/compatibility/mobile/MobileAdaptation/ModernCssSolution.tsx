import React, { useState } from 'react';
import { Card, Typography, Tag, Space, Slider, Alert } from 'antd';
import { ModernCssExamples } from './Examples';
import SolutionSection from './SolutionSection';

const { Text } = Typography;

/**
 * 互动演示：现代 CSS clamp 方案
 */
const ClampDemo = () => {
  const [viewportWidth, setViewportWidth] = useState(375);
  const minSize = 14;
  const preferredVw = 4.267;
  const maxSize = 20;
  const calculatedSize = Math.min(maxSize, Math.max(minSize, (viewportWidth * preferredVw) / 100));

  return (
    <Card title="🎨 clamp() 字体适配演示" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>模拟视口宽度：</Text>
          <Slider
            min={280}
            max={500}
            value={viewportWidth}
            onChange={setViewportWidth}
            marks={{ 280: '280', 320: '320', 375: '375', 430: '430', 500: '500' }}
          />
        </div>

        <Alert
          message={
            <div>
              <div>
                <Text strong>CSS：</Text>
                <Text code>font-size: clamp(14px, 4.267vw, 20px);</Text>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>计算：</Text>
                <div>
                  preferred = {viewportWidth} × 4.267% ={' '}
                  {((viewportWidth * preferredVw) / 100).toFixed(2)}px
                </div>
                <div>
                  result = clamp(14, {((viewportWidth * preferredVw) / 100).toFixed(2)}, 20) ={' '}
                  <Tag color="green" style={{ fontSize: 16 }}>
                    {calculatedSize.toFixed(2)}px
                  </Tag>
                </div>
              </div>
            </div>
          }
          type="info"
        />

        <div
          style={{
            padding: 24,
            background: '#f6ffed',
            borderRadius: 8,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: `${calculatedSize}px`,
              fontWeight: 'bold',
              color: '#52c41a',
              transition: 'font-size 0.2s',
            }}
          >
            这是一段自适应文字
          </div>
          <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
            当前字体大小：{calculatedSize.toFixed(2)}px
          </Text>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Tag color={viewportWidth <= 328 ? 'red' : 'default'}>≤328px: 14px（最小值）</Tag>
          <Tag color={viewportWidth > 328 && viewportWidth < 469 ? 'green' : 'default'}>
            328~469px: 按比例
          </Tag>
          <Tag color={viewportWidth >= 469 ? 'red' : 'default'}>≥469px: 20px（最大值）</Tag>
        </div>
      </Space>
    </Card>
  );
};

/**
 * 方案四：现代 CSS 方案
 */
const ModernCssSolution: React.FC = () => {
  return (
    <SolutionSection
      examples={ModernCssExamples}
      demo={<ClampDemo />}
      borderColor="#722ed1"
      bgColor="#f9f0ff"
    />
  );
};

export default ModernCssSolution;
