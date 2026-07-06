export const comparisonTable = {
  columns: [
    { title: '对比项', dataIndex: 'item', key: 'item' },
    { title: 'registerMicroApps', dataIndex: 'register', key: 'register' },
    { title: 'loadMicroApp', dataIndex: 'load', key: 'load' },
  ],
  dataSource: [
    { key: '1', item: '触发方式', register: '路由变化自动触发', load: '手动调用' },
    { key: '2', item: '粒度', register: '全局注册，所有路由匹配自动激活', load: '单实例精细控制' },
    { key: '3', item: 'props 更新', register: '子应用重新 mount 才能更新', load: '调用 app.update({ props }) 动态更新' },
    { key: '4', item: '多实例', register: '一个子应用只能由一个容器', load: '同一子应用可在不同容器同时挂载' },
    { key: '5', item: '卸载时机', register: '路由离开时自动卸载', load: '手动调用 app.unmount()' },
    { key: '6', item: '返回类型', register: 'void', load: 'LoadableApp 实例' },
  ],
};

export const statusTable = {
  columns: [
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '含义', dataIndex: 'meaning', key: 'meaning' },
  ],
  dataSource: [
    { key: '1', status: 'NOT_LOADED', meaning: '子应用尚未加载入口文件' },
    { key: '2', status: 'LOADING_SOURCE_CODE', meaning: '正在加载子应用的 JS entry' },
    { key: '3', status: 'NOT_BOOTSTRAPPED', meaning: '入口已加载，但尚未执行 bootstrap' },
    { key: '4', status: 'BOOTSTRAPPING', meaning: '正在执行子应用的 bootstrap 回调' },
    { key: '5', status: 'NOT_MOUNTED', meaning: '子应用已准备好，等待 mount' },
    { key: '6', status: 'MOUNTING', meaning: '正在执行子应用的 mount 回调' },
    { key: '7', status: 'MOUNTED', meaning: '子应用已挂载并正常运行' },
    { key: '8', status: 'UNMOUNTING', meaning: '正在执行子应用的 unmount 回调' },
    { key: '9', status: 'UNLOADING', meaning: '正在卸载子应用的入口资源（仅 loadMicroApp 支持）' },
    { key: '10', status: 'SKIP_BECAUSE_BROKEN', meaning: '子应用出错，标记为不可用' },
    { key: '11', status: 'LOAD_ERROR', meaning: '加载入口文件时出错' },
  ],
};
