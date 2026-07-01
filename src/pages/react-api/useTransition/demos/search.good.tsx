import React, { useState, useTransition } from 'react';
import { Input } from 'antd';

/**
 * 最佳实践：搜索框使用 startTransition
 * 输入状态同步更新，过滤逻辑放入 transition，保证输入流畅
 */
const SearchGood: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // ✅ 输入状态必须同步更新，保证输入框跟手
    setInputValue(value);
    // ✅ 过滤逻辑放入 transition，不阻塞输入
    startTransition(() => {
      setSearchQuery(value);
    });
  };

  return (
    <div>
      <Input value={inputValue} onChange={handleChange} placeholder="请输入关键词" />
      {isPending && <div>后台过滤中...</div>}
      <HeavyList query={searchQuery} />
    </div>
  );
};

const HeavyList: React.FC<{ query: string }> = ({ query }) => {
  const items = Array.from({ length: 30000 }, (_, i) => `数据条目 ${i}`);
  const filtered = items.filter((item) => item.includes(query));

  return (
    <div>
      {filtered.slice(0, 100).map((item) => (
        <div key={item}>{item}</div>
      ))}
    </div>
  );
};

export default SearchGood;
