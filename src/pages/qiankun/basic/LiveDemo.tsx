import React, { useState, useMemo } from 'react';
import { Card, Switch, Typography, Alert, Space, Collapse, List, Tag } from 'antd';
import { liveDemoData } from './data';

type SwitchKey = 'childPlugin' | 'childCors' | 'childEntry' | 'childRouter' | 'hostActiveRule' | 'hostContainer';

const initialState: Record<SwitchKey, boolean> = {
  childPlugin: false,
  childCors: false,
  childEntry: false,
  childRouter: false,
  hostActiveRule: false,
  hostContainer: false,
};

const sectionMap: Record<SwitchKey, string> = {
  childPlugin: '二、子应用打包配置',
  childCors: '二、子应用打包配置',
  childEntry: '三、子应用入口改造',
  childRouter: '四、子应用内部路由',
  hostActiveRule: '五、父应用注册',
  hostContainer: '六、挂载容器',
};

const LiveDemo: React.FC = () => {
  const [state, setState] = useState<Record<SwitchKey, boolean>>(initialState);

  const allEnabled = useMemo(() => Object.values(state).every(Boolean), [state]);

  const missingKeys = useMemo(
    () => (Object.keys(state) as SwitchKey[]).filter((key) => !state[key]),
    [state]
  );

  const toggle = (key: SwitchKey) => {
    setState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card title={liveDemoData.title}>
      <Typography.Paragraph>{liveDemoData.description}</Typography.Paragraph>

      <Space direction="vertical" style={{ width: '100%' }}>
        {liveDemoData.switches.map((item) => (
          <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{item.label}</span>
            <Switch
              checked={state[item.key as SwitchKey]}
              onChange={() => toggle(item.key as SwitchKey)}
            />
          </div>
        ))}
      </Space>

      <Alert
        style={{ marginTop: 24 }}
        type={allEnabled ? 'success' : 'error'}
        message={allEnabled ? '配置可运行' : '配置仍有缺失'}
        description={allEnabled ? liveDemoData.successText : liveDemoData.errorText}
        showIcon
      />

      {!allEnabled && (
        <div style={{ marginTop: 16 }}>
          <Typography.Text type="danger">未启用的配置项：</Typography.Text>
          <List
            size="small"
            bordered
            dataSource={missingKeys}
            renderItem={(key) => (
              <List.Item>
                <Tag color="error">{liveDemoData.switches.find((s) => s.key === key)?.label}</Tag>
                <span style={{ marginLeft: 8 }}>对应章节：{sectionMap[key]}</span>
              </List.Item>
            )}
          />
        </div>
      )}

      <Collapse style={{ marginTop: 24 }}>
        <Collapse.Panel header={liveDemoData.checklistTitle} key="checklist">
          <Typography.Title level={5}>子应用侧</Typography.Title>
          <ul>
            <li>vite.config.ts 中使用 vite-plugin-qiankun</li>
            <li>server.headers 配置 Access-Control-Allow-Origin</li>
            <li>main.js 中使用 renderWithQiankun 暴露生命周期</li>
            <li>router/index.ts 中根据 __POWERED_BY_QIANKUN__ 切换 base</li>
          </ul>
          <Typography.Title level={5}>父应用侧</Typography.Title>
          <ul>
            <li>registerMicroApps 中正确配置 name / entry / container / activeRule</li>
            <li>调用 start()</li>
            <li>布局中预留 #micro-viewport 容器并设置合理高度</li>
          </ul>
        </Collapse.Panel>
      </Collapse>
    </Card>
  );
};

export default LiveDemo;
