# qiankun 专题 — 概览 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在主应用 react-interview 的 `qiankun 专题` 下新增 `概览` 知识体系页面，核心话题是 qiankun vs iframe 的全面对比（10 个维度），包含场景决策树 Live Demo。

**Architecture:** 采用 `content.mdx` 单文件结构（与 `styled-components-cssom` 一致），`data.ts` 存放表格数据，`LiveDemo.tsx` 作为对比决策器，`demos/` 存放代码示例通过 `?raw` 引入。路由注册在所有组件创建完成后最后进行。

**Tech Stack:** React 18 + TypeScript + Vite + Ant Design + `react-diff-viewer-continued`（CodeDiff 组件）+ 项目已有 `MermaidViewer` 组件。

---

## 文件结构

```text
src/pages/qiankun/overview/
  index.tsx               # 页面入口，仅渲染 <Content />
  content.mdx             # 所有章节内容（4 个大节 + 10 个维度）
  data.ts                 # 对比表格数据、决策树配置、场景对照表
  LiveDemo.tsx            # 对比决策器互动组件
  demos/
    iframe-basic.html
    iframe-communication.html
    iframe-auto-height.html
    iframe-memory-leak.html
    qiankun-register.tsx
    qiankun-communication.tsx
    qiankun-style-sharing.tsx
src/router/config.tsx     # 最后一步才注册新路由
```

---

## Task 1: 创建目录结构与数据文件

**Files:**
- Create: `src/pages/qiankun/overview/data.ts`
- Create directories: `src/pages/qiankun/overview/demos`

**说明：** 数据文件存放所有对比表格数据、决策树配置和场景对照表数据。

- [ ] **Step 1: 创建目录结构**

Run:

```bash
mkdir -p src/pages/qiankun/overview/demos
```

- [ ] **Step 2: 编写 data.ts**

Create: `src/pages/qiankun/overview/data.ts`

```typescript
import { ReactNode } from 'react';

export const comparisonData = [
  {
    id: 'architecture',
    title: '2.1 架构本质',
    summary: 'qiankun 在同一 Document 下运行多个 SPA；iframe 是独立的完整浏览器上下文。',
    table: {
      columns: [
        { title: '对比项', dataIndex: 'item', key: 'item' },
        { title: 'qiankun', dataIndex: 'qiankun', key: 'qiankun' },
        { title: 'iframe', dataIndex: 'iframe', key: 'iframe' },
      ],
      dataSource: [
        { key: '1', item: '浏览器上下文', qiankun: '同一 Document，共享 DOM Tree', iframe: '独立 Document，独立 Window' },
        { key: '2', item: '渲染方式', qiankun: '子应用元素直接挂到主应用 DOM 上', iframe: '&lt;iframe&gt; 内独立渲染' },
        { key: '3', item: 'URL 归属', qiankun: '主应用地址栏', iframe: 'iframe 有自己独立的地址栏（不可见）' },
      ],
    },
    badDemo: 'iframe-basic.html',
    goodDemo: 'qiankun-register.tsx',
    badDesc: 'iframe 嵌入：整个 DOM 是黑盒',
    goodDesc: 'qiankun registerMicroApps：子应用组件直接嵌入主应用布局',
  },
  {
    id: 'router',
    title: '2.2 路由与 URL 体验',
    summary: 'qiankun 共享主应用路由，iframe 内部路由与主应用完全隔离。',
    table: {
      columns: [
        { title: '对比项', dataIndex: 'item', key: 'item' },
        { title: 'qiankun', dataIndex: 'qiankun', key: 'qiankun' },
        { title: 'iframe', dataIndex: 'iframe', key: 'iframe' },
      ],
      dataSource: [
        { key: '1', item: '浏览器地址', qiankun: '共享主应用地址，可通过 activeRule 做路径映射', iframe: 'iframe 内部路由变化不改变主应用地址栏' },
        { key: '2', item: '前进后退', qiankun: '子应用内部路由切换在主应用 history 中，浏览器前进后退正常', iframe: 'iframe 内部 history 操作不会触发主应用 popstate' },
        { key: '3', item: '刷新行为', qiankun: '刷新主应用，qiankun 自动重新激活子应用', iframe: '刷新主应用，iframe 的 src 不变，但 iframe 内状态全丢' },
        { key: '4', item: '书签', qiankun: '可以收藏子应用的具体页面 URL', iframe: '只能收藏主应用 URL' },
      ],
    },
    badDemo: 'iframe-basic.html',
    goodDemo: 'qiankun-register.tsx',
    badDesc: 'iframe 书签分享：实际是主应用路径，iframe 需额外同步',
    goodDesc: 'qiankun：子应用路由是主应用路由的一部分',
  },
  {
    id: 'communication',
    title: '2.3 应用间通信',
    summary: 'qiankun 同进程直接通信，iframe 需要异步 postMessage。',
    table: {
      columns: [
        { title: '对比项', dataIndex: 'item', key: 'item' },
        { title: 'qiankun', dataIndex: 'qiankun', key: 'qiankun' },
        { title: 'iframe', dataIndex: 'iframe', key: 'iframe' },
      ],
      dataSource: [
        { key: '1', item: '通信机制', qiankun: 'props + initGlobalState / onGlobalStateChange', iframe: 'postMessage + addEventListener' },
        { key: '2', item: '数据类型', qiankun: '引用传递，对象直接共享', iframe: '结构化克隆算法（structured clone），函数/Proxy 等无法传递' },
        { key: '3', item: '通信延迟', qiankun: '同进程同步调用', iframe: '异步消息队列' },
        { key: '4', item: '调试难度', qiankun: '断点同进程，容易跟踪', iframe: '需要两边 DevTools，消息序列化后难以追溯' },
      ],
    },
    badDemo: 'iframe-communication.html',
    goodDemo: 'qiankun-communication.tsx',
    badDesc: 'postMessage 传一个回调函数 — 传不过去，报错',
    goodDesc: 'props.onGlobalStateChange 直接订阅状态变化',
  },
  {
    id: 'dom-layout',
    title: '2.4 DOM 与布局集成',
    summary: 'qiankun 元素直接融入主应用 DOM 树；iframe 被固定宽高窗口限制。',
    table: {
      columns: [
        { title: '对比项', dataIndex: 'item', key: 'item' },
        { title: 'qiankun', dataIndex: 'qiankun', key: 'qiankun' },
        { title: 'iframe', dataIndex: 'iframe', key: 'iframe' },
      ],
      dataSource: [
        { key: '1', item: '布局方式', qiankun: '子应用元素直接在主应用 DOM 树中，可共享 CSS 变量、主题', iframe: '&lt;iframe&gt; 是一个固定宽高的独立窗口' },
        { key: '2', item: '自适应', qiankun: '子应用可以响应主应用容器尺寸变化，无需额外逻辑', iframe: 'iframe 高度需要手动计算并通过 postMessage 同步' },
        { key: '3', item: '弹窗/浮层', qiankun: '子应用弹窗可以直接覆盖到主应用上（z-index 可调）', iframe: 'iframe 内的弹窗被限制在 iframe 边框内' },
        { key: '4', item: '加载体验', qiankun: '子应用可以渐进式渲染', iframe: 'iframe 白屏，直到子应用完全加载后才显示' },
      ],
    },
    badDemo: 'iframe-auto-height.html',
    goodDemo: 'qiankun-register.tsx',
    badDesc: 'iframe 自适应高度：需要 postMessage 手动通知主应用调整高度',
    goodDesc: 'qiankun：子应用 render({ container }) 直接挂载到指定 DOM 节点',
  },
  {
    id: 'style-isolation',
    title: '2.5 样式隔离',
    summary: 'qiankun 样式隔离有坑（styled-components 丢失案例），iframe 天然完全隔离。',
    table: {
      columns: [
        { title: '对比项', dataIndex: 'item', key: 'item' },
        { title: 'qiankun', dataIndex: 'qiankun', key: 'qiankun' },
        { title: 'iframe', dataIndex: 'iframe', key: 'iframe' },
      ],
      dataSource: [
        { key: '1', item: '隔离程度', qiankun: '实验性、有坑（styled-components 案例就是典型）', iframe: '天然完全隔离，不会互相影响' },
        { key: '2', item: '隔离方式', qiankun: 'experimentalStyleIsolation + 沙箱 DOM 劫持', iframe: 'Shadow DOM 天然隔离' },
        { key: '3', item: '样式共享', qiankun: '子应用可以使用主应用的 Ant Design 主题变量', iframe: '需要额外加载主应用主题文件' },
        { key: '4', item: '适用性', qiankun: '需要处理 styled-components、CSS-in-JS 等特殊情况', iframe: '任何前端框架都不会有样式冲突' },
      ],
    },
    badDemo: 'iframe-basic.html',
    goodDemo: 'qiankun-style-sharing.tsx',
    badDesc: 'iframe 无法复用主应用 Ant Design 主题',
    goodDesc: 'qiankun 主子应用共享 Ant Design ConfigProvider 主题',
  },
  {
    id: 'js-security',
    title: '2.6 JS 隔离与安全',
    summary: 'qiankun 用 Proxy 模拟隔离，有逃逸风险；iframe 是浏览器进程级隔离。',
    table: {
      columns: [
        { title: '对比项', dataIndex: 'item', key: 'item' },
        { title: 'qiankun', dataIndex: 'qiankun', key: 'qiankun' },
        { title: 'iframe', dataIndex: 'iframe', key: 'iframe' },
      ],
      dataSource: [
        { key: '1', item: '隔离方式', qiankun: 'Proxy 沙箱（proxySandbox），拦截 window 操作', iframe: '浏览器进程级隔离' },
        { key: '2', item: '安全性', qiankun: '有沙箱逃逸风险（如 Object.prototype 污染）', iframe: '天然沙箱，互不影响' },
        { key: '3', item: '全局变量', qiankun: '沙箱模拟隔离，mount 时创建，unmount 时回收', iframe: '完全独立不共享' },
        { key: '4', item: '安全策略', qiankun: '需要子应用配合 qiankun 生命周期', iframe: '浏览器同源策略（CSP）管理' },
      ],
    },
    badDemo: null,
    goodDemo: null,
    badDesc: null,
    goodDesc: null,
  },
  {
    id: 'performance',
    title: '2.7 资源加载与性能',
    summary: 'qiankun 可共享主应用资源并支持预加载；iframe 每个实例独立重复加载。',
    table: {
      columns: [
        { title: '对比项', dataIndex: 'item', key: 'item' },
        { title: 'qiankun', dataIndex: 'qiankun', key: 'qiankun' },
        { title: 'iframe', dataIndex: 'iframe', key: 'iframe' },
      ],
      dataSource: [
        { key: '1', item: '基础库加载', qiankun: '可共享，主应用已加载的 React/Vue/AntD 子应用复用', iframe: '每个 iframe 独立加载，重新下载' },
        { key: '2', item: '预加载', qiankun: '支持 prefetchApps，空闲时预加载子应用资源', iframe: '不支持' },
        { key: '3', item: '连接数', qiankun: '与主应用共享 TCP 连接（同域时）', iframe: '独立建立连接' },
        { key: '4', item: '首屏速度', qiankun: '第一次加载子应用时需要请求 HTML Entry 和 JS', iframe: 'iframe 加载完整 HTML 文档，首屏更慢' },
        { key: '5', item: '内存占用', qiankun: '子应用与主应用共享内存空间', iframe: '每个 iframe 是独立进程（浏览器多进程架构）' },
      ],
    },
    badDemo: null,
    goodDemo: null,
    badDesc: null,
    goodDesc: null,
  },
  {
    id: 'seo',
    title: '2.8 SEO 与首屏',
    summary: 'qiankun 在同一 Document 中，SEO 友好；iframe 内容搜索引擎不可见。',
    table: {
      columns: [
        { title: '对比项', dataIndex: 'item', key: 'item' },
        { title: 'qiankun', dataIndex: 'qiankun', key: 'qiankun' },
        { title: 'iframe', dataIndex: 'iframe', key: 'iframe' },
      ],
      dataSource: [
        { key: '1', item: '搜索引擎', qiankun: '子应用内容与主应用在同一 Document 中，可被爬虫索引', iframe: '搜索引擎不抓取 iframe 内容' },
        { key: '2', item: 'SSR/SSG 友好', qiankun: '可以配合 SSR，子应用首屏 HTML 由服务端渲染', iframe: '子应用 SSR 对主应用无意义' },
        { key: '3', item: '首屏白屏', qiankun: '主应用先渲染，子应用异步加载', iframe: '主应用先渲染，iframe 独立加载，子应用页面完全白屏后才出现' },
      ],
    },
    badDemo: null,
    goodDemo: null,
    badDesc: null,
    goodDesc: null,
  },
  {
    id: 'cross-origin',
    title: '2.9 跨域能力',
    summary: 'qiankun 需要额外跨域配置；iframe 天然支持跨域加载。',
    table: {
      columns: [
        { title: '对比项', dataIndex: 'item', key: 'item' },
        { title: 'qiankun', dataIndex: 'qiankun', key: 'qiankun' },
        { title: 'iframe', dataIndex: 'iframe', key: 'iframe' },
      ],
      dataSource: [
        { key: '1', item: '跨域资源加载', qiankun: '需要主应用配置 CORS 头，或通过 nginx 反向代理', iframe: '天然支持跨域加载，src 可以是任意域名' },
        { key: '2', item: '跨域通信', qiankun: 'qiankun 本身不提供跨域功能，需要搭配 CORS', iframe: 'postMessage 天然支持跨域，W3C 标准' },
        { key: '3', item: '跨域限制', qiankun: 'fetch HTML Entry、子应用 JS/CSS 都需要 CORS', iframe: 'iframe 内的跨域请求受浏览器同源策略限制' },
      ],
    },
    badDemo: null,
    goodDemo: null,
    badDesc: null,
    goodDesc: null,
  },
  {
    id: 'dev-experience',
    title: '2.10 开发体验与调试',
    summary: 'qiankun 可独立开发热更新；iframe 需要主应用内联调。',
    table: {
      columns: [
        { title: '对比项', dataIndex: 'item', key: 'item' },
        { title: 'qiankun', dataIndex: 'qiankun', key: 'qiankun' },
        { title: 'iframe', dataIndex: 'iframe', key: 'iframe' },
      ],
      dataSource: [
        { key: '1', item: '独立开发', qiankun: '子应用可以独立运行，热更新正常', iframe: '子应用可以独立运行，热更新正常' },
        { key: '2', item: '联调', qiankun: '需要在主应用内一起跑，但有 qiankun dev mode（vite-plugin-qiankun）', iframe: '需要不断刷新主应用页面看 iframe 效果' },
        { key: '3', item: '调试', qiankun: '子应用代码在主应用 DevTools 中，断点同进程', iframe: '需要在主应用和 iframe 各自 DevTools 中切换' },
        { key: '4', item: '构建部署', qiankun: '需要配置子应用打包出口，相对路径等', iframe: '简单的静态部署即可' },
      ],
    },
    badDemo: null,
    goodDemo: null,
    badDesc: null,
    goodDesc: null,
  },
];

export const scenarioTableData = [
  { key: '1', scenario: '企业内部后台系统集成为统一平台', recommendation: 'qiankun', reason: '统一路由、统一 UI、共享登录态' },
  { key: '2', scenario: '嵌入第三方不可信的广告/插件', recommendation: 'iframe', reason: '安全隔离，沙箱不可突破' },
  { key: '3', scenario: '需要一个表格工具作为主应用功能点', recommendation: 'qiankun', reason: '无缝 UI 集成，自适应布局' },
  { key: '4', scenario: '两个完全独立的系统，只需要"使用"对方的一个页面', recommendation: 'iframe', reason: '简单，改动最小' },
  { key: '5', scenario: '需要所有子应用有独立域名', recommendation: 'qiankun + nginx 转发', reason: 'iframe 的 URL 不与主应用同步' },
  { key: '6', scenario: '对 SEO 有要求的子应用整合', recommendation: 'qiankun', reason: '同 Document，搜索引擎可爬取' },
];

export interface LiveDemoQuestion {
  key: string;
  label: string;
  description: string;
  group: 'url' | 'style' | 'security' | 'other';
}

export const liveDemoQuestions: LiveDemoQuestion[] = [
  { key: 'needUnifiedUrl', label: '需要统一路由/URL体验', description: '子应用内部路由变化是否应该反映在主应用地址栏？', group: 'url' },
  { key: 'needSeo', label: '需要 SEO', description: '子应用页面内容是否需要被搜索引擎索引？', group: 'url' },
  { key: 'needFullStyleIsolation', label: '需要完全样式隔离', description: '子应用样式必须完全不干扰主应用？', group: 'style' },
  { key: 'needStyleSharing', label: '需要共享主应用主题/样式', description: '子应用应该复用主应用的主题变量、CSS 变量？', group: 'style' },
  { key: 'needCrossOrigin', label: '需要跨域加载子应用', description: '子应用是否部署在另一个域名/IP 上？', group: 'security' },
  { key: 'isAppTrusted', label: '子应用是否可信（内部项目）', description: '子应用代码是否来自团队内部？还是第三方不可信内容？', group: 'security' },
  { key: 'needAdaptiveLayout', label: '需要自适应布局/弹窗浮层', description: '子应用是否需要响应式、弹窗覆盖到主应用区域？', group: 'other' },
  { key: 'needFastPrototype', label: '需要快速原型/最小改动', description: '是否希望用最简单的方案快速把页面集成进来？', group: 'other' },
];

export function recommendByAnswers(answers: Record<string, boolean>): { recommendation: string; reason: string; detail: string }[] {
  const results: { recommendation: string; reason: string; detail: string }[] = [];

  const needUnifiedUrl = answers.needUnifiedUrl ?? false;
  const needSeo = answers.needSeo ?? false;
  const needFullStyleIsolation = answers.needFullStyleIsolation ?? false;
  const needStyleSharing = answers.needStyleSharing ?? false;
  const needCrossOrigin = answers.needCrossOrigin ?? false;
  const isAppTrusted = answers.isAppTrusted ?? true;
  const needAdaptiveLayout = answers.needAdaptiveLayout ?? false;
  const needFastPrototype = answers.needFastPrototype ?? false;

  // qiankun scoring
  let qiankunScore = 0;
  let qiankunReasons: string[] = [];
  let iframeScore = 0;
  let iframeReasons: string[] = [];

  if (needUnifiedUrl) { qiankunScore += 3; qiankunReasons.push('qiankun 共享主应用路由，子应用内路由切换反映在地址栏'); }
  else { iframeScore += 1; iframeReasons.push('iframe 不关心主应用路由变化'); }

  if (needSeo) { qiankunScore += 3; qiankunReasons.push('qiankun 同 Document，子应用内容可被搜索引擎索引'); }

  if (needFullStyleIsolation) { iframeScore += 3; iframeReasons.push('iframe 提供浏览器原生完全样式隔离'); }
  else { qiankunScore += 1; qiankunReasons.push('qiankun 样式隔离基本够用'); }

  if (needStyleSharing) { qiankunScore += 2; qiankunReasons.push('qiankun 主子应用可共享 Ant Design 主题'); }

  if (needCrossOrigin) { iframeScore += 2; iframeReasons.push('iframe src 天然支持跨域'); }
  else { qiankunScore += 1; qiankunReasons.push('同域部署 qiankun 无需额外跨域配置'); }

  if (!isAppTrusted) { iframeScore += 3; iframeReasons.push('iframe 进程级隔离，不可信代码无法逃逸'); }
  else { qiankunScore += 1; qiankunReasons.push('内部项目 qiankun 集成体验更好'); }

  if (needAdaptiveLayout) { qiankunScore += 3; qiankunReasons.push('qiankun 子应用直接嵌入主应用 DOM，自适应无额外工作'); }

  if (needFastPrototype && !needUnifiedUrl && !needSeo && !needStyleSharing) {
    iframeScore += 1; iframeReasons.push('iframe 部署简单，静态文件即可');
  }

  if (qiankunScore >= iframeScore) {
    results.push({
      recommendation: '推荐 qiankun',
      reason: 'qiankun 更适合你的需求场景',
      detail: qiankunReasons.join('；'),
    });
  }
  if (iframeScore >= qiankunScore) {
    results.push({
      recommendation: '推荐 iframe',
      reason: 'iframe 更适合你的需求场景',
      detail: iframeReasons.join('；'),
    });
  }
  if (qiankunScore === iframeScore) {
    results.push({
      recommendation: '两者均可',
      reason: 'qiankun 和 iframe 的综合得分相同',
      detail: '建议根据团队熟悉度和长期维护成本选择。qiankun 提供更好的集成体验但复杂度更高；iframe 简单但集成体验差。',
    });
  }

  return results;
}
```

- [ ] **Step 3: 验证 TypeScript**

Run: `npx tsc --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck src/pages/qiankun/overview/data.ts`
Expected: 通过。

- [ ] **Step 4: Commit**

```bash
git add src/pages/qiankun/overview/data.ts
git commit -m "feat(qiankun-overview): add data.ts with comparison tables and decision config"
```

---

## Task 2: 创建 demo 代码示例文件

**Files:**
- Create: `src/pages/qiankun/overview/demos/iframe-basic.html`
- Create: `src/pages/qiankun/overview/demos/iframe-communication.html`
- Create: `src/pages/qiankun/overview/demos/iframe-auto-height.html`
- Create: `src/pages/qiankun/overview/demos/iframe-memory-leak.html`
- Create: `src/pages/qiankun/overview/demos/qiankun-register.tsx`
- Create: `src/pages/qiankun/overview/demos/qiankun-communication.tsx`
- Create: `src/pages/qiankun/overview/demos/qiankun-style-sharing.tsx`

- [ ] **Step 1: iframe-basic.html**

Create: `src/pages/qiankun/overview/demos/iframe-basic.html`

```html
<!-- ❌ iframe 基础嵌入：整个 DOM 是黑盒，URL 不共享 -->
<!DOCTYPE html>
<html>
<body>
  <!-- iframe 就是简单地嵌入一个独立页面 -->
  <!-- 1. iframe 内的 DOM 完全不可见，无法与主应用元素混排 -->
  <!-- 2. iframe 内部的路由切换不影响主应用地址栏 -->
  <!-- 3. iframe 高度需要手动计算，否则会出现滚动条或空白 -->
  <iframe src="https://sql.example.com/query-page" width="100%" height="800px">
    <!-- 这个 iframe 加载的是完整的 HTML 页面 -->
    <!-- 它有自己的：<!DOCTYPE> / <html> / <head> / <body> -->
    <!-- 有自己独立的：window / document / history / localStorage -->
    <!-- 主应用完全无法操控 iframe 内部的内容 -->
  </iframe>
</body>
</html>
```

- [ ] **Step 2: iframe-communication.html**

Create: `src/pages/qiankun/overview/demos/iframe-communication.html`

```html
<!-- ❌ iframe 通信：postMessage 只能传递序列化数据，无法传引用/函数 -->
<!DOCTYPE html>
<html>
<body>
  <!-- 主应用 -->
  <script>
    const iframe = document.querySelector('iframe');

    // 问题 1：函数无法传递
    function onUserChange(user) {
      console.log('用户变了', user);
    }
    // ❌ 试图传递一个回调函数
    iframe.contentWindow.postMessage(
      { type: 'subscribe', callback: onUserChange },  // callback 会被 structured clone 丢弃！
      '*'
    );
    // 实际收到的 callback 是 null / 报错

    // 正确的做法：用消息类型协商
    iframe.contentWindow.postMessage(
      { type: 'user-changed', user: { id: 1, name: 'Alice' } },
      '*'
    );
    // 但这样主应用需要自己维护消息路由，如果消息多了非常混乱
  </script>

  <!-- 子应用（iframe 内） -->
  <script>
    window.addEventListener('message', (event) => {
      // 需要手动验证 event.origin
      if (event.origin !== 'https://main.example.com') return;
      // 所有通信都走 message 通道，没有类型安全
      const { type, data } = event.data;
      // 每新增一个消息类型就要改这里的 switch/case
      switch (type) {
        case 'user-changed': /* ... */ break;
        case 'theme-changed': /* ... */ break;
        // ...
      }
    });

    // 回传消息也需要手动发 postMessage
    iframe.contentWindow.parent.postMessage(
      { type: 'query-result', data: { rows: [] } },
      '*'
    );
  </script>
</body>
</html>
```

- [ ] **Step 3: iframe-auto-height.html**

Create: `src/pages/qiankun/overview/demos/iframe-auto-height.html`

```html
<!-- ❌ iframe 自适应高度：需要 postMessage 手动同步，复杂且不稳定 -->
<!DOCTYPE html>
<html>
<head>
  <style>
    /* 主应用无法用 CSS 控制 iframe 内部高度 */
    /* 只能设置外部 iframe 标签的 height 属性 */
  </style>
</head>
<body>
  <!-- 主应用 JS：轮询或监听 iframe 内消息来调整高度 -->
  <script>
    const iframe = document.querySelector('iframe');

    // 监听 iframe 内发来的高度变化消息
    window.addEventListener('message', (event) => {
      if (event.data.type === 'height-change') {
        // 手动调整 iframe 高度
        iframe.height = event.data.height + 'px';
      }
    });

    // 需要监听 DOM 变化？还需要处理 ResizeObserver、MutationObserver

    // 如果子应用是动态内容（如展开/折叠）、resize 窗口，
    // 这个流程会大量触发 postMessage，导致帧率下降
  </script>

  <!-- 子应用（iframe 内）也需要发消息告知高度 -->
  <script>
    function reportHeight() {
      const height = document.body.scrollHeight;
      // 每次内容变化都要向父窗口发送消息
      window.parent.postMessage({ type: 'height-change', height }, '*');
    }

    // 需要监听子应用自身的内容变化
    const observer = new ResizeObserver(reportHeight);
    observer.observe(document.body);
    // 还要处理：MutationObserver 监听 DOM 变更
    // 还要处理：字体加载、图片加载后高度变化
    // 逻辑复杂，且容易因时序问题产生高度闪烁
  </script>
</body>
</html>
```

- [ ] **Step 4: iframe-memory-leak.html**

Create: `src/pages/qiankun/overview/demos/iframe-memory-leak.html`

```html
<!-- ❌ iframe 内存泄漏：频繁创建/销毁 iframe 会累积内存 -->
<!DOCTYPE html>
<html>
<body>
  <!-- 频繁切换子应用时，主应用不断创建新的 iframe -->
  <script>
    let currentIframe = null;

    function switchApp(url) {
      // 移除旧的 iframe
      if (currentIframe) {
        document.body.removeChild(currentIframe);
        // 即使移除了 DOM，iframe 的浏览上下文可能还没有被 GC 回收
        // 特别是 iframe 内有定时器、WebSocket、大量 DOM 时
        // 需要显式设置 src 为空并等待回收
        currentIframe.src = 'about:blank';  // 这个操作有助于释放部分内存
      }

      // 创建新的 iframe
      currentIframe = document.createElement('iframe');
      currentIframe.src = url;
      document.body.appendChild(currentIframe);
      // 每次切换都会加载一个完整的 HTML 文档
      // 子应用所有的 JS、CSS、DOM、音频/视频/WebSocket 连接都要重新初始化
      // 速度远不如 qiankun 的 mount/unmount 缓存机制
    }
  </script>
</body>
</html>
```

- [ ] **Step 5: qiankun-register.tsx**

Create: `src/pages/qiankun/overview/demos/qiankun-register.tsx`

```tsx
// ✅ qiankun 注册：子应用组件直接嵌入主应用 DOM 树
// 让我们看 registerMicroApps 的配置和效果

import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'sql-editor',
    entry: '//localhost:8082',  // 子应用开发服务器
    container: '#micro-viewport', // 子应用挂载到哪里
    activeRule: '/dashboard/sql', // 什么路由下激活

    // 子应用渲染后，它的 DOM 直接位于 #micro-viewport 中
    // 与主应用的 Sidebar、Header 在同一个 Document 下
    // 这意味着：
    // 1. 主应用 CSS 变量、字体、Ant Design 主题都对子应用生效
    // 2. 子应用的弹窗/Modal 可以覆盖到主应用全屏
    // 3. 子应用的 ResizeObserver 可以直接响应容器尺寸变化
    // 4. 无需手动同步高度或位置
  },
]);

start();
```

- [ ] **Step 6: qiankun-communication.tsx**

Create: `src/pages/qiankun/overview/demos/qiankun-communication.tsx`

```tsx
// ✅ qiankun 通信：同进程直接调用，类型安全，调试友好

// ---------- 主应用侧 ----------
import { initGlobalState, MicroAppStateActions } from 'qiankun';

// 初始化全局状态，所有子应用都可以订阅
const actions: MicroAppStateActions = initGlobalState({
  user: null,
  theme: 'light',
  token: '',
});

// 主应用可以直接修改状态，子应用立即收到通知
actions.setGlobalState({
  user: { id: 1, name: 'Alice', roles: ['admin'] },
  theme: 'dark',
});

// ---------- 子应用侧 ----------
// 在子应用 mount 生命周期中接收 props
export function mount(props: any) {
  // props 中包含 onGlobalStateChange 和 setGlobalState
  const { onGlobalStateChange, setGlobalState } = props;

  // 订阅全局状态变化，回调同步执行
  // 不需要像 postMessage 那样处理序列化、event.origin 验证
  onGlobalStateChange((state: any, prev: any) => {
    // state.user 是直接引用，不是克隆
    // 主应用和子应用共享同一个对象
    console.log('全局状态变了', state.user);
    // 可以立即更新子应用内部的 context/store
  }, true);

  // 子应用也可以修改全局状态，影响其他子应用
  setGlobalState({ theme: 'light' });
}
```

- [ ] **Step 7: qiankun-style-sharing.tsx**

Create: `src/pages/qiankun/overview/demos/qiankun-style-sharing.tsx`

```tsx
// ✅ qiankun 样式共享：主子应用共用 Ant Design 主题

// ---------- 主应用 ----------
// 在 App.tsx 中配置 Ant Design 主题
import { ConfigProvider } from 'antd';

const theme = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6,
    // 所有子应用都能继承这个主题
  },
};

function MainApp() {
  return (
    <ConfigProvider theme={theme}>
      <div className="main-layout">
        <Sidebar />
        {/* qiankun 子应用挂载点 */}
        <div id="micro-viewport" />
      </div>
    </ConfigProvider>
  );
}

// ---------- 子应用 ----------
// 子应用不需要单独引入 ConfigProvider,
// Ant Design 的样式 token 通过 CSS 变量继承自主应用
import { Button, Table } from 'antd';

function QueryPage() {
  return (
    <div>
      {/* 这里的 Button 颜色和主应用一致 */}
      {/* 不需要单独配置 theme */}
      <Button type="primary">执行查询</Button>
      <Table dataSource={[]} columns={[]} />
    </div>
  );
}
// 但要注意：Ant Design 的 JS 运行时仍然需要在子应用中单独安装
// 可以通过 externals + CDN 实现全量共享（需额外配置）
```

- [ ] **Step 8: 验证**

Run: `npx tsc --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck src/pages/qiankun/overview/demos/qiankun-register.tsx src/pages/qiankun/overview/demos/qiankun-communication.tsx src/pages/qiankun/overview/demos/qiankun-style-sharing.tsx`
Expected: 通过。

- [ ] **Step 9: Commit**

```bash
git add src/pages/qiankun/overview/demos/
git commit -m "feat(qiankun-overview): add demo files for qiankun vs iframe comparison"
```

---

## Task 3: 创建 LiveDemo 组件

**Files:**
- Create: `src/pages/qiankun/overview/LiveDemo.tsx`

- [ ] **Step 1: 编写 LiveDemo.tsx**

Create: `src/pages/qiankun/overview/LiveDemo.tsx`

```tsx
import React, { useState, useMemo } from 'react';
import { Card, Switch, Typography, Space, Collapse, Tag, Alert, Divider } from 'antd';
import { liveDemoQuestions, recommendByAnswers, scenarioTableData } from './data';

const LiveDemo: React.FC = () => {
  const [answers, setAnswers] = useState<Record<string, boolean>>({
    needUnifiedUrl: true,
    needSeo: false,
    needFullStyleIsolation: false,
    needStyleSharing: true,
    needCrossOrigin: false,
    isAppTrusted: true,
    needAdaptiveLayout: true,
    needFastPrototype: false,
  });

  const results = useMemo(() => recommendByAnswers(answers), [answers]);

  const toggleAnswer = (key: string) => {
    setAnswers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const groupLabels: Record<string, string> = {
    url: '路由与 SEO',
    style: '样式',
    security: '安全与跨域',
    other: '其他',
  };

  return (
    <Card title="对比决策器" id="live-demo">
      <Typography.Paragraph>
        根据你的场景选择条件，系统会实时分析推荐方案。
      </Typography.Paragraph>

      <Space direction="vertical" style={{ width: '100%' }}>
        {(['url', 'style', 'security', 'other'] as const).map((group) => (
          <React.Fragment key={group}>
            <Typography.Title level={5}>{groupLabels[group]}</Typography.Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {liveDemoQuestions
                .filter((q) => q.group === group)
                .map((q) => (
                  <div
                    key={q.key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '4px 0',
                    }}
                  >
                    <span>
                      <strong>{q.label}</strong>
                      <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                        {q.description}
                      </Typography.Text>
                    </span>
                    <Switch
                      checked={answers[q.key]}
                      onChange={() => toggleAnswer(q.key)}
                    />
                  </div>
                ))}
            </div>
            <Divider />
          </React.Fragment>
        ))}
      </Space>

      <Divider />

      <Typography.Title level={5}>分析结果</Typography.Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        {results.map((r, i) => (
          <Alert
            key={i}
            type={r.recommendation.includes('qiankun') && r.recommendation.includes('iframe') ? 'info' : r.recommendation.includes('qiankun') ? 'success' : 'warning'}
            message={
              <Space>
                <strong>{r.recommendation}</strong>
                <Tag color={r.recommendation.includes('qiankun') ? 'blue' : 'green'}>{r.reason}</Tag>
              </Space>
            }
            description={r.detail}
            showIcon
          />
        ))}
      </Space>

      <Collapse style={{ marginTop: 24 }}>
        <Collapse.Panel header="常见场景对照表" key="scenarios">
          {scenarioTableData.map((s) => (
            <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>{s.scenario}</span>
              <Space>
                <Tag color={s.recommendation.includes('qiankun') ? 'blue' : 'green'}>{s.recommendation}</Tag>
                <Typography.Text type="secondary">{s.reason}</Typography.Text>
              </Space>
            </div>
          ))}
        </Collapse.Panel>
      </Collapse>
    </Card>
  );
};

export default LiveDemo;
```

- [ ] **Step 2: 验证 TypeScript**

Run: `npx tsc --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck src/pages/qiankun/overview/LiveDemo.tsx`
Expected: 通过。

- [ ] **Step 3: Commit**

```bash
git add src/pages/qiankun/overview/LiveDemo.tsx
git commit -m "feat(qiankun-overview): add comparison decider live demo"
```

---

## Task 4: 创建 content.mdx

**Files:**
- Create: `src/pages/qiankun/overview/content.mdx`

**说明：** 使用 MDX 格式，单文件包含所有章节内容。引入 Ant Design 组件、CodeDiff、LiveDemo。

- [ ] **Step 1: 编写 content.mdx**

Create: `src/pages/qiankun/overview/content.mdx`

```mdx
import CodeDiff from '@/components/CodeDiff';
import LiveDemo from './LiveDemo';
import { Card, Table, Alert, Tag, Typography, Divider, Space, Collapse } from 'antd';
import { comparisonData, scenarioTableData } from './data';

import iframeBasic from './demos/iframe-basic.html?raw';
import iframeCommunication from './demos/iframe-communication.html?raw';
import iframeAutoHeight from './demos/iframe-auto-height.html?raw';
import iframeMemoryLeak from './demos/iframe-memory-leak.html?raw';
import qiankunRegister from './demos/qiankun-register.tsx?raw';
import qiankunCommunication from './demos/qiankun-communication.tsx?raw';
import qiankunStyleSharing from './demos/qiankun-style-sharing.tsx?raw';

# qiankun 专题：概览

<Typography.Paragraph type="secondary">qiankun vs iframe：10 个维度的全面对比与场景化选型指南</Typography.Paragraph>

---

## 一、引言

<Alert type="info" message="面试高频题" description=""到底微前端为什么不用 iframe？"" showIcon />

微前端是近年来前端领域最热门的话题之一。而在讨论微前端选型时，<strong>iframe</strong> 总能轻易地解决"把一个独立页面嵌入另一个页面"这个最原始的需求。iframe 在 1997 年的 HTML 4.0 规范中就已经存在了，它是最古老的"嵌入式页面"方案。

但是，<strong>"能解决"不等于"好解决"</strong>。

我们听到面试官说 iframe 的一些常见缺点：iframe 太重、通信复杂、SEO 差、URL 不同步、白屏时间长。但 iframe 也在很多场景下是<strong>最成熟的方案</strong>。

本章目标不是简单结论"qiankun 好 iframe 坏"，而是<strong>把 10 个维度的权衡讲透</strong>，让你在任何场景下都能做出合理的技术选型。

每个维度的结构：
<ol>
  <li>一句话概括差异</li>
  <li>对比表格（qiankun vs iframe）</li>
  <li>代码示例对比</li>
</ol>

---

## 二、qiankun vs iframe 全面对比

{comparisonData.map((dimension) => {
  const demoMap: Record<string, string> = {
    'iframe-basic.html': iframeBasic,
    'iframe-communication.html': iframeCommunication,
    'iframe-auto-height.html': iframeAutoHeight,
    'iframe-memory-leak.html': iframeMemoryLeak,
    'qiankun-register.tsx': qiankunRegister,
    'qiankun-communication.tsx': qiankunCommunication,
    'qiankun-style-sharing.tsx': qiankunStyleSharing,
  };

  return (
    <section key={dimension.id}>
      <Typography.Title level={3}>{dimension.title}</Typography.Title>

      <Typography.Paragraph>{dimension.summary}</Typography.Paragraph>

      <Table
        dataSource={dimension.table.dataSource}
        columns={dimension.table.columns}
        pagination={false}
        size="small"
        bordered
        style={{ marginBottom: 16 }}
      />

      {dimension.badDemo && dimension.goodDemo && (
        <>
          <Typography.Title level={5}>代码示例对比</Typography.Title>
          <CodeDiff
            oldValue={demoMap[dimension.badDemo] || ''}
            newValue={demoMap[dimension.goodDemo] || ''}
            leftTitle={dimension.badDesc ? `❌ ${dimension.badDesc}` : '❌ iframe'}
            rightTitle={dimension.goodDesc ? `✅ ${dimension.goodDesc}` : '✅ qiankun'}
            type="error"
            hideDiffMarkers={true}
          />
        </>
      )}

      <Divider />
    </section>
  );
})}

---

## 三、核心结论

### 决策树

```
是否需要统一路由/URL体验？
  ├── 是 → 是否需要完全样式隔离？
  │     ├── 是 → 综合考虑：qiankun + 额外样式隔离措施
  │     └── 否 → 推荐 qiankun
  └── 否 → 是否需要跨域加载不可信内容？
        ├── 是 → 推荐 iframe（安全沙箱天然隔离）
        └── 否 → 推荐 iframe（简单场景下最省心）
```

### 三句话总结

<Card style={{ marginBottom: 12 }}>
  <Typography.Text>
    <strong>"iframe 是最成熟的微前端方案，但不是最好的"</strong> — 适合简单集成、跨域隔离场景
  </Typography.Text>
</Card>
<Card style={{ marginBottom: 12 }}>
  <Typography.Text>
    <strong>"qiankun 是最流行的微前端框架，但不是万能的"</strong> — 适合统一 UX、共享资源、路由同步场景
  </Typography.Text>
</Card>
<Card style={{ marginBottom: 12 }}>
  <Typography.Text>
    <strong>"选型没有银弹，只有取舍"</strong>
  </Typography.Text>
</Card>

### 常见场景对照

<Table dataSource={scenarioTableData} pagination={false} size="small" bordered
  columns={[
    { title: '场景', dataIndex: 'scenario', key: 'scenario' },
    { title: '推荐方案', dataIndex: 'recommendation', key: 'recommendation', render: (text: string) => <Tag color={text.includes('qiankun') ? 'blue' : 'green'}>{text}</Tag> },
    { title: '原因', dataIndex: 'reason', key: 'reason' },
  ]}
/>

---

## 四、Live Demo：对比决策器

<LiveDemo />
```

- [ ] **Step 2: 验证 MDX 文件可被编译**

Run: `npx tsc --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck src/pages/qiankun/overview/data.ts src/pages/qiankun/overview/LiveDemo.tsx`
Expected: 通过。MDX 文件由 vite 插件处理，不需要 TypeScript 直接编译。

- [ ] **Step 3: Commit**

```bash
git add src/pages/qiankun/overview/content.mdx
git commit -m "feat(qiankun-overview): add main content.mdx with all comparison sections"
```

---

## Task 5: 创建页面入口 index.tsx

**Files:**
- Create: `src/pages/qiankun/overview/index.tsx`

- [ ] **Step 1: 编写 index.tsx**

Create: `src/pages/qiankun/overview/index.tsx`

```tsx
import Content from './content.mdx';
import React from 'react';

const QiankunOverviewPage: React.FC = () => {
  return <Content />;
};

export default QiankunOverviewPage;
```

- [ ] **Step 2: 验证 TypeScript**

Run: `npx tsc --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck src/pages/qiankun/overview/index.tsx`
Expected: 通过。

- [ ] **Step 3: Commit**

```bash
git add src/pages/qiankun/overview/index.tsx
git commit -m "feat(qiankun-overview): add page entry component"
```

---

## Task 6: 注册路由

**Files:**
- Modify: `src/router/config.tsx`

- [ ] **Step 1: 添加懒加载导入**

在 `src/router/config.tsx` 的懒加载组件区域新增：

```tsx
const QiankunOverviewPage = lazy(() => import('../pages/qiankun/overview/index'));
```

- [ ] **Step 2: 添加 qiankun 专题子菜单**

在已有的 `qiankun 专题` 菜单的 `children` 中新增：

```tsx
      {
        path: '/dashboard/qiankun/overview',
        label: '概览',
        element: <QiankunOverviewPage />,
      },
```

- [ ] **Step 3: 验证类型检查**

Run: `npx tsc --noEmit`
Expected: 通过（项目既有错误不影响新增内容）。

- [ ] **Step 4: Commit**

```bash
git add src/router/config.tsx
git commit -m "feat(router): register qiankun overview route"
```

---

## Task 7: 运行 lint 和类型检查

- [ ] **Step 1: 运行 lint**

Run: `npm run lint`
Expected: 无新增错误。

- [ ] **Step 2: 运行类型检查**

Run: `npx tsc --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck`
Expected: 通过。

- [ ] **Step 3: 运行 dev 服务器验证页面**

Run: `npm run dev`（后台），等待 5 秒后检查输出。

- [ ] **Step 4: Commit（如有修复）**

```bash
git add -A
git commit -m "fix(qiankun-overview): fix lint and typecheck issues"
```

---

## 验收标准检查

- [ ] 主应用菜单 `qiankun 专题` 下新增 `概览`
- [ ] 访问 `/dashboard/qiankun/overview` 能正常打开页面
- [ ] 页面包含 4 个大节：引言、全面对比、核心结论、Live Demo
- [ ] 全面对比覆盖 10 个维度，每个维度有 Ant Design Table + CodeDiff
- [ ] 决策树给出场景化推荐，不是简单的"哪个好"
- [ ] Live Demo 是场景决策器，根据用户选择实时推荐方案
- [ ] 代码注释详尽，中文
- [ ] 不依赖真实 Monaco/CodeMirror 运行时
- [ ] 通过 `npm run dev` 验证
