/**
 * 示例代码位置说明：
 * 该文件存放于 @src/pages/performance/IdleLoad/Examples.ts
 * 用于展示 性能优化 - 闲时加载 (SmartIdleLoad / TransitionIdleLoad) 的对比实现
 */

export const IdleLoadExamples = {
  // ==================== 方案一：SmartIdleLoad 组件完整源码 ====================
  smartIdleLoadSource: `
import React, { useState, useEffect, Suspense } from 'react';

/**
 * requestIdleCallback API 详解：
 * 
 * 1. 作用：
 *    这是一个由浏览器提供的 API，允许开发者在主线程空闲期间执行低优先级的后台操作，
 *    而不影响关键的动画和输入响应。
 * 
 * 2. 参数说明：
 *    - callback: 当浏览器空闲时执行的函数。该函数会接收一个 IdleDeadline 对象作为参数。
 *      - deadline.timeRemaining(): 返回当前空闲周期的剩余毫秒数。
 *      - deadline.didTimeout: 布尔值。如果是因为达到了指定的 timeout 而被强制执行的，则为 true。
 *    - options (可选):
 *      - timeout: 这是一个"防饿死"机制。如果指定了时间（毫秒），浏览器即使在没有空闲的情况下，
 *        也会在超过这个时间后强制执行回调。
 * 
 * 3. 常用场景：
 *    - 日志埋点上报：不影响页面主要流程。
 *    - 数据预取/预加载：如在空闲时加载非首屏组件或数据。
 *    - 某些非紧急的 DOM 修改：防止引起丢帧。
 *    - 复杂的计算逻辑：将任务拆分并在多个空闲周期内完成。
 * 
 * 4. 注意事项：
 *    - 不要在回调中执行过长的同步任务，否则依然会阻塞主线程。
 *    - 不要在回调中修改 DOM（推荐在 requestAnimationFrame 中进行 DOM 修改）。
 *    - 兼容性：Safari 和老版本浏览器不支持，通常需要 Polyfill（如本组件中的 setTimeout 垫片）。
 */

export default function SmartIdleLoad({ children, fallback, timeout = 3000 }) {
  const [shouldRender, setShouldRender] = useState(false);
  useEffect(() => {
    // 兼容性垫片：如果浏览器不支持 requestIdleCallback，则降级使用 setTimeout
    const requestIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
    const cancelIdle = window.cancelIdleCallback || clearTimeout;

    // 核心逻辑：利用浏览器空闲时间加载组件
    const idleId = requestIdle(
      (deadline) => {
        // deadline.didTimeout 告诉我们：这是因为超时被强制触发的，还是真的等到了空闲
        // deadline.timeRemaining() > 0 表示当前帧还有剩余时间
        if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
          setShouldRender(true);
        }
      },
      { timeout } // 关键参数：设置超时时间，防止任务因为一直不空闲而永远不执行（防饿死）
    );

    return () => cancelIdle(idleId);
  }, [timeout]);

  return shouldRender ? <Suspense fallback={fallback}>{children}</Suspense> : fallback;
}
  `,

  // ==================== 方案二：TransitionIdleLoad 组件完整源码 ====================
  transitionIdleLoadSource: `
import React, { useState, useTransition, Suspense } from 'react';

interface TransitionIdleLoadProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

/**
 * React 18 useTransition 闲时加载组件
 *
 * 核心思路：
 *   利用 React 18 的 useTransition 将组件挂载标记为"过渡更新"（Transition Update）。
 *   这类更新被 React Scheduler 视为低优先级，可以被用户的交互中断，
 *   从而保证主线程始终优先响应紧急任务。
 *
 * 与 SmartIdleLoad（requestIdleCallback）的区别：
 *   - SmartIdleLoad：等浏览器空闲帧（外部调度）
 *   - TransitionIdleLoad：React 内部 Scheduler 调度（可被用户交互中断）
 */
export default function TransitionIdleLoad({ children, fallback }: TransitionIdleLoadProps) {
  const [isPending, startTransition] = useTransition();
  const [shouldRender, setShouldRender] = useState(false);

  React.useEffect(() => {
    // 将组件挂载标记为低优先级过渡更新
    startTransition(() => {
      setShouldRender(true);
    });
  }, []);

  if (!shouldRender) {
    return <>{fallback}</>;
  }

  return (
    <>
      {isPending && fallback}
      <Suspense fallback={fallback}>
        <div style={{ opacity: isPending ? 0.5 : 1, transition: 'opacity 0.3s' }}>
          {children}
        </div>
      </Suspense>
    </>
  );
}
  `,

  // ==================== 传统直接加载方式（对比组）====================
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

  // ==================== 方案一使用示例 ====================
  optimizedSmart: `
// 方案一：利用 requestIdleCallback 在浏览器空闲时才开始加载和渲染组件
import React, { lazy } from 'react';
import SmartIdleLoad from '../../components/SmartIdleLoad';

const ComplexChart = lazy(() => import('../../samples/ComplexChart'));

function SmartIdleLoadPage() {
  return (
    <SmartIdleLoad 
      fallback={<div>等待主线程空闲中...</div>} 
      timeout={5000}
    >
      <ComplexChart />
    </SmartIdleLoad>
  );
}
  `,

  // ==================== 方案二使用示例 ====================
  optimizedTransition: `
// 方案二：利用 React 18 useTransition 将组件挂载标记为低优先级
import React, { lazy } from 'react';
import TransitionIdleLoad from '../../components/TransitionIdleLoad';

const ComplexChart = lazy(() => import('../../samples/ComplexChart'));

function TransitionIdleLoadPage() {
  return (
    <TransitionIdleLoad fallback={<div>Scheduler 调度渲染中...</div>}>
      <ComplexChart />
    </TransitionIdleLoad>
  );
}
  `,

  // ==================== 方案对比表格代码 ====================
  comparisonCode: `
// 两种方案的核心差异对比

// ┌─────────────────────┬──────────────────────────────┬──────────────────────────────┐
// │       维度          │   SmartIdleLoad (方案一)      │   TransitionIdleLoad (方案二) │
// ├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
// │ 调度方              │ 浏览器 requestIdleCallback    │ React 内部 Scheduler         │
// │ 可中断性            │ 不可中断，等空闲才执行        │ ✅ 可被高优先级更新中断       │
// │ 与 React 生命周期   │ 外部 API，需手动同步          │ 原生集成，自动处理            │
// │ 兼容性              │ Safari 不支持                 │ React 18+ 全支持              │
// │ 适用场景            │ 通用任务调度、非 React 逻辑   │ React 组件/状态相关的闲时加载 │
// │ 过渡状态反馈        │ 无                            │ ✅ 提供 isPending 状态        │
// └─────────────────────┴──────────────────────────────┴──────────────────────────────┘
  `,
};
