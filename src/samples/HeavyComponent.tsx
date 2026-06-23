import React from 'react';
import { Card, List, Tag } from 'antd';

/**
 * 示例代码位置说明：
 * 该组件定义在 @src/samples/HeavyComponent.tsx
 * 用于演示 Hover Preloading 的加载效果
 */
const HeavyComponent: React.FC = () => {
  // 模拟一个数据量较大的列表渲染
  const mockData = Array.from({ length: 1000 }).map((_, i) => ({
    id: i,
    title: `重型组件内部数据项目 #${i + 1}`,
    status: Math.random() > 0.5 ? 'active' : 'idle',
  }));

  return (
    <Card title="🚀 已加载的重型业务组件" extra={<Tag color="green">已渲染</Tag>}>
      <div style={{ height: '300px', overflow: 'auto' }}>
        <List
          size="small"
          dataSource={mockData}
          renderItem={(item) => (
            <List.Item>
              {item.title} -{' '}
              <Tag color={item.status === 'active' ? 'blue' : 'default'}>{item.status}</Tag>
            </List.Item>
          )}
        />
      </div>
    </Card>
  );
};

export default HeavyComponent;
