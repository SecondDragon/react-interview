export const introData = {
  title: '一、引言',
  content: [
    '在微前端架构中，主应用和子应用运行在同一页面的不同生命周期中。它们共享同一个浏览器标签页，却拥有各自独立的 JavaScript 执行上下文和 DOM 区域。',
    '这时候就会出现一个核心问题：',
    '<strong>主应用的登录状态如何同步到子应用？</strong>',
    '<strong>子应用 A 修改了数据，子应用 B 怎么知道？</strong>',
    '<strong>主题色切换是否所有子应用都跟随？</strong>',
    '这些问题靠 iframe 的 postMessage 可以解决，但不够直观。qiankun 提供了两种内置的通信机制：<strong>Props 通信</strong>和<strong>全局状态（GlobalState）</strong>。',
  ],
  scenarios: [
    '主应用登录 → 所有子应用获取 token',
    '主应用切换主题 → 所有子应用同步切换',
    '子应用 A 修改了某些全局数据 → 子应用 B 需要感知',
  ],
};

export const propsData = {
  title: '二、Props 通信',
  apiTable: {
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
  },
  advantageTable: {
    columns: [
      { title: '优势', dataIndex: 'pro', key: 'pro' },
      { title: '不足', dataIndex: 'con', key: 'con' },
    ],
    dataSource: [
      { key: '1', pro: '简单直观，类型安全', con: '只能主 → 子单向传递' },
      { key: '2', pro: '支持函数、对象等引用类型', con: 'registerMicroApps 的 props 在子应用重新 mount 前不变' },
      { key: '3', pro: '天然与生命周期绑定', con: '兄弟子应用之间无法通过 props 直接通信' },
    ],
  },
};

export const globalStateData = {
  title: '三、initGlobalState 全局状态',
  apiTable: {
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
  },
};

export const comparisonData = {
  title: '四、对比和选型',
  table: {
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
  },
};

export const principleData = {
  title: '五、原理解析',
  sections: [
    {
      subtitle: '5.1 发布订阅模式',
      content: [
        `<code>initGlobalState</code> 的核心机制是<strong>发布-订阅模式</strong>。qiankun 内部维护一个全局状态仓库和一个订阅者列表。`,
        `<strong>核心流程：</strong>`,
        `<code>initGlobalState(state)</code>：创建一个全局状态仓库，内部维护一个 state 对象和一个 observers（Map<string, Function>）。`,
        `<code>setGlobalState(newState)</code>：合并新状态到旧状态，遍历所有 observers 执行回调。`,
        `<code>onGlobalStateChange(callback)</code>：将 callback 注册到 observers 中。`,
        `<code>offGlobalStateChange()</code>：从 observers 中移除所有回调。`,
      ],
    },
    {
      subtitle: '5.2 如何注入到子应用 props 中',
      content: [
        `qiankun 在加载子应用时，会将 <code>onGlobalStateChange</code> 和 <code>setGlobalState</code> 自动注入到子应用的 props 中。`,
        `也就是说，子应用收到的 props 中不仅包含 registerMicroApps 时传入的 props，还包含全局状态的接口。`,
        `这就是为什么子应用在 mount 时可以直接 <code>props.onGlobalStateChange(...)</code>。`,
      ],
    },
    {
      subtitle: '5.3 沙箱隔离对通信的影响',
      content: [
        `qiankun 的 JS 沙箱（proxySandbox）拦截了子应用的 window 操作。`,
        `子应用内部的 <code>window.xxx = yyy</code> 不会暴露到主应用 window。`,
        `正因为沙箱隔离，子应用无法直接访问主应用的全局变量——所以才需要 <code>initGlobalState</code> 这种显式的通信机制。`,
        `因此，<code>initGlobalState</code> 是<strong>唯一受官方推荐</strong>的跨应用通信方式（除了 props）。`,
      ],
    },
    {
      subtitle: '5.4 fireImmediately 参数',
      content: [
        `<code>fireImmediately = true</code>：注册后立即以当前 state 调用一次 callback。`,
        `<code>fireImmediately = false</code> 或不传：只在 state 变化时才调用 callback。`,
        `在子应用初始化时，需要使用 <code>true</code> 来获取当前状态。`,
      ],
    },
    {
      subtitle: '5.5 offGlobalStateChange 与内存泄漏',
      content: [
        `<code>offGlobalStateChange</code> 会清除该子应用的所有订阅者。`,
        `但 <code>onGlobalStateChange</code> 返回的 unsubscribe 函数可以更精细地取消单个订阅。`,
        `<strong>建议：</strong>在子应用 <code>unmount</code> 生命周期中取消订阅，防止内存泄漏。`,
        `qiankun 在子应用 unmount 时会自动调用 offGlobalStateChange，但如果是通过 <code>loadMicroApp</code> 手动管理的子应用，需要自己调用 unsubscribe。`,
      ],
    },
  ],
};

export const liveDemoData = {
  title: '六、Live Demo：实时通信演示',
  description: '模拟 qiankun 中主应用与子应用之间的全局状态通信。每个面板代表一个应用实例，修改状态后其他面板立即收到更新。',
};
