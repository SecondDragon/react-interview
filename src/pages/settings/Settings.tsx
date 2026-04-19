import React from 'react';
import { Card, Switch, Space, Typography, Alert } from 'antd';
import { useAppStore } from '../../store/useAppStore';

const Settings: React.FC = () => {
  const { collapsed, toggleCollapsed } = useAppStore();

  return (
    <Card title="系统配置 (持久化存储演示)">
      <Alert
        message="状态持久化提示"
        description="您可以尝试刷新页面，下面的开关状态会自动从 localStorage 恢复。"
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
      />
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space align="center">
          <Typography.Text>侧边栏折叠状态：</Typography.Text>
          <Switch
            checked={collapsed}
            onChange={toggleCollapsed}
            checkedChildren="折叠"
            unCheckedChildren="展开"
          />
        </Space>
      </Space>
    </Card>
  );
};

export default Settings;
