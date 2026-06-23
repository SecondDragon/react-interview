# Role

你是一个精通 React 和浏览器底层渲染原理的高级前端架构师。擅长编写高性能、可复用、无第三方依赖的底层 UI 组件。

# Task

请使用 React + TypeScript 从零手写一个高性能的「动态高度虚拟列表」组件（VirtualList），架构思想请参考 `react-virtuoso`。不要使用任何第三方虚拟列表库。

# Core Features (核心需求)

1. **不定高渲染 (Dynamic Height)**：绝对不能要求传入固定的 `itemHeight`。列表项的高度必须由其内容撑开（包含异步加载的图片或长文本）。
2. **虚拟化 (Virtualization)**：在大数据量下，只渲染可视区域（Viewport）及上下预渲染区域（Overscan）的 DOM 节点。
3. **无限滚动 (Infinite Scroll)**：支持触底加载更多。
4. **泛型支持 (Generics)**：组件需支持泛型数据源 `data: T[]`。

# Technical Constraints & Implementation Guide (技术实现指引)

为了达到上述要求，你必须采用以下架构：

### 1. 动态尺寸引擎 (核心重点)

- 采用“先渲染 -> 后测量 -> 动态纠偏”的策略。
- 维护一个内部的状态/Ref来记录每个 item 的尺寸信息：`positions` (包含 index, top, height, bottom)。
- 对每一个渲染在 DOM 上的 Item 容器使用 `ResizeObserver` 监听。当尺寸发生变化时，立即更新 `positions` 缓存，并重新计算后续 Item 的绝对定位（transform/top）以及整个内部占位容器 (Spacer)的总高度。
- 针对未渲染、未测量的 Item，使用 `defaultItemHeight` 作为预估高度进行排版。

### 2. 渲染引擎

- 外层容器 (Scroll Container)：负责监听 `onScroll` 事件，具有 `overflow-y: auto`。
- 内部占位容器 (Spacer)：一个空的 `div`，高度设为所有 Item 高度之和（真实高度+预估高度），用于撑开滚动条。
- 列表容器：采用绝对定位。
- 采用空间分桶 (Binning) 页面被切成了 800px（可配置） 一个的房间。卡片算出实际的坐标后，会“登记”在它经过的房号下。
- 根据当前的 `scrollTop` 和视口高度 `clientHeight`，以及Overscan 来算出预渲染的房间号，在从中拿到要渲染的卡片数据。

### 3. 无限加载处理

- 暴露 `onEndReached` (触底回调), `hasMore` (是否有更多数据), `isLoading` (是否正在加载) 这三个 props。
- 采用内部 Ref (`isLoadingRef`, `hasMoreRef`) 结合 State 的双状态设计，防止用户滑动过快导致并发重复发起网络请求。
- 可以在列表底部渲染一个 Sentinel (哨兵节点)，通过 `IntersectionObserver` 或滚动余量计算来触发 `onEndReached`。

# Output Requirements

1. 给出完整的 TypeScript 接口定义 (`VirtualListProps`)。
2. 给出完整的组件代码（可以拆分为多个内部 Hook 方便阅读，如 `useSizeMeasurer`, `useVirtualization` 等）。
3. 代码中必须包含详细的中文注释，特别是解释 `ResizeObserver` 是如何更新高度映射表的。
4. 给出一个使用该组件实现“图文列表 + 触底加载”的使用示例。
