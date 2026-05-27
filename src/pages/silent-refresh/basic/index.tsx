import React, { useState, useRef, useCallback } from 'react';
import { Card, Typography, Alert, Divider, Tag, Button, Space, Steps, Badge, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, SendOutlined } from '@ant-design/icons';
import CodeBlock from '@/components/CodeBlock';
import CodeDiff from '@/components/CodeDiff';
import { BasicExamples } from './Examples';

const { Title, Paragraph, Text } = Typography;

/**
 * 模拟的 Token 存储
 */
let mockToken = 'old-expired-token-abc123';

/**
 * 模拟后端：首次返回 401，刷新后返回正常
 */
function mockApi(endpoint: string, token: string): Promise<{ status: number; data: any }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (token === 'old-expired-token-abc123') {
        resolve({ status: 401, data: { code: 'UNAUTHORIZED', message: 'Token 已过期' } });
      } else {
        resolve({ status: 200, data: { users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] } });
      }
    }, 800);
  });
}

function mockRefreshToken(): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockToken = 'new-valid-token-xyz789';
      resolve(mockToken);
    }, 1000);
  });
}

/**
 * 步骤状态类型
 */
type StepStatus = 'wait' | 'process' | 'finish' | 'error';

/**
 * 互动演示：Promise 链替换可视化
 */
const PromiseChainDemo: React.FC = () => {
  const [logs, setLogs] = useState<Array<{ time: string; msg: string; type: 'info' | 'success' | 'error' | 'warning' }>>([]);
  const [step, setStep] = useState<StepStatus[]>([{ idx: 0, status: 'wait' }, { idx: 1, status: 'wait' }, { idx: 2, status: 'wait' }, { idx: 3, status: 'wait' }].map(s => s.status));
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; data?: any } | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((msg: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { time, msg, type }]);
    // 自动滚动
    setTimeout(() => {
      if (logRef.current) {
        logRef.current.scrollTop = logRef.current.scrollHeight;
      }
    }, 50);
  }, []);

  const runDemo = useCallback(async () => {
    setRunning(true);
    setLogs([]);
    setResult(null);
    setStep(['wait', 'wait', 'wait', 'wait']);
    mockToken = 'old-expired-token-abc123';

    addLog('📤 发起请求: GET /api/users', 'info');
    setStep(['process', 'wait', 'wait', 'wait']);

    // Step 1: 发起请求
    const res1 = await mockApi('/api/users', mockToken);
    if (res1.status === 401) {
      addLog('❌ 收到 401 Unauthorized —— Token 已过期', 'error');
      setStep(['error', 'process', 'wait', 'wait']);

      // Step 2: 拦截器捕获 → 刷新 Token
      addLog('🔧 拦截器捕获 401，开始刷新 Token...', 'warning');
      const newToken = await mockRefreshToken();
      addLog(`🔑 Token 刷新成功: ${newToken.substring(0, 12)}...`, 'success');
      setStep(['error', 'finish', 'process', 'wait']);

      // Step 3: 用新 Token 重试
      addLog('🔄 用新 Token 重试原请求...', 'info');
      const res2 = await mockApi('/api/users', newToken);
      if (res2.status === 200) {
        addLog('✅ 请求成功！返回用户数据', 'success');
        setStep(['error', 'finish', 'finish', 'finish']);
        setResult({ success: true, data: res2.data });
      }
    } else {
      addLog('✅ 请求成功（Token 未过期）', 'success');
    }

    setRunning(false);
  }, [addLog]);

  const resetDemo = () => {
    setLogs([]);
    setResult(null);
    setStep(['wait', 'wait', 'wait', 'wait']);
    mockToken = 'old-expired-token-abc123';
  };

  const steps = [
    { title: '发起请求', description: '携带过期 Token', icon: step[0] === 'error' ? <CloseCircleOutlined /> : step[0] === 'finish' ? <CheckCircleOutlined /> : step[0] === 'process' ? <SyncOutlined spin /> : null },
    { title: '拦截 401', description: '拦截器捕获并修复', icon: step[1] === 'finish' ? <CheckCircleOutlined /> : step[1] === 'process' ? <SyncOutlined spin /> : null },
    { title: '刷新 Token', description: '获取新 Token 重试', icon: step[2] === 'finish' ? <CheckCircleOutlined /> : step[2] === 'process' ? <SyncOutlined spin /> : null },
    { title: '返回结果', description: '上层无感知', icon: step[3] === 'finish' ? <CheckCircleOutlined /> : null },
  ];

  return (
    <div>
      <Title level={4}>互动演示：模拟 Promise 链替换全过程</Title>
      <Paragraph>
        点击下方按钮，模拟一次 Token 已过期的请求。观察拦截器如何静默修复并返回正常结果。
      </Paragraph>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" icon={<SendOutlined />} onClick={runDemo} loading={running}>
            发送请求（Token 已过期）
          </Button>
          <Button onClick={resetDemo} disabled={running}>重置</Button>
        </Space>
      </Card>

      {/* 步骤可视化 */}
      <Card size="small" title="执行流程" style={{ marginBottom: 16 }}>
        <Steps
          current={-1}
          size="small"
          items={steps.map((s, i) => ({
            title: s.title,
            description: s.description,
            status: step[i] === 'error' ? 'error' : step[i] === 'finish' ? 'finish' : step[i] === 'process' ? 'process' : 'wait',
            icon: s.icon || undefined,
          }))}
        />
      </Card>

      {/* 日志 */}
      <Card
        size="small"
        title="实时日志"
        style={{ marginBottom: 16 }}
        extra={result && (
          <Badge status={result.success ? 'success' : 'error'} text={result.success ? '最终结果：成功' : '最终结果：失败'} />
        )}
      >
        <div
          ref={logRef}
          style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: '12px 16px',
            borderRadius: 6,
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: 13,
            maxHeight: 300,
            overflowY: 'auto',
            lineHeight: 1.8,
          }}
        >
          {logs.length === 0 && <div style={{ color: '#888' }}>等待执行...</div>}
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

      {result && result.success && (
        <Alert
          type="success"
          showIcon
          message="上层调用方完全无感知！"
          description={
            <div>
              <Paragraph style={{ marginBottom: 8 }}>
                虽然请求经历了 <Text code>401 → 刷新 Token → 重试</Text>，但调用方 <Text code>await api.get('/users')</Text> 只看到了最终的 200 成功响应。
              </Paragraph>
              <Text strong>返回的数据：</Text>
              <CodeBlock code={JSON.stringify(result.data, null, 2)} language="json" type="success" title="正常响应结果" />
            </div>
          }
        />
      )}
    </div>
  );
};

/**
 * Promise 链替换基础篇页面
 */
const SilentRefreshBasic: React.FC = () => {
  return (
    <div>
      <Title level={2}>{BasicExamples.title}</Title>

      {/* 一、问题场景 */}
      <Card title="一、问题场景" style={{ marginBottom: 24 }}>
        <Paragraph>
          前端使用 JWT 认证，AccessToken 有效期通常为 30 分钟。当 Token 过期后，用户点击按钮发起请求时后端返回 <Text code>401 Unauthorized</Text>。
        </Paragraph>
        <Paragraph>
          <Text strong>如果在每个接口调用处都手动处理 401，会出现：</Text>
        </Paragraph>
        <ul>
          <li><Text type="danger">代码重复</Text>：N 个接口写 N 遍 401 处理逻辑</li>
          <li><Text type="danger">并发刷新</Text>：多个请求同时 401 时，会发起多次 Token 刷新</li>
          <li><Text type="danger">体验差</Text>：请求失败 → 用户感知 → 手动重试</li>
        </ul>
        <CodeBlock code={BasicExamples.problem} title="❌ 每个调用方自己处理 401" type="error" />
      </Card>

      {/* 二、核心思想 */}
      <Card title="二、核心思想：Promise 链替换" style={{ marginBottom: 24 }}>
        <Paragraph>
          Axios 响应拦截器的<Text strong>错误处理函数</Text>如果 <Text strong>return 一个新的 Promise</Text>，
          这个新 Promise 会<Text mark>替换掉原来的失败 Promise</Text>，成为整个调用链的新"后端"。
        </Paragraph>

        <Alert
          type="info"
          showIcon
          message="形象比喻：快递中转站"
          description="快递因地址错误被退回（401），中转站自动修正地址重新投递。你最终只收到'签收成功'，根本不知道中间被退回过。"
          style={{ marginBottom: 16 }}
        />

        <Title level={5}>Axios 拦截器关键规则</Title>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              <th style={{ border: '1px solid #f0f0f0', padding: '8px 12px', textAlign: 'left' }}>拦截器类型</th>
              <th style={{ border: '1px solid #f0f0f0', padding: '8px 12px', textAlign: 'left' }}>返回值</th>
              <th style={{ border: '1px solid #f0f0f0', padding: '8px 12px', textAlign: 'left' }}>效果</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #f0f0f0', padding: '8px 12px' }}>成功拦截器</td>
              <td style={{ border: '1px solid #f0f0f0', padding: '8px 12px' }}><Text code>return response</Text></td>
              <td style={{ border: '1px solid #f0f0f0', padding: '8px 12px' }}>继续传递 response</td>
            </tr>
            <tr style={{ background: '#fff7e6' }}>
              <td style={{ border: '1px solid #f0f0f0', padding: '8px 12px' }}><Text strong>错误拦截器</Text></td>
              <td style={{ border: '1px solid #f0f0f0', padding: '8px 12px' }}><Text strong code>return newPromise</Text></td>
              <td style={{ border: '1px solid #f0f0f0', padding: '8px 12px' }}><Text strong type="warning">替换整个 Promise 链！</Text></td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #f0f0f0', padding: '8px 12px' }}>错误拦截器</td>
              <td style={{ border: '1px solid #f0f0f0', padding: '8px 12px' }}><Text code>return Promise.reject(err)</Text></td>
              <td style={{ border: '1px solid #f0f0f0', padding: '8px 12px' }}>继续传递错误</td>
            </tr>
          </tbody>
        </table>
      </Card>

      {/* 三、代码对比 */}
      <Card title="三、代码对比：朴素方式 vs 拦截器方式" style={{ marginBottom: 24 }}>
        <CodeDiff
          oldValue={BasicExamples.naiveApproach}
          newValue={BasicExamples.interceptorApproach}
          leftTitle="❌ 朴素方式（每个接口都处理）"
          rightTitle="✅ 拦截器方式（统一处理）"
          type="error"
          hideDiffMarkers={true}
        />
      </Card>

      {/* 四、互动演示 */}
      <Card
        title={<span>四、互动演示 <Tag color="blue">Live Simulation</Tag></span>}
        style={{ marginBottom: 24 }}
      >
        <PromiseChainDemo />
      </Card>

      {/* 五、常见误区 */}
      <Card title="五、常见误区" style={{ marginBottom: 24 }}>
        <Paragraph>
          <Text strong type="danger">最常见的错误：忘记 return！</Text>
        </Paragraph>
        <CodeDiff
          oldValue={BasicExamples.bad_interceptor}
          newValue={BasicExamples.good_interceptor}
          leftTitle="❌ 忘记 return（上层收到 undefined）"
          rightTitle="✅ 正确 return（替换 Promise 链）"
          type="error"
          hideDiffMarkers={true}
        />
      </Card>

      {/* 六、核心原理 */}
      <Card title="六、核心原理" style={{ background: '#f0f5ff' }}>
        <Paragraph>{BasicExamples.why}</Paragraph>
        <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 6, fontSize: 13, lineHeight: 1.8 }}>
{`上层调用:
  const res = await request.get('/users')   ← 等待的 Promise...
                                                    ↑
                                                    │ 被悄悄替换了！
                                                    │
原始 Promise:  发送请求 → 401 → ❌ rejected ──── 不再使用
                                                    │
拦截器:        捕获 401 → 刷新 Token → 重试 → ✅ resolved
                                                    │
上层:          res.data = [...]  ← 收到正常响应    ↓`}
        </pre>
      </Card>
    </div>
  );
};

export default SilentRefreshBasic;
