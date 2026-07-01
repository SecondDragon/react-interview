import React, { useState } from 'react';
import { Input } from 'antd';

/**
 * 反面教材：搜索框同步更新
 * 每次输入都会同步触发过滤，导致输入卡顿
 */
const SearchBad: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    // ❌ 同步更新搜索词，会阻塞输入
    setSearchQuery(value);
  };

  return (
    <div>
      <Input value={inputValue} onChange={handleChange} placeholder="请输入关键词" />
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

export default SearchBad;
