import type { TabsProps } from 'antd';

/* ======== 页面元数据 ======== */
export const UseTransitionMeta = {
  title: 'useTransition',
  description:
    'React 18 并发特性核心 Hook 之一。它允许你把某些状态更新标记为"非紧急"，让 React 优先响应用户输入、动画等高优先级任务，从而避免界面卡顿。',
} as const;

/* ======== API 总览 - 特性列表 ======== */
export const overviewFeatures = [
  { name: 'startTransition', desc: '把一组状态更新标记为非紧急的过渡更新。' },
  { name: 'isPending', desc: '指示当前是否存在正在进行的过渡更新，可用于展示 loading/骨架屏。' },
] as const;

/* ======== 章节一：基础用法 - 适用场景列表 ======== */
export const basicTransitionScenarios = {
  suitable: [
    '搜索框过滤大量数据',
    'Tab 切换时渲染复杂内容',
    '路由切换时预加载新页面内容',
    '批量更新多个不紧急的状态',
  ],
  unsuitable: [
    '需要立即反馈的受控输入（如文本框 value）',
    '依赖更新后立刻读取 DOM 的场景',
    '需要同步执行的副作用',
  ],
} as const;

export const basicTransitionProsCons = [
  { type: 'pro' as const, text: '不阻塞用户输入和动画，体验更流畅。' },
  { type: 'pro' as const, text: '无需手动防抖或节流，React 自动调度。' },
  { type: 'con' as const, text: '过渡更新的结果不会立即呈现，需要配合 isPending 做反馈。' },
  { type: 'con' as const, text: '滥用会导致界面"闪烁"或状态不一致。' },
] as const;

/* ======== 章节二：isPending - 适用场景列表 ======== */
export const pendingStateScenarios = {
  suitable: [
    '按钮触发复杂计算或视图切换',
    '需要让用户感知"后台正在渲染"',
    '配合骨架屏提升 perceived performance',
  ],
  unsuitable: [
    '同步更新中不需要 isPending',
    '已经有更精确的数据加载状态（如请求 loading）',
  ],
} as const;

export const pendingStateProsCons = [
  { type: 'pro' as const, text: '自动跟随 transition 生命周期，避免手动维护 loading 状态。' },
  { type: 'pro' as const, text: '可以精准反馈"渲染中"而非"请求中"。' },
  { type: 'con' as const, text: '多个 transition 同时存在时，isPending 为任意一个 transition 的状态。' },
] as const;

/* ======== 章节三：对比表格数据 ======== */
export const comparisonColumns = [
  { title: '对比维度', dataIndex: 'dimension', key: 'dimension' },
  { title: 'useTransition', dataIndex: 'useTransition', key: 'useTransition' },
  { title: 'useDeferredValue', dataIndex: 'useDeferredValue', key: 'useDeferredValue' },
] as const;

export const comparisonDataSource = [
  {
    key: '1',
    dimension: '控制对象',
    useTransition: '控制状态更新的时机（startTransition 包裹 setState）',
    useDeferredValue: '控制某个值被消费的节奏（返回延迟值）',
  },
  {
    key: '2',
    dimension: '使用位置',
    useTransition: '事件处理函数中',
    useDeferredValue: '组件 render 中，接收 props 或 state',
  },
  {
    key: '3',
    dimension: '典型场景',
    useTransition: '搜索提交、Tab 切换、表单保存',
    useDeferredValue: '从 props 派生渲染大量列表、图表',
  },
  {
    key: '4',
    dimension: '内部机制',
    useTransition: '显式标记 TransitionLane',
    useDeferredValue: '内部同样使用 TransitionLane',
  },
] as const;

/* ======== 章节五：调度时间线步骤 ======== */
export const principleTimelineSteps = [
  { title: 'transition 开始', description: '标记为 TransitionLane，进入时间切片' },
  { title: '输入事件插入', description: 'InputDiscreteLane 优先级更高，准备插队' },
  { title: 'transition 暂停', description: 'React 保存 workInProgress 进度' },
  { title: '处理输入事件', description: '高优先级更新先完成渲染和提交' },
  { title: '重新调度 transition', description: '丢弃旧工作，基于最新状态重新渲染' },
] as const;

/* ======== 步骤 → React 内部映射 ======== */
export const principleStepMapping = [
  {
    step: 'transition 开始',
    action:
      'React 调用 requestIdleCallback / scheduler 调度一个低优先级任务，标记 Lane 为 TransitionLane。',
  },
  {
    step: '输入事件插入',
    action: '用户输入触发新的更新，React 比较 Lane 优先级，发现 InputDiscreteLane 更高。',
  },
  {
    step: 'transition 暂停',
    action: 'React 保存当前 workInProgress 树，记录已完成的组件和副作用，释放主线程。',
  },
  {
    step: '处理输入事件',
    action: '高优先级更新完成 render 和 commit，输入框立刻呈现最新值。',
  },
  {
    step: '丢弃旧 transition',
    action: 'Lane 模型判断旧 transition 基于过期状态，直接废弃，避免展示不一致内容。',
  },
  {
    step: '重新调度 transition',
    action: 'React 基于最新 state 重新创建 workInProgress 树，再次进入时间切片。',
  },
] as const;

/* ======== 章节五：时间切片步骤详解 ======== */
export const timeSlicingSteps = [
  {
    title: '1. 创建 workInProgress 树',
    desc: 'React 开始 render 阶段时，会基于 current 树复制出一棵 workInProgress 树。所有更新都在这棵树上进行。',
  },
  {
    title: '2. 逐节点遍历（beginWork / completeWork）',
    desc: 'React 从根节点开始，递归调用 beginWork 处理每个节点，再调用 completeWork 回溯。每处理完一个节点，就完成了一小步工作。',
  },
  {
    title: '3. 调用 shouldYield() 检查',
    desc: '每处理完一个节点，React 会调用 scheduler 的 shouldYield()。它检查当前帧剩余时间是否不足 5ms，或是否有更高优先级任务需要处理。',
  },
  {
    title: '4. 保存进度并退出 render',
    desc: '如果 shouldYield() 返回 true，React 会记录当前遍历到的 workInProgress 节点，然后退出 render 函数，把主线程交还浏览器。',
  },
  {
    title: '5. 恢复渲染',
    desc: '浏览器处理完事件/输入后，通过 scheduleCallback 再次调度 React 的 render。React 从之前保存的 workInProgress 节点继续遍历，而不是从头开始。',
  },
] as const;

/* ======== 面试高频考点 ======== */
export const interviewQuestions = [
  {
    q: 'useTransition 和 useDeferredValue 有什么区别？',
    a: 'useTransition 控制状态更新的时机，适合事件处理函数；useDeferredValue 控制某个值被消费的节奏，适合从 props/state 派生延迟值。两者内部都基于 transition。',
  },
  {
    q: 'startTransition 中的更新可以被打断吗？',
    a: '可以。transition 更新优先级低，当更高优先级更新（如输入事件）进来时，React 会暂停、恢复或丢弃 transition，以保证紧急交互流畅。',
  },
  {
    q: 'isPending 和普通 loading 状态有什么不同？',
    a: 'isPending 由 React 并发调度自动管理，反映 transition 是否正在渲染；普通 loading 需要手动 setState，通常用于网络请求。',
  },
  {
    q: '哪些状态更新不应该放进 startTransition？',
    a: '受控输入的即时反馈、需要更新后立即读取 DOM 的场景、需要同步执行的副作用都不应放进 transition。',
  },
] as const;
