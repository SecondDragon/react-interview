/**
 * 示例代码位置说明：
 * 该文件存放于 @src/pages/performance/IdleLoad/Examples.ts
 * 用于展示 性能优化 - 闲时加载 (SmartIdleLoad) 的对比实现
 */

export const IdleLoadExamples = {
  // 传统直接加载方式（对比组）
  traditional: `
// 传统加载：直接导入并渲染，在主线程繁忙时会造成明显的掉帧或阻塞
import ComplexChart from '../../samples/ComplexChart';

function TraditionalPage() {
  return (
    <div>
      <h3>普通加载方式</h3>
      <ComplexChart />
    </div>
  );
}
  `,

  // 闲时加载优化方式（实验组）
  optimized: `
// 闲时加载：利用 requestIdleCallback 在浏览器空闲时才开始加载和渲染组件
import React, { lazy } from 'react';
import SmartIdleLoad from '../../components/SmartIdleLoad';

const ComplexChart = lazy(() => import('../../samples/ComplexChart'));

function OptimizedPage() {
  return (
    <SmartIdleLoad 
      fallback={<div>等待主线程空闲中...</div>} 
      timeout={5000}
    >
      <ComplexChart />
    </SmartIdleLoad>
  );
}
  `
};
