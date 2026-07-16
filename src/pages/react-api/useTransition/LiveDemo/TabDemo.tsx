import React, { useState, useTransition } from 'react';
import type { TabsProps } from 'antd';
import { Switch, Button, Tag, Card, Space, Tabs } from 'antd';
import { RocketOutlined, StopOutlined } from '@ant-design/icons';
import { HeavyTabContent } from './shared';

const TabDemo: React.FC = () => {
  const [useTransitionMode, setUseTransitionMode] = useState(false);
  const [activeKey, setActiveKey] = useState('simple');
  const [displayKey, setDisplayKey] = useState('simple');
  const [isPending, startTransition] = useTransition();

  const items: TabsProps['items'] = [
    { key: 'simple', label: '简单内容', children: <div style={{ padding: 40, textAlign: 'center' }}>轻量内容</div> },
    { key: 'heavy', label: '复杂内容', children: <HeavyTabContent /> },
  ];

  const handleChange = (key: string) => {
    if (useTransitionMode) {
      setActiveKey(key);
      startTransition(() => setDisplayKey(key));
    } else {
      setActiveKey(key);
      setDisplayKey(key);
    }
  };

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <span>模式：</span>
        <Switch
          checkedChildren={<><RocketOutlined /> Transition 模式</>}
          unCheckedChildren={<><StopOutlined /> 同步模式</>}
          checked={useTransitionMode}
          onChange={(val) => {
            setUseTransitionMode(val);
            setActiveKey('simple');
            setDisplayKey('simple');
          }}
        />
        {useTransitionMode && isPending && <Tag color="processing">加载复杂内容中...</Tag>}
      </Space>
      <Tabs activeKey={activeKey} items={items} onChange={handleChange} />
    </Card>
  );
};

export default TabDemo;
