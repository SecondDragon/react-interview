import React, { useState, useRef, useCallback } from 'react';
import { Card, Space, Typography, Tag, Button, Input, Divider, Alert } from 'antd';

interface AppInstance {
  id: number;
  containerId: string;
  props: Record<string, any>;
  status: string;
}

let nextId = 1;

const LiveDemo: React.FC = () => {
  const [instances, setInstances] = useState<AppInstance[]>([]);
  const [theme, setTheme] = useState('light');
  const [token, setToken] = useState('initial-token');
  const [log, setLog] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  }, []);

  const mountInstance = useCallback(() => {
    const id = nextId++;
    const containerId = `demo-container-${id}`;
    const newInstance: AppInstance = {
      id,
      containerId,
      props: { theme, token, panelId: id },
      status: 'MOUNTED',
    };
    setInstances((prev) => [...prev, newInstance]);
    addLog(`挂载实例 #${id} 到 #${containerId}，props: { theme: ${theme}, token: ${token} }`);
  }, [theme, token, addLog]);

  const unmountInstance = useCallback((id: number) => {
    setInstances((prev) => prev.filter((i) => i.id !== id));
    addLog(`卸载实例 #${id}`);
  }, [addLog]);

  const unmountAll = useCallback(() => {
    setInstances([]);
    addLog('卸载所有实例');
  }, [addLog]);

  const updateProps = useCallback(() => {
    setInstances((prev) =>
      prev.map((i) => ({ ...i, props: { ...i.props, theme, token } }))
    );
    addLog(`更新所有实例 props: { theme: ${theme}, token: ${token} }`);
  }, [theme, token, addLog]);

  const clearLog = useCallback(() => {
    setLog([]);
  }, []);

  return (
    <Card title="手动加载演示器">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Card size="small" title="控制面板">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span><strong>Theme:</strong></span>
              <Tag color={theme === 'dark' ? 'purple' : 'orange'}>{theme}</Tag>
              <Button size="small" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                切换
              </Button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span><strong>Token:</strong></span>
              <Input
                size="small"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                style={{ width: 200 }}
              />
            </div>
            <Divider style={{ margin: '4px 0' }} />
            <Space>
              <Button type="primary" onClick={mountInstance}>
                挂载子应用
              </Button>
              <Button onClick={updateProps} disabled={instances.length === 0}>
                更新所有 props
              </Button>
              <Button danger onClick={unmountAll} disabled={instances.length === 0}>
                全部卸载
              </Button>
            </Space>
          </Space>
        </Card>

        <Card size="small" title={`已挂载的子应用实例 (${instances.length})`}>
          {instances.length === 0 ? (
            <Typography.Text type="secondary">暂无实例，点击"挂载子应用"创建</Typography.Text>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {instances.map((inst) => (
                <Card
                  key={inst.id}
                  size="small"
                  title={`实例 #${inst.id}`}
                  extra={<Button size="small" danger onClick={() => unmountInstance(inst.id)}>卸载</Button>}
                  style={{ width: 240 }}
                >
                  <div><strong>容器：</strong>#{inst.containerId}</div>
                  <div><strong>状态：</strong><Tag color="green">{inst.status}</Tag></div>
                  <div><strong>Theme：</strong>{inst.props.theme}</div>
                  <div><strong>Token：</strong>{inst.props.token}</div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        <Card
          size="small"
          title="操作日志"
          extra={<Button size="small" onClick={clearLog}>清空</Button>}
        >
          <div style={{ maxHeight: 200, overflow: 'auto' }}>
            {log.length === 0 ? (
              <Typography.Text type="secondary">暂无操作日志</Typography.Text>
            ) : (
              log.map((msg, i) => (
                <div key={i} style={{ padding: '2px 0', fontSize: 13, borderBottom: '1px solid #f5f5f5' }}>
                  {msg}
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
