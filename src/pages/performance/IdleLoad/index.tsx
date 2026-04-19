import React, { lazy, useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Tag, Spin, Row, Col, Tabs } from 'antd';
import SmartIdleLoad from '../../../components/SmartIdleLoad';
import CodeBlock from '../../../components/CodeBlock';
import { IdleLoadExamples } from './Examples';

const { Title, Paragraph, Text } = Typography;

// 懒加载重型 ECharts 组件
const ComplexChart = lazy(() => import('../../../samples/ComplexChart'));

const IdleLoadPage: React.FC = () => {
  const [isBlocking, setIsBlocking] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const timestamp = performance.now().toFixed(2);
    setLogs((prev) => [`[${timestamp}ms] ${msg}`, ...prev].slice(0, 5));
  };

  // 模拟主线程阻塞
  const handleBlockMainThread = () => {
    setIsBlocking(true);
    addLog('开始手动阻塞主线程 (3秒)...');

    setTimeout(() => {
      const start = performance.now();
      while (performance.now() - start < 3000) {
        /* empty */
      }
      addLog('主线程阻塞结束！');
      setIsBlocking(false);
    }, 10);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    handleBlockMainThread();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>性能优化专题：闲时加载 (Idle Load)</Title>

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="核心原理说明" bordered={false}>
            <Paragraph>
              在现代前端应用中，某些重型第三方库（如 ECharts, Monaco Editor
              等）的初始化和渲染会占用大量主线程时间。
              如果这些组件在页面初始化时就加载，可能会导致页面响应迟缓。
            </Paragraph>
            <Paragraph>
              <Text strong>闲时加载策略：</Text> 利用 <code>requestIdleCallback</code>{' '}
              API，在浏览器处于空闲帧（Idle Frame）时，再执行非紧急的渲染任务。
            </Paragraph>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="演示对比区" extra={<Tag color="blue">实时测试</Tag>}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Paragraph>点击按钮模拟 3 秒的计算密集型任务，观察下方图表是否会智能等待。</Paragraph>

              <Button type="primary" danger onClick={handleBlockMainThread} loading={isBlocking}>
                {isBlocking ? '主线程阻塞中 (UI 已冻结)...' : '点击模拟阻塞主线程 3 秒'}
              </Button>

              <div
                style={{
                  marginTop: '16px',
                  background: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '4px',
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>运行状态日志：</div>
                {logs.map((log, index) => (
                  <div
                    key={index}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      color: log.includes('结束') ? '#52c41a' : '#1677ff',
                    }}
                  >
                    {log}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px' }}>
                <SmartIdleLoad
                  fallback={
                    <div
                      style={{
                        height: '400px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#fafafa',
                        borderRadius: '8px',
                      }}
                    >
                      <Spin tip="等待主线程空闲中 (SmartIdleLoad)..." />
                    </div>
                  }
                  timeout={10000}
                >
                  <ComplexChart />
                </SmartIdleLoad>
              </div>
            </Space>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="代码示例展示">
            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: '1',
                  label: '优化后的写法 (SmartIdleLoad)',
                  children: <CodeBlock code={IdleLoadExamples.optimized} language="tsx" />,
                },
                {
                  key: '2',
                  label: '传统直接渲染方式',
                  children: <CodeBlock code={IdleLoadExamples.traditional} language="tsx" />,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default IdleLoadPage;
