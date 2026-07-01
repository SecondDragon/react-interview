import React, { useState } from 'react';
import { Input } from 'antd';

/**
 * 反面教材：直接用 input 值驱动大量子组件渲染
 * 每次输入都会同步触发子树重渲染，导致输入卡顿
 */
const ParentBad: React.FC = () => {
  const [query, setQuery] = useState('');

  return (
    <div>
      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="输入搜索词" />
      <HeavyList query={query} />
    </div>
  );
};

const HeavyList: React.FC<{ query: string }> = ({ query }) => {
  const items = Array.from({ length: 3000 }, (_, i) => `数据 ${i}`);
  const filtered = items.filter((item) => item.includes(query));

  return (
    <div>
      {filtered.slice(0, 100).map((item) => (
        <div key={item}>{item}</div>
      ))}
    </div>
  );
};

export default ParentBad;
