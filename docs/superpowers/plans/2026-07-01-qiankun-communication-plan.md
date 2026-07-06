# qiankun 专题 — 应用间通信 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在主应用 react-interview 的 `qiankun 专题` 下新增 `应用间通信` 知识体系页面，覆盖 props 通信和 initGlobalState 的所有 API 及底层实现原理。

**Architecture:** 采用 `content.mdx` 单文件结构（与 overview 一致），复杂逻辑提到单独组件中。`data.ts` 存放章节文本和表格数据，`LiveDemo.tsx` 作为实时通信演示，`demos/` 存放代码示例通过 `?raw` 引入。路由注册在所有组件创建完成后最后进行。

**Tech Stack:** React 18 + TypeScript + Vite + Ant Design + `react-diff-viewer-continued`（CodeDiff 组件）。

---

## 文件结构

```text
src/pages/qiankun/communication/
  index.tsx
  content.mdx
  data.ts
  LiveDemo.tsx
  demos/
    props-register.tsx
    props-mount.tsx
    props-update.tsx
    init-global-state.tsx
    on-global-state-change.tsx
    set-global-state.tsx
    off-global-state-change.tsx
    publish-subscribe-implementation.ts
src/router/config.tsx     # 最后一步才注册新路由
```

---

## Task 1: 创建目录结构与数据文件

**Files:**
- Create: `src/pages/qiankun/communication/data.ts`
- Create directories: `src/pages/qiankun/communication/demos`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p src/pages/qiankun/communication/demos
```

- [ ] **Step 2: 编写 data.ts**

```typescript
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
```

- [ ] **Step 3: 验证 TypeScript**

Run: `npx tsc --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck src/pages/qiankun/communication/data.ts`
Expected: 通过。

- [ ] **Step 4: Commit**

```bash
git add src/pages/qiankun/communication/data.ts
git commit -m "feat(qiankun-communication): add data.ts"
```

---

## Task 2: 创建 demo 代码示例文件

**Files:**
- Create: `src/pages/qiankun/communication/demos/props-register.tsx`
- Create: `src/pages/qiankun/communication/demos/props-mount.tsx`
- Create: `src/pages/qiankun/communication/demos/props-update.tsx`
- Create: `src/pages/qiankun/communication/demos/init-global-state.tsx`
- Create: `src/pages/qiankun/communication/demos/on-global-state-change.tsx`
- Create: `src/pages/qiankun/communication/demos/set-global-state.tsx`
- Create: `src/pages/qiankun/communication/demos/off-global-state-change.tsx`
- Create: `src/pages/qiankun/communication/demos/publish-subscribe-implementation.ts`

- [ ] **Step 1: props-register.tsx**

```tsx
// ✅ registerMicroApps 传入 props
// 主应用通过 props 向子应用传递初始数据和回调函数

import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:8001',
    container: '#container',
    activeRule: '/app1',
    // props 字段：在子应用 mount 时，这些数据会作为 props 参数传入
    props: {
      // 可以传普通数据
      token: 'xxx',
      user: { id: 1, name: 'Alice' },
      // 可以传函数回调
      onLogout: () => {
        window.location.href = '/login';
      },
      // 可以传 Ant Design 主题配置
      theme: { colorPrimary: '#1677ff', borderRadius: 6 },
    },
  },
  {
    name: 'app2',
    entry: '//localhost:8002',
    container: '#container',
    activeRule: '/app2',
    // 不同子应用可以传入不同的 props
    props: {
      token: 'yyy',
      user: { id: 2, name: 'Bob' },
      baseUrl: '/api/v2',
    },
  },
]);

start();
```

- [ ] **Step 2: props-mount.tsx**

```tsx
// ✅ 子应用 mount 生命周期接收 props
// props 包含两部分：registerMicroApps 传入的 props + qiankun 自动注入的全局状态接口

// 子应用入口文件
let appInstance: any = null;

export async function mount(props: any) {
  // props 的结构如下：
  // {
  //   token: 'xxx',                        // registerMicroApps 传入的
  //   user: { id: 1, name: 'Alice' },      // registerMicroApps 传入的
  //   onLogout: () => {},                   // registerMicroApps 传入的函数回调
  //   container: document.querySelector('#container'), // qiankun 自动注入的挂载容器
  //   onGlobalStateChange: fn,              // qiankun 自动注入的全局状态订阅
  //   setGlobalState: fn,                   // qiankun 自动注入的全局状态修改
  // }

  const { container, token, user, onLogout } = props;

  // 使用 props 中的 container 作为挂载点
  const rootElement = container
    ? container.querySelector('#app')
    : document.getElementById('app');

  appInstance = createApp(App);
  appInstance.config.globalProperties.$token = token;
  appInstance.config.globalProperties.$user = user;
  appInstance.config.globalProperties.$onLogout = onLogout;
  appInstance.mount(rootElement);
}

export async function unmount(props: any) {
  const { container } = props;
  if (appInstance) {
    appInstance.unmount();
    appInstance = null;
  }
}
```

- [ ] **Step 3: props-update.tsx**

```tsx
// ✅ loadMicroApp 动态更新 props
// registerMicroApps 的 props 无法动态更新，但 loadMicroApp 可以

import { loadMicroApp } from 'qiankun';

// 手动加载子应用
const app = loadMicroApp('app1', {
  entry: '//localhost:8001',
  container: '#container',
  props: {
    token: 'initial-token',
    user: null,
  },
});

// 稍后登录成功，需要更新 token
app.update({
  props: {
    token: 'new-token-after-login',
    user: { id: 1, name: 'Alice' },
  },
});

// 再次更新
app.update({
  props: {
    token: 'refreshed-token',
  },
});

// 需要注意：update 只会将新 props 合并到旧 props 中
// 不会触发子应用重新 mount，而是通过 qiankun 内部机制通知子应用
```

- [ ] **Step 4: init-global-state.tsx**

```tsx
// ✅ initGlobalState 基本用法（主应用侧）

import { initGlobalState, MicroAppStateActions } from 'qiankun';

// 1. 定义初始状态
const initialState = {
  user: null,            // 用户信息，登录后由主应用设置
  theme: 'light',        // 主题：light / dark
  token: '',             // 登录令牌
  notifications: [],     // 全局通知列表
};

// 2. 初始化全局状态
// 返回一个 actions 对象，包含 setGlobalState、onGlobalStateChange、offGlobalStateChange
const actions: MicroAppStateActions = initGlobalState(initialState);

// 3. 主应用也可以订阅全局状态变化
actions.onGlobalStateChange((state, prev) => {
  console.log('主应用监听到全局状态变化：', state, prev);
});

// 4. 导出 actions 供其他地方使用
export { actions };
```

- [ ] **Step 5: on-global-state-change.tsx**

```tsx
// ✅ 子应用订阅全局状态变化

// 子应用入口文件中

let unsubscribeFromGlobalState: (() => void) | null = null;

export async function mount(props: any) {
  const { onGlobalStateChange, setGlobalState } = props;

  // 订阅全局状态变化
  // 第一个参数：回调函数，接收新状态 (state) 和旧状态 (prev)
  // 第二个参数：fireImmediately，是否注册后立即调用一次
  unsubscribeFromGlobalState = onGlobalStateChange(
    (state: any, prev: any) => {
      console.log('子应用收到全局状态变化：', state, prev);
      console.log('用户信息：', state.user);
      console.log('主题：', state.theme);
      console.log('Token：', state.token);

      // 根据变化更新子应用内部状态
      if (state.theme !== prev.theme) {
        applyTheme(state.theme);
      }
      if (state.user !== prev.user) {
        updateUserInfo(state.user);
      }
    },
    true, // fireImmediately = true：立即获取一次当前状态
  );
}

function applyTheme(theme: string) {
  document.documentElement.setAttribute('data-theme', theme);
}

function updateUserInfo(user: any) {
  // 更新子应用内部的 user store 或 context
}

export async function unmount(props: any) {
  // 取消订阅，防止内存泄漏
  if (unsubscribeFromGlobalState) {
    unsubscribeFromGlobalState();
    unsubscribeFromGlobalState = null;
  }
}
```

- [ ] **Step 6: set-global-state.tsx**

```tsx
// ✅ 子应用修改全局状态

import React from 'react';
import { Button, Card } from 'antd';

// 模拟子应用中的一个 React 组件
function ThemeToggle(props: any) {
  // props 中的 setGlobalState 来自 mount 时传入的 props
  const { setGlobalState } = props;

  const toggleTheme = () => {
    // 子应用可以修改全局状态
    // 所有订阅了 onGlobalStateChange 的其他子应用会立即收到更新
    setGlobalState({
      theme: 'dark',
    });
  };

  const updateNotifications = () => {
    setGlobalState((prev: any) => ({
      notifications: [...prev.notifications, { id: Date.now(), text: '新通知' }],
    }));
  };

  return (
    <Card title="子应用 A">
      <Button onClick={toggleTheme}>切换到暗黑模式</Button>
      <Button onClick={updateNotifications}>添加通知</Button>
    </Card>
  );
}

export default ThemeToggle;
```

- [ ] **Step 7: off-global-state-change.tsx**

```tsx
// ✅ 取消订阅 offGlobalStateChange
// 两种取消方式：

// 方式一：onGlobalStateChange 返回的 unsubscribe 函数（推荐，更精确）
export async function mount(props: any) {
  const { onGlobalStateChange } = props;

  const unsubscribe1 = onGlobalStateChange((state) => {
    console.log('订阅者 1', state.theme);
  });

  const unsubscribe2 = onGlobalStateChange((state) => {
    console.log('订阅者 2', state.token);
  });

  // 可以单独取消某一个订阅，不影响其他订阅
  unsubscribe1(); // 只取消订阅者 1
}

// 方式二：actions.offGlobalStateChange()（主应用侧）
// 会清除所有订阅者
import { initGlobalState } from 'qiankun';

const actions = initGlobalState({});

// 添加订阅
actions.onGlobalStateChange((state) => {
  console.log('订阅者', state);
});

// 清除所有订阅
actions.offGlobalStateChange();
// 之后任何 setGlobalState 都不会触发回调
```

- [ ] **Step 8: publish-subscribe-implementation.ts**

```ts
// 手写发布订阅模式 —— 理解 initGlobalState 的内部实现原理

type Callback = (state: any, prev: any) => void;

interface GlobalStateActions {
  onGlobalStateChange: (callback: Callback, fireImmediately?: boolean) => () => void;
  setGlobalState: (newState: Record<string, any>) => void;
  offGlobalStateChange: () => void;
}

function initGlobalState(initialState: Record<string, any>): GlobalStateActions {
  // 内部状态
  let currentState = { ...initialState };

  // 订阅者列表，使用 Map 可以给每个订阅者分配唯一 id
  let observerId = 0;
  const observers = new Map<number, Callback>();

  return {
    // 订阅全局状态变化
    onGlobalStateChange(callback: Callback, fireImmediately?: boolean) {
      const id = ++observerId;
      observers.set(id, callback);

      // fireImmediately: 注册后立即以当前状态执行一次回调
      if (fireImmediately) {
        // 深度克隆，避免 callback 直接修改 state
        callback({ ...currentState }, { ...currentState });
      }

      // 返回 unsubscribe 函数
      return () => {
        observers.delete(id);
      };
    },

    // 修改全局状态
    setGlobalState(newState: Record<string, any>) {
      const prevState = { ...currentState };

      // 合并新状态
      currentState = {
        ...currentState,
        ...newState,
      };

      // 通知所有订阅者
      observers.forEach((callback) => {
        callback({ ...currentState }, prevState);
      });
    },

    // 取消所有订阅
    offGlobalStateChange() {
      observers.clear();
    },
  };
}

// 使用示例
const actions = initGlobalState({ user: null, theme: 'light' });

const unsubscribe = actions.onGlobalStateChange((state, prev) => {
  console.log('state changed:', prev, '→', state);
}, true);

actions.setGlobalState({ theme: 'dark' });
actions.setGlobalState({ user: { name: 'Alice' } });

unsubscribe(); // 取消订阅
```

- [ ] **Step 9: 验证**

Run: `npx tsc --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck src/pages/qiankun/communication/demos/props-register.tsx src/pages/qiankun/communication/demos/props-mount.tsx src/pages/qiankun/communication/demos/props-update.tsx src/pages/qiankun/communication/demos/init-global-state.tsx src/pages/qiankun/communication/demos/on-global-state-change.tsx src/pages/qiankun/communication/demos/set-global-state.tsx src/pages/qiankun/communication/demos/off-global-state-change.tsx src/pages/qiankun/communication/demos/publish-subscribe-implementation.ts`
Expected: 通过。

- [ ] **Step 10: Commit**

```bash
git add src/pages/qiankun/communication/demos/
git commit -m "feat(qiankun-communication): add demo files"
```

---

## Task 3: 创建 LiveDemo 组件

**Files:**
- Create: `src/pages/qiankun/communication/LiveDemo.tsx`

- [ ] **Step 1: 编写 LiveDemo.tsx**

```tsx
import React, { useState, useCallback, useRef } from 'react';
import { Card, Space, Typography, Tag, Button, Divider, Input, Switch } from 'antd';

interface LogEntry {
  id: number;
  source: string;
  action: string;
  prevValue: string;
  newValue: string;
  timestamp: string;
}

const LiveDemo: React.FC = () => {
  const [globalState, setGlobalState] = useState({
    user: '未登录',
    theme: 'light',
    count: 0,
  });
  const [appAState, setAppAState] = useState(globalState);
  const [appBState, setAppBState] = useState(globalState);
  const [appASubscribed, setAppASubscribed] = useState(true);
  const [appBSubscribed, setAppBSubscribed] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logId = useRef(0);
  const [userInput, setUserInput] = useState('Alice');

  const now = () => new Date().toLocaleTimeString('zh-CN', { hour12: false });

  const addLog = useCallback((source: string, action: string, prev: string, next: string) => {
    logId.current += 1;
    setLogs((prev) => [
      { id: logId.current, source, action, prevValue: prev, newValue: next, timestamp: now() },
      ...prev,
    ]);
  }, []);

  const updateGlobalState = useCallback((partialState: Partial<typeof globalState>) => {
    const prev = JSON.stringify(globalState);
    setGlobalState((prevState) => {
      const newState = { ...prevState, ...partialState };
      const next = JSON.stringify(newState);
      addLog('主应用', `setGlobalState(${JSON.stringify(partialState)})`, prev, next);
      return newState;
    });
    if (appASubscribed) {
      setAppAState((prev) => ({ ...prev, ...partialState }));
      addLog('子应用 A', 'onGlobalStateChange 收到更新', JSON.stringify(appAState), JSON.stringify({ ...appAState, ...partialState }));
    }
    if (appBSubscribed) {
      setAppBState((prev) => ({ ...prev, ...partialState }));
      addLog('子应用 B', 'onGlobalStateChange 收到更新', JSON.stringify(appBState), JSON.stringify({ ...appBState, ...partialState }));
    }
  }, [globalState, appAState, appBState, appASubscribed, appBSubscribed, addLog]);

  const simulateChildAction = useCallback((child: 'A' | 'B', partialState: Partial<typeof globalState>) => {
    const prev = JSON.stringify(globalState);
    addLog(`子应用 ${child}`, `setGlobalState(${JSON.stringify(partialState)})`, prev, '');
    setGlobalState((prevState) => {
      const newState = { ...prevState, ...partialState };
      const next = JSON.stringify(newState);
      addLog(`子应用 ${child}`, `setGlobalState 执行完毕`, prev, next);
      return newState;
    });
    if (child === 'A') {
      setAppAState((prev) => ({ ...prev, ...partialState }));
      if (appBSubscribed) {
        setAppBState((prev) => ({ ...prev, ...partialState }));
        addLog('子应用 B', '收到子应用 A 的更新', '', JSON.stringify(partialState));
      }
    }
    if (child === 'B') {
      setAppBState((prev) => ({ ...prev, ...partialState }));
      if (appASubscribed) {
        setAppAState((prev) => ({ ...prev, ...partialState }));
        addLog('子应用 A', '收到子应用 B 的更新', '', JSON.stringify(partialState));
      }
    }
  }, [globalState, appASubscribed, appBSubscribed, addLog]);

  return (
    <Card title="实时通信演示">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 主应用面板 */}
        <Card size="small" title="🏠 主应用 initGlobalState" extra={<Tag color="blue">Global State</Tag>}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Typography.Text strong>用户：</Typography.Text>
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                style={{ width: 200 }}
              />
              <Button
                size="small"
                style={{ marginLeft: 8 }}
                onClick={() => updateGlobalState({ user: userInput })}
              >
                设置用户
              </Button>
            </div>
            <div>
              <Typography.Text strong>主题：</Typography.Text>
              <Switch
                checkedChildren="dark"
                unCheckedChildren="light"
                checked={globalState.theme === 'dark'}
                onChange={(checked) => updateGlobalState({ theme: checked ? 'dark' : 'light' })}
              />
            </div>
            <div>
              <Typography.Text strong>计数器：</Typography.Text>
              <Tag>{globalState.count}</Tag>
              <Button size="small" onClick={() => updateGlobalState({ count: globalState.count + 1 })}>
                +1
              </Button>
            </div>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              当前全局状态：
            </Typography.Paragraph>
            <pre style={{ margin: 0, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
              {JSON.stringify(globalState, null, 2)}
            </pre>
          </Space>
        </Card>

        {/* 子应用面板 */}
        <div style={{ display: 'flex', gap: 16 }}>
          <Card
            size="small"
            title="📦 子应用 A"
            style={{ flex: 1 }}
            extra={
              <Space>
                <Tag color={appASubscribed ? 'green' : 'red'}>
                  {appASubscribed ? '已订阅' : '未订阅'}
                </Tag>
                <Button size="small" onClick={() => {
                  setAppASubscribed(!appASubscribed);
                  addLog('子应用 A', appASubscribed ? 'offGlobalStateChange 取消订阅' : 'onGlobalStateChange 重新订阅', '', '');
                }}>
                  {appASubscribed ? '取消订阅' : '重新订阅'}
                </Button>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Typography.Text strong>收到的用户：</Typography.Text>
                <Tag>{appAState.user}</Tag>
              </div>
              <div>
                <Typography.Text strong>收到的主题：</Typography.Text>
                <Tag>{appAState.theme}</Tag>
              </div>
              <div>
                <Typography.Text strong>收到的计数：</Typography.Text>
                <Tag>{appAState.count}</Tag>
              </div>
              <Button size="small" onClick={() => simulateChildAction('A', { count: globalState.count + 10 })}>
                子应用 A：设置 count += 10
              </Button>
            </Space>
          </Card>

          <Card
            size="small"
            title="📦 子应用 B"
            style={{ flex: 1 }}
            extra={
              <Space>
                <Tag color={appBSubscribed ? 'green' : 'red'}>
                  {appBSubscribed ? '已订阅' : '未订阅'}
                </Tag>
                <Button size="small" onClick={() => {
                  setAppBSubscribed(!appBSubscribed);
                  addLog('子应用 B', appBSubscribed ? 'offGlobalStateChange 取消订阅' : 'onGlobalStateChange 重新订阅', '', '');
                }}>
                  {appBSubscribed ? '取消订阅' : '重新订阅'}
                </Button>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Typography.Text strong>收到的用户：</Typography.Text>
                <Tag>{appBState.user}</Tag>
              </div>
              <div>
                <Typography.Text strong>收到的主题：</Typography.Text>
                <Tag>{appBState.theme}</Tag>
              </div>
              <div>
                <Typography.Text strong>收到的计数：</Typography.Text>
                <Tag>{appBState.count}</Tag>
              </div>
              <Button size="small" onClick={() => simulateChildAction('B', { theme: globalState.theme === 'dark' ? 'light' : 'dark' })}>
                子应用 B：切换主题
              </Button>
            </Space>
          </Card>
        </div>

        <Divider />

        {/* 时间线日志 */}
        <Card size="small" title="📋 通信日志时间线">
          <div style={{ maxHeight: 300, overflow: 'auto' }}>
            {logs.length === 0 ? (
              <Typography.Text type="secondary">暂无日志，请操作上方面板触发通信</Typography.Text>
            ) : (
              logs.map((log) => (
                <div key={log.id} style={{ padding: '4px 0', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}>
                  <Typography.Text type="secondary" style={{ marginRight: 8 }}>{log.timestamp}</Typography.Text>
                  <Tag color="blue">{log.source}</Tag>
                  <code>{log.action}</code>
                  {log.prevValue && (
                    <>
                      <Typography.Text type="secondary" style={{ margin: '0 4px' }}>←</Typography.Text>
                      <code style={{ color: '#999' }}>{log.prevValue}</code>
                    </>
                  )}
                  {log.newValue && (
                    <>
                      <Typography.Text type="secondary" style={{ margin: '0 4px' }}>→</Typography.Text>
                      <code style={{ color: '#52c41a' }}>{log.newValue}</code>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </Space>
    </Card>
  );
};

export default LiveDemo;
```

- [ ] **Step 2: 验证 TypeScript**

Run: `npx tsc --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck src/pages/qiankun/communication/LiveDemo.tsx`
Expected: 通过。

- [ ] **Step 3: Commit**

```bash
git add src/pages/qiankun/communication/LiveDemo.tsx
git commit -m "feat(qiankun-communication): add live demo component"
```

---

## Task 4: 创建 content.mdx

**Files:**
- Create: `src/pages/qiankun/communication/content.mdx`

- [ ] **Step 1: 编写 content.mdx**

```mdx
import CodeDiff from '@/components/CodeDiff';
import LiveDemo from './LiveDemo';
import { Card, Table, Alert, Typography, Divider, List, Space } from 'antd';
import { introData, propsData, globalStateData, comparisonData, principleData, liveDemoData } from './data';

import propsRegister from './demos/props-register.tsx?raw';
import propsMount from './demos/props-mount.tsx?raw';
import propsUpdate from './demos/props-update.tsx?raw';
import initGlobalState from './demos/init-global-state.tsx?raw';
import onGlobalStateChange from './demos/on-global-state-change.tsx?raw';
import setGlobalState from './demos/set-global-state.tsx?raw';
import offGlobalStateChange from './demos/off-global-state-change.tsx?raw';
import publishSubscribe from './demos/publish-subscribe-implementation.ts?raw';

# qiankun 专题：应用间通信

<Typography.Paragraph type="secondary">qiankun 中主应用与子应用之间、子应用与子应用之间的通信机制与实现原理</Typography.Paragraph>

---

## {introData.title}

{introData.content.map((text, i) => (
  <Typography.Paragraph key={i} dangerouslySetInnerHTML={{ __html: text }} />
))}

### 典型场景

<List
  size="small"
  dataSource={introData.scenarios}
  renderItem={(item) => <List.Item>{item}</List.Item>}
/>

---

## {propsData.title}

<Table dataSource={propsData.apiTable.dataSource} columns={propsData.apiTable.columns} pagination={false} size="small" bordered style={{ marginBottom: 16 }} />

### 主应用注册时传入 props

<CodeDiff oldValue={propsRegister} newValue={propsRegister} leftTitle="" rightTitle="✅ registerMicroApps 传入 props" type="error" hideDiffMarkers={true} />

### 子应用 mount 时接收 props

<CodeDiff oldValue={propsMount} newValue={propsMount} leftTitle="" rightTitle="✅ mount 接收 props" type="error" hideDiffMarkers={true} />

### loadMicroApp 动态更新 props

<CodeDiff oldValue={propsUpdate} newValue={propsUpdate} leftTitle="" rightTitle="✅ loadMicroApp update props" type="error" hideDiffMarkers={true} />

### 对比

<Table dataSource={propsData.advantageTable.dataSource} columns={propsData.advantageTable.columns} pagination={false} size="small" bordered style={{ marginBottom: 16 }} />

---

## {globalStateData.title}

<Table dataSource={globalStateData.apiTable.dataSource} columns={globalStateData.apiTable.columns} pagination={false} size="small" bordered style={{ marginBottom: 16 }} />

### initGlobalState

<CodeDiff oldValue={initGlobalState} newValue={initGlobalState} leftTitle="" rightTitle="✅ initGlobalState 基本用法" type="error" hideDiffMarkers={true} />

### 子应用订阅状态变化

<CodeDiff oldValue={onGlobalStateChange} newValue={onGlobalStateChange} leftTitle="" rightTitle="✅ onGlobalStateChange 订阅" type="error" hideDiffMarkers={true} />

### 子应用修改全局状态

<CodeDiff oldValue={setGlobalState} newValue={setGlobalState} leftTitle="" rightTitle="✅ setGlobalState 修改" type="error" hideDiffMarkers={true} />

### 取消订阅

<CodeDiff oldValue={offGlobalStateChange} newValue={offGlobalStateChange} leftTitle="" rightTitle="✅ offGlobalStateChange 取消订阅" type="error" hideDiffMarkers={true} />

---

## {comparisonData.title}

<Table dataSource={comparisonData.table.dataSource} columns={comparisonData.table.columns} pagination={false} size="small" bordered style={{ marginBottom: 16 }} />

---

## {principleData.title}

{principleData.sections.map((section) => (
  <div key={section.subtitle}>
    <Typography.Title level={4}>{section.subtitle}</Typography.Title>
    {section.content.map((text, i) => (
      <Typography.Paragraph key={i} dangerouslySetInnerHTML={{ __html: text }} />
    ))}
  </div>
))}

### 源码级实现（简化）

<CodeDiff oldValue={publishSubscribe} newValue={publishSubscribe} leftTitle="" rightTitle="✅ 手写发布订阅模式" type="error" hideDiffMarkers={true} />

<Alert type="info" message="核心原理" description="initGlobalState 的内部实现就是上面这个发布订阅模式。qiankun 在加载子应用时，将 onGlobalStateChange 和 setGlobalState 注入到子应用的 props 中，从而实现跨应用通信。" showIcon style={{ marginTop: 16 }} />

---

## {liveDemoData.title}

<Typography.Paragraph>{liveDemoData.description}</Typography.Paragraph>

<LiveDemo />
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/qiankun/communication/content.mdx
git commit -m "feat(qiankun-communication): add content.mdx"
```

---

## Task 5: 创建页面入口 index.tsx

**Files:**
- Create: `src/pages/qiankun/communication/index.tsx`

- [ ] **Step 1: 编写 index.tsx**

```tsx
import Content from './content.mdx';
import React from 'react';

const QiankunCommunicationPage: React.FC = () => {
  return <Content />;
};

export default QiankunCommunicationPage;
```

- [ ] **Step 2: 验证 TypeScript**

Run: `npx tsc --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck src/pages/qiankun/communication/index.tsx`
Expected: 通过。

- [ ] **Step 3: Commit**

```bash
git add src/pages/qiankun/communication/index.tsx
git commit -m "feat(qiankun-communication): add page entry component"
```

---

## Task 6: 注册路由

**Files:**
- Modify: `src/router/config.tsx`

- [ ] **Step 1: 添加懒加载导入**

在 `src/router/config.tsx` 的懒加载组件区域新增：

```tsx
const QiankunCommunicationPage = lazy(() => import('../pages/qiankun/communication/index'));
```

- [ ] **Step 2: 添加 qiankun 专题子菜单**

在已有的 `qiankun 专题` 菜单的 `children` 中新增：

```tsx
      {
        path: '/dashboard/qiankun/communication',
        label: '应用间通信',
        element: <QiankunCommunicationPage />,
      },
```

- [ ] **Step 3: 验证类型检查**

Run: `npx tsc --noEmit`
Expected: 通过（项目既有错误不影响）。

- [ ] **Step 4: Commit**

```bash
git add src/router/config.tsx
git commit -m "feat(router): register qiankun communication route"
```

---

## Task 7: 运行 lint 和 dev 验证

- [ ] **Step 1: 运行 lint**

Run: `npm run lint`
Expected: 无新增错误。

- [ ] **Step 2: 运行类型检查**

Run: `npx tsc --noEmit`
Expected: 项目既有错误不影响新增内容。

- [ ] **Step 3: 运行 dev 服务器验证页面**

Run: `npm run dev`（后台），等待 5 秒后检查输出。

- [ ] **Step 4: Commit（如有修复）**

```bash
git add -A
git commit -m "fix(qiankun-communication): fix lint and typecheck issues"
```

---

## 验收标准检查

- [ ] 主应用菜单 `qiankun 专题` 下新增 `应用间通信`
- [ ] 访问 `/dashboard/qiankun/communication` 能正常打开页面
- [ ] 页面包含 6 个大节：引言、props 通信、initGlobalState、对比选型、原理解析、Live Demo
- [ ] 覆盖所有 API：`initGlobalState`、`onGlobalStateChange`、`setGlobalState`、`offGlobalStateChange`
- [ ] 原理部分包含发布订阅模式、沙箱隔离影响、fireImmediately、内存泄漏等
- [ ] Live Demo 可以实时模拟跨应用通信场景
- [ ] 通过 `npm run dev` 验证
