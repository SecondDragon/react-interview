import React, { useState, useCallback } from 'react';
import { Card, Typography, Divider, Tag, Button, Space, Select, Badge, Table, Alert } from 'antd';
import { ExperimentOutlined, ClearOutlined } from '@ant-design/icons';
import CodeBlock from '@/components/CodeBlock';
import { ExtendedExamples } from './Examples';

const { Title, Paragraph, Text } = Typography;

/**
 * 可切换模式的互动演示
 */
const ExtendedDemo: React.FC = () => {
  const [mode, setMode] = useState<'retry' | 'fallback' | 'cache' | 'rateLimit' | 'all'>('retry');
  const [logs, setLogs] = useState<Array<{ time: string; msg: string; type: 'info' | 'success' | 'error' | 'warning' }>>([]);
  const [running, setRunning] = useState(false);
  const [finalResult, setFinalResult] = useState<string | null>(null);

  const addLog = useCallback((msg: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { time, msg, type }]);
  }, []);

  const runDemo = useCallback(async () => {
    setRunning(true);
    setLogs([]);
    setFinalResult(null);

    if (mode === 'retry') {
      addLog('📤 发起请求: GET /api/data', 'info');
      addLog('❌ 第 1 次尝试失败 (500 Internal Server Error)', 'error');
      await new Promise(r => setTimeout(r, 800));
      addLog('⏳ 等待 1s 后重试...', 'warning');
      await new Promise(r => setTimeout(r, 1000));
      addLog('🔄 第 2 次尝试...', 'info');
      addLog('❌ 第 2 次尝试失败 (503 Service Unavailable)', 'error');
      await new Promise(r => setTimeout(r, 1500));
      addLog('⏳ 等待 2s 后重试...', 'warning');
      await new Promise(r => setTimeout(r, 2000));
      addLog('🔄 第 3 次尝试...', 'info');
      addLog('✅ 第 3 次尝试成功！数据已返回', 'success');
      setFinalResult('retry-success');
    } else if (mode === 'fallback') {
      addLog('📤 请求主接口: https://api-primary.example.com/data', 'info');
      await new Promise(r => setTimeout(r, 1200));
      addLog('❌ 主接口超时 (ECONNABORTED)', 'error');
      addLog('🔄 拦截器切换 BaseURL → 备用接口', 'warning');
      addLog('📤 请求备用: https://api-fallback.example.com/data', 'info');
      await new Promise(r => setTimeout(r, 800));
      addLog('✅ 备用接口返回成功', 'success');
      setFinalResult('fallback-success');
    } else if (mode === 'cache') {
      addLog('📤 发起请求: GET /api/expensive-data', 'info');
      addLog('💾 请求成功，数据已缓存', 'success');
      await new Promise(r => setTimeout(r, 1500));
      addLog('📤 再次请求同一接口（网络已断开）', 'info');
      addLog('❌ 网络错误 (ERR_NETWORK)', 'error');
      addLog('📦 拦截器检测到缓存命中，返回缓存数据', 'warning');
      addLog('✅ 返回缓存数据（状态码 200 from cache）', 'success');
      setFinalResult('cache-success');
    } else if (mode === 'rateLimit') {
      addLog('📤 发起请求: GET /api/search', 'info');
      await new Promise(r => setTimeout(r, 500));
      addLog('❌ 收到 429 Too Many Requests', 'error');
      addLog('⏳ 读取 Retry-After 头: 3s', 'warning');
      addLog('⏳ 等待 3 秒...', 'info');
      await new Promise(r => setTimeout(r, 3000));
      addLog('🔄 等待结束，自动重试...', 'info');
      await new Promise(r => setTimeout(r, 600));
      addLog('✅ 重试成功！', 'success');
      setFinalResult('ratelimit-success');
    } else if (mode === 'all') {
      // Full flow: retry → fallback → cache
      addLog('📤 请求: GET /api/critical-data', 'info');
      await new Promise(r => setTimeout(r, 600));
      addLog('❌ 500 错误 → 进入重试...', 'error');
      await new Promise(r => setTimeout(r, 1000));
      addLog('❌ 重试后仍然 500 → 降级到备用接口...', 'error');
      await new Promise(r => setTimeout(r, 800));
      addLog('❌ 备用接口也挂了 → 尝试从缓存读取...', 'warning');
      addLog('📦 缓存命中！返回上次缓存的数据', 'warning');
      addLog('✅ 成功返回（来自缓存，数据可能稍旧）', 'success');
      setFinalResult('all-success');
    }

    setRunning(false);
  }, [mode, addLog]);

  const reset = () => { setLogs([]); setFinalResult(null); };

  return (
    <div>
      <Title level={4}>互动演示：切换模式观察不同修复策略</Title>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <Select
            value={mode}
            onChange={(v) => { setMode(v); reset(); }}
            style={{ width: 300 }}
            options={[
              { value: 'retry', label: '模式 1: 指数退避重试（5xx → 重试 3 次）' },
              { value: 'fallback', label: '模式 2: 接口降级（主接口挂 → 切备用）' },
              { value: 'cache', label: '模式 3: 缓存回源（断网 → 读缓存）' },
              { value: 'rateLimit', label: '模式 4: 限流等待（429 → Retry-After）' },
              { value: 'all', label: '🚀 全部组合（重试→降级→缓存）' },
            ]}
          />
          <Button type="primary" icon={<ExperimentOutlined />} onClick={runDemo} loading={running}>
            运行演示
          </Button>
          <Button icon={<ClearOutlined />} onClick={reset} disabled={running}>重置</Button>
        </Space>
      </Card>

      <Card size="small" title="执行日志" style={{ marginBottom: 16 }}>
        <div style={{
          background: '#1e1e1e', color: '#d4d4d4', padding: 12, borderRadius: 6,
          fontFamily: 'Consolas, Monaco, monospace', fontSize: 12, maxHeight: 350,
          overflowY: 'auto', lineHeight: 1.8,
        }}>
          {logs.length === 0 && <div style={{ color: '#888' }}>选择模式后点击"运行演示"...</div>}
          {logs.map((log, i) => (
            <div key={i}>
              <span style={{ color: '#888' }}>[{log.time}]</span>{' '}
              <span style={{
                color: log.type === 'error' ? '#f44747' : log.type === 'success' ? '#6a9955' : log.type === 'warning' ? '#dcdcaa' : '#9cdcfe'
              }}>
                {log.msg}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {finalResult && (
        <Alert
          type="success"
          showIcon
          message="上层调用方完全无感知！"
          description={`const res = await api.get('/data') → 正常收到响应。调用方不知道中间经历了 ${mode === 'retry' ? '3 次重试' : mode === 'fallback' ? '接口切换' : mode === 'cache' ? '缓存回源' : mode === 'rateLimit' ? '限流等待' : '重试→降级→缓存 的全流程'}。`}
        />
      )}
    </div>
  );
};

/**
 * 扩展模式页面
 */
const SilentRefreshExtended: React.FC = () => {
  return (
    <div>
      <Title level={2}>{ExtendedExamples.title}</Title>
      <Paragraph>
        Promise 链替换模式不仅用于 Token 刷新，还可以推广到多种网络异常场景。
        核心模式始终是：<Text code>拦截器捕获失败 → 执行修复逻辑 → return 新的 Promise</Text>。
      </Paragraph>

      {/* 总览表 */}
      <Card title="五种扩展模式一览" style={{ marginBottom: 24 }}>
        <Table
          dataSource={ExtendedExamples.patternTable}
          columns={[
            { title: '模式', dataIndex: 'pattern', key: 'pattern', width: 120 },
            { title: '触发条件', dataIndex: 'trigger', key: 'trigger', width: 150 },
            { title: '修复动作', dataIndex: 'action', key: 'action' },
            { title: '关键代码', dataIndex: 'code', key: 'code', render: (v: string) => <Text code>{v}</Text> },
          ]}
          pagination={false}
          size="small"
          bordered
        />
      </Card>

      {/* 互动演示 */}
      <Card title={<span>互动演示 <Tag color="blue">Live Simulation</Tag></span>} style={{ marginBottom: 24 }}>
        <ExtendedDemo />
      </Card>

      {/* 四种模式的代码 */}
      <Card title="模式 1：指数退避自动重试" style={{ marginBottom: 24 }}>
        <Paragraph>
          场景：网络抖动、服务临时不可用。通过<Text strong>指数退避</Text>（1s → 2s → 4s）避免重试风暴。
        </Paragraph>
        <CodeBlock code={ExtendedExamples.retry} title="5xx 自动重试（最多 3 次）" type="info" language="typescript" />
      </Card>

      <Card title="模式 2：接口降级 / 故障转移" style={{ marginBottom: 24 }}>
        <Paragraph>
          场景：主接口挂了。拦截器<Text strong>自动切换到备用接口</Text>，保证服务可用。
        </Paragraph>
        <CodeBlock code={ExtendedExamples.fallback} title="主接口超时 → 自动切备用" type="info" language="typescript" />
      </Card>

      <Card title="模式 3：缓存回源" style={{ marginBottom: 24 }}>
        <Paragraph>
          场景：网络断开或服务端完全不可达。从<Text strong>本地缓存</Text>返回上次的数据。
        </Paragraph>
        <CodeBlock code={ExtendedExamples.cache} title="网络断开 → 返回缓存数据" type="info" language="typescript" />
      </Card>

      <Card title="模式 4：限流等待（429）" style={{ marginBottom: 24 }}>
        <Paragraph>
          场景：调用频率过高。读取<Text code>Retry-After</Text>响应头，等待指定时间后自动重试。
        </Paragraph>
        <CodeBlock code={ExtendedExamples.rateLimit} title="429 限流 → 等待 Retry-After 后重试" type="info" language="typescript" />
      </Card>

      {/* 统一拦截器 */}
      <Card title="🚀 统一拦截器：组合所有模式" style={{ marginBottom: 24 }}>
        <Paragraph>
          在实际项目中，可以将所有模式组合进<Text strong>一个统一的响应拦截器</Text>，
          按优先级依次尝试：缓存 → 重试 → 降级 → 限流 → 最终失败。
        </Paragraph>
        <CodeBlock code={ExtendedExamples.unifiedInterceptor} title="统一拦截器：按优先级兜底" type="success" language="typescript" />
        <Alert
          type="warning"
          showIcon
          message="注意优先级"
          description="401 应该最先处理（认证失败时其他修复无意义）。429 限流其次（先服从限流再决定要不要重试）。缓存回源作为最后兜底。"
          style={{ marginTop: 16 }}
        />
      </Card>

      {/* 核心原理 */}
      <Card title="核心原理" style={{ background: '#f0f5ff' }}>
        <Paragraph>
          无论哪种扩展模式，本质都是同一个公式：
        </Paragraph>
        <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 6, fontSize: 14, textAlign: 'center' }}>
{`┌──────────┐     ┌──────────┐     ┌──────────┐
│ 捕获失败  │ ──→ │ 执行修复  │ ──→ │ return   │
│ (error)  │     │ 逻辑     │     │ 新Promise │
└──────────┘     └──────────┘     └──────────┘
                                        │
                                   上层无感知`}
        </pre>
      </Card>
    </div>
  );
};

export default SilentRefreshExtended;
