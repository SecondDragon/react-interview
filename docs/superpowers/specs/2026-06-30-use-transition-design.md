# useTransition 学习页面设计文档

## 目标

在 `src/pages/react-api/useTransition/` 下新建一个完整的 React API 学习页面，系统讲解 `useTransition` 的所有核心能力：

1. 基础用法：把非紧急状态更新包裹进 `startTransition`
2. `isPending`：给过渡状态加 loading / 骨架屏反馈
3. 与 `useDeferredValue` 的对比和组合使用
4. 错误用法与边界
5. 实现原理：React 18 并发更新、时间切片、Lane 模型

页面需要先解释原理，再解释用法，并给出可交互案例。实现原理章节必须包含可视化案例，并在案例中详细讲解每一步对应原理中的哪些操作。

## 目录结构

```
src/pages/react-api/useTransition/
├── index.tsx                    # 主页面：总览 + 组合章节
├── data.ts                      # 纯数据：文案、原理、对比表、面试题
├── LiveDemo.tsx                 # 统一交互演示组件（按 type 分发）
├── chapters/
│   ├── BasicTransition.tsx      # 章节一：基础用法（搜索、Tab 切换）
│   ├── PendingState.tsx         # 章节二：isPending 状态反馈
│   ├── DeferredValue.tsx        # 章节三：与 useDeferredValue 对比与组合
│   ├── Pitfalls.tsx             # 章节四：错误用法与边界
│   └── Principle.tsx            # 章节五：实现原理（并发更新、时间切片、Lane 模型）
└── demos/
    ├── search.bad.tsx
    ├── search.good.tsx
    ├── tab.bad.tsx
    ├── tab.good.tsx
    ├── pending-badge.bad.tsx
    ├── pending-badge.good.tsx
    ├── pending-skeleton.bad.tsx
    ├── pending-skeleton.good.tsx
    ├── deferred.bad.tsx
    ├── deferred.good.tsx
    ├── pitfall-sync-read.bad.tsx
    ├── pitfall-sync-read.good.tsx
    └── principle-visual.tsx
```

## 路由与菜单

在 `src/router/config.tsx` 的 `React API 学习` 菜单下新增：

```typescript
{
  path: '/dashboard/react-api/use-transition',
  label: 'useTransition',
  element: <UseTransitionPage />,
}
```

## 章节内容设计

### 章节一：基础用法（BasicTransition）

核心目标：理解 `startTransition` 最基本的用法——把“非紧急更新”标记出来。

#### 案例 1：搜索框过滤

- Bad：输入时同步 `setSearchQuery`，下方 HeavyList 阻塞输入。
- Good：`startTransition(() => setSearchQuery(val))`，输入保持流畅。
- Live Demo：开关切换“同步模式 / Transition 模式”，输入时感受差异。

#### 案例 2：Tab 切换

- Bad：点击 Tab 同步切换高亮 + 渲染复杂内容，点击动画卡顿。
- Good：高亮状态同步更新，内容渲染用 transition 包裹。
- Live Demo：两个 Tab，一个内容简单、一个内容沉重，对比切换流畅度。

### 章节二：isPending 状态反馈（PendingState）

核心目标：理解 `useTransition` 返回的 `isPending` 能做什么。

#### 案例 1：Pending 徽标

- Bad：用户点击后没有任何反馈，怀疑是否点击成功。
- Good：用 `isPending` 在按钮上显示“加载中”徽标。
- Live Demo：按钮触发一个沉重的状态更新，观察徽标变化。

#### 案例 2：骨架屏

- Bad：直接白屏等待重渲染完成。
- Good：`isPending` 时显示骨架屏，渲染完成后替换真实内容。
- Live Demo：切换复杂视图时，同步模式白屏 vs transition 模式骨架屏。

### 章节三：与 useDeferredValue 对比与组合（DeferredValue）

核心目标：讲清 `useTransition` 和 `useDeferredValue` 的关系、区别、适用场景，以及组合用法。

- 原理对比：
  - `useTransition`：你主动告诉 React“这个更新不紧急”。
  - `useDeferredValue`：你告诉 React“这个值可以延迟使用”。
- 关系：`useDeferredValue` 内部也是基于 transition 实现。
- 适用场景：
  - `useTransition`：适合“事件处理函数中触发状态更新”。
  - `useDeferredValue`：适合“从 props 派生出一个可以延迟的值”。
- 组合用法：父组件用 `useTransition` 控制提交，子组件用 `useDeferredValue` 延迟渲染。
- Live Demo：一个搜索页，父组件控制搜索词提交，子组件用 `deferredQuery` 延迟渲染列表。

### 章节四：错误用法与边界（Pitfalls）

核心目标：明确什么不能放进 transition，以及常见踩坑。

- 坑 1：在 transition 中同步读取 DOM（如 `getBoundingClientRect`），读到的是旧值。
- 坑 2：把用户输入的受控组件状态放进 transition，导致输入不跟手。
- 坑 3：在 transition 中调用会触发同步副作用的代码。
- Live Demo：一个“读取元素高度”的案例，对比同步读取和用 `useEffect` 读取的差异。

### 章节五：实现原理（Principle）

核心目标：用可视化案例把 React 18 并发更新、时间切片、Lane 模型串起来。

#### 原理要点

1. React 18 之前是“不可中断的同步渲染”。
2. React 18 引入并发渲染，更新可以被打断、恢复、丢弃。
3. `startTransition` 把更新标记为 `TransitionLane`，优先级低于 `InputDiscreteLane`（输入事件）。
4. 时间切片：React 把长任务切成 5ms 左右的小片，每片之间检查是否有更高优先级任务。
5. 如果高优先级任务进来，React 会丢弃当前 transition 的渲染，重新基于最新状态开始。

#### 可视化案例设计

一个“任务时间线”动画：

- 横轴是时间。
- 橙色块代表紧急更新（输入事件）。
- 蓝色块代表 transition 更新。
- 展示“输入事件插入 → transition 被打断 → 重新调度 transition”的过程。

旁边用文字标注每一步对应 React 的什么操作：

- “输入事件发生” → `InputDiscreteLane` 优先级更高。
- “transition 渲染被暂停” → React 保存当前进度。
- “处理输入事件” → 高优先级更新先渲染。
- “丢弃旧 transition，基于新状态重新渲染” → Lane 模型保证一致性。

## 数据与代码分离

- `data.ts`：存放所有章节标题、原理文案、对比表、面试题。
- `demos/*.bad.tsx` / `*.good.tsx`：只放用于 `?raw` 提取的代码，不参与编译执行。
- `LiveDemo.tsx`：统一渲染所有交互案例，通过 `type` prop 区分。
- 章节组件：只负责组合展示，不包含大段字符串。

## 样式与交互规范

- 页面宽度自适应，不设置 `max-width`。
- 每个章节用 `Card` 包裹，内部再用 `Collapse` 或嵌套 `Card` 组织。
- 代码对比统一使用 `CodeDiff` 组件。
- 所有注释和文档使用中文。
