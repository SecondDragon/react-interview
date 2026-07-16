import React, { useState, useTransition } from 'react';
import { Badge, Button, Card, Space } from 'antd';

const PendingBadgeDemo: React.FC = () => {
  const [count, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      const start = performance.now();
      while (performance.now() - start < 600) {}
      setCount((c) => c + 1);
    });
  };

  return (
    <Card>
      <Space>
        <Badge dot={isPending}>
          <Button onClick={handleClick} disabled={isPending}>
            {isPending ? '处理中...' : '提交'}
          </Button>
        </Badge>
        <span>已提交次数：{count}</span>
      </Space>
    </Card>
  );
};

export default PendingBadgeDemo;
