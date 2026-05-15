import React, { useState } from 'react';
import { Card, Typography, Tag, Space, Radio, Alert } from 'antd';
import { PostcssPluginExamples } from './Examples';
import SolutionSection from './SolutionSection';

const { Text } = Typography;

/**
 * 互动演示：PostCSS 插件工程化
 * 模拟构建前后的代码对比
 */
const PostcssPluginDemo = () => {
  const [strategy, setStrategy] = useState<'pseudo' | 'shadow' | 'svg'>('pseudo');

  const strategies = [
    { value: 'pseudo', label: '伪元素方案', color: 'blue' },
    { value: 'shadow', label: 'box-shadow 方案', color: 'green' },
    { value: 'svg', label: 'SVG 方案', color: 'purple' },
  ];

  // 模拟构建后的代码
  const getCompiledCode = (s: string) => {
    if (s === 'pseudo') {
      return `/* 构建后：伪元素方案 */
.card {
  position: relative;
  border-bottom: none;
}
.card::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 1px;
  background-color: #ddd;
  transform: scaleY(0.5);
  transform-origin: 0 100%;
}`;
    }
    if (s === 'shadow') {
      return `/* 构建后：box-shadow 方案 */
.card {
  border: none;
  box-shadow: 0 0 0 0.5px #ddd inset;
}`;
    }
    return `/* 构建后：SVG 方案 */
.card {
  border: none;
  background-image: url("data:image/svg+xml,...");
  background-size: 100% 100%;
}`;
  };

  const currentStrategy = strategies.find((s) => s.value === strategy)!;

  return (
    <Card title="🛠️ PostCSS 插件工程化演示" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>选择转换策略：</Text>
          <Radio.Group
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            buttonStyle="solid"
            style={{ marginLeft: 8 }}
          >
            {strategies.map((opt) => (
              <Radio.Button key={opt.value} value={opt.value}>
                {opt.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>

        <Alert
          message={
            <div>
              <div>
                <Text strong>当前策略：</Text>
                <Tag color={currentStrategy.color}>{currentStrategy.label}</Tag>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>开发者写的代码：</Text>
                <div>
                  <Text code>.card {'{'} border: 1px solid #ddd; {'}'}</Text>
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>PostCSS 自动转换为：</Text>
                <pre style={{ margin: 0, fontSize: 12, background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                  {getCompiledCode(strategy)}
                </pre>
              </div>
            </div>
          }
          type="info"
        />

        <div style={{ marginTop: 16 }}>
          <Text strong>效果预览：</Text>
          <div style={{ marginTop: 8, padding: 24, background: '#f5f5f5', borderRadius: 8 }}>
            {strategy === 'pseudo' && (
              <div
                style={{
                  padding: 16,
                  background: '#fff',
                  position: 'relative',
                  textAlign: 'center',
                }}
              >
                <Text>伪元素方案效果</Text>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 1,
                    backgroundColor: '#ddd',
                    transform: 'scaleY(0.5)',
                    transformOrigin: '0 100%',
                  }}
                />
              </div>
            )}
            {strategy === 'shadow' && (
              <div
                style={{
                  padding: 16,
                  background: '#fff',
                  boxShadow: '0 0 0 0.5px #ddd inset',
                  textAlign: 'center',
                }}
              >
                <Text>box-shadow 方案效果</Text>
              </div>
            )}
            {strategy === 'svg' && (
              <div
                style={{
                  padding: 16,
                  background: '#fff',
                  backgroundImage:
                    'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'none\' stroke=\'%23ddd\' stroke-width=\'1\' vector-effect=\'non-scaling-stroke\'/%3E%3C/svg%3E")',
                  backgroundSize: '100% 100%',
                  textAlign: 'center',
                }}
              >
                <Text>SVG 方案效果</Text>
              </div>
            )}
          </div>
        </div>
      </Space>
    </Card>
  );
};

/**
 * 方案五：PostCSS 插件工程化
 */
const PostcssPluginSolution: React.FC = () => {
  return (
    <SolutionSection
      examples={PostcssPluginExamples}
      demo={<PostcssPluginDemo />}
      borderColor="#eb2f96"
      bgColor="#fff0f6"
    />
  );
};

export default PostcssPluginSolution;
