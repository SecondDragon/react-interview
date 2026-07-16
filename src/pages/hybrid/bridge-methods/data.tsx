import { Tag } from 'antd';
import React from 'react';

export const bridgeMethodsColumns = [
  { title: '特性', dataIndex: 'feature', key: 'feature' },
  { title: 'URL Scheme 拦截', dataIndex: 'urlScheme', key: 'urlScheme' },
  { title: 'JSI 上下文注入', dataIndex: 'jsi', key: 'jsi' },
  { title: 'postMessage', dataIndex: 'postMessage', key: 'postMessage' },
  { title: 'WebSocket 桥接', dataIndex: 'websocket', key: 'websocket' },
];

export const bridgeMethodsData = [
  {
    key: '1',
    feature: '通信方向',
    urlScheme: 'Web → Native（单向）',
    jsi: '双向同步/异步',
    postMessage: '双向异步',
    websocket: '全双工实时通信',
  },
  {
    key: '2',
    feature: '数据格式',
    urlScheme: 'URL 编码字符串',
    jsi: 'JavaScript 原生类型',
    postMessage: '结构化数据（JSON）',
    websocket: '文本 / 二进制帧',
  },
  {
    key: '3',
    feature: '数据大小限制',
    urlScheme: '~2KB（URL 长度限制）',
    jsi: '无硬限制',
    postMessage: '无硬限制',
    websocket: '无硬限制（分帧传输）',
  },
  {
    key: '4',
    feature: '同步调用',
    urlScheme: '❌ 不支持',
    jsi: '✅ 支持',
    postMessage: '❌ 不支持',
    websocket: '❌ 不支持（需模拟）',
  },
  {
    key: '5',
    feature: '双向通信',
    urlScheme: '❌ 单向',
    jsi: '✅ 双向',
    postMessage: '✅ 双向',
    websocket: '✅ 全双工',
  },
  {
    key: '6',
    feature: '实现复杂度',
    urlScheme: '⭐ 最低',
    jsi: '⭐⭐ 较低',
    postMessage: '⭐⭐⭐ 中等',
    websocket: '⭐⭐⭐⭐ 较高',
  },
  {
    key: '7',
    feature: '兼容性',
    urlScheme: '所有 WebView 版本',
    jsi: '所有 WebView 版本',
    postMessage: 'iOS 8+ WKWebView / Android 6+',
    websocket: 'WebSocket 协议支持即可',
  },
  {
    key: '8',
    feature: '安全性',
    urlScheme: '低（URL 可被监听）',
    jsi: '中（需 @JavascriptInterface 注解）',
    postMessage: '高（沙箱隔离）',
    websocket: '中（需处理跨域）',
  },
  {
    key: '9',
    feature: '典型场景',
    urlScheme: '简单参数传递、分享',
    jsi: '设备信息获取、本地存储',
    postMessage: '支付、登录、相机',
    websocket: 'IM 聊天、实时协作',
  },
];

export const summaryColumns = [
  { title: '评估维度', dataIndex: 'dimension', key: 'dimension' },
  { title: 'URL Scheme', dataIndex: 'urlScheme', key: 'urlScheme' },
  { title: 'JSI 注入', dataIndex: 'jsi', key: 'jsi' },
  { title: 'postMessage', dataIndex: 'postMessage', key: 'postMessage' },
  { title: 'WebSocket', dataIndex: 'websocket', key: 'websocket' },
];

export const summaryData = [
  {
    key: '1',
    dimension: '快速原型',
    urlScheme: <Tag color="green">推荐</Tag>,
    jsi: <Tag color="blue">可用</Tag>,
    postMessage: <Tag color="gold">不推荐</Tag>,
    websocket: <Tag color="red">太重</Tag>,
  },
  {
    key: '2',
    dimension: '生产级 App',
    urlScheme: <Tag color="gold">仅作降级</Tag>,
    jsi: <Tag color="green">推荐</Tag>,
    postMessage: <Tag color="green">推荐</Tag>,
    websocket: <Tag color="blue">按需选用</Tag>,
  },
  {
    key: '3',
    dimension: '实时通信场景',
    urlScheme: <Tag color="red">不合适</Tag>,
    jsi: <Tag color="gold">较勉强</Tag>,
    postMessage: <Tag color="blue">可用</Tag>,
    websocket: <Tag color="green">最优</Tag>,
  },
  {
    key: '4',
    dimension: '低版本兼容',
    urlScheme: <Tag color="green">最优</Tag>,
    jsi: <Tag color="green">最优</Tag>,
    postMessage: <Tag color="red">不兼容</Tag>,
    websocket: <Tag color="gold">有限</Tag>,
  },
  {
    key: '5',
    dimension: '最佳实践推荐',
    urlScheme: <Tag color="red">历史方案</Tag>,
    jsi: <Tag color="green">混合使用</Tag>,
    postMessage: <Tag color="green">混合使用</Tag>,
    websocket: <Tag color="blue">专项使用</Tag>,
  },
];

export const liveDemoMethods = [
  {
    key: 'urlScheme',
    label: 'URL Scheme 拦截',
    color: '#faad14',
    description: '通过自定义 URL 触发原生能力，适用于简单单向通知',
    pros: ['实现最简单', '兼容所有 WebView', '无需原生 SDK 升级'],
    cons: ['URL 长度限制 2KB', '无法同步获取返回值', '数据需手动编解码', '安全性较低'],
  },
  {
    key: 'jsi',
    label: 'JSI 上下文注入',
    color: '#1890ff',
    description: '注入全局对象到 JS 上下文，支持双向同步/异步调用',
    pros: ['通信延迟最低', '支持同步调用', '无数据大小限制', '双向通信'],
    cons: ['Android 历史安全漏洞', 'iOS 需 WKWebView', '方法名冲突风险'],
  },
  {
    key: 'postMessage',
    label: 'postMessage 双向通信',
    color: '#52c41a',
    description: '通过 WebView 标准消息 API 进行结构化数据通信',
    pros: ['标准化 API', '安全沙箱隔离', '支持结构化数据', '原生推荐方式'],
    cons: ['仅异步通信', 'iOS 需 WKWebView', 'Android 需 6.0+'],
  },
  {
    key: 'websocket',
    label: 'WebSocket 桥接',
    color: '#722ed1',
    description: '原生启动本地 WebSocket Server，实现全双工通信',
    pros: ['真正全双工', '无大小限制', '可跨 WebView', '支持二进制'],
    cons: ['实现最复杂', '额外网络开销', '端口管理麻烦', '连接管理复杂'],
  },
];
