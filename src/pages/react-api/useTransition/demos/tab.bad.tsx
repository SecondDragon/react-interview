import React, { useState } from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';

/**
 * 反面教材：Tab 切换同步渲染复杂内容
 * 高亮和内容同时更新，导致切换动画卡顿
 */
const TabBad: React.FC = () => {
  const [activeKey, setActiveKey] = useState('simple');

  const items: TabsProps['items'] = [
    { key: 'simple', label: '简单内容', children: <div> lightweight content </div> },
    { key: 'heavy', label: '复杂内容', children: <HeavyContent /> },
  ];

  const handleChange = (key: string) => {
    // ❌ 同步切换 Tab，复杂内容阻塞高亮反馈
    setActiveKey(key);
  };

  return <Tabs activeKey={activeKey} items={items} onChange={handleChange} />;
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

export default TabBad;
