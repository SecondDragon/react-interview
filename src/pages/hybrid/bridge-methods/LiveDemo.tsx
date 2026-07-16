import React, { useState, useCallback } from 'react';
import {
  Card,
  Button,
  Typography,
  Tag,
  Space,
  Divider,
  message,
  Select,
  Descriptions,
  List,
  Alert,
} from 'antd';
import {
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { liveDemoMethods } from './data';

const { Text, Title, Paragraph } = Typography;

const BridgeMethodsLiveDemo: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<string>('urlScheme');
  const [latency, setLatency] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<{ success: boolean; msg: string } | null>(null);

  const currentMethod = liveDemoMethods.find((m) => m.key === selectedMethod)!;

  const simulateCall = useCallback(async () => {
    setIsSimulating(true);
    setSimResult(null);

    const baseDelay = {
      urlScheme: 200 + Math.random() * 300,
      jsi: 10 + Math.random() * 50,
      postMessage: 50 + Math.random() * 100,
      websocket: 30 + Math.random() * 80,
    }[selectedMethod]!;

    const dataSize = {
      urlScheme: '~200 字节（URL 编码限制）',
      jsi: '~2 KB（JSON 序列化）',
      postMessage: '~2 KB（JSON 序列化）',
      websocket: '~10 KB（支持二进制帧）',
    }[selectedMethod]!;

    await new Promise((r) => setTimeout(r, baseDelay));

    setLatency(Math.round(baseDelay));
    setSimResult({
      success: true,
      msg: `调用成功！延迟 ${Math.round(baseDelay)}ms，数据传输量 ${dataSize}`,
    });
    setIsSimulating(false);
  }, [selectedMethod]);

  const reset = useCallback(() => {
    setLatency(null);
    setSimResult(null);
  }, []);

  return (
    <div>
      <Alert
        message="四种桥接方式对比模拟器"
        description="选择不同的桥接方式，模拟从 Web 端发起调用到原生端执行并返回的完整过程。观察各方案的延迟差异和数据传输能力。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Space direction="vertical" style={{ width: '100%' }}>
        <Card size="small" title="选择桥接方式" style={{ background: '#fafafa' }}>
          <Space wrap>
            {liveDemoMethods.map((m) => (
              <Button
                key={m.key}
                type={selectedMethod === m.key ? 'primary' : 'default'}
                style={
                  selectedMethod === m.key
                    ? { borderColor: m.color, backgroundColor: m.color, borderWidth: 2 }
                    : { borderColor: m.color, color: m.color }
                }
                onClick={() => {
                  setSelectedMethod(m.key);
                  reset();
                }}
              >
                {m.label}
              </Button>
            ))}
          </Space>
        </Card>

        <Card
          size="small"
          title={
            <Space>
              <ApiOutlined />
              <Text strong>{currentMethod.label}</Text>
              <Tag color={selectedMethod === 'urlScheme' ? 'orange' : selectedMethod === 'jsi' ? 'blue' : selectedMethod === 'postMessage' ? 'green' : 'purple'}>
                已选择
              </Tag>
            </Space>
          }
        >
          <Descriptions column={1} size="small">
            <Descriptions.Item label="说明">{currentMethod.description}</Descriptions.Item>
          </Descriptions>

          <Divider plain>优缺点</Divider>

          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <Text type="success" strong>
                <CheckCircleOutlined /> 优点
              </Text>
              <List
                size="small"
                dataSource={currentMethod.pros}
                renderItem={(item) => (
                  <List.Item style={{ padding: '4px 0' }}>
                    <Text type="success">✓ </Text>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Text type="danger" strong>
                <CloseCircleOutlined /> 缺点
              </Text>
              <List
                size="small"
                dataSource={currentMethod.cons}
                renderItem={(item) => (
                  <List.Item style={{ padding: '4px 0' }}>
                    <Text type="danger">✗ </Text>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="primary"
            onClick={simulateCall}
            loading={isSimulating}
            icon={<SyncOutlined />}
            size="large"
          >
            模拟调用（Web → Native）
          </Button>
          <Button onClick={reset} disabled={isSimulating}>
            重置
          </Button>
        </div>

        {simResult && (
          <Card
            size="small"
            title={
              <Space>
                <Tag color={simResult.success ? 'green' : 'red'}>
                  {simResult.success ? '调用成功' : '调用失败'}
                </Tag>
                <Text>{simResult.msg}</Text>
              </Space>
            }
            style={{
              border: `2px solid ${simResult.success ? '#52c41a' : '#ff4d4f'}`,
            }}
          >
            <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1890ff' }}>{latency}ms</div>
                <Text type="secondary">通信延迟</Text>
              </div>
              <Divider type="vertical" style={{ height: 60 }} />
              <div>
                <Text strong>调用路径：</Text>
                <Text code style={{ display: 'block', marginTop: 4 }}>
                  Web SDK → {currentMethod.label} → Native API → {currentMethod.label} → Web SDK
                </Text>
              </div>
            </div>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default BridgeMethodsLiveDemo;
