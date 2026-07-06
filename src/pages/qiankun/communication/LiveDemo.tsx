import React, { useState, useCallback, useRef } from 'react';
import { Card, Space, Typography, Tag, Button, Divider, Input, Switch } from 'antd';

interface LogEntry {
  id: number;
  source: string;
  action: string;
  prevValue: string;
  newValue: string;
  timestamp: string;
}

const LiveDemo: React.FC = () => {
  const [globalState, setGlobalState] = useState({
    user: '未登录',
    theme: 'light',
    count: 0,
  });
  const [appAState, setAppAState] = useState(globalState);
  const [appBState, setAppBState] = useState(globalState);
  const [appASubscribed, setAppASubscribed] = useState(true);
  const [appBSubscribed, setAppBSubscribed] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logId = useRef(0);
  const [userInput, setUserInput] = useState('Alice');

  const now = () => new Date().toLocaleTimeString('zh-CN', { hour12: false });

  const addLog = useCallback((source: string, action: string, prev: string, next: string) => {
    logId.current += 1;
    setLogs((prevLogs) => [
      { id: logId.current, source, action, prevValue: prev, newValue: next, timestamp: now() },
      ...prevLogs,
    ]);
  }, []);

  const updateGlobalState = useCallback((partialState: Partial<typeof globalState>) => {
    const prev = JSON.stringify(globalState);
    setGlobalState((prevState) => {
      const newState = { ...prevState, ...partialState };
      const next = JSON.stringify(newState);
      addLog('主应用', `setGlobalState(${JSON.stringify(partialState)})`, prev, next);
      return newState;
    });
    if (appASubscribed) {
      setAppAState((prev) => ({ ...prev, ...partialState }));
      addLog('子应用 A', 'onGlobalStateChange 收到更新', JSON.stringify(appAState), JSON.stringify({ ...appAState, ...partialState }));
    }
    if (appBSubscribed) {
      setAppBState((prev) => ({ ...prev, ...partialState }));
      addLog('子应用 B', 'onGlobalStateChange 收到更新', JSON.stringify(appBState), JSON.stringify({ ...appBState, ...partialState }));
    }
  }, [globalState, appAState, appBState, appASubscribed, appBSubscribed, addLog]);

  const simulateChildAction = useCallback((child: 'A' | 'B', partialState: Partial<typeof globalState>) => {
    const prev = JSON.stringify(globalState);
    addLog(`子应用 ${child}`, `setGlobalState(${JSON.stringify(partialState)})`, prev, '');
    setGlobalState((prevState) => {
      const newState = { ...prevState, ...partialState };
      const next = JSON.stringify(newState);
      addLog(`子应用 ${child}`, `setGlobalState 执行完毕`, prev, next);
      return newState;
    });
    if (child === 'A') {
      setAppAState((prev) => ({ ...prev, ...partialState }));
      if (appBSubscribed) {
        setAppBState((prev) => ({ ...prev, ...partialState }));
        addLog('子应用 B', '收到子应用 A 的更新', '', JSON.stringify(partialState));
      }
    }
    if (child === 'B') {
      setAppBState((prev) => ({ ...prev, ...partialState }));
      if (appASubscribed) {
        setAppAState((prev) => ({ ...prev, ...partialState }));
        addLog('子应用 A', '收到子应用 B 的更新', '', JSON.stringify(partialState));
      }
    }
  }, [globalState, appASubscribed, appBSubscribed, addLog]);

  return (
    <Card title="实时通信演示">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 主应用面板 */}
        <Card size="small" title="🏠 主应用 initGlobalState" extra={<Tag color="blue">Global State</Tag>}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Typography.Text strong>用户：</Typography.Text>
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                style={{ width: 200 }}
              />
              <Button
                size="small"
                style={{ marginLeft: 8 }}
                onClick={() => updateGlobalState({ user: userInput })}
              >
                设置用户
              </Button>
            </div>
            <div>
              <Typography.Text strong>主题：</Typography.Text>
              <Switch
                checkedChildren="dark"
                unCheckedChildren="light"
                checked={globalState.theme === 'dark'}
                onChange={(checked) => updateGlobalState({ theme: checked ? 'dark' : 'light' })}
              />
            </div>
            <div>
              <Typography.Text strong>计数器：</Typography.Text>
              <Tag>{globalState.count}</Tag>
              <Button size="small" onClick={() => updateGlobalState({ count: globalState.count + 1 })}>
                +1
              </Button>
            </div>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              当前全局状态：
            </Typography.Paragraph>
            <pre style={{ margin: 0, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
              {JSON.stringify(globalState, null, 2)}
            </pre>
          </Space>
        </Card>

        {/* 子应用面板 */}
        <div style={{ display: 'flex', gap: 16 }}>
          <Card
            size="small"
            title="📦 子应用 A"
            style={{ flex: 1 }}
            extra={
              <Space>
                <Tag color={appASubscribed ? 'green' : 'red'}>
                  {appASubscribed ? '已订阅' : '未订阅'}
                </Tag>
                <Button size="small" onClick={() => {
                  setAppASubscribed(!appASubscribed);
                  addLog('子应用 A', appASubscribed ? 'offGlobalStateChange 取消订阅' : 'onGlobalStateChange 重新订阅', '', '');
                }}>
                  {appASubscribed ? '取消订阅' : '重新订阅'}
                </Button>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Typography.Text strong>收到的用户：</Typography.Text>
                <Tag>{appAState.user}</Tag>
              </div>
              <div>
                <Typography.Text strong>收到的主题：</Typography.Text>
                <Tag>{appAState.theme}</Tag>
              </div>
              <div>
                <Typography.Text strong>收到的计数：</Typography.Text>
                <Tag>{appAState.count}</Tag>
              </div>
              <Button size="small" onClick={() => simulateChildAction('A', { count: globalState.count + 10 })}>
                子应用 A：设置 count += 10
              </Button>
            </Space>
          </Card>

          <Card
            size="small"
            title="📦 子应用 B"
            style={{ flex: 1 }}
            extra={
              <Space>
                <Tag color={appBSubscribed ? 'green' : 'red'}>
                  {appBSubscribed ? '已订阅' : '未订阅'}
                </Tag>
                <Button size="small" onClick={() => {
                  setAppBSubscribed(!appBSubscribed);
                  addLog('子应用 B', appBSubscribed ? 'offGlobalStateChange 取消订阅' : 'onGlobalStateChange 重新订阅', '', '');
                }}>
                  {appBSubscribed ? '取消订阅' : '重新订阅'}
                </Button>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Typography.Text strong>收到的用户：</Typography.Text>
                <Tag>{appBState.user}</Tag>
              </div>
              <div>
                <Typography.Text strong>收到的主题：</Typography.Text>
                <Tag>{appBState.theme}</Tag>
              </div>
              <div>
                <Typography.Text strong>收到的计数：</Typography.Text>
                <Tag>{appBState.count}</Tag>
              </div>
              <Button size="small" onClick={() => simulateChildAction('B', { theme: globalState.theme === 'dark' ? 'light' : 'dark' })}>
                子应用 B：切换主题
              </Button>
            </Space>
          </Card>
        </div>

        <Divider />

        {/* 时间线日志 */}
        <Card size="small" title="📋 通信日志时间线">
          <div style={{ maxHeight: 300, overflow: 'auto' }}>
            {logs.length === 0 ? (
              <Typography.Text type="secondary">暂无日志，请操作上方面板触发通信</Typography.Text>
            ) : (
              logs.map((log) => (
                <div key={log.id} style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}>
                  <Typography.Text type="secondary" style={{ marginRight: 8 }}>{log.timestamp}</Typography.Text>
                  <Tag color="blue">{log.source}</Tag>
                  <code>{log.action}</code>
                  {log.prevValue && (
                    <>
                      <Typography.Text type="secondary" style={{ margin: '0 4px' }}>←</Typography.Text>
                      <code style={{ color: '#999' }}>{log.prevValue}</code>
                    </>
                  )}
                  {log.newValue && (
                    <>
                      <Typography.Text type="secondary" style={{ margin: '0 4px' }}>→</Typography.Text>
                      <code style={{ color: '#52c41a' }}>{log.newValue}</code>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </Space>
    </Card>
  );
};

export default LiveDemo;
