import React from 'react';

export const prefetchComparison = [
  {
    dimension: '触发时机',
    noPrefetch: '用户点击导航时才开始下载',
    withPrefetch: '首屏渲染完成后，浏览器空闲时提前下载',
  },
  {
    dimension: '感知延迟',
    noPrefetch: '有（网络耗时 + 解析耗时）',
    withPrefetch: '无（chunk 已在缓存中）',
  },
  {
    dimension: '对首屏影响',
    noPrefetch: '无（未加载的 chunk 不影响首屏）',
    withPrefetch: '无（空闲时才执行）',
  },
  {
    dimension: '开发成本',
    noPrefetch: '零（React.lazy 默认行为）',
    withPrefetch: '低（加一行 idlePrefetch: true）',
  },
  {
    dimension: '带宽浪费',
    noPrefetch: '无（按需加载）',
    withPrefetch: '用户可能不访问的页面也会下载',
  },
];

export const approachComparison = [
  {
    approach: 'IdlePrefetch（本项目 Vite 方案）',
    mechanism: '运行时通过 requestIdleCallback 调度 import() 执行',
    config: '在 RouteConfig 中添加 idlePrefetch: true + importFn',
    control: '代码控制（可动态开启/关闭）',
    pros: '不依赖构建工具，配置直观，可条件判断',
    cons: '运行时执行 import() 会占用主线程解析模块',
  },
  {
    approach: 'webpackPrefetch（Webpack 魔法注释）',
    mechanism: '构建时生成 <link rel="prefetch"> 注入 HTML',
    config: '/* webpackPrefetch: true */ 魔法注释',
    control: '构建器控制（编译期决定）',
    pros: '由浏览器调度，只下载不解析，无 CPU 开销',
    cons: '仅 Webpack 支持，Vite/Rollup 不兼容',
  },
];

export const scenarioList = [
  '用户高频访问但不在首屏的页面（如详情页、报表页）',
  '体积较大的重型页面（ECharts 图表、Monaco 编辑器等）',
  '二级/三级菜单页面，用户进入概率高但首屏不需加载',
  '弹窗/抽屉中的重型内容（确认用户大概率会打开）',
];

export const principleSteps = [
  {
    title: '1. 首屏渲染完成',
    description: '用户进入应用，首屏关键内容快速呈现，所有紧迫渲染任务完成',
  },
  {
    title: '2. 注册 requestIdleCallback',
    description: 'IdlePrefetch 组件的 useEffect 注册回调，等待浏览器空闲帧',
  },
  {
    title: '3. 遍历路由树',
    description: '递归收集所有 idlePrefetch: true 的路由节点，提取 importFn',
  },
  {
    title: '4. 批量执行 import()',
    description: '在空闲回调中逐一执行 importer()，浏览器发起 HTTP 请求下载 JS chunk',
  },
  {
    title: '5. 用户导航命中缓存',
    description: '用户点击菜单触发 React.lazy，import() 直接从缓存加载，零等待',
  },
];

export const webpackExampleCode = `// Webpack 魔法注释方案
// 构建时自动生成 <link rel="prefetch"> 标签

const ReportPage = lazy(() => import(
  /* webpackPrefetch: true */  // ← 浏览器空闲时下载
  './pages/ReportPage'
));

const DataTable = lazy(() => import(
  /* webpackPrefetch: true */  // ← 同样被预取
  './pages/DataTable'
));

const SettingsPage = lazy(() => import(
  /* webpackPreload: true */   // ← 不同！立即预加载（与父 chunk 并行）
  './pages/SettingsPage'
));`;

export const vitePrefetchSource = `import { useEffect } from 'react';

interface PrefetchRoute {
  idlePrefetch?: boolean;
  importFn?: () => Promise<unknown>;
  children?: PrefetchRoute[];
}

function collectImporters(routes: PrefetchRoute[]) {
  const importers: (() => Promise<unknown>)[] = [];
  const walk = (list: PrefetchRoute[]) => {
    for (const route of list) {
      if (route.idlePrefetch && route.importFn) {
        importers.push(route.importFn);
      }
      if (route.children) walk(route.children);
    }
  };
  walk(routes);
  return importers;
}

export default function IdlePrefetch({ routes, timeout = 3000 }) {
  const importers = collectImporters(routes);

  useEffect(() => {
    if (importers.length === 0) return;

    const requestIdle =
      window.requestIdleCallback ||
      ((cb) => setTimeout(cb, 1));

    const idleId = requestIdle(() => {
      importers.forEach((importer) => {
        importer().catch(() => {});
      });
    }, { timeout });

    return () => cancelIdleCallback(idleId);
  }, [importers, timeout]);

  return null;
}`;
