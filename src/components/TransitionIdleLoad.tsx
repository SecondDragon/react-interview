import React, { useState, useTransition, Suspense } from 'react';

interface TransitionIdleLoadProps {
  /** 要闲时渲染的子组件（通常是 lazy 加载的组件） */
  children: React.ReactNode;
  /** 加载中的占位 UI */
  fallback: React.ReactNode;
}

/**
 * React 18 useTransition 闲时加载组件
 *
 * 核心思路：
 *   利用 React 18 的 useTransition 将组件挂载标记为"过渡更新"（Transition Update）。
 *   这类更新被 React Scheduler 视为低优先级，可以被用户的交互（如点击、输入）中断，
 *   从而保证主线程始终优先响应紧急任务。
 *
 * 与 SmartIdleLoad（requestIdleCallback）的区别：
 *   ┌─────────────────────┬──────────────────────────────┬──────────────────────────────┐
 *   │       维度          │   SmartIdleLoad (方案一)      │   TransitionIdleLoad (方案二) │
 *   ├─────────────────────┼──────────────────────────────┼──────────────────────────────┤
 *   │ 调度方              │ 浏览器 requestIdleCallback    │ React 内部 Scheduler         │
 *   │ 可中断性            │ 不可中断，等空闲才执行        │ ✅ 可被高优先级更新中断       │
 *   │ 与 React 生命周期   │ 外部 API，需手动同步          │ 原生集成，自动处理            │
 *   │ 兼容性              │ Safari 不支持                 │ React 18+ 全支持              │
 *   │ 适用场景            │ 通用任务调度、非 React 逻辑   │ React 组件/状态相关的闲时加载 │
 *   │ 过渡状态反馈        │ 无                            │ ✅ 提供 isPending 状态        │
 *   └─────────────────────┴──────────────────────────────┴──────────────────────────────┘
 *
 * 使用场景：
 *   - 大数据量列表的搜索过滤渲染
 *   - 复杂可视化图表的切换动画
 *   - 非首屏重型组件的渐进式挂载
 *   - 任何需要在"不阻塞用户交互"前提下完成的 React 渲染
 */
export default function TransitionIdleLoad({ children, fallback }: TransitionIdleLoadProps) {
  const [isPending, startTransition] = useTransition();
  const [shouldRender, setShouldRender] = useState(false);

  React.useEffect(() => {
    // 将组件挂载标记为低优先级过渡更新
    // React Scheduler 会在处理完所有紧急更新后，再执行这个过渡
    startTransition(() => {
      setShouldRender(true);
    });
  }, []);

  // 尚未开始渲染：展示 fallback
  if (!shouldRender) {
    return <>{fallback}</>;
  }

  return (
    <>
      {/* 过渡中：展示 fallback + 半透明内容 */}
      {isPending && fallback}
      <Suspense fallback={fallback}>
        <div
          style={{
            opacity: isPending ? 0.5 : 1,
            transition: 'opacity 0.3s ease',
          }}
        >
          {children}
        </div>
      </Suspense>
    </>
  );
}
