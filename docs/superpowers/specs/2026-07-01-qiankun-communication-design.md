# qiankun 专题 — 应用间通信设计文档

> 创建日期：2026-07-06
> 所属系统：react-interview（主应用）
> 文档类型：UI/知识体系页面设计
> 状态：待实现

## 1. 设计目标

在主应用（react-interview）的 `qiankun 专题` 下新增第五个菜单项 **"应用间通信"**。核心话题是 qiankun 中不同应用之间如何通信，包括所有 API 的使用方式、适用场景，以及底层实现原理。

本页面的目标：

- 覆盖 qiankun 提供的两种通信方式：**props 传参** 和 **initGlobalState 全局状态**
- 用完整的代码示例演示每种 API 的用法：`initGlobalState`、`onGlobalStateChange`、`setGlobalState`、`offGlobalStateChange`
- 深入讲解 `initGlobalState` 的底层原理：发布订阅模式、Proxy 代理、沙箱关联
- 用 props 通信的各个阶段：注册时 props → mount 时 props → props 更新
- 保持与 `overview` 一致的 `content.mdx` 单文件结构

## 2. 页面范围与边界

### 2.1 在本次设计中完成

- 主应用路由注册：
  - 父级菜单已存在：`qiankun 专题`（`/dashboard/qiankun`）
  - 新增二级菜单：`应用间通信`（`/dashboard/qiankun/communication`）
- 页面组件目录：`src/pages/qiankun/communication/`
- 使用 `content.mdx` 单文件结构
- 内容覆盖：

| # | 内容 | 说明 |
|---|---|---|
| 一 | 引言 | 微前端为什么需要通信？通信的两种范式 |
| 二 | props 通信 | `registerMicroApps` 传入 props、mount 生命周期接收 props、props 动态更新 |
| 三 | initGlobalState | `initGlobalState` / `setGlobalState` / `onGlobalStateChange` / `offGlobalStateChange` 完整用法 |
| 四 | 对比和选型 | props vs globalState 各适用什么场景 |
| 五 | 原理解析 | 发布订阅模式、Proxy 代理、沙箱隔离、源码解读 |
| 六 | Live Demo | 实时通信演示 |

### 2.2 明确不在本次范围

- 不讨论如果使用 Vuex/Pinia/Redux 等状态管理库跨应用共享（这些都是 qiankun 通信之上的封装）
- 不讨论 Module Federation 的 shared 模块，那是 Webpack 5 的机制
- 不讨论跨应用自定义事件（`window.dispatchEvent`）这种非 qiankun 方案
- 不改动已有 4 个子菜单的现有内容

## 3. 文件结构

```text
src/pages/qiankun/communication/
  index.tsx                               # 页面入口
  content.mdx                             # 所有章节内容
  data.ts                                 # 纯数据（表格、原理图数据）
  LiveDemo.tsx                            # 实时通信演示
  demos/
    props-register.tsx                    # registerMicroApps 传入 props
    props-mount.tsx                       # mount 生命周期接收 props
    props-update.tsx                      # props 动态更新（loadMicroApp）
    init-global-state.tsx                 # initGlobalState 基本用法
    on-global-state-change.tsx            # 子应用订阅全局状态
    set-global-state.tsx                  # 子应用修改全局状态
    off-global-state-change.tsx           # 取消订阅
    publish-subscribe-implementation.ts   # 手写发布订阅模式的简单实现（原理讲解用）
```

## 4. 路由注册

在主应用 [src/router/config.tsx](file:///d:/测试人工智能/前端面试/react-interview/src/router/config.tsx#L105) 的 `qiankun 专题` 菜单下新增子菜单：

```tsx
const QiankunCommunicationPage = lazy(() => import('../pages/qiankun/communication/index'));

export const dashboardRoutes: RouteConfig[] = [
  // ... 已有路由 ...
  {
    path: '/dashboard/qiankun',
    label: 'qiankun 专题',
    icon: <ApiOutlined />,
    children: [
      // ... 已有子菜单 ...
      {
        path: '/dashboard/qiankun/communication',
        label: '应用间通信',
        element: <QiankunCommunicationPage />,
      },
    ],
  },
];
```

> 注意：路由注册必须在页面组件全部创建完成后最后进行，避免提前引用不存在的文件。

## 5. 组件结构

### 5.1 页面入口 `index.tsx`

```tsx
import Content from './content.mdx';
import React from 'react';

const QiankunCommunicationPage: React.FC = () => {
  return <Content />;
};

export default QiankunCommunicationPage;
```

### 5.2 内容文件 `content.mdx`

- 使用 import 引入 Ant Design 组件、`CodeDiff`、`LiveDemo`
- 复杂逻辑提到单独组件中处理

### 5.3 数据文件 `data.ts`

存放：
- 各章节的段落文本、注意事项、对比表格数据
- 源码解读中涉及的代码片段数据
- API 参考表格数据

### 5.4 Live Demo `LiveDemo.tsx`

实时通信演示：
- 模拟主应用面板，展示 `initGlobalState` 初始化状态
- 模拟子应用 A 面板，展示 `onGlobalStateChange` 订阅
- 模拟子应用 B 面板，展示 `setGlobalState` 修改
- 展示收发的时间线日志

## 6. 内容设计

### 6.1 一、引言

**微前端为什么需要通信？**

- 多个 SPA 运行在同一页面，但共享同一用户、同一登录态、同一主题
- 典型场景：
  - 主应用登录 → 所有子应用获取 token
  - 主应用切换主题 → 所有子应用同步切换
  - 子应用 A 修改了某些全局数据 → 子应用 B 需要感知

**qiankun 的两种通信范式：**

1. **Props 通信**：主应用通过 `registerMicroApps` 的 props 选项，或 `loadMicroApp` 的 props 选项，向子应用传递数据。子应用在 mount 生命周期中接收 props。这是单向的（主 → 子）。
2. **全局状态**：通过 `initGlobalState` 创建一个全局状态对象，所有子应用通过 `onGlobalStateChange` 订阅变化、`setGlobalState` 触发变化。这是双向的（主 ↔ 子）。

### 6.2 二、Props 通信

**核心 API：**
- `registerMicroApps(apps, { lifeCycles?: { beforeLoad?: ..., beforeMount?: ..., afterUnmount?: ... } })` 中的 `props` 字段
- `loadMicroApp(app, configuration?)` 中的 `props` 字段
- 子应用 mount 生命周期接收的 `props` 参数

**使用方式：**

```tsx
// 主应用注册时传入 props
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:8001',
    container: '#container',
    activeRule: '/app1',
    props: {
      token: 'xxx',
      user: { id: 1, name: 'Alice' },
      onLogout: () => { /* ... */ },
    },
  },
]);
```

```tsx
// 子应用 mount 时接收 props
export function mount(props) {
  const { token, user, onLogout, container } = props;
  // 直接使用
  render({ element: container ? container.querySelector('#app') : '#app' });
}
```

**Pros & Cons：**

| 优势 | 不足 |
|---|---|
| 简单直观，类型安全 | 只能主 → 子单向传递 |
| 支持函数、对象等引用类型 | 需要重新 mount 才能更新 props（除了 `loadMicroApp` 的方式） |
| 天然与生命周期绑定 | 兄弟子应用之间无法通过 props 直接通信 |

**`loadMicroApp` 的动态 props 更新：**

```tsx
const app = loadMicroApp('app1', { props: { token: 'initial' } });
// 后来需要更新 props
app.update({ props: { token: 'new-token' } });
```

**代码示例：**
- `demos/props-register.tsx` — registerMicroApps 传入 props
- `demos/props-mount.tsx` — mount 生命周期接收 props
- `demos/props-update.tsx` — loadMicroApp 动态更新 props

### 6.3 三、initGlobalState 全局状态

**完整 API 列表：**

| API | 说明 | 在哪调用 |
|---|---|---|
| `initGlobalState(state)` | 初始化全局状态，返回 actions 对象 | 主应用 |
| `actions.setGlobalState(state)` | 修改全局状态，触发所有订阅者 | 主应用 / 子应用 |
| `actions.onGlobalStateChange(callback, fireImmediately?)` | 订阅全局状态变化 | 子应用 |
| `actions.offGlobalStateChange()` | 取消订阅 | 子应用 |

**使用流程：**

```tsx
// ---------- 主应用 ----------
import { initGlobalState } from 'qiankun';

const initialState = {
  user: null,
  theme: 'light',
  token: '',
};

const actions = initGlobalState(initialState);

actions.onGlobalStateChange((state, prev) => {
  console.log('主应用监听到全局状态变化', state, prev);
});

// 修改全局状态
actions.setGlobalState({ theme: 'dark' });

// 导出 actions 供子应用通过 props 获取
export { actions };
```

```tsx
// ---------- 子应用 ----------
// 在 mount 生命周期中
export function mount(props) {
  const { onGlobalStateChange, setGlobalState } = props;

  // 订阅全局状态（主应用 initGlobalState 返回的 actions 自动注入到子应用 props 中）
  onGlobalStateChange((state, prev) => {
    // state.user, state.theme, state.token 都可用
    // 同步更新子应用的内部状态
  }, true); // fireImmediately: true 表示注册后立即执行一次

  // 子应用也可以修改全局状态
  setGlobalState({ theme: 'dark' });

  // 取消订阅（通常在 unmount 时调用）
  // 但注意：offGlobalStateChange 需要保存 onGlobalStateChange 返回的 unsubscribe 函数
}
```

**代码示例：**
- `demos/init-global-state.tsx` — 主应用初始化全局状态
- `demos/on-global-state-change.tsx` — 子应用订阅全局状态
- `demos/set-global-state.tsx` — 子应用修改全局状态
- `demos/off-global-state-change.tsx` — 取消订阅

### 6.4 四、对比和选型

| 场景 | 推荐方式 | 原因 |
|---|---|---|
| 主应用传递给子应用一些静态配置（baseUrl、主题色） | props | 简单、类型安全 |
| 子应用需要修改全局数据并通知其他子应用 | globalState | 双向、发布订阅 |
| 需要在子应用 unmount 后仍然保留状态 | globalState | 保存在主应用内存中 |
| 传递函数回调（如：跳转到主应用某个页面） | props | 函数引用无法序列化，props 直接传 |
| 兄弟子应用之间直接通信 | globalState | props 是主→子单向的 |
| 状态变化需要严格追踪（日志、时间旅行） | globalState | onGlobalStateChange 天然提供 prev 和 next |

### 6.5 五、原理解析

#### 5.1 发布订阅模式

`initGlobalState` 的核心机制是**发布-订阅模式**：

```
                       ┌─────────────┐
                       │  GlobalState │
                       │  (Store)     │
                       └──────┬──────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
    ┌─────▼─────┐     ┌──────▼──────┐     ┌──────▼──────┐
    │ 主应用      │     │ 子应用 A     │     │ 子应用 B     │
    │ setGlobal  │     │ onChange    │     │ onChange    │
    │ State      │     │             │     │             │
    └───────────┘     └─────────────┘     └─────────────┘
```

在 qiankun 内部：
- `initGlobalState(state)`：创建一个全局状态仓库，内部维护一个 `state` 对象和一个订阅者列表 `observers: Map<string, Function>`
- `setGlobalState(newState)`：合并新状态到旧状态，遍历所有 observers 执行回调
- `onGlobalStateChange(callback)`：将 callback 注册到 observers 中，给子应用分配一个唯一 id
- `offGlobalStateChange()`：从 observers 中移除对应的 callback

#### 5.2 如何注入到子应用 props 中

qiankun 在加载子应用时，会做以下事情：

1. 主应用调用 `initGlobalState(initialState)`，创建一个全局状态仓库，返回 actions 对象
2. 子应用通过 `registerMicroApps` 注册后，qiankun 内部会在 mount 子应用时，将 `onGlobalStateChange` 和 `setGlobalState` 注入到 props 中
3. 关键源码思路（非精确源码，而是原理性代码）：

```ts
// qiankun 内部（简化）
function initGlobalState(state) {
  const observers = new Map();
  let currentState = { ...state };

  return {
    onGlobalStateChange(callback, fireImmediately) {
      const id = generateId();
      observers.set(id, callback);
      if (fireImmediately) {
        callback(currentState, currentState);
      }
      // 返回 unsubscribe 函数
      return () => observers.delete(id);
    },
    setGlobalState(newState) {
      const prevState = { ...currentState };
      currentState = { ...currentState, ...newState };
      observers.forEach(callback => {
        callback(currentState, prevState);
      });
    },
    offGlobalStateChange() {
      observers.clear();
    },
  };
}

// 加载子应用时（简化）
function loadApp(appName, props) {
  const { onGlobalStateChange, setGlobalState } = globalStateActions;
  const childProps = {
    ...props,
    onGlobalStateChange,
    setGlobalState,
  };
  // 把 childProps 传给子应用的 mount 生命周期
}
```

#### 5.3 沙箱隔离对通信的影响

qiankun 的 JS 沙箱（proxySandbox）拦截了子应用的 window 操作。这意味着：

- 子应用内部的 `window.xxx = yyy` 不会暴露到主应用 window
- 子应用内部的 `window.getGlobalState` 不会与主应用冲突
- 但正因为沙箱隔离，子应用无法直接访问主应用的全局变量——所以才需要 `initGlobalState` 这种显式的通信机制

因此，`initGlobalState` 是**唯一受官方推荐**的跨应用通信方式（除了 props）。

#### 5.4 `onGlobalStateChange` 的 `fireImmediately` 参数

- `fireImmediately = true`：注册后立即以当前 state 调用一次 callback，子应用可以立刻获取到初始状态
- `fireImmediately = false` 或不传：只在 state 变化时才调用 callback

```tsx
// 场景：子应用初始化时需要获取当前用户信息
onGlobalStateChange((state) => {
  if (state.user) {
    setCurrentUser(state.user);
  }
}, true); // 立即获取一次
```

#### 5.5 `offGlobalStateChange` 的正确用法

- `offGlobalStateChange` 会清除该子应用的所有订阅者
- 但 `onGlobalStateChange` 返回的 unsubscribe 函数可以更精细地取消单个订阅
- 建议在子应用 `unmount` 生命周期中调用，防止内存泄漏

```tsx
const unsubscribe = onGlobalStateChange(callback);
// 在 unmount 时
unsubscribe(); // 只取消这一个订阅
```

#### 5.6 内存泄漏与垃圾回收

常见问题：
- 子应用 unmount 后，`onGlobalStateChange` 的回调仍然留在 observers 中
- 子应用重新 mount 时又注册了一个新回调
- 如果之前的老回调没有清除，每个子应用会积累多个回调

qiankun 的做法：
- 在子应用 unmount 时，qiankun 会调用 `offGlobalStateChange` 清除该子应用的所有回调
- 但如果是通过 `loadMicroApp` 手动管理子应用，需要自己调用 unsubscribe

**代码示例：**
- `demos/publish-subscribe-implementation.ts` — 手写发布订阅模式实现

### 6.6 六、Live Demo：实时通信演示

**交互设计：**

1. **初始化面板**：模拟主应用调用 `initGlobalState`，显示初始状态 JSON
2. **子应用 A 面板**：显示 `onGlobalStateChange` 订阅的状态，支持修改部分状态
3. **子应用 B 面板**：显示 `onGlobalStateChange` 订阅的状态，支持修改部分状态
4. **时间线日志**：记录每一次状态变化的来源、旧值、新值、时间戳

**功能：**
- 任何面板修改状态，其他面板立即收到更新
- 日志展示 `prev → next` 的变化路径
- 可以点击"取消订阅"模拟 `offGlobalStateChange`，观察取消后不再收到更新
- 可以点击"重新订阅"恢复

## 7. 数据与代码分离

- `data.ts` 存放章节文本、API 表格数据、原理说明等纯文本
- 所有代码示例通过 `import xxx from './demos/xxx?raw'` 引入

## 8. 代码规范

- 使用 Ant Design 组件：Typography、Card、Table、Alert、Tag、Divider、List
- 使用 `CodeDiff` 组件展示 Bad/Good 代码对比（如果需要）
- 所有代码注释和文档解释使用中文

## 9. 验收标准

- [ ] 主应用菜单 `qiankun 专题` 下新增 `应用间通信`
- [ ] 访问 `/dashboard/qiankun/communication` 能正常打开页面
- [ ] 页面包含 6 个大节：引言、props 通信、initGlobalState、对比选型、原理解析、Live Demo
- [ ] 覆盖所有 API：`initGlobalState`、`onGlobalStateChange`、`setGlobalState`、`offGlobalStateChange`
- [ ] 原理部分包含发布订阅模式、沙箱隔离影响、fireImmediately、内存泄漏等
- [ ] Live Demo 可以实时模拟跨应用通信场景
- [ ] 通过 `npm run dev` 验证

## 10. 后续可扩展

- 基于 `initGlobalState` 封装 Redux/Zustand 状态管理
- 跨应用路由跳转的通信模式
- 应用间通信的异常处理与容灾
