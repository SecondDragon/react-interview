import React, { useState } from 'react';
import { Button, Input } from 'antd';

/**
 * 反面教材：同步长任务阻塞主线程
 * 一次性处理所有节点，期间无法响应输入
 */
const TimeSlicingBad: React.FC = () => {
  const [items] = useState(() => Array.from({ length: 50000 }, (_, i) => i));
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(0);
  const [inputValue, setInputValue] = useState('');

  const handleCompute = () => {
    // ❌ 同步一次性处理所有节点，阻塞主线程
    let sum = 0;
    for (let i = 0; i < items.length; i++) {
      sum += Math.sqrt(items[i]);
    }
    setProgress(100);
    setResult(sum);
  };

  return (
    <div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="尝试在计算时输入，观察是否卡顿"
        style={{ marginBottom: 16 }}
      />
      <Button onClick={handleCompute}>同步计算 {items.length} 个节点</Button>
      <div>进度：{progress}%</div>
      <div>结果：{result.toFixed(2)}</div>
    </div>
  );
};

export default TimeSlicingBad;
