# useTransition 学习页面实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `src/pages/react-api/useTransition/` 下新建一个完整的 `useTransition` API 学习页面，并在主应用路由中注册。

**Architecture:** 按“能力维度”拆分章节组件，数据与代码分离；交互案例统一由 `LiveDemo.tsx` 按类型分发；Bad/Good 代码提取到 `demos/` 目录并通过 `?raw` 导入展示。

**Tech Stack:** React 19 + TypeScript + Vite + Ant Design + react-syntax-highlighter（通过 CodeDiff 组件）

---

## 文件清单

### 新建文件

- `src/pages/react-api/useTransition/index.tsx` — 主页面
- `src/pages/react-api/useTransition/data.ts` — 纯数据
- `src/pages/react-api/useTransition/LiveDemo.tsx` — 统一交互演示
- `src/pages/react-api/useTransition/chapters/BasicTransition.tsx` — 基础用法章节
- `src/pages/react-api/useTransition/chapters/PendingState.tsx` — isPending 章节
- `src/pages/react-api/useTransition/chapters/DeferredValue.tsx` — useDeferredValue 章节
- `src/pages/react-api/useTransition/chapters/Pitfalls.tsx` — 错误用法章节
- `src/pages/react-api/useTransition/chapters/Principle.tsx` — 实现原理章节
- `src/pages/react-api/useTransition/demos/search.bad.tsx` — 搜索框反面教材
- `src/pages/react-api/useTransition/demos/search.good.tsx` — 搜索框最佳实践
- `src/pages/react-api/useTransition/demos/tab.bad.tsx` — Tab 切换反面教材
- `src/pages/react-api/useTransition/demos/tab.good.tsx` — Tab 切换最佳实践
- `src/pages/react-api/useTransition/demos/pending-badge.bad.tsx` — pending 徽标反面教材
- `src/pages/react-api/useTransition/demos/pending-badge.good.tsx` — pending 徽标最佳实践
- `src/pages/react-api/useTransition/demos/pending-skeleton.bad.tsx` — 骨架屏反面教材
- `src/pages/react-api/useTransition/demos/pending-skeleton.good.tsx` — 骨架屏最佳实践
- `src/pages/react-api/useTransition/demos/deferred.bad.tsx` — useDeferredValue 反面教材
- `src/pages/react-api/useTransition/demos/deferred.good.tsx` — useDeferredValue 最佳实践
- `src/pages/react-api/useTransition/demos/pitfall-sync-read.bad.tsx` — 同步读取 DOM 反面教材
- `src/pages/react-api/useTransition/demos/pitfall-sync-read.good.tsx` — 同步读取 DOM 最佳实践
- `src/pages/react-api/useTransition/demos/principle-visual.tsx` — 原理可视化组件源码（用于 ?raw）

### 修改文件

- `src/router/config.tsx` — 注册 useTransition 路由
- `tsconfig.json` — 将 `src/pages/react-api/useTransition/demos/*.bad.tsx` 排除类型检查（如果项目已有全局 exclude 模式则跳过）

---

## Task 1: 创建数据文件 data.ts

**Files:**
- Create: `src/pages/react-api/useTransition/data.ts`

- [ ] **Step 1: 编写 data.ts**

```typescript
export const UseTransitionMeta = {
  title: 'useTransition',
  description:
    'React 18 并发特性核心 Hook 之一。它允许你把某些状态更新标记为“非紧急”，让 React 优先响应用户输入、动画等高优先级任务，从而避免界面卡顿。',
};

export const overviewData = {
  definition:
    'useTransition 返回一个数组 [isPending, startTransition]。在 startTransition 回调中触发的状态更新会被标记为“过渡更新”，React 会在处理完紧急更新后再执行它，并且允许被打断和重启。',
  features: [
    { name: 'startTransition', desc: '把一组状态更新标记为非紧急的过渡更新。' },
    { name: 'isPending', desc: '指示当前是否存在正在进行的过渡更新，可用于展示 loading/骨架屏。' },
  ],
};

export const basicTransitionData = {
  intent:
    '当某个状态更新会导致大量重渲染、阻塞用户输入或动画时，可以把它放进 startTransition，让 React 先保证高优先级交互的流畅。',
  principle:
    'React 18 的并发渲染允许更新拥有优先级。startTransition 会把内部的 setState 标记为 TransitionLane，优先级低于输入事件（InputDiscreteLane）和动画帧。因此即使用户继续输入，React 也会先完成输入响应，再抽空渲染 transition。',
  scenarios: {
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
  },
  prosCons: [
    { type: 'pro' as const, text: '不阻塞用户输入和动画，体验更流畅。' },
    { type: 'pro' as const, text: '无需手动防抖或节流，React 自动调度。' },
    { type: 'con' as const, text: '过渡更新的结果不会立即呈现，需要配合 isPending 做反馈。' },
    { type: 'con' as const, text: '滥用会导致界面“闪烁”或状态不一致。' },
  ],
};

export const pendingStateData = {
  intent:
    'isPending 告诉开发者当前是否有过渡更新正在进行。利用它可以在等待渲染完成时展示 loading、骨架屏或禁用按钮，避免用户焦虑。',
  principle:
    'startTransition 会返回一个布尔值 isPending。当 transition 开始时被置为 true，transition 渲染完成并提交后被置为 false。它和普通 loading 状态的区别在于：它由 React 并发调度自动管理，不需要手动 setLoading(true)/setLoading(false)。',
  scenarios: {
    suitable: [
      '按钮触发复杂计算或视图切换',
      '需要让用户感知“后台正在渲染”',
      '配合骨架屏提升 perceived performance',
    ],
    unsuitable: [
      '同步更新中不需要 isPending',
      '已经有更精确的数据加载状态（如请求 loading）',
    ],
  },
  prosCons: [
    { type: 'pro' as const, text: '自动跟随 transition 生命周期，避免手动维护 loading 状态。' },
    { type: 'pro' as const, text: '可以精准反馈“渲染中”而非“请求中”。' },
    { type: 'con' as const, text: '多个 transition 同时存在时，isPending 为任意一个 transition 的状态。' },
  ],
};

export const deferredValueData = {
  intent:
    'useDeferredValue 和 useTransition 都用于把更新变得“可延迟”，但使用场景不同。前者适合“值”的延迟，后者适合“事件处理函数中的状态更新”。',
  principle:
    'useDeferredValue(value) 会返回一个延迟版本的 value。当 value 变化时，React 会先用旧值保持界面响应，再用新值在后台渲染。它内部也是通过 transition 实现的，因此享有同样的优先级调度能力。',
  comparison: [
    {
      dimension: '控制对象',
      useTransition: '控制状态更新的时机（startTransition 包裹 setState）',
      useDeferredValue: '控制某个值被消费的节奏（返回延迟值）',
    },
    {
      dimension: '使用位置',
      useTransition: '事件处理函数中',
      useDeferredValue: '组件 render 中，接收 props 或 state',
    },
    {
      dimension: '典型场景',
      useTransition: '搜索提交、Tab 切换、表单保存',
      useDeferredValue: '从 props 派生渲染大量列表、图表',
    },
    {
      dimension: '内部机制',
      useTransition: '显式标记 TransitionLane',
      useDeferredValue: '内部同样使用 TransitionLane',
    },
  ],
  combination:
    '组合用法：父组件用 useTransition 控制“何时提交搜索词”，子组件用 useDeferredValue 延迟渲染列表。这样输入框始终保持即时响应，列表在后台平滑更新。',
};

export const pitfallsData = {
  intent:
    'transition 不是万能药。错误地包裹某些更新会导致状态不一致、输入不跟手或 DOM 读取错误。',
  pitfalls: [
    {
      title: '在 transition 中同步读取 DOM',
      bad: '调用 startTransition 后立刻 getBoundingClientRect，读到的是旧布局。',
      good: '在 useEffect 中读取，或等 transition 完成后再读取。',
    },
    {
      title: '把受控输入状态放进 transition',
      bad: '在 onChange 里用 startTransition 设置 input value，导致输入延迟。',
      good: '输入状态同步更新；只有依赖输入结果的过滤/搜索才放进 transition。',
    },
    {
      title: '在 transition 中执行同步副作用',
      bad: '在 startTransition 里直接操作 DOM 或调用 alert。',
      good: '副作用放在 useEffect 或事件回调中同步执行。',
    },
  ],
};

export const principleData = {
  intro:
    '要理解 useTransition，必须先理解 React 18 的并发渲染模型。它由三个核心概念支撑：并发更新、时间切片和 Lane 优先级模型。',
  points: [
    {
      title: '并发更新（Concurrent Updates）',
      content:
        'React 18 之前，一次渲染一旦开始就必须完成，无法中断。React 18 引入了并发渲染，允许 React 在执行低优先级更新时，暂停当前工作去处理更高优先级的更新，然后恢复或丢弃之前的工作。',
    },
    {
      title: '时间切片（Time Slicing）',
      content:
        'React 把一次长渲染拆分成多个小任务（通常约 5ms），每个切片执行完后会检查是否有更高优先级任务。如果有，就暂停当前工作；如果没有，就继续下一个切片。这样主线程不会被长时间占用。',
    },
    {
      title: 'Lane 模型',
      content:
        'React 用 Lane（二进制位）表示更新的优先级。InputDiscreteLane（输入事件）优先级高于 TransitionLane。startTransition 会把更新标记到 TransitionLane，因此输入事件可以插队，旧的 transition 会被丢弃并基于最新状态重新调度。',
    },
  ],
  timelineSteps: [
    { label: '输入事件发生', desc: 'InputDiscreteLane 优先级更高，准备插队' },
    { label: 'transition 渲染被暂停', desc: 'React 保存当前进度（workInProgress 树）' },
    { label: '处理输入事件', desc: '高优先级更新先完成渲染和提交' },
    { label: '丢弃旧 transition', desc: 'Lane 模型发现旧 transition 基于过期状态' },
    { label: '重新调度 transition', desc: '基于最新状态开始新的 transition 渲染' },
  ],
};

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
];
