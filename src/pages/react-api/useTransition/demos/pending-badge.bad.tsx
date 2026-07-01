import React, { useState } from 'react';
import { Button } from 'antd';

/**
 * 反面教材：没有 pending 反馈
 * 用户点击后不知道系统是否正在处理
 */
const PendingBadgeBad: React.FC = () => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    // ❌ 同步执行大量计算，UI 卡住且没有任何反馈
    const start = performance.now();
    while (performance.now() - start < 800) {}
    setCount((c) => c + 1);
  };

  return (
    <div>
      <Button onClick={handleClick}>提交</Button>
      <div>已提交次数：{count}</div>
    </div>
  );
};

export default PendingBadgeBad;
