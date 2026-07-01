import React, { useState, useDeferredValue } from 'react';
import { Input } from 'antd';

/**
 * 最佳实践：使用 useDeferredValue 延迟消费 query
 * 输入框保持即时响应，列表使用延迟值在后台渲染
 */
const ParentGood: React.FC = () => {
  const [query, setQuery] = useState('');
  // ✅ 派生出一个可以延迟使用的值
  const deferredQuery = useDeferredValue(query);

  return (
    <div>
      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="输入搜索词" />
      <HeavyList query={deferredQuery} />
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

export default ParentGood;
