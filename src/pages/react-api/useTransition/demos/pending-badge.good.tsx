import React, { useState, useTransition } from 'react';
import { Button, Badge } from 'antd';

/**
 * 最佳实践：使用 isPending 提供反馈
 * 用户点击后立即看到“处理中”徽标
 */
const PendingBadgeGood: React.FC = () => {
  const [count, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      // ✅ 模拟复杂计算
      const start = performance.now();
      while (performance.now() - start < 800) {}
      setCount((c) => c + 1);
    });
  };

  return (
    <div>
      <Badge dot={isPending}>
        <Button onClick={handleClick} disabled={isPending}>
          {isPending ? '处理中...' : '提交'}
        </Button>
      </Badge>
      <div>已提交次数：{count}</div>
    </div>
  );
};

export default PendingBadgeGood;
