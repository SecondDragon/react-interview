import React, { useState, useTransition } from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';

/**
 * 最佳实践：Tab 切换使用 startTransition
 * 高亮状态同步更新，复杂内容用 transition 延迟渲染，切换更顺滑
 */
const TabGood: React.FC = () => {
  const [activeKey, setActiveKey] = useState('simple');
  const [displayKey, setDisplayKey] = useState('simple');
  const [isPending, startTransition] = useTransition();

  const items: TabsProps['items'] = [
    { key: 'simple', label: '简单内容', children: <div> lightweight content </div> },
    { key: 'heavy', label: '复杂内容', children: <HeavyContent /> },
  ];

  const handleChange = (key: string) => {
    // ✅ Tab 高亮立即响应
    setActiveKey(key);
    // ✅ 复杂内容渲染放入 transition
    startTransition(() => {
      setDisplayKey(key);
    });
  };

  return (
    <div>
      <Tabs activeKey={activeKey} items={items} onChange={handleChange} />
      {isPending && <div>正在加载复杂内容...</div>}
      <div style={{ opacity: isPending ? 0.5 : 1 }}>
        {items?.find((item) => item?.key === displayKey)?.children}
      </div>
    </div>
  );
};

const HeavyContent: React.FC = () => {
  const list = Array.from({ length: 2000 }, (_, i) => i);
  return (
    <div>
      {list.map((i) => (
        <div key={i} style={{ padding: 4, borderBottom: '1px solid #eee' }}>
          复杂行 {i}
        </div>
      ))}
    </div>
  );
};

export default TabGood;
