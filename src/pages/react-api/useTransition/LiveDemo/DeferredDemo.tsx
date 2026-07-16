import React, { useState, useDeferredValue } from 'react';
import { Input, Alert, Card } from 'antd';
import { HeavyList } from './shared';

const DeferredDemo: React.FC = () => {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  return (
    <Card>
      <Input
        placeholder="输入搜索词"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <Alert
        message="说明"
        description={`当前输入值：${query}；延迟值：${deferredQuery}。列表使用延迟值渲染，输入框保持即时响应。`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <HeavyList query={deferredQuery} />
    </Card>
  );
};

export default DeferredDemo;
