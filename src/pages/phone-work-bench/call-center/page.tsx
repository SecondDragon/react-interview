'use client';

import { ConfigProvider } from 'antd';
import CallCenterLayout from './CallCenterLayout';

export default function Home() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3b82f6',
          borderRadius: 8,
          fontFamily:
            "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', ui-sans-serif, system-ui, -apple-system, sans-serif",
        },
      }}
    >
      <CallCenterLayout />
    </ConfigProvider>
  );
}
