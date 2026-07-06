// ✅ 子应用修改全局状态

import React from 'react';
import { Button, Card } from 'antd';

// 模拟子应用中的一个 React 组件
function ThemeToggle(props: any) {
  // props 中的 setGlobalState 来自 mount 时传入的 props
  const { setGlobalState } = props;

  const toggleTheme = () => {
    // 子应用可以修改全局状态
    // 所有订阅了 onGlobalStateChange 的其他子应用会立即收到更新
    setGlobalState({
      theme: 'dark',
    });
  };

  const updateNotifications = () => {
    setGlobalState((prev: any) => ({
      notifications: [...prev.notifications, { id: Date.now(), text: '新通知' }],
    }));
  };

  return (
    <Card title="子应用 A">
      <Button onClick={toggleTheme}>切换到暗黑模式</Button>
      <Button onClick={updateNotifications}>添加通知</Button>
    </Card>
  );
}

export default ThemeToggle;
