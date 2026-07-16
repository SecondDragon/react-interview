import { Tag } from 'antd';
import React from 'react';

export const schemeComparisonColumns = [
  { title: '特性', dataIndex: 'feature', key: 'feature' },
  { title: '纯原生 (Native)', dataIndex: 'native', key: 'native' },
  { title: '纯 Web (SPA)', dataIndex: 'web', key: 'web' },
  { title: 'Hybrid 混合', dataIndex: 'hybrid', key: 'hybrid' },
];

export const schemeComparisonData = [
  {
    key: '1',
    feature: '开发效率',
    native: '低（各端独立开发）',
    web: '高（一套代码）',
    hybrid: '较高（Web 为主，原生能力按需桥接）',
  },
  {
    key: '2',
    feature: '性能体验',
    native: '最佳（直接调用 GPU/API）',
    web: '一般（受限于浏览器渲染）',
    hybrid: '良好（关键路径原生渲染）',
  },
  {
    key: '3',
    feature: '跨平台能力',
    native: '差（iOS/Android 各写一套）',
    web: '最佳（一次编写，到处运行）',
    hybrid: '好（Web 跨平台 + 原生 API 桥接）',
  },
  {
    key: '4',
    feature: '原生 API 访问',
    native: '完全访问',
    web: '受限（仅浏览器 API）',
    hybrid: '完全访问（通过 JSBridge）',
  },
  {
    key: '5',
    feature: '热更新 / 动态化',
    native: '不支持（需发版审核）',
    web: '天然支持',
    hybrid: '支持（更新 H5 资源即可）',
  },
  {
    key: '6',
    feature: '开发成本',
    native: '高（双端团队）',
    web: '低（前端团队）',
    hybrid: '中（前端为主 + 少量原生）',
  },
  {
    key: '7',
    feature: '典型场景',
    native: '游戏、AR/VR、音视频编辑',
    web: '内容展示、后台管理、营销页',
    hybrid: '电商、资讯、金融、IM 聊天',
  },
];

export const frameworkColumns = [
  { title: '框架 / 方案', dataIndex: 'name', key: 'name' },
  { title: '渲染方式', dataIndex: 'render', key: 'render' },
  { title: '语言', dataIndex: 'language', key: 'language' },
  { title: '跨平台', dataIndex: 'platform', key: 'platform' },
  { title: '性能', dataIndex: 'performance', key: 'performance' },
  { title: '生态成熟度', dataIndex: 'eco', key: 'eco' },
];

export const frameworkData = [
  {
    key: '1',
    name: 'Cordova / PhoneGap',
    render: 'WebView 渲染',
    language: 'HTML + CSS + JS',
    platform: 'iOS / Android',
    performance: '较低',
    eco: '成熟（逐渐淘汰）',
  },
  {
    key: '2',
    name: 'React Native',
    render: '原生组件映射',
    language: 'React (JS/TS)',
    platform: 'iOS / Android / Web',
    performance: '接近原生',
    eco: '非常成熟',
  },
  {
    key: '3',
    name: 'Flutter',
    render: '自研 Skia 引擎自绘',
    language: 'Dart',
    platform: 'iOS / Android / Web / Desktop',
    performance: '接近原生',
    eco: '成熟（Google 维护）',
  },
  {
    key: '4',
    name: 'Weex',
    render: '原生组件映射',
    language: 'Vue (JS)',
    platform: 'iOS / Android',
    performance: '接近原生',
    eco: '已停止维护',
  },
  {
    key: '5',
    name: '小程序 (WXML)',
    render: 'WebView + 原生混合',
    language: 'JS + WXML + WXSS',
    platform: '微信 / 支付宝 / 字节等',
    performance: '良好',
    eco: '非常成熟',
  },
  {
    key: '6',
    name: 'Taro / uni-app',
    render: '多端统一转译',
    language: 'React / Vue (JS/TS)',
    platform: 'H5 / 小程序 / RN / Native',
    performance: '取决于目标平台',
    eco: '成熟',
  },
];

export const bridgeColumns = [
  { title: '通信方式', dataIndex: 'method', key: 'method' },
  { title: '原理', dataIndex: 'principle', key: 'principle' },
  { title: '优点', dataIndex: 'pros', key: 'pros' },
  { title: '缺点', dataIndex: 'cons', key: 'cons' },
];

export const bridgeData = [
  {
    key: '1',
    method: 'URL Scheme 拦截',
    principle: 'Web 端发起自定义 URL 请求（如 jsbridge://call?method=xxx），原生端拦截 WebView 的 shouldOverrideUrlLoading',
    pros: '实现简单，兼容所有 WebView 版本',
    cons: 'URL 长度限制；传参需编码；同步调用困难',
  },
  {
    key: '2',
    method: 'JavaScriptCore / JSI 注入',
    principle: '原生端通过 WebView 的 evaluateJavaScript / addJavascriptInterface 向 JS 上下文注入全局对象',
    pros: '高效、支持同步/异步双向调用',
    cons: '对 WebView 版本有要求；安全性需关注（Android addJavascriptInterface 历史漏洞）',
  },
  {
    key: '3',
    method: 'postMessage 双向通信',
    principle: '利用 WebView 的 onMessage/postMessage API（如 WKUserContentController）',
    pros: '标准化 API、安全、支持结构化数据',
    cons: '仅 iOS WKWebView 及以上版本支持',
  },
  {
    key: '4',
    method: 'WebSocket 桥接',
    principle: '原生端启动本地 WebSocket Server，Web 端通过 WebSocket 连接进行通信',
    pros: '全双工、无大小限制、可跨 WebView',
    cons: '实现复杂；多了一层网络开销',
  },
];

export const callModeColumns = [
  { title: '模式', dataIndex: 'mode', key: 'mode' },
  { title: '流程', dataIndex: 'flow', key: 'flow' },
  { title: '适用场景', dataIndex: 'scenario', key: 'scenario' },
];

export const callModeData = [
  {
    key: '1',
    mode: 'JS -> Native 单向通知',
    flow: 'JS 调用原生方法，不关心返回值',
    scenario: '修改原生配置、触发震动、关闭 WebView',
  },
  {
    key: '2',
    mode: 'JS -> Native -> 回调',
    flow: 'JS 调用原生方法，原生完成后通过回调通知 JS',
    scenario: '获取设备信息、读取相册、调用支付',
  },
  {
    key: '3',
    mode: 'Native -> JS 主动推送',
    flow: '原生主动调用 JS 注册的回调函数',
    scenario: '网络状态变化、定位更新、推送通知',
  },
  {
    key: '4',
    mode: '双向实时通信',
    flow: '双方通过 Bridge 随时发起调用',
    scenario: 'IM 消息、协同编辑、实时白板',
  },
];
