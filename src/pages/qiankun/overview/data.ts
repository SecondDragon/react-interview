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
