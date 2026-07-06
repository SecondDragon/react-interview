import { ReactNode } from 'react';

export const propsApiTable = {
  columns: [
    { title: 'API', dataIndex: 'api', key: 'api' },
    { title: '说明', dataIndex: 'desc', key: 'desc' },
    { title: '调用方', dataIndex: 'caller', key: 'caller' },
  ],
  dataSource: [
    { key: '1', api: 'registerMicroApps apps[n].props', desc: '注册时传入 props，子应用 mount 时接收', caller: '主应用' },
    { key: '2', api: 'loadMicroApp(app, { props })', desc: '手动加载时传入 props', caller: '主应用' },
    { key: '3', api: 'app.update({ props })', desc: '动态更新 loadMicroApp 加载的子应用 props', caller: '主应用' },
    { key: '4', api: 'mount(props) 的参数', desc: '子应用 mount 生命周期接收的 props 对象', caller: '子应用' },
  ],
};

export const propsAdvantageTable = {
  columns: [
    { title: '优势', dataIndex: 'pro', key: 'pro' },
    { title: '不足', dataIndex: 'con', key: 'con' },
  ],
  dataSource: [
    { key: '1', pro: '简单直观，类型安全', con: '只能主 → 子单向传递' },
    { key: '2', pro: '支持函数、对象等引用类型', con: 'registerMicroApps 的 props 在子应用重新 mount 前不变' },
    { key: '3', pro: '天然与生命周期绑定', con: '兄弟子应用之间无法通过 props 直接通信' },
  ],
};

export const globalStateApiTable = {
  columns: [
    { title: 'API', dataIndex: 'api', key: 'api' },
    { title: '说明', dataIndex: 'desc', key: 'desc' },
    { title: '在哪调用', dataIndex: 'caller', key: 'caller' },
  ],
  dataSource: [
    { key: '1', api: 'initGlobalState(state)', desc: '初始化全局状态，返回 actions 对象', caller: '主应用' },
    { key: '2', api: 'actions.setGlobalState(state)', desc: '修改全局状态，触发所有订阅者', caller: '主应用 / 子应用' },
    { key: '3', api: 'actions.onGlobalStateChange(cb, fireImmediately?)', desc: '订阅全局状态变化', caller: '主应用 / 子应用' },
    { key: '4', api: 'actions.offGlobalStateChange()', desc: '取消所有订阅', caller: '主应用 / 子应用' },
  ],
};

export const comparisonTable = {
  columns: [
    { title: '场景', dataIndex: 'scenario', key: 'scenario' },
    { title: '推荐方式', dataIndex: 'recommendation', key: 'recommendation' },
    { title: '原因', dataIndex: 'reason', key: 'reason' },
  ],
  dataSource: [
    { key: '1', scenario: '主应用传递给子应用静态配置（baseUrl、主题色）', recommendation: 'props', reason: '简单、类型安全' },
    { key: '2', scenario: '子应用需要修改全局数据并通知其他子应用', recommendation: 'globalState', reason: '双向、发布订阅' },
    { key: '3', scenario: '需要在子应用 unmount 后仍然保留状态', recommendation: 'globalState', reason: '保存在主应用内存中' },
    { key: '4', scenario: '传递函数回调（如跳转到主应用某个页面）', recommendation: 'props', reason: '函数引用无法序列化，props 直接传' },
    { key: '5', scenario: '兄弟子应用之间直接通信', recommendation: 'globalState', reason: 'props 是主→子单向的' },
    { key: '6', scenario: '状态变化需要严格追踪', recommendation: 'globalState', reason: 'onGlobalStateChange 提供 prev 和 next' },
  ],
};
