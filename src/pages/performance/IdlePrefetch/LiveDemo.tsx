import React, { useState, useCallback } from 'react';
import { Card, Button, Tag, Alert, Space, Typography, Switch, Divider, Row, Col, Progress } from 'antd';
import {
  ThunderboltOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';

const { Text, Paragraph, Title } = Typography;

interface PageItem {
  key: string;
  label: string;
  prefetched: boolean;
  simulatedDelay: number;
}

const pages: PageItem[] = [
  { key: 'report', label: '📊 报表图表', prefetched: true, simulatedDelay: 0 },
  { key: 'data', label: '📋 数据表格', prefetched: true, simulatedDelay: 0 },
  { key: 'settings', label: '⚙️ 系统设置', prefetched: false, simulatedDelay: 1500 },
  { key: 'logs', label: '📝 操作日志', prefetched: false, simulatedDelay: 2000 },
];

const LiveDemo: React.FC = () => {
  const [idleTriggered, setIdleTriggered] = useState(false);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [loadedKeys, setLoadedKeys] = useState<Set<string>>(new Set());

  const triggerIdle = useCallback(() => {
    setIdleTriggered(true);
    const prefetched = pages.filter((p) => p.prefetched);
    prefetched.forEach((p) => {
      setTimeout(() => {
        setLoadedKeys((prev) => new Set(prev).add(p.key));
      }, 500);
    });
  }, []);

  const handleClick = useCallback(
    (page: PageItem) => {
      if (loadedKeys.has(page.key)) {
        return;
      }
      setLoadingKey(page.key);
      setTimeout(() => {
        setLoadedKeys((prev) => new Set(prev).add(page.key));
        setLoadingKey(null);
      }, page.simulatedDelay);
    },
    [loadedKeys]
  );

  return (
    <Card style={{ maxWidth: 700, margin: '0 auto' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div style={{ textAlign: 'center' }}>
          <Title level={5} style={{ margin: 0 }}>
            模拟导航加载体验
          </Title>
          <Paragraph type="secondary" style={{ marginTop: 4 }}>
            下方 4 个页面中，前 2 个标记了闲时预取。点击"模拟闲时"提前下载后，再对比加载速度
          </Paragraph>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        <div style={{ textAlign: 'center' }}>
          <Space>
            <Button
              type="primary"
              icon={idleTriggered ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
              onClick={triggerIdle}
              disabled={idleTriggered}
              size="large"
            >
              {idleTriggered ? '已预取' : '🕐 模拟闲时 — 预取标记页面'}
            </Button>
          </Space>
        </div>

        {idleTriggered && (
          <Alert
            message="闲时预取完成"
            description="标记了 idlePrefetch 的页面（报表图表、数据表格）已在后台完成下载。现在点击它们会秒开；未标记的页面则需要等待网络加载。"
            type="success"
            showIcon
          />
        )}

        <Row gutter={[12, 12]}>
          {pages.map((page) => {
            const isLoading = loadingKey === page.key;
            const isLoaded = loadedKeys.has(page.key);

            return (
              <Col span={12} key={page.key}>
                <Card
                  size="small"
                  hoverable
                  onClick={() => handleClick(page)}
                  style={{
                    cursor: 'pointer',
                    borderColor: isLoaded
                      ? '#52c41a'
                      : page.prefetched && idleTriggered
                        ? '#1890ff'
                        : undefined,
                    opacity: isLoading ? 0.6 : 1,
                    transition: 'all 0.3s',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{page.label}</div>
                  <div>
                    {isLoading ? (
                      <Tag icon={<LoadingOutlined />} color="processing">
                        加载中...
                      </Tag>
                    ) : isLoaded ? (
                      <Tag icon={<CheckCircleOutlined />} color="success">
                        已加载
                      </Tag>
                    ) : page.prefetched ? (
                      <Tag icon={<ThunderboltOutlined />} color="blue">
                        已标记预取
                      </Tag>
                    ) : (
                      <Tag icon={<ClockCircleOutlined />} color="default">
                        未预取
                      </Tag>
                    )}
                  </div>

                  {page.prefetched && (
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        声明: idlePrefetch: true
                      </Text>
                    </div>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>

        <Divider style={{ margin: '8px 0' }} />

        <div>
          <Title level={5}>体验说明</Title>
          <Space direction="vertical">
            <Text>
              1. 点击 <Text strong>"模拟闲时"</Text> 按钮，模拟浏览器空闲时触发的预取
            </Text>
            <Text>
              2. 点击前 2 个卡片（已预取）→ <Text strong style={{ color: '#52c41a' }}>秒开</Text>
            </Text>
            <Text>
              3. 点击后 2 个卡片（未预取）→ 有 <Text code>1.5~2s</Text> 的模拟加载延迟
            </Text>
          </Space>
        </div>
      </Space>
    </Card>
  );
};

export default LiveDemo;
