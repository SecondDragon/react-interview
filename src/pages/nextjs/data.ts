import type { ColumnsType } from 'antd/es/table';

/** 概览栏目，将差异按主题分组 */
export interface DifferenceGroup {
  key: string;
  category: string;
  icon: string;
  summary: string;
  craApproach: string;
  nextApproach: string;
  coreReason: string;
  subTopics: string[];
}

export const differenceGroups: DifferenceGroup[] = [
  {
    key: 'rendering',
    category: '渲染模式',
    icon: '🖥️',
    summary: '最根本的区别：React SPA 是纯客户端渲染（CSR），Next.js 提供了服务端渲染（SSR）、静态生成（SSG）、增量静态再生（ISR）等多种渲染模式',
    craApproach: '所有页面都是 CSR，浏览器下载空的 HTML + 完整的 JS Bundle，由 JS 在客户端渲染全部内容',
    nextApproach: '每个页面可以按需选择 SSR / SSG / ISR / CSR 四种模式，甚至可以在同一页面混合使用',
    coreReason: 'React 本身只是一个 UI 库，不解决"页面从哪儿来"的问题。Next.js 在 React 之上封装了 Node.js 运行时，让 React 组件可以在服务端先渲染成 HTML 再发送给浏览器',
    subTopics: ['服务端组件 vs 客户端组件', '流式渲染 (Streaming SSR)', 'Partial Prerendering (PPR)'],
  },
  {
    key: 'routing',
    category: '路由系统',
    icon: '🧭',
    summary: 'React SPA 使用前端路由库（react-router）在客户端控制 URL 切换；Next.js 使用基于文件系统的服务端路由',
    craApproach: '使用 react-router-dom 等库，在 JS 中声明式配置路由。所有路由跳转不经过服务器，由 JS 拦截并切换组件',
    nextApproach: '按照 pages/ 或 app/ 目录结构自动生成路由。每个文件就是一个路由，支持 layout、loading、error 等特殊文件约定',
    coreReason: '因为 Next.js 需要在服务端知道"用户访问的是哪个页面"以便执行 SSR，所以路由必须由服务器理解。文件系统路由天然与服务端文件结构对应，是最自然的方式',
    subTopics: ['App Router vs Pages Router', 'Layout 嵌套与持久化', '平行路由与拦截路由'],
  },
  {
    key: 'data-fetching',
    category: '数据获取',
    icon: '📡',
    summary: 'React SPA 所有数据在客户端请求；Next.js 可以在服务端获取数据后直接注入到页面 HTML 中',
    craApproach: '在 useEffect 或 SWR/React Query 中发起 fetch，浏览器先渲染空白/loading，数据到后再渲染内容',
    nextApproach: '服务端组件中可以直接 async/await 数据库或 API，数据在服务端就绪后再输出 HTML；客户端组件可用 SWR 做增量获取',
    coreReason: 'SSR 的核心价值之一就是消除"请求时差"——数据在服务器拿到后再一起返回，浏览器拿到的是包含完整数据的 HTML。这需要 React 组件能在 Node.js 环境中运行',
    subTopics: ['服务端组件直接访问数据库', 'Route Handler (API Routes)', 'Server Actions'],
  },
  {
    key: 'seo',
    category: 'SEO 与元数据',
    icon: '🔍',
    summary: 'React SPA 生成的 HTML 几乎为空，搜索引擎抓取困难；Next.js 天然输出完整 HTML，SEO 友好',
    craApproach: 'HTML 只有一个 <div id="root">，需要借助 react-helmet 等库动态修改 document.title，搜索引擎爬虫难以索引 JS 渲染后的内容',
    nextApproach: '每个页面直接输出完整 HTML，支持静态 <title>、<meta>、Open Graph、JSON-LD 结构化数据，搜索引擎可直接抓取',
    coreReason: 'CSR 的 HTML 是一个空壳，搜索引擎爬虫（尤其是百度）执行 JS 的能力有限。SSR 在服务端生成完整 HTML，从根本上解决了 SEO 问题',
    subTopics: ['generateMetadata API', 'generateStaticParams', '结构化数据与 JSON-LD'],
  },
  {
    key: 'bundle',
    category: '打包与代码拆分',
    icon: '📦',
    summary: 'React SPA 打包成单一或少量 JS Bundle；Next.js 自动按页面粒度拆分代码',
    craApproach: 'CRA/Vite 通常将所有页面代码打包到一个 Bundle 中（或通过 React.lazy 手动拆分），首屏加载的 JS 可能包含用户从未访问的页面',
    nextApproach: '自动按路由粒度做 Code Splitting，每个页面只有自己的 JS + 共享依赖。服务端组件代码不会发送到客户端',
    coreReason: '文件系统路由让 Next.js 在编译阶段就能明确知道"哪个 JS 属于哪个页面"，因此可以实现编译时自动代码分割。CSR 的路由配置在运行时才被解析，做不到编译时优化',
    subTopics: ['服务端组件零客户端体积', '自动预加载与 prefetch', 'Tree Shaking 差异化'],
  },
  {
    key: 'assets',
    category: '资源优化',
    icon: '🖼️',
    summary: 'React SPA 需要手动或借助社区库优化图片、字体等资源；Next.js 内置了全套资源优化方案',
    craApproach: '图片需要手动设置 srcSet、lazy loading、尺寸预留，字体需要手动处理 preload 和 FOIT/FOUT',
    nextApproach: '内置 <Image> 组件自动优化图片（WebP/AVIF、响应式尺寸、懒加载、防 CLS），内置字体优化（自动 preload、消除 FOIT）',
    coreReason: '资源加载策略与渲染模式深度绑定。SSR 页面在服务端就知道页面需要哪些图片和字体，可以提前注入 preload link；CSR 页面直到 JS 执行才知道需要什么资源，优化窗口更窄',
    subTopics: ['<Image> 组件的自动优化', 'next/font 字体优化', 'Script 加载策略'],
  },
  {
    key: 'api',
    category: 'API 与后端能力',
    icon: '⚙️',
    summary: 'React SPA 完全是前端应用，不包含任何后端代码；Next.js 是 Full-Stack 框架，前端后端写在一起',
    craApproach: '前端项目只包含客户端代码，需要另外搭建 Node.js/Java/Go 等后端服务来提供 API',
    nextApproach: '可以用 Route Handler（API Routes）或 Server Actions 直接在同一个项目中写后端逻辑，前后端共享类型和工具函数',
    coreReason: 'Next.js 运行在 Node.js 服务器上，天然具备处理 HTTP 请求的能力。它把前端路由和后端路由统一到同一个项目中，消除了前后端分离的物理边界',
    subTopics: ['Route Handlers (app/api)', 'Server Actions', '中间件 (Middleware)'],
  },
  {
    key: 'deployment',
    category: '部署与运维',
    icon: '🚀',
    summary: 'React SPA 是静态文件，可部署在任何静态服务器上；Next.js 需要 Node.js 运行时或 Serverless 平台',
    craApproach: 'build 后生成纯静态 HTML/JS/CSS 文件，可直接扔到 Nginx、OSS、CDN 上，不需要任何服务器运行时',
    nextApproach: 'SSR 页面需要 Node.js 服务器来动态渲染；SSG 页面可导出为静态文件；推荐部署到 Vercel（Serverless）等支持 Node.js 的平台',
    coreReason: 'SSR/ISR 需要在服务端执行 React 渲染逻辑，所以必须有一个运行 Node.js 的服务器。这是"动态服务"与"静态文件"的本质区别',
    subTopics: ['Vercel 平台适配', '自部署 (Node.js/Docker)', '静态导出 (next export)'],
  },
  {
    key: 'middleware',
    category: '请求拦截',
    icon: '🔀',
    summary: 'React SPA 无法在请求到达页面之前做任何处理；Next.js 的 Middleware 可以在请求到达页面之前执行逻辑',
    craApproach: '没有服务端请求的概念，所有"拦截"逻辑只能在客户端 JS 加载完成后执行，存在安全时间窗口',
    nextApproach: 'Middleware 在 Edge Runtime 中运行，可在请求到达页面路由之前执行重定向、重写、鉴权、A/B 测试等逻辑',
    coreReason: 'Next.js 是一个 Web 服务框架，本质上就是一个 HTTP Server。Middleware 就是 Express/Koa 中间件的 Next.js 版本，运行在 CDN Edge 层',
    subTopics: ['Edge Runtime', '请求重写与重定向', '基于 Cookie/Header 的 A/B 测试'],
  },
  {
    key: 'integrations',
    category: '生态整合',
    icon: '🔗',
    summary: 'React SPA 通过手动配置整合各种库；Next.js 对主流框架和库提供官方一级整合',
    craApproach: '需要手动安装和配置 next-seo、react-helmet-async、react-snap（预渲染）、@loadable/component（代码分割）等第三方库来实现 SSR 类功能',
    nextApproach: 'Auth（NextAuth.js）、CMS（Contentful/Strapi）、数据库（Prisma/Drizzle）、样式（Tailwind/CSS Modules/Sass）均有官方指引或原生支持',
    coreReason: 'Next.js 作为一个有明确技术主张的框架，对常用工具做了深度适配。它控制了构建、路由、渲染整个链路，因此能提供"开箱即用"的整合体验',
    subTopics: ['Auth.js (NextAuth)', 'Prisma / Drizzle ORM', 'Tailwind CSS / CSS Modules / Sass'],
  },
];

export const overviewColumns: ColumnsType<DifferenceGroup> = [
  { title: '维度', dataIndex: 'category', key: 'category', width: 140 },
  { title: '核心区别', dataIndex: 'summary', key: 'summary', width: 300 },
  { title: 'React SPA 做法', dataIndex: 'craApproach', key: 'craApproach', width: 280 },
  { title: 'Next.js 做法', dataIndex: 'nextApproach', key: 'nextApproach', width: 280 },
  { title: '底层原因', dataIndex: 'coreReason', key: 'coreReason', width: 320 },
];

export const renderingModeData = [
  {
    mode: 'CSR (Client-Side Rendering)',
    desc: '浏览器下载空 HTML + JS Bundle，JS 在客户端渲染全部内容',
    timing: '运行时（客户端）',
    nextSupport: 'use client + useEffect/SWR',
    craSupport: '唯一模式',
    seoRating: '⭐',
  },
  {
    mode: 'SSR (Server-Side Rendering)',
    desc: '服务端渲染 HTML 后发送给浏览器，浏览器 hydrates 交互',
    timing: '每次请求时（服务端）',
    nextSupport: 'dynamic = "force-dynamic"',
    craSupport: '❌ 不支持',
    seoRating: '⭐⭐⭐⭐⭐',
  },
  {
    mode: 'SSG (Static Site Generation)',
    desc: '构建时生成静态 HTML，CDN 直接分发',
    timing: '构建时',
    nextSupport: 'generateStaticParams',
    craSupport: '❌ 不支持',
    seoRating: '⭐⭐⭐⭐⭐',
  },
  {
    mode: 'ISR (Incremental Static Regeneration)',
    desc: '静态页面 + 后台定时重新生成，兼顾速度与新鲜度',
    timing: '构建时 + 定时后台更新',
    nextSupport: 'revalidate 配置',
    craSupport: '❌ 不支持',
    seoRating: '⭐⭐⭐⭐⭐',
  },
];

export const renderingModeColumns: ColumnsType = [
  { title: '渲染模式', dataIndex: 'mode', key: 'mode', width: 200 },
  { title: '说明', dataIndex: 'desc', key: 'desc', width: 280 },
  { title: '渲染时机', dataIndex: 'timing', key: 'timing', width: 160 },
  { title: 'Next.js', dataIndex: 'nextSupport', key: 'nextSupport', width: 200 },
  { title: '普通 React', dataIndex: 'craSupport', key: 'craSupport', width: 120 },
  { title: 'SEO', dataIndex: 'seoRating', key: 'seoRating', width: 80 },
];

export interface PlanItem {
  key: string;
  topic: string;
  description: string;
  status: string;
}

export const planColumns: ColumnsType<PlanItem> = [
  { title: '子专题', dataIndex: 'topic', key: 'topic', width: 160 },
  { title: '内容说明', dataIndex: 'description', key: 'description' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
];

export const planData: PlanItem[] = [
  { key: '1', topic: '渲染模式详解', description: '深入讲解 SSR / SSG / ISR / CSR 四种模式的工作原理、适用场景和配置方式', status: '待创建' },
  { key: '2', topic: '路由系统对比', description: '文件系统路由 vs react-router，App Router 的 Layout / Loading / Error 约定', status: '待创建' },
  { key: '3', topic: '数据获取策略', description: '服务端组件直接 fetch、Route Handler、Server Actions 与 SWR/React Query 的对比', status: '待创建' },
  { key: '4', topic: '打包与代码分割', description: 'Next.js 自动 Code Splitting 机制、服务端组件零客户端体积的原理', status: '待创建' },
  { key: '5', topic: 'SEO 与元数据', description: 'generateMetadata、结构化数据、Open Graph 与 CSR 的 SEO 困境', status: '待创建' },
  { key: '6', topic: '图片与资源优化', description: '<Image> 组件、next/font、Script 加载策略的底层机制', status: '待创建' },
  { key: '7', topic: 'API Routes 与 Server Actions', description: '前后端一体化开发、Route Handler 与 Server Actions 的区别和最佳实践', status: '待创建' },
  { key: '8', topic: 'Middleware 与 Edge Runtime', description: '请求拦截、Edge 计算、与 Express/Koa 中间件的类比', status: '待创建' },
  { key: '9', topic: '部署策略', description: 'Vercel Serverless 部署、自部署 Docker、静态导出适用场景', status: '待创建' },
  { key: '10', topic: '性能对比实战', description: 'Lighthouse 指标对比、首屏加载时间、TTI、Bundle Size 实测', status: '待创建' },
  { key: '11', topic: '迁移指南', description: '从 CRA/Vite SPA 迁移到 Next.js 的步骤、常见坑和最佳实践', status: '待创建' },
];
