import React, { useState, useCallback, useRef } from 'react';
import { Card, Button, Input, Typography, Alert, Space, Tag, Divider, message, Select, Table } from 'antd';
import {
  SendOutlined,
  PhoneOutlined,
  ApiOutlined,
  ReloadOutlined,
  ClearOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

/**
 * 模拟的 JS Bridge 实现
 */
class MockJSBridge {
  private callbackId = 0;
  private callbacks: Map<number, (data: any) => void> = new Map();
  private nativeApis: Map<string, (params: any) => any> = new Map();

  constructor() {
    this.nativeApis.set('getDeviceInfo', () => ({
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      online: navigator.onLine,
    }));
    this.nativeApis.set('showToast', (params: { message: string }) => {
      message.info(`[Native Toast] ${params.message}`);
      return { success: true };
    });
    this.nativeApis.set('getBatteryInfo', () => ({ level: Math.round(Math.random() * 100), charging: Math.random() > 0.5 }));
    this.nativeApis.set('vibrate', (params: { duration: number }) => {
      message.warning(`[模拟震动] 持续时间: ${params.duration}ms`);
      return { success: true };
    });
  }

  call(method: string, params: any = {}): Promise<any> {
    return new Promise((resolve) => {
      const id = ++this.callbackId;
      this.callbacks.set(id, resolve);
      setTimeout(() => {
        const api = this.nativeApis.get(method);
        if (api) {
          const result = api(params);
          const callback = this.callbacks.get(id);
          if (callback) {
            callback(result);
            this.callbacks.delete(id);
          }
        } else {
          const callback = this.callbacks.get(id);
          if (callback) {
            callback({ error: `Unknown API: ${method}` });
            this.callbacks.delete(id);
          }
        }
      }, 300 + Math.random() * 500);
    });
  }

  registerNativeMethod(name: string, handler: (params: any) => any) {
    this.nativeApis.set(name, handler);
  }

  callJS(method: string, data: any) {
    const handler = this.jsHandlers.get(method);
    if (handler) {
      handler(data);
    }
  }

  private jsHandlers: Map<string, (data: any) => void> = new Map();

  registerJSHandler(method: string, handler: (data: any) => void) {
    this.jsHandlers.set(method, handler);
  }
}

const BridgeDemo: React.FC = () => {
  const bridgeRef = useRef(new MockJSBridge());
  const [logs, setLogs] = useState<{ type: 'js' | 'native' | 'result'; msg: string; time: string }[]>([]);
  const [customMethod, setCustomMethod] = useState('getDeviceInfo');
  const [customParams, setCustomParams] = useState('{}');
  const [nativePushMethod, setNativePushMethod] = useState('networkChange');
  const [nativePushData, setNativePushData] = useState('{ "status": "offline" }');

  const addLog = useCallback((type: 'js' | 'native' | 'result', msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-49), { type, msg, time }]);
  }, []);

  const handleCall = useCallback(async () => {
    let method = customMethod;
    let params: any = {};
    try {
      params = JSON.parse(customParams);
    } catch {
      message.error('参数格式错误，请输入合法的 JSON');
      return;
    }

    addLog('js', `JS -> Native: ${method}(${JSON.stringify(params)})`);
    try {
      const result = await bridgeRef.current.call(method, params);
      addLog('result', `Native -> JS: ${JSON.stringify(result, null, 2)}`);
    } catch (err: any) {
      addLog('result', `Error: ${err.message}`);
    }
  }, [customMethod, customParams, addLog]);

  const handleNativePush = useCallback(() => {
    const method = nativePushMethod;
    let data: any = {};
    try {
      data = JSON.parse(nativePushData);
    } catch {
      message.error('推送数据格式错误');
      return;
    }
    addLog('native', `Native -> JS: 推送事件 "${method}"`);
    addLog('result', `数据: ${JSON.stringify(data)}`);
    message.info(`[Native 推送] 已向 JS 端推送事件: ${method}`);
  }, [nativePushMethod, nativePushData, addLog]);

  const handlePredefinedCall = useCallback(async (method: string, params?: any) => {
    addLog('js', `JS -> Native: ${method}(${JSON.stringify(params || {})})`);
    try {
      const result = await bridgeRef.current.call(method, params || {});
      addLog('result', `Native -> JS: ${JSON.stringify(result, null, 2)}`);
    } catch (err: any) {
      addLog('result', `Error: ${err.message}`);
    }
  }, [addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <div>
      <Alert
        message="Hybrid Bridge 通信模拟器"
        description="右侧模拟 WebView 中 JS 与 Native 端的桥接通信流程。点击预设按钮体验双向调用，或手动输入方法名和参数进行测试。每条日志都标注了消息方向。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Card title="预设 API 调用" size="small" style={{ flex: 1, minWidth: 300 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button block onClick={() => handlePredefinedCall('getDeviceInfo')} icon={<PhoneOutlined />}>
              获取设备信息 (getDeviceInfo)
            </Button>
            <Button block onClick={() => handlePredefinedCall('showToast', { message: 'Hello from JS!' })} icon={<SendOutlined />}>
              弹出 Native Toast
            </Button>
            <Button block onClick={() => handlePredefinedCall('getBatteryInfo')} icon={<ApiOutlined />}>
              获取电量信息
            </Button>
            <Button block onClick={() => handlePredefinedCall('vibrate', { duration: 200 })} icon={<ApiOutlined />}>
              触发震动 (200ms)
            </Button>
          </Space>
        </Card>

        <Card title="自定义 API 调用" size="small" style={{ flex: 1, minWidth: 300 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>方法名</Text>
              <Input
                value={customMethod}
                onChange={(e) => setCustomMethod(e.target.value)}
                placeholder="getDeviceInfo"
                style={{ marginTop: 4 }}
              />
            </div>
            <div>
              <Text strong>参数 (JSON)</Text>
              <Input.TextArea
                value={customParams}
                onChange={(e) => setCustomParams(e.target.value)}
                placeholder='{"key": "value"}'
                rows={2}
                style={{ marginTop: 4, fontFamily: 'monospace' }}
              />
            </div>
            <Button type="primary" onClick={handleCall} icon={<SendOutlined />} block>
              调用 Native API
            </Button>
          </Space>
        </Card>

        <Card title="Native -> JS 推送" size="small" style={{ flex: 1, minWidth: 300 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>事件名称</Text>
              <Input
                value={nativePushMethod}
                onChange={(e) => setNativePushMethod(e.target.value)}
                placeholder="networkChange"
                style={{ marginTop: 4 }}
              />
            </div>
            <div>
              <Text strong>数据</Text>
              <Input.TextArea
                value={nativePushData}
                onChange={(e) => setNativePushData(e.target.value)}
                placeholder='{"status": "offline"}'
                rows={2}
                style={{ marginTop: 4, fontFamily: 'monospace' }}
              />
            </div>
            <Button onClick={handleNativePush} icon={<ReloadOutlined />} block>
              模拟 Native 推送事件
            </Button>
          </Space>
        </Card>
      </div>

      <Card
        title="通信日志"
        size="small"
        style={{ marginTop: 16 }}
        extra={<Button size="small" icon={<ClearOutlined />} onClick={clearLogs}>清空日志</Button>}
      >
        <div style={{ maxHeight: 300, overflowY: 'auto', fontFamily: 'monospace', fontSize: 13 }}>
          {logs.length === 0 ? (
            <Text type="secondary">暂无通信记录，点击上方按钮开始模拟 JS-Native 桥接通信</Text>
          ) : (
            logs.map((log, i) => (
              <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Tag color={log.type === 'js' ? 'blue' : log.type === 'native' ? 'green' : 'orange'} style={{ flexShrink: 0 }}>
                  {log.type === 'js' ? 'JS → Native' : log.type === 'native' ? 'Native → JS' : '返回结果'}
                </Tag>
                <Text style={{ flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{log.msg}</Text>
                <Text type="secondary" style={{ flexShrink: 0, fontSize: 11 }}>{log.time}</Text>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default BridgeDemo;
