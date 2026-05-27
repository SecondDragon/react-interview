import React, { useState, useCallback } from 'react';
import { Card, Typography, Alert, Divider, Tag, Button, Space, Badge, Table } from 'antd';
import { ThunderboltOutlined, SendOutlined } from '@ant-design/icons';
import CodeBlock from '@/components/CodeBlock';
import CodeDiff from '@/components/CodeDiff';
import { ProductionExamples } from './Examples';

const { Title, Paragraph, Text } = Typography;

/**
 * 模拟的生产级 Token 管理器
 */
class TokenManager {
  private isRefreshing = false;
  private subscribers: Array<(token: string | null) => void> = [];
  private refreshCount = 0;

  getRefreshCount() { return this.refreshCount; }

  async refresh(onLog: (msg: string, type: 'info' | 'success' | 'error' | 'warning') => void): Promise<string | null> {
    // 并发去重：如果正在刷新，加入等待队列
    if (this.isRefreshing) {
      onLog('⏳ 检测到正在刷新中，加入等待队列...', 'warning');
      return new Promise((resolve) => {
        this.subscribers.push((token) => resolve(token));
      });
    }

    this.isRefreshing = true;
    this.refreshCount++;
    onLog(`🔄 开始刷新 Token（第 ${this.refreshCount} 次刷新请求）`, 'info');

    try {
      // 模拟网络请求
      await new Promise(r => setTimeout(r, 1500));
      const newToken = `new-token-${Date.now()}`;
      onLog(`🔑 Token 刷新成功: ${newToken.substring(0, 16)}...`, 'success');

      // 通知所有等待者
      const count = this.subscribers.length;
      if (count > 0) {
        onLog(`📢 通知 ${count} 个等待中的请求：Token 已就绪`, 'info');
      }
      this.subscribers.forEach(cb => cb(newToken));
      this.subscribers = [];
      return newToken;
    } catch {
      onLog('❌ Token 刷新失败', 'error');
      this.subscribers.forEach(cb => cb(null));
      this.subscribers = [];
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }
}

/**
 * 并发请求 + 去重演示
 */
const ConcurrencyDemo: React.FC = () => {
  const [logs, setLogs] = useState<Array<{ time: string; msg: string; type: 'info' | 'success' | 'error' | 'warning'; endpoint?: string }>>([]);
  const [running, setRunning] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [endpointResults, setEndpointResults] = useState<Record<string, string>>({});

  const addLog = useCallback((msg: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', endpoint?: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { time, msg, type, endpoint }]);
  }, []);

  const runConcurrentDemo = useCallback(async () => {
    setRunning(true);
    setLogs([]);
    setEndpointResults({});
    setRefreshCount(0);

    const tm = new TokenManager();

    const mockRequest = async (endpoint: string) => {
      addLog(`📤 [${endpoint}] 发起请求`, 'info', endpoint);
      await new Promise(r => setTimeout(r, 300 + Math.random() * 500));

      // 模拟 401 触发刷新
      addLog(`❌ [${endpoint}] 收到 401, 触发 Token 刷新`, 'error', endpoint);
      const newToken = await tm.refresh(addLog);

      if (newToken) {
        addLog(`🔄 [${endpoint}] 用新 Token 重试`, 'warning', endpoint);
        await new Promise(r => setTimeout(r, 400));
        addLog(`✅ [${endpoint}] 请求成功`, 'success', endpoint);
        setEndpointResults(prev => ({ ...prev, [endpoint]: 'success' }));
      } else {
        addLog(`💥 [${endpoint}] 刷新失败，请求无法恢复`, 'error', endpoint);
        setEndpointResults(prev => ({ ...prev, [endpoint]: 'failed' }));
      }
    };

    // 同时发起 4 个请求
    await Promise.all([
      mockRequest('/api/users'),
      mockRequest('/api/orders'),
      mockRequest('/api/stats'),
      mockRequest('/api/config'),
    ]);

    setRefreshCount(tm.getRefreshCount());
    setRunning(false);
  }, [addLog]);

  const reset = () => { setLogs([]); setRefreshCount(0); setEndpointResults({}); };

  return (
    <div>
      <Title level={4}>并发请求 + 去重演示</Title>
      <Paragraph>
        同时发起 <Text strong>4 个请求</Text>，Token 均已过期。观察刷新锁（isRefreshing）如何保证只刷新 <Text strong>1 次</Text>，其余请求等待共享结果。
      </Paragraph>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" icon={<ThunderboltOutlined />} onClick={runConcurrentDemo} loading={running}>
            同时发送 4 个请求
          </Button>
          <Button onClick={reset} disabled={running}>重置</Button>
        </Space>
        <Divider type="vertical" />
        <Space>
          <Badge status="processing" text={`Token 刷新次数: ${refreshCount}`} />
          {Object.entries(endpointResults).map(([ep, status]) => (
            <Badge key={ep} status={status === 'success' ? 'success' : 'error'} text={`${ep}: ${status}`} />
          ))}
        </Space>
      </Card>

      {refreshCount > 0 && (
        <Alert
          type={refreshCount === 1 ? 'success' : 'warning'}
          showIcon
          message={refreshCount === 1
            ? `✅ 去重成功！4 个请求只触发了 ${refreshCount} 次 Token 刷新`
            : `⚠️ 未做去重时，4 个请求会触发 ${refreshCount} 次刷新`}
          style={{ marginBottom: 16 }}
        />
      )}

      <Card size="small" title="实时日志" style={{ marginBottom: 16 }}>
        <div style={{
          background: '#1e1e1e', color: '#d4d4d4', padding: 12, borderRadius: 6,
          fontFamily: 'Consolas, Monaco, monospace', fontSize: 12, maxHeight: 400,
          overflowY: 'auto', lineHeight: 1.8,
        }}>
          {logs.length === 0 && <div style={{ color: '#888' }}>等待执行...</div>}
          {logs.map((log, i) => (
            <div key={i}>
              <span style={{ color: '#888' }}>[{log.time}]</span>{' '}
              {log.endpoint && <span style={{ color: '#569cd6' }}>[{log.endpoint}]</span>}{' '}
              <span style={{
                color: log.type === 'error' ? '#f44747' : log.type === 'success' ? '#6a9955' : log.type === 'warning' ? '#dcdcaa' : '#9cdcfe'
              }}>
                {log.msg}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {refreshCount > 0 && (
        <Card size="small" title="网络请求统计" style={{ background: '#f6ffed' }}>
          <Table
            dataSource={[
            { key: '1', scenario: '无去重', requests: '1(auth) × 4 + 4(retry) = 8', refreshCalls: '4 次' },
            { key: '2', scenario: '有去重（本演示）', requests: '1(auth) + 4(retry) = 5', refreshCalls: '1 次' },
          ]}
            columns={[
            { title: '方案', dataIndex: 'scenario', key: 'scenario' },
            { title: '总请求数', dataIndex: 'requests', key: 'requests' },
            { title: '刷新次数', dataIndex: 'refreshCalls', key: 'refreshCalls' },
          ]}
            pagination={false}
            size="small"
            bordered
          />
        </Card>
      )}
    </div>
  );
};

/**
 * 生产级 Token 无感刷新页面
 */
const SilentRefreshProduction: React.FC = () => {
  const compareCols = [
    { title: '指标', dataIndex: 'metric', key: 'metric', width: 150 },
    { title: '朴素方式', dataIndex: 'naive', key: 'naive' },
    { title: '基础拦截器', dataIndex: 'basic', key: 'basic' },
    { title: '✅ 生产级方案', dataIndex: 'production', key: 'production', render: (v: string) => <Text strong style={{ color: '#52c41a' }}>{v}</Text> },
  ];

  return (
    <div>
      <Title level={2}>{ProductionExamples.title}</Title>
      <Paragraph>
        基础方案解决了"上层无感知"问题，但在<Text strong>并发场景</Text>下仍然存在缺陷。生产级方案需要三个关键设计。
      </Paragraph>

      {/* 一、并发去重 */}
      <Card title="一、并发去重：多个请求同时 401 只刷新一次" style={{ marginBottom: 24 }}>
        <Paragraph>
          场景：页面初始化时同时请求用户列表、订单列表、统计数据。如果 Token 已过期，3 个请求几乎同时收到 401。
        </Paragraph>

        <CodeDiff
          oldValue={ProductionExamples.concurrencyProblem}
          newValue={ProductionExamples.concurrencyFix}
          leftTitle="❌ 问题：3 次刷新"
          rightTitle="✅ 解决：1 次刷新 + 订阅通知"
          type="error"
          hideDiffMarkers={true}
        />

        <Alert
          type="info"
          showIcon
          message="核心机制：isRefreshing 锁 + subscribers 队列"
          description="第一个收到 401 的请求获得锁并开始刷新，后续请求检测到锁存在，直接返回一个 Promise 并加入等待队列。刷新完成后，所有等待者同时被通知并重试。"
          style={{ marginTop: 16 }}
        />
      </Card>

      {/* 二、并发演示 */}
      <Card title="二、互动演示：并发请求去重" style={{ marginBottom: 24 }}>
        <ConcurrencyDemo />
      </Card>

      {/* 三、主动预判 */}
      <Card title="三、主动预判：Token 快过期时提前刷新" style={{ marginBottom: 24 }}>
        <Paragraph>
          与其等 401 了再被动修复，不如<Text strong>在 Token 过期前主动刷新</Text>。这需要在请求拦截器中解析 JWT 的过期时间。
        </Paragraph>
        <CodeBlock code={ProductionExamples.preemptiveCode} title="请求拦截器：提前 5 分钟刷新" type="success" language="typescript" />
        <Alert
          type="success"
          showIcon
          message="优势：零延迟体验"
          description="提前刷新的请求可以与正常业务请求并行，用户完全不会遇到 401。仅在极端情况（如网络断开）下才回退到拦截器的被动修复。"
          style={{ marginTop: 16 }}
        />
      </Card>

      {/* 四、响应头自动续签 */}
      <Card title="四、响应头自动续签（零延迟方案）" style={{ marginBottom: 24 }}>
        <Paragraph>
          最优雅的方案：后端 Gateway/BFF 在<Text strong>任何正常请求的响应头</Text>中下发新 Token，
          前端完全不发起额外的刷新请求。
        </Paragraph>
        <CodeBlock code={ProductionExamples.autoRenewCode} title="响应拦截器：自动读取续签头" type="success" language="typescript" />
      </Card>

      {/* 五、三层架构 */}
      <Card title="五、三层防护架构总览" style={{ marginBottom: 24 }}>
        <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 6, fontSize: 13, lineHeight: 1.6 }}>
          {ProductionExamples.fullArchitecture}
        </pre>
        <Divider />
        <Table
          dataSource={[
            { key: '1', metric: 'Token 刷新次数', naive: 'N 次（N=并发数）', basic: 'N 次', production: '1 次或 0 次' },
            { key: '2', metric: '用户感知', naive: '报错，手动重试', basic: '无感知但浪费资源', production: '完全无感知' },
            { key: '3', metric: '网络浪费', naive: '刷新请求 N 次', basic: '刷新请求 N 次', production: '最多 1 次' },
          ]}
          columns={compareCols}
          pagination={false}
          size="small"
          bordered
        />
      </Card>

      {/* 六、核心原理 */}
      <Card title="六、核心原理总结" style={{ background: '#f0f5ff' }}>
        <ul>
          <li><Text strong>Promise 链替换</Text>：错误拦截器 return 新 Promise，上层无感知</li>
          <li><Text strong>并发去重</Text>：isRefreshing 锁 + subscribers 观察者队列，保证只刷新一次</li>
          <li><Text strong>主动预判</Text>：解析 JWT exp 字段，提前 5 分钟刷新，在 401 前就完成</li>
          <li><Text strong>响应头续签</Text>：后端在 x-access-token 头中下发新 Token，零额外请求</li>
        </ul>
      </Card>
    </div>
  );
};

export default SilentRefreshProduction;
