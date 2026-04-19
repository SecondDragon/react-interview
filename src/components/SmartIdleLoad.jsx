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
 *      - timeout: 这是一个“防饿死”机制。如果指定了时间（毫秒），浏览器即使在没有空闲的情况下，
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
