# 浏览器缓存机制 - 设计文档

## 1. 项目概述

**目标**：在 `react-interview` 主应用的「网络请求专题」下新增「浏览器缓存机制」子专题，帮助用户在面试中能够系统、完整地回答浏览器缓存相关问题。

**范围**：本次实现一个单专题，包含 5 个子页面，位于 `/dashboard/network/browser-cache/**` 路径下：

1. `overview` — 缓存分层与整体概览
2. `http-cache` — HTTP 强缓存与协商缓存
3. `storage-cache` — 内存缓存与磁盘缓存
4. `service-worker-cache` — Service Worker 与 Cache API
5. `cache-strategy` — 工程实践与面试高频考点

---

## 2. 目录结构

```text
src/pages/network/browser-cache/
├── overview/
│   ├── index.tsx
│   ├── content.mdx
│   ├── data.ts
│   ├── diagrams/
│   │   └── cache-layers.mmd          # 浏览器缓存分层流程图
│   └── CacheLayersDemo.tsx           # 分层点击交互组件
├── http-cache/
│   ├── index.tsx
│   ├── content.mdx
│   ├── data.ts
│   ├── LiveDemo.tsx                  # 缓存命中模拟器
│   ├── demos/
│   │   ├── cache-headers.bad.conf    # 反面：错误/缺失的缓存响应头
│   │   ├── cache-headers.good.conf   # 正面：合理的 Nginx 缓存响应头
│   │   ├── etag-implementation.bad.js
│   │   └── etag-implementation.good.js
│   └── diagrams/
│       ├── http-cache-flow.mmd       # 完整 HTTP 缓存决策流程
│       ├── strong-vs-negotiate.mmd   # 强缓存 vs 协商缓存
│       └── etag-vs-last-modified.mmd # ETag vs Last-Modified
├── storage-cache/
│   ├── index.tsx
│   ├── content.mdx
│   ├── data.ts
│   ├── LiveDemo.tsx                  # 内存/磁盘缓存分配模拟
│   ├── demos/
│   │   ├── base64-image.bad.tsx      # 反面：滥用 base64 撑爆内存缓存
│   │   ├── base64-image.good.tsx     # 正面：按场景选择外链资源
│   │   ├── storage-quota.bad.js
│   │   └── storage-quota.good.js
│   └── diagrams/
│       └── memory-disk-flow.mmd      # 请求先查内存再查磁盘流程
├── service-worker-cache/
│   ├── index.tsx
│   ├── content.mdx
│   ├── data.ts
│   ├── LiveDemo.tsx                  # SW 缓存策略选择器
│   ├── demos/
│   │   ├── sw-register.bad.js
│   │   ├── sw-register.good.js
│   │   ├── sw-cache-strategy.bad.js
│   │   └── sw-cache-strategy.good.js
│   └── diagrams/
│       └── sw-lifecycle.mmd          # Service Worker 生命周期
└── cache-strategy/
    ├── index.tsx
    ├── content.mdx
    ├── data.ts
    ├── LiveDemo.tsx                  # 项目级缓存策略配置器
    ├── demos/
    │   ├── webpack-cache.bad.ts
    │   ├── webpack-cache.good.ts
    │   ├── runtime-cache.bad.tsx
    │   └── runtime-cache.good.tsx
    └── diagrams/
        └── strategy-decision.mmd     # 资源类型与缓存策略决策树
```

---

## 3. 路由配置

在 `src/router/config.tsx` 的 `/dashboard/network` 节点下新增子菜单：

```tsx
const BrowserCacheOverview = lazy(() => import('../pages/network/browser-cache/overview/index'));
const HttpCachePage = lazy(() => import('../pages/network/browser-cache/http-cache/index'));
const StorageCachePage = lazy(() => import('../pages/network/browser-cache/storage-cache/index'));
const ServiceWorkerCachePage = lazy(() => import('../pages/network/browser-cache/service-worker-cache/index'));
const CacheStrategyPage = lazy(() => import('../pages/network/browser-cache/cache-strategy/index'));

{
  path: '/dashboard/network/browser-cache',
  label: '浏览器缓存机制',
  icon: <GlobalOutlined />,
  children: [
    { path: '/dashboard/network/browser-cache/overview', label: '缓存分层概览', element: <BrowserCacheOverview /> },
    { path: '/dashboard/network/browser-cache/http-cache', label: 'HTTP 缓存', element: <HttpCachePage /> },
    { path: '/dashboard/network/browser-cache/storage-cache', label: '内存与磁盘缓存', element: <StorageCachePage /> },
    { path: '/dashboard/network/browser-cache/service-worker-cache', label: 'Service Worker 缓存', element: <ServiceWorkerCachePage /> },
    { path: '/dashboard/network/browser-cache/cache-strategy', label: '工程实践与面试考点', element: <CacheStrategyPage /> },
  ],
}
```

---

## 4. 页面内容设计

### 4.1 缓存分层概览（overview）

**教学目标**：让用户一眼看出浏览器内部有哪些缓存层、各自的作用域和优先级。

内容要点：

- 为什么需要缓存：减少网络请求、降低服务器压力、加速页面渲染、支持离线体验。
- 浏览器缓存分层（按优先级从高到低）：
  1. **Service Worker Cache** — 离线可用、完全可控。
  2. **Memory Cache** — 快、容量小、页面关闭即释放。
  3. **Disk Cache** — 慢、容量大、持久化。
  4. **Push Cache** — HTTP/2 Server Push 临时缓存，会话期内有效。
- 各层对比：速度、容量、生命周期、命中条件。
- 互动：`CacheLayersDemo` 组件，点击某一层展示详细说明与典型资源示例。

### 4.2 HTTP 缓存（http-cache）

**教学目标**：讲清楚强缓存和协商缓存的触发条件、响应头含义、刷新行为差异。

内容要点：

- **强缓存**：
  - `Expires`（HTTP/1.0，绝对时间，受本地时钟影响）。
  - `Cache-Control`（HTTP/1.1，优先级更高）：
    - `max-age`、`s-maxage`
    - `no-cache`（仍需协商）、`no-store`（完全不缓存）
    - `public`、`private`
    - `must-revalidate`、`immutable`
- **协商缓存**：
  - `Last-Modified` / `If-Modified-Since`：秒级精度、可能被修改但内容未变。
  - `ETag` / `If-None-Match`：优先级更高，内容指纹。
  - `304 Not Modified` 与 `200 (from disk cache)` / `200 (from memory cache)` 的区别。
- **浏览器刷新行为**：
  - 地址栏回车 / 跳转：按正常缓存策略。
  - F5 / 点击刷新：强缓存失效，协商缓存仍可能命中。
  - Ctrl+F5 / Cmd+Shift+R：强制禁用缓存，重新请求。
- **CodeDiff**：
  - 错误 vs 正确的 Nginx/Node 响应头配置。
  - 错误 vs 正确的 ETag 生成逻辑。
- **LiveDemo**：缓存命中模拟器
  - 可选择响应头组合（Cache-Control、ETag、Last-Modified）。
  - 可选择用户操作（首次访问、再次访问、F5、Ctrl+F5）。
  - 实时输出：是否命中缓存、状态码、来自哪一层缓存、是否发请求。

### 4.3 内存与磁盘缓存（storage-cache）

**教学目标**：理解浏览器如何根据资源类型、大小、使用频率决定放在内存还是磁盘。

内容要点：

- **Memory Cache**：
  - 来源：preloader 预加载、当前页面已解析的 base64 资源、高频脚本。
  - 特点：读取极快、容量小、tab 关闭即清空。
- **Disk Cache**：
  - 来源：大文件、图片、字体、非高频脚本。
  - 特点：容量大、持久化、读取较慢。
- **资源类型倾向**：
  - base64 小图、主文档 CSS/JS → 内存。
  - 大图、视频、字体、低频资源 → 磁盘。
- **缓存驱逐策略**：LRU、容量上限、隐私模式限制。
- **Storage Quota**：
  - `navigator.storage.estimate()`。
  - IndexedDB、Cache API 共用配额。
- **CodeDiff**：
  - 滥用 base64 导致内存缓存压力。
  - 合理的资源切分与懒加载。
- **LiveDemo**：
  - 拖动资源大小滑块，观察进入 Memory / Disk / 不被缓存的阈值。
  - 显示模拟的内存/磁盘容量条。

### 4.4 Service Worker 缓存（service-worker-cache）

**教学目标**：掌握 SW 生命周期、Cache API 与常见缓存策略。

内容要点：

- **Service Worker 生命周期**：注册 → install → waiting → activate → fetch。
- **Cache API**：`caches.open()`、`cache.match()`、`cache.put()`、`cache.delete()`。
- **缓存策略**：
  - `cache-first`：优先缓存，离线可用，更新滞后。
  - `network-first`：优先网络，适合频繁更新的 API。
  - `stale-while-revalidate`：先返回缓存同时后台更新，兼顾速度与新鲜度。
  - `network-only` / `cache-only`：特殊场景。
- **更新与清理**：
  - `skipWaiting` + `clients.claim`。
  - 缓存版本控制（按构建 hash 分 `cache-v1`、`cache-v2`）。
  - activate 阶段清理旧缓存。
- **CodeDiff**：
  - 错误：SW 不版本化、旧缓存永远不清理。
  - 正确：按构建版本管理缓存、激活后清理旧版本。
- **LiveDemo**：策略选择器
  - 选择策略 + 网络状态（在线/离线）+ 缓存是否命中。
  - 显示请求流向与响应来源。

### 4.5 工程实践与面试考点（cache-strategy）

**教学目标**：把前面知识串成可落地的工程方案和面试回答。

内容要点：

- **静态资源缓存**：
  - 文件名加 hash：`main.a1b2c3.js`。
  - `Cache-Control: public, max-age=31536000, immutable`。
  - HTML 文件 `no-cache` 或短 max-age，保证更新及时生效。
- **API 请求缓存**：
  - GET 可适度缓存；POST/PUT/DELETE 不缓存。
  - 对实时性要求不高的数据使用 `stale-while-revalidate`。
- **缓存失效方案**：
  - hash 文件名。
  - query string cache busting。
  - Service Worker 主动清理。
- **面试高频问答**：
  - 强缓存和协商缓存的区别？
  - 为什么有了 Last-Modified 还需要 ETag？
  - F5 和 Ctrl+F5 对缓存的影响？
  - 浏览器缓存和 Service Worker 缓存的优先级？
  - 如何设计一个可持续更新的前端缓存方案？
- **CodeDiff**：
  - Webpack/Vite 缓存配置 bad vs good。
  - 运行时 fetch 缓存控制 bad vs good。
- **LiveDemo**：策略配置器
  - 选择资源类型（HTML/CSS/JS/API/图片/字体）。
  - 自动生成推荐的 Cache-Control、文件命名、是否走 SW 等建议。

---

## 5. 组件与数据设计

### 5.1 共用组件

- `CodeDiff`：所有 Bad/Good 代码对比统一使用 `CodeDiff`，源码通过 `?raw` 从 `demos/` 目录导入。
- `MermaidViewer`：所有流程图独立为 `.mmd` 文件，统一通过 `MermaidViewer` 渲染。

### 5.2 页面级组件

- `overview/CacheLayersDemo.tsx`：点击不同缓存层显示详情。
- `http-cache/LiveDemo.tsx`：缓存命中模拟器。
- `storage-cache/LiveDemo.tsx`：内存/磁盘缓存分配模拟。
- `service-worker-cache/LiveDemo.tsx`：SW 缓存策略选择器。
- `cache-strategy/LiveDemo.tsx`：项目级缓存策略配置器。

### 5.3 data.ts 职责

每个 `data.ts` 只存放结构化数据：

- 对比表格（缓存层对比、强缓存 vs 协商缓存、策略对比等）。
- Live Demo 的初始状态、选项、配置。
- 面试高频问答列表。

禁止在 `data.ts` 中写大段概念性文字，概念解释全部放到 `content.mdx`。

### 5.4 MDX 编写规范

- `content.mdx` 中只写 Markdown 文本、import 组件、调用组件。
- 禁止在 `.mdx` 中写 `.map()`、条件渲染、解构赋值、运行时语句。
- Ant Design 组件使用完整路径，例如 `Typography.Title`、`Card.Meta`。

---

## 6. 代码组织规范

### 6.1 源码提取规范

```mdx
import cacheHeadersBad from './demos/cache-headers.bad.conf?raw';
import cacheHeadersGood from './demos/cache-headers.good.conf?raw';

<CodeDiff
  oldValue={cacheHeadersBad}
  newValue={cacheHeadersGood}
  leftTitle="❌ 反面教材"
  rightTitle="✅ 最佳实践"
  type="error"
  hideDiffMarkers={true}
/>
```

- 反面教材使用 `.bad.{ext}`，最佳实践使用 `.good.{ext}`。
- `.bad.*` 文件需被 TypeScript 排除，避免编译错误。

### 6.2 Mermaid 图表规范

- 图表源文件统一放在各页面目录下的 `diagrams/` 子目录。
- 文件名使用 kebab-case，与内容对应。
- 禁止在 `.mdx` 中直接写大段 Mermaid 字符串。

### 6.3 样式规范

- 优先使用 Ant Design 组件与现有样式系统。
- 自定义样式使用 `style` prop 或 styled-components；styled-components 变量放在组件文件末尾。
- 所有注释与文档使用中文。

---

## 7. 实现顺序

1. 创建目录结构 `src/pages/network/browser-cache/**`。
2. 实现公共依赖：每个子页面的 `index.tsx`、`content.mdx`、`data.ts` 骨架。
3. 按顺序填充各页面：
   1. `overview`：缓存分层图 + 交互 Demo。
   2. `http-cache`：强缓存/协商缓存正文 + 缓存命中模拟器。
   3. `storage-cache`：内存/磁盘缓存正文 + 分配模拟器。
   4. `service-worker-cache`：SW 生命周期与策略 + 策略选择器。
   5. `cache-strategy`：工程实践 + 面试问答 + 策略配置器。
4. 在 `src/router/config.tsx` 中注册路由。
5. 运行类型检查与 lint，确保无错误。
6. 本地验证路由可访问、Live Demo 交互正常。

---

## 8. 测试与验证

- `npm run typecheck` 通过。
- `npm run lint` 通过。
- 手动检查 5 个新路由是否能在左侧菜单正确显示并正常加载。
- 检查所有 `CodeDiff` 组件是否正常渲染代码对比。
- 检查所有 `MermaidViewer` 图表是否正常渲染。
- 检查所有 Live Demo 交互状态是否正确。

---

## 9. 注意事项

- 所有概念解释、注释、文档均使用中文。
- 每个子页面保持独立，便于后续单独扩展。
- Live Demo 以教学为主，不要过度模拟浏览器内部实现细节，避免误导。
- 确保新增路由与 qiankun 微应用路由无冲突。
