import React, { useState, useRef, useCallback } from 'react';
import { Card, Space, Typography, Tag, Button, Divider, Alert } from 'antd';

interface LogEntry {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

const LiveDemo: React.FC = () => {
  const [currentApp, setCurrentApp] = useState<'none' | 'appA' | 'appB'>('none');
  const [sandboxEnabled, setSandboxEnabled] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [windowState, setWindowState] = useState<Record<string, any>>({});
  const fakeWindowRef = useRef<Record<string, any>>({});
  const logId = useRef(0);

  const addLog = useCallback((message: string, type: LogEntry['type']) => {
    logId.current += 1;
    setLogs((prev) => [{ id: logId.current, message, type }, ...prev]);
  }, []);

  const mountAppA = useCallback(() => {
    if (sandboxEnabled) {
      fakeWindowRef.current.__token = 'token-from-app-a';
      fakeWindowRef.current.__user = { name: 'Alice', role: 'admin' };
    } else {
      (window as any).__token = 'token-from-app-a';
      (window as any).__user = { name: 'Alice', role: 'admin' };
    }
    setCurrentApp('appA');
    addLog('App A mount: 设置 __token, __user', 'info');
    syncWindowState(sandboxEnabled);
  }, [sandboxEnabled, addLog]);

  const mountAppB = useCallback(() => {
    if (sandboxEnabled) {
      fakeWindowRef.current.__token = 'token-from-app-b';
      fakeWindowRef.current.__currentUser = { name: 'Bob', role: 'viewer' };
    } else {
      (window as any).__token = 'token-from-app-b';
      (window as any).__currentUser = { name: 'Bob', role: 'viewer' };
    }
    setCurrentApp('appB');
    addLog('App B mount: 覆盖 __token, 设置 __currentUser', 'info');
    syncWindowState(sandboxEnabled);
  }, [sandboxEnabled, addLog]);

  const unmountApp = useCallback(() => {
    if (sandboxEnabled) {
      // 沙箱模式下，清理 fakeWindow
      delete fakeWindowRef.current.__token;
      delete fakeWindowRef.current.__user;
      delete fakeWindowRef.current.__currentUser;
      addLog('unmount: 清空 fakeWindow（真实 window 从未被污染）', 'success');
    } else {
      // 非沙箱模式下，变量仍然残留
      addLog('unmount: 变量仍然留在 window 上', 'error');
    }
    setCurrentApp('none');
    syncWindowState(sandboxEnabled);
  }, [sandboxEnabled, addLog]);

  const syncWindowState = (sandbox: boolean) => {
    const state: Record<string, any> = {};
    if (sandbox) {
      if (fakeWindowRef.current.__token) state.__token = fakeWindowRef.current.__token;
      if (fakeWindowRef.current.__user) state.__user = fakeWindowRef.current.__user;
      if (fakeWindowRef.current.__currentUser) state.__currentUser = fakeWindowRef.current.__currentUser;
    } else {
      if ((window as any).__token) state.__token = (window as any).__token;
      if ((window as any).__user) state.__user = (window as any).__user;
      if ((window as any).__currentUser) state.__currentUser = (window as any).__currentUser;
    }
    setWindowState(state);
  };

  const clearAll = useCallback(() => {
    delete (window as any).__token;
    delete (window as any).__user;
    delete (window as any).__currentUser;
    fakeWindowRef.current = {};
    setCurrentApp('none');
    setWindowState({});
    setLogs([]);
  }, []);

  return (
    <Card title="全局变量污染演示器">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 沙箱开关 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            <strong>沙箱模式：</strong>
            <Tag color={sandboxEnabled ? 'green' : 'red'}>{sandboxEnabled ? '已启用' : '已禁用'}</Tag>
          </span>
          <Button onClick={() => setSandboxEnabled(!sandboxEnabled)}>
            {sandboxEnabled ? '禁用沙箱' : '启用沙箱'}
          </Button>
        </div>

        {/* 操作按钮 */}
        <Space>
          <Button type="primary" onClick={mountAppA} disabled={currentApp === 'appA'}>挂载 App A</Button>
          <Button type="primary" onClick={mountAppB} disabled={currentApp === 'appB'}>挂载 App B</Button>
          <Button onClick={unmountApp} disabled={currentApp === 'none'} danger>卸载当前应用</Button>
          <Button onClick={clearAll}>重置</Button>
        </Space>

        {/* 当前全局变量状态 */}
        <Card size="small" title="当前 window 全局变量">
          <pre style={{ margin: 0, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
            {JSON.stringify(windowState, null, 2) || '(无)'}
          </pre>
          {!sandboxEnabled && currentApp === 'none' && Object.keys(windowState).length > 0 && (
            <Alert type="error" message="无沙箱模式下，子应用卸载后变量仍然残留！" showIcon style={{ marginTop: 8 }} />
          )}
          {sandboxEnabled && currentApp === 'none' && (
            <Alert type="success" message="沙箱模式下，子应用卸载后变量已自动清理" showIcon style={{ marginTop: 8 }} />
          )}
        </Card>

        {/* 操作日志 */}
        <Card size="small" title="操作日志">
          <div style={{ maxHeight: 200, overflow: 'auto' }}>
            {logs.length === 0 ? (
              <Typography.Text type="secondary">暂无日志，请操作按钮触发</Typography.Text>
            ) : (
              logs.map((log) => (
                <div key={log.id} style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}>
                  <Tag color={log.type === 'success' ? 'green' : log.type === 'error' ? 'red' : 'blue'}>{log.type}</Tag>
                  {log.message}
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
