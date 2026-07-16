import type { ColumnsType } from 'antd/es/table';

export const preloadColumns: ColumnsType = [
  { title: '指令', dataIndex: 'directive', key: 'directive', width: 200 },
  { title: '加载优先级', dataIndex: 'priority', key: 'priority', width: 120 },
  { title: '触发时机', dataIndex: 'timing', key: 'timing' },
  { title: '适合场景', dataIndex: 'scene', key: 'scene' },
];

export const preloadData = [
  {
    key: '1',
    directive: 'import(/* webpackPreload: true */)',
    priority: '高（浏览器关键资源）',
    timing: '与当前页面并行加载',
    scene: '确定用户下一步 100% 会访问的页面（如登录页）',
  },
  {
    key: '2',
    directive: 'import(/* webpackPrefetch: true */)',
    priority: '低（浏览器空闲时）',
    timing: '当前页面加载完成后，闲时下载',
    scene: '预测用户下一步可能访问的页面（如 Dashboard）',
  },
  {
    key: '3',
    directive: 'import()（无魔法注释）',
    priority: '—',
    timing: '执行到该代码时触发',
    scene: '无法预测用户行为的兜底方案',
  },
];

export const chunkStrategyColumns: ColumnsType = [
  { title: 'Chunk 名', dataIndex: 'name', key: 'name', width: 120 },
  { title: '包含内容', dataIndex: 'content', key: 'content' },
  { title: '体积(gzip)', dataIndex: 'size', key: 'size', width: 100 },
  { title: '加载策略', dataIndex: 'strategy', key: 'strategy', width: 140 },
];

export const chunkStrategyData = [
  {
    key: '1',
    name: 'entry',
    content: 'react / react-dom / react-router / 路由配置 + Suspense 壳',
    size: '~50KB',
    strategy: '立即加载（initial）',
  },
  {
    key: '2',
    name: 'Login',
    content: '登录表单、基础样式、验证逻辑',
    size: '~15KB',
    strategy: 'webpackPreload（并行）',
  },
  {
    key: '3',
    name: 'Dashboard',
    content: '页面布局、标题、导航、StatCards 轻量组件',
    size: '~30KB',
    strategy: 'webpackPrefetch（闲时）',
  },
  {
    key: '4',
    name: 'echarts',
    content: 'echarts 及其依赖（独立 cacheGroup 提取）',
    size: '~280KB',
    strategy: 'Dashboard 内子 prefetch',
  },
  {
    key: '5',
    name: 'vendor',
    content: '其他第三方库（antd、axios 等）',
    size: '~100KB',
    strategy: 'webpackPrefetch（闲时）',
  },
];

export const layerColumns: ColumnsType = [
  { title: '层级', dataIndex: 'layer', key: 'layer', width: 120 },
  { title: '手段', dataIndex: 'method', key: 'method' },
  { title: '效果', dataIndex: 'effect', key: 'effect' },
];

export const layerData = [
  {
    key: '1',
    layer: '第零层',
    method: 'entry chunk 极轻量化 + SplitChunks 精确分组',
    effect: '不相关代码永远不会被打包进入口，初始 JS 仅 ~50KB',
  },
  {
    key: '2',
    layer: '第一层',
    method: '路由级 lazy() + webpackPreload/webpackPrefetch',
    effect: '登录页与 entry 并行加载（零额外等待），Dashboard 闲时预取',
  },
  {
    key: '3',
    layer: '第二层',
    method: '组件级 lazy() + Suspense + 骨架屏',
    effect: '页面内重组件异步加载，首帧只渲染轻量 UI，重组件区域显示骨架屏',
  },
];
