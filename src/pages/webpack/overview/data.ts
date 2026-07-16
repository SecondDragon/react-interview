import type { ColumnsType } from 'antd/es/table';

export const coreConceptColumns: ColumnsType = [
  { title: '概念', dataIndex: 'concept', key: 'concept', width: 120 },
  { title: '说明', dataIndex: 'desc', key: 'desc' },
  { title: '面试频率', dataIndex: 'frequency', key: 'frequency', width: 100 },
];

export const coreConceptData = [
  { key: '1', concept: 'Entry', desc: 'Webpack 构建的入口文件，从该文件开始递归构建依赖图', frequency: '★★★★★' },
  { key: '2', concept: 'Output', desc: '打包产物的输出路径和文件名配置', frequency: '★★★★☆' },
  { key: '3', concept: 'Loader', desc: '模块转换器，将非 JS 文件转换为 Webpack 能处理的模块', frequency: '★★★★★' },
  { key: '4', concept: 'Plugin', desc: '插件系统，通过 Tapable 钩子介入整个构建生命周期', frequency: '★★★★★' },
  { key: '5', concept: 'Module', desc: '一切皆模块，Webpack 内部以模块为单位管理所有资源', frequency: '★★★☆☆' },
  { key: '6', concept: 'Chunk', desc: '打包后的代码块，一个 Chunk 对应一个输出文件', frequency: '★★★★☆' },
  { key: '7', concept: 'Tree Shaking', desc: '基于静态分析的死代码消除', frequency: '★★★★★' },
  { key: '8', concept: 'HMR', desc: '模块热替换，开发阶段无需刷新即可更新模块', frequency: '★★★☆☆' },
  { key: '9', concept: 'Code Splitting', desc: '代码分割，将代码拆分为多个 Chunk 实现按需加载', frequency: '★★★★★' },
  { key: '10', concept: 'Source Map', desc: '源代码映射，将编译产物映射回源码便于调试', frequency: '★★★☆☆' },
];

export const topicColumns: ColumnsType = [
  { title: '知识点', dataIndex: 'topic', key: 'topic', width: 180 },
  { title: '核心内容', dataIndex: 'content', key: 'content' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
];

export const topicData = [
  {
    key: '1',
    topic: 'Webpack 构建流程',
    content: '深入理解 Webpack 的初始化、编译、输出三阶段，掌握 Tapable 钩子系统的工作原理',
    status: '待更新',
  },
  {
    key: '2',
    topic: 'Loader 机制与开发',
    content: 'Loader 的执行顺序、pitch 机制、自定义 Loader 开发实战',
    status: '待更新',
  },
  {
    key: '3',
    topic: 'Plugin 机制与开发',
    content: 'Compiler/Compilation 对象、Tapable 钩子类型、自定义 Plugin 开发实战',
    status: '待更新',
  },
  {
    key: '4',
    topic: '代码分割 (Code Splitting)',
    content: 'SplitChunksPlugin 配置策略、动态 import()、preload/prefetch',
    status: '待更新',
  },
  {
    key: '5',
    topic: 'Tree Shaking',
    content: 'ES Module 静态分析、sideEffects 配置、嵌套 Tree Shaking',
    status: '待更新',
  },
  {
    key: '6',
    topic: '模块热替换 (HMR)',
    content: 'HMR 运行时原理、WebSocket 通信链路、module.hot API',
    status: '待更新',
  },
  {
    key: '7',
    topic: '构建性能优化',
    content: '多线程编译、缓存策略、缩小构建范围、DLL/持久化缓存',
    status: '待更新',
  },
  {
    key: '8',
    topic: '模块联邦 (Module Federation)',
    content: 'Webpack 5 微前端方案、remote/host 模式、共享依赖策略',
    status: '待更新',
  },
  {
    key: '9',
    topic: 'Webpack 5 新特性',
    content: '持久化缓存、Asset Modules、运行时优化、模块联邦深度解析',
    status: '待更新',
  },
  {
    key: '10',
    topic: '与 Vite/Rollup 对比',
    content: '不同构建工具的设计哲学、性能差异、适用场景分析',
    status: '待更新',
  },
];
