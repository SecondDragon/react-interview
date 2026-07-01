import React, { useState, useCallback, useRef } from 'react';
import { Button, Input } from 'antd';

/**
 * 最佳实践：手动模拟时间切片
 * 每处理一批节点后检查是否该让出主线程，期间可以响应输入
 */
const TimeSlicingGood: React.FC = () => {
  const [items] = useState(() => Array.from({ length: 50000 }, (_, i) => i));
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const indexRef = useRef(0);
  const sumRef = useRef(0);

  // ✅ 模拟 scheduler 的 shouldYield：每 5ms 检查一次
  const shouldYield = useCallback(() => {
    return performance.now() - frameStartRef.current > 5;
  }, []);

  const frameStartRef = useRef(performance.now());

  const processBatch = useCallback(() => {
    frameStartRef.current = performance.now();

    while (indexRef.current < items.length) {
      sumRef.current += Math.sqrt(items[indexRef.current]);
      indexRef.current++;

      // ✅ 每处理一个节点都检查是否该让出主线程
      if (shouldYield()) {
        setProgress(Math.floor((indexRef.current / items.length) * 100));
        // 把控制权交还浏览器，下一帧继续
        requestAnimationFrame(processBatch);
        return;
      }
    }

    // 全部完成
    setProgress(100);
    setResult(sumRef.current);
    setIsRunning(false);
    indexRef.current = 0;
    sumRef.current = 0;
  }, [items, shouldYield]);

  const handleCompute = () => {
    setIsRunning(true);
    setProgress(0);
    setResult(0);
    indexRef.current = 0;
    sumRef.current = 0;
    requestAnimationFrame(processBatch);
  };

  return (
    <div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="尝试在计算时输入，观察是否仍然流畅"
        style={{ marginBottom: 16 }}
      />
      <Button onClick={handleCompute} disabled={isRunning}>
        时间切片计算 {items.length} 个节点
      </Button>
      <div>进度：{progress}%</div>
      <div>结果：{result.toFixed(2)}</div>
    </div>
  );
};

export default TimeSlicingGood;
