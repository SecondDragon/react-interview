# qiankun 专题 — 乾坤基础 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在主应用 react-interview 中新增 `qiankun 专题` → `乾坤基础` 知识体系页面，包含 6 个详细章节、CodeDiff 代码对比、静态 Live Demo，并修正之前提前注册的路由。

**Architecture:** 采用章节化组件（`chapters/*.tsx`）+ 源码提取（`demos/*.bad.ts` / `*.good.ts`）+ 纯数据文件（`data.ts`）+ 静态交互演示（`LiveDemo.tsx`）的结构。所有代码通过 Vite `?raw` 引入，避免手写字符串。`index.tsx` 作为页面入口组合所有章节，章节遵循"五维度"结构。

**Tech Stack:** React 18 + TypeScript + Vite + Ant Design + styled-components（用于样式变量） + `react-diff-viewer-continued`（CodeDiff 组件）。

---

## 文件结构

```text
src/pages/qiankun/
  basic/
    index.tsx
    data.ts
    LiveDemo.tsx
    chapters/
      SectionIntro.tsx
      SectionChildBuild.tsx
      SectionChildEntry.tsx
      SectionChildRouter.tsx
      SectionHostRegister.tsx
      SectionMountContainer.tsx
    demos/
      child-vite-config.bad.ts
      child-vite-config.good.ts
      child-main-js.bad.ts
      child-main-js.good.ts
      child-router.bad.ts
      child-router.good.ts
      host-register-js.bad.ts
      host-register-js.good.ts
      host-layout-html.bad.html
      host-layout-html.good.tsx
src/router/config.tsx   # 最后一步才注册新路由
```

---

## Task 1: 回退提前注册的路由

**Files:**
- Modify: `src/router/config.tsx`

**说明：** 之前提前注册了 `QiankunBasicPage` 的懒加载和 `qiankun 专题` 菜单，但页面组件尚未创建，此时访问该路由会触发运行时错误（如懒加载失败或页面白屏）。为了遵循"页面就绪后再注册"的实践，第一步先把这部分回退，等所有页面组件完成后再注册。

- [ ] **Step 1: 删除懒加载导入**

找到并删除这一行：

```tsx
const QiankunBasicPage = lazy(() => import('../pages/qiankun/basic/index'));
```

- [ ] **Step 2: 删除 qiankun 专题菜单**

找到并删除这一段：

```tsx
  {
    path: '/dashboard/qiankun',
    label: 'qiankun 专题',
    icon: <ApiOutlined />,
    children: [
      {
        path: '/dashboard/qiankun/basic',
        label: '乾坤基础',
        element: <QiankunBasicPage />,
      },
    ],
  },
```

- [ ] **Step 3: 验证项目仍可构建**

Run: `npm run typecheck`
Expected: 通过（无新增错误，也不要求 QiankunBasicPage 存在）。

- [ ] **Step 4: Commit**

```bash
git add src/router/config.tsx
git commit -m "revert: remove premature qiankun route registration"
```

---

## Task 2: 创建页面目录与数据文件

**Files:**
- Create: `src/pages/qiankun/basic/data.ts`

**说明：** 数据文件只存放纯文本，不包含代码字符串。为后续章节组件提供标题、描述、原因、原理、注意事项等文本。

- [ ] **Step 1: 创建目录结构**

Run:

```bash
mkdir -p src/pages/qiankun/basic/chapters src/pages/qiankun/basic/demos
```

- [ ] **Step 2: 编写 data.ts**

Create: `src/pages/qiankun/basic/data.ts`

```typescript
export const pageData = {
  title: 'qiankun 专题：乾坤基础',
  subtitle: '基于路由加载的 qiankun 微前端最小可用配置',
};

export const introData = {
  title: '一、引言：基于路由加载的 qiankun 是什么',
  phenomenon: [
    '子应用明明能独立跑，嵌入主应用后白屏；',
    '子应用路由和主应用路由互相覆盖；',
    '刷新后子应用直接 404；',
    '不知道 entry 填 HTML 入口还是 JS 入口。',
  ],
  cause: 'qiankun 的"基于路由加载"是指：主应用监听 URL 变化，当 URL 匹配某个子应用的 activeRule 时，请求该子应用的 entry（默认 HTML Entry），把解析后的 DOM/JS 插入主应用指定的 container 中。子应用接管 container 内部渲染，主应用框架继续存在。',
  solution: '路由驱动加载是微前端最自然的集成方式：用户无感知，URL 统一，刷新行为可控。相比手动 loadMicroApp，路由加载更适合多页后台系统。',
  principle: [
    'single-spa 提供路由变化监听与生命周期调度；',
    'qiankun 在 single-spa 之上增加了 HTML Entry、JS 隔离、样式隔离、预加载；',
    'activeRule 决定何时加载，entry 决定加载什么，container 决定挂载到哪里。',
  ],
};

export const childBuildData = {
  title: '二、子应用打包配置（Vite + vite-plugin-qiankun）',
  phenomenon: [
    '控制台报 ReferenceError: xx is not defined；',
    '样式加载正常但 JS 不执行，或执行后直接接管整个 document；',
    '开发环境父应用请求子应用资源时触发 CORS 错误。',
  ],
  cause: 'qiankun 默认以 HTML Entry 方式加载子应用。它会通过 fetch 请求子应用的入口 HTML，然后解析出所有 <script>、<link>，再插入沙箱执行。如果子应用打包产物不是浏览器可独立运行的格式，或者开发服务器没有允许跨域，父应用就无法正确拿到资源。',
  solution: '使用 vite-plugin-qiankun 改造 Vite 配置；开发环境配置 Access-Control-Allow-Origin；生产环境输出 UMD/IIFE 格式。',
  principle: [
    'vite-plugin-qiankun 通过 Vite 插件钩子改写入口代码，使 Vue 应用在 qiankun 环境下导出 bootstrap / mount / unmount / update；',
    '沙箱中执行子应用 JS 时，全局 window 被代理，因此子应用必须避免直接污染全局变量；',
    'HTML Entry 让父应用可以按资源粒度加载 JS/CSS，而不是只加载一个 bundle。',
  ],
  notes: [
    'useDevMode: true 仅在开发环境使用，生产环境不要开启；',
    '生产环境建议 output.format 为 iife 或 umd，并配置 rollupOptions.external 避免重复打包 qiankun helper；',
    '跨域头只在开发环境需要，生产环境由 CDN/Nginx 处理。',
  ],
};

export const childEntryData = {
  title: '三、子应用入口改造与生命周期',
  phenomenon: [
    '第一次进入页面能看到内容，切换其他主应用菜单再回来，子应用不渲染或报错；',
    '重复挂载导致内存泄漏、事件重复绑定；',
    '子应用卸载后 DOM 残留。',
  ],
  cause: '普通 Vue 入口 createApp(App).mount("#app") 一执行就渲染，没有给 qiankun 调度的机会。qiankun 需要子应用在正确的生命周期做正确的事：bootstrap 只初始化一次；mount 每次激活时渲染，并接收父应用传来的 container；unmount 每次切换走时彻底清理；update 响应父应用传参更新。',
  solution: '使用 renderWithQiankun 暴露生命周期；mount 时根据 props.container 决定挂载点；unmount 时调用 app.unmount() 并清空引用；独立运行判断 if (!qiankunWindow.__POWERED_BY_QIANKUN__)。',
  principle: [
    'renderWithQiankun 本质是 qiankun 约定的协议：子应用必须暴露生命周期函数；',
    'qiankun 通过 single-spa 在路由变化时调用 mount/unmount，子应用不能自己抢跑；',
    'qiankunWindow 是 vite-plugin-qiankun 提供的对真实 window 的引用，用于判断运行环境而不破坏沙箱。',
  ],
  notes: [
    'container.querySelector("#app") 保证子应用渲染在 qiankun 提供的容器内，而不是整个 document；',
    '卸载时务必清空 app 引用，否则下一次 mount 会复用旧实例；',
    'update 生命周期很少用到，但建议保留空实现，避免父应用传参时触发异常。',
  ],
};

export const childRouterData = {
  title: '四、子应用内部路由 base 适配',
  phenomenon: [
    '从 /dashboard/micro-vue/list 跳 /dashboard/micro-vue/detail，子应用内部路由不响应；',
    '刷新 /dashboard/micro-vue/detail 直接 404；',
    '子应用 router.push("/list") 把主应用 URL 改成了 /list，跳出子应用范围。',
  ],
  cause: 'Vue Router 的 createWebHistory 需要一个 base，独立运行时 base 是 "/"，但在主应用里子应用挂载在 "/dashboard/micro-vue" 下。如果子应用仍然以 "/" 为 base，它的 history 对象会错误解析路径，导致路由不匹配或主应用路由被污染。',
  solution: '根据 qiankunWindow.__POWERED_BY_QIANKUN__ 切换 base；主应用环境下 base 设为 "/dashboard/micro-vue" 或对应前缀；子应用内部路由路径仍然以 "/micro-vue/list" 等相对 base 的路径定义。',
  principle: [
    'HTML5 History API 的 history.pushState 路径是相对于 base 的；',
    'qiankun 通过 popstate 监听 URL 变化，并匹配 activeRule，子应用路由必须在同一命名空间下工作；',
    '如果子应用和主应用都使用 createWebHistory，base 必须错开或嵌套正确，否则两者会抢 location.pathname 的解释权。',
  ],
  notes: [
    'qiankun 不会自动改写子应用路由 base，这是开发者必须显式处理的部分；',
    'base 一致后，子应用路由和主应用 URL 才能同步；',
    '独立运行时 base 回退到 "/"，不影响本地开发。',
  ],
};

export const hostRegisterData = {
  title: '五、父应用注册与激活规则',
  phenomenon: [
    'activeRule 写错了，子应用永远不激活；',
    'activeRule 写太宽泛，多个子应用同时激活；',
    'entry 协议写错，浏览器报 Failed to fetch；',
    'start() 没调用，qiankun 只注册不工作。',
  ],
  cause: 'registerMicroApps 只是注册表，start() 才开始监听路由并激活。activeRule 负责判断当前 URL 是否属于该子应用，entry 是加载入口，name 是唯一标识，container 是挂载点。任何一个字段不对，都会链式失败。',
  solution: '完整配置 name / entry / container / activeRule，并调用 start()。name 唯一且与子应用自身一致；entry 使用协议相对或完整 URL；container 使用 #micro-viewport；activeRule 使用函数或字符串匹配主应用路径。',
  principle: [
    'qiankun 基于 single-spa 的 registerApplication 封装；',
    'activeRule 可以是字符串、函数或数组，函数形式最灵活；',
    '使用 HTML Entry 时，qiankun 会请求 entry 对应的 HTML，解析资源并插入沙箱；',
    '子应用 name 会被用于 dom 隔离、样式前缀、错误提示等。',
  ],
  notes: [
    'name 必须全局唯一，避免缓存和加载冲突；',
    'entry 使用 "//localhost:8082" 这种协议相对 URL，开发/生产切换更方便；',
    '函数式 activeRule 适合 hash 路由或复杂前缀匹配；',
    'start() 是启动监听的必要一步，一定要记得调用。',
  ],
};

export const mountContainerData = {
  title: '六、挂载容器 DOM 与样式约定',
  phenomenon: [
    '主应用没有 #micro-viewport 元素，qiankun 找不到挂载点；',
    '容器高度为 0，子应用渲染了但不可见；',
    '主应用和子应用样式冲突，子应用按钮被主应用全局样式覆盖；',
    '子应用卸载后，容器内残留样式或 DOM 片段。',
  ],
  cause: 'qiankun 把子应用整个 HTML 的内容插入 container，但 container 本身由父应用提供。如果父应用没有预留、高度为 0、或被隐藏，子应用就无法正常展示。样式隔离在 qiankun 中不是绝对隔离，主应用的全局样式仍可能影响子应用。',
  solution: '在主应用布局中预留 <div id="micro-viewport" />；给容器设置最小高度，如 minHeight: 500px；容器使用 overflow: auto 或 position: relative；不要把 #micro-viewport 放在会被 display: none 包裹的组件里。',
  principle: [
    'qiankun 在 mount 时会把子应用 entry 的 <body> 内内容克隆到 container，子应用的 #app 也会被移入容器；',
    '子应用 document 和 window 被代理，但 CSSOM 中的选择器不会被自动改写，因此需要父应用控制全局样式；',
    '容器高度、定位、滚动策略是父应用布局的责任，不是子应用能决定的。',
  ],
  notes: [
    '子应用本身不能控制自己的根容器，它只能渲染到 qiankun 指定的 DOM 节点；',
    '高度、overflow、定位由父应用决定，才能保证子应用滚动和布局正常；',
    '样式冲突需要父应用尽量避免写全局标签选择器。',
  ],
};

export const liveDemoData = {
  title: '配置校验器',
  description: '下面这组开关对应一个最小可用 qiankun 父子应用所需的关键配置。你可以逐项打开，查看当前配置是否足以让子应用正常加载。',
  switches: [
    { key: 'childPlugin', label: '子应用使用 vite-plugin-qiankun' },
    { key: 'childCors', label: '子应用开发服务器配置 CORS' },
    { key: 'childEntry', label: '子应用入口使用 renderWithQiankun' },
    { key: 'childRouter', label: '子应用路由根据 __POWERED_BY_QIANKUN__ 切换 base' },
    { key: 'hostActiveRule', label: '父应用正确配置 activeRule' },
    { key: 'hostContainer', label: '父应用预留 #micro-viewport 容器' },
  ],
  successText: '当前配置可运行：子应用能够被正确加载、挂载、卸载，并与主应用路由协同工作。',
  errorText: '当前配置仍有缺失，无法保证子应用正常加载。请查看下方红色项并跳转到对应小节。',
  checklistTitle: '最小可用配置清单',
};
```

- [ ] **Step 3: 验证 data.ts 没有语法错误**

Run: `npx tsc --noEmit src/pages/qiankun/basic/data.ts`
Expected: 通过。

- [ ] **Step 4: Commit**

```bash
git add src/pages/qiankun/basic/data.ts
git commit -m "feat(qiankun): add data.ts for qiankun basic page"
```

---

## Task 3: 创建 CodeDiff 代码示例文件（demos）

**Files:**
- Create: `src/pages/qiankun/basic/demos/child-vite-config.bad.ts`
- Create: `src/pages/qiankun/basic/demos/child-vite-config.good.ts`
- Create: `src/pages/qiankun/basic/demos/child-main-js.bad.ts`
- Create: `src/pages/qiankun/basic/demos/child-main-js.good.ts`
- Create: `src/pages/qiankun/basic/demos/child-router.bad.ts`
- Create: `src/pages/qiankun/basic/demos/child-router.good.ts`
- Create: `src/pages/qiankun/basic/demos/host-register-js.bad.ts`
- Create: `src/pages/qiankun/basic/demos/host-register-js.good.ts`
- Create: `src/pages/qiankun/basic/demos/host-layout-html.bad.html`
- Create: `src/pages/qiankun/basic/demos/host-layout-html.good.tsx`

**说明：** 每个文件只放代码和中文注释，注释详尽，不需要导出任何内容。`.bad.ts` 会被 tsconfig.json 的 `exclude` 排除，不参与类型检查。

- [ ] **Step 1: child-vite-config.bad.ts**

Create: `src/pages/qiankun/basic/demos/child-vite-config.bad.ts`

```typescript
// ❌ 反面教材：没有 qiankun 插件的 Vite 配置
// 普通 Vite Vue 项目直接这样写，在 qiankun 环境下会加载失败。

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  // 只使用了 vue 插件，没有 vite-plugin-qiankun。
  // 这意味着打包产物不会自动导出 qiankun 需要生命周期，
  // 父应用通过 HTML Entry 加载时，子应用无法被正确挂载和卸载。
  plugins: [vue()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  server: {
    // 没有配置 CORS 头。
    // 在开发环境下，父应用（如 localhost:5173）通过 fetch 请求子应用（localhost:8082）的 HTML 入口时，
    // 浏览器会触发跨域限制，导致 qiankun 无法获取子应用资源。
    port: 8082,
  },

  // 没有配置 build.lib / rollupOptions。
  // 生产环境打包出来的可能是 ES Module 格式，qiankun 沙箱执行时无法拿到子应用暴露的生命周期函数，
  // 从而出现 ReferenceError 或白屏。
});
```

- [ ] **Step 2: child-vite-config.good.ts**

Create: `src/pages/qiankun/basic/demos/child-vite-config.good.ts`

```typescript
// ✅ 最佳实践：使用 vite-plugin-qiankun 改造 Vite 配置

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import qiankun from 'vite-plugin-qiankun';
import { resolve } from 'path';

export default defineConfig({
  // vite-plugin-qiankun 会在构建阶段注入 qiankun 子应用所需的生命周期与沙箱兼容代码。
  // 第一个参数 'micro-vue' 是子应用名称，需要与父应用 registerMicroApps 中的 name 保持一致。
  plugins: [
    vue(),
    qiankun('micro-vue', {
      // useDevMode 为 true 时，开发环境下直接使用 vite-plugin-qiankun 的 helper 暴露生命周期，
      // 不需要手动写 UMD/IIFE 包装。生产环境请勿开启，应使用 build.lib 输出标准格式。
      useDevMode: true,
    }),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  server: {
    port: 8082,
    // 开发环境下必须允许跨域，否则父应用无法通过 fetch 请求子应用资源。
    // 生产环境通常由 Nginx/CDN 统一配置，这里只针对本地开发。
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },

  // 生产环境建议配置：
  // build: {
  //   lib: {
  //     name: 'micro-vue',
  //     entry: 'src/main.js',
  //     formats: ['iife'],
  //     fileName: 'micro-vue',
  //   },
  //   rollupOptions: {
  //     // 避免把 vue 打进子应用，应由父应用或 CDN 提供公共依赖。
  //     external: ['vue'],
  //   },
  // },
});
```

- [ ] **Step 3: child-main-js.bad.ts**

Create: `src/pages/qiankun/basic/demos/child-main-js.bad.ts`

```typescript
// ❌ 反面教材：普通 Vue 3 入口，没有 qiankun 生命周期
// 这样写子应用可以独立运行，但无法被 qiankun 正确加载和卸载。

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// 直接创建并挂载 Vue 应用。
// 在 qiankun 环境下，这段代码会立即执行并把 #app 挂载到 document.body 上，
// 而不是父应用指定的 container 中，导致子应用跳出沙箱控制。
const app = createApp(App);
app.use(router);
app.mount('#app');

// 问题：
// 1. 没有暴露 bootstrap / mount / unmount / update 生命周期，qiankun 无法调度；
// 2. 切换主应用菜单时，子应用不会自动卸载，DOM 和事件监听可能残留；
// 3. 无法接收父应用传递的 container，子应用不知道应该渲染到哪个 DOM 节点。
```

- [ ] **Step 4: child-main-js.good.ts**

Create: `src/pages/qiankun/basic/demos/child-main-js.good.ts`

```typescript
// ✅ 最佳实践：子应用入口通过 renderWithQiankun 暴露生命周期

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

let app = null;

/**
 * 渲染函数
 * @param {Object} props - qiankun 传入的参数
 * @param {HTMLElement} props.container - 父应用提供的挂载容器
 */
function render(props) {
  // 如果存在 container，说明子应用运行在 qiankun 环境下，
  // 必须在父应用提供的容器内查找 #app 节点，而不是直接挂载到 document。
  const { container } = props;
  const target = container ? container.querySelector('#app') : '#app';

  app = createApp(App);
  app.use(router);
  app.mount(target);
}

// 通过 renderWithQiankun 暴露 qiankun 约定的生命周期函数。
renderWithQiankun({
  // bootstrap 在子应用第一次加载前执行，适合做一次性初始化。
  bootstrap() {
    console.log('[micro-vue] bootstrap');
  },

  // mount 在子应用被激活时执行。qiankun 会把 props 传进来，其中包含 container。
  mount(props) {
    console.log('[micro-vue] mount', props);
    render(props);
  },

  // unmount 在子应用切换走时执行。必须彻底清理 Vue 实例和引用，否则会造成内存泄漏。
  unmount(props) {
    console.log('[micro-vue] unmount', props);
    app?.unmount();
    app = null;
  },

  // update 在父应用调用 microApp.update(props) 时触发。
  // 简单场景可以留空实现，但建议保留，避免父应用传参时触发异常。
  update(props) {
    console.log('[micro-vue] update', props);
  },
});

// 独立运行判断：如果没有被 qiankun 加载，则直接渲染。
// 这样本地开发 npm run dev 时仍然可以独立访问子应用。
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
}
```

- [ ] **Step 5: child-router.bad.ts**

Create: `src/pages/qiankun/basic/demos/child-router.bad.ts`

```typescript
// ❌ 反面教材：子应用路由 base 固定为 "/"
// 独立运行时没问题，但嵌入 qiankun 后会出现路由不匹配或 URL 污染。

import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/micro-vue/list' },
  { path: '/micro-vue/list', component: () => import('./views/List.vue') },
  { path: '/micro-vue/detail', component: () => import('./views/Detail.vue') },
];

// 独立运行时 base 为 "/" 是正确的。
// 但在 qiankun 中，子应用挂载在主应用的 "/dashboard/micro-vue" 下，
// 此时子应用仍然以 "/" 为 base，会错误解析主应用的 URL，导致路由跳转异常。
const router = createRouter({
  history: createWebHistory('/'),
  routes,
});

export default router;
```

- [ ] **Step 6: child-router.good.ts**

Create: `src/pages/qiankun/basic/demos/child-router.good.ts`

```typescript
// ✅ 最佳实践：根据运行环境切换路由 base

import { createRouter, createWebHistory } from 'vue-router';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

const routes = [
  { path: '/', redirect: '/micro-vue/list' },
  { path: '/micro-vue/list', component: () => import('./views/List.vue') },
  { path: '/micro-vue/detail', component: () => import('./views/Detail.vue') },
];

// 判断当前是否运行在 qiankun 环境中。
// __POWERED_BY_QIANKUN__ 是 qiankun 注入到子应用 window 上的标识。
const isInQiankun = qiankunWindow.__POWERED_BY_QIANKUN__;

// 在 qiankun 环境下，base 必须和主应用为该子应用分配的 activeRule 路径前缀一致。
// 这样 Vue Router 的 history 对象才能正确解析 "/dashboard/micro-vue/xxx" 这样的 URL。
// 独立运行时使用 "/"，不影响本地开发。
const base = isInQiankun ? '/dashboard/micro-vue' : '/';

const router = createRouter({
  history: createWebHistory(base),
  routes,
});

export default router;
```

- [ ] **Step 7: host-register-js.bad.ts**

Create: `src/pages/qiankun/basic/demos/host-register-js.bad.ts`

```typescript
// ❌ 反面教材：父应用注册配置错误
// 注册表写错、没调用 start()，子应用永远不会被加载。

import { registerMicroApps } from 'qiankun';

registerMicroApps([
  {
    // 错误：name 和子应用自身的名称不一致，可能导致加载混乱。
    name: 'vue-app',

    // 错误：entry 缺少协议前缀，qiankun 无法正确请求资源。
    entry: 'localhost:8082',

    // 错误：container 选择器和主应用实际 DOM 不一致，qiankun 找不到挂载点。
    container: '#subapp-viewport',

    // 错误：activeRule 和子应用实际路径不匹配，子应用永远不会被激活。
    activeRule: '/micro-vue',
  },
]);

// 错误：没有调用 start()。
// registerMicroApps 只是把配置登记到注册表，start() 才会开始监听路由并加载子应用。
```

- [ ] **Step 8: host-register-js.good.ts**

Create: `src/pages/qiankun/basic/demos/host-register-js.good.ts`

```typescript
// ✅ 最佳实践：父应用注册 qiankun 子应用

import { registerMicroApps, start } from 'qiankun';

// 这是一个辅助函数，用于 hash 路由模式下判断当前 URL 是否以某个 hash 开头。
// 如果主应用使用 history 模式，也可以直接把 activeRule 写成字符串或正则。
const getActiveRule = (hash) => (location) => location.hash.startsWith(hash);

registerMicroApps([
  {
    // name 必须全局唯一，且最好与子应用自身的名称保持一致。
    // qiankun 会用 name 做缓存 key、DOM 隔离前缀、错误提示等。
    name: 'vue-app',

    // entry 是子应用的入口地址，qiankun 默认使用 HTML Entry。
    // 使用 "//localhost:8082" 这种协议相对 URL，可以自动跟随父应用的 http/https 协议。
    entry: '//localhost:8082',

    // container 是子应用挂载的 DOM 容器选择器，必须在主应用布局中真实存在。
    container: '#micro-viewport',

    // activeRule 决定什么 URL 下激活该子应用。
    // 这里主应用使用 hash 路由，所以用函数判断 hash 是否以 "#/dashboard/micro-vue" 开头。
    activeRule: getActiveRule('#/dashboard/micro-vue'),
  },
]);

// 调用 start() 后，qiankun 才会开始监听路由变化并加载子应用。
// 可以在这里配置 prefetch、sandbox、singular 等选项。
start({
  // 预加载其他子应用资源，提升切换体验。
  prefetch: true,
});
```

- [ ] **Step 9: host-layout-html.bad.html**

Create: `src/pages/qiankun/basic/demos/host-layout-html.bad.html`

```html
<!-- ❌ 反面教材：主应用没有预留挂载容器 -->
<!-- qiankun 找不到 #micro-viewport，子应用无法被挂载到正确位置。 -->

<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>主应用</title>
  </head>
  <body>
    <!-- 主应用布局中只有菜单和主内容区，没有为子应用预留挂载点 -->
    <div id="root">
      <aside>侧边栏菜单</aside>
      <main>
        <h1>主应用内容</h1>
        <!-- 这里应该有一个 <div id="micro-viewport"></div> 让 qiankun 挂载子应用 -->
      </main>
    </div>
  </body>
</html>
```

- [ ] **Step 10: host-layout-html.good.tsx**

Create: `src/pages/qiankun/basic/demos/host-layout-html.good.tsx`

```tsx
// ✅ 最佳实践：主应用布局中预留挂载容器
// 注意：这里为了演示，用 inline style 展示关键样式。实际项目中建议用 CSS/Styled Components。

import React from 'react';

export default function HostLayout() {
  return (
    <div id="root" style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: 200, borderRight: '1px solid #ddd' }}>
        侧边栏菜单
      </aside>
      <main style={{ flex: 1, padding: 16, overflow: 'auto' }}>
        <h1>主应用内容区</h1>

        {/*
          #micro-viewport 是 qiankun 挂载子应用的容器，必须满足以下条件：
          1. 在 registerMicroApps 的 container 字段中能找到；
          2. 不能被 display: none 包裹，否则子应用无法渲染；
          3. 需要有明确高度（或 minHeight），否则子应用渲染后可能不可见；
          4. 建议设置 overflow: auto，让子应用内容超出时可以独立滚动。
        */}
        <div
          id="micro-viewport"
          style={{
            minHeight: 500,
            border: '1px dashed #1890ff',
            borderRadius: 8,
            overflow: 'auto',
            position: 'relative',
          }}
        >
          {/* 子应用会挂载到这里 */}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 11: 验证 demos 目录被正确排除**

Run: `npx tsc --noEmit`
Expected: 通过（`.bad.ts` 已被 tsconfig.json 的 `exclude` 排除）。

- [ ] **Step 12: Commit**

```bash
git add src/pages/qiankun/basic/demos/
git commit -m "feat(qiankun): add bad/good code demos for qiankun basic"
```

---

## Task 4: 创建章节组件

**Files:**
- Create: `src/pages/qiankun/basic/chapters/SectionIntro.tsx`
- Create: `src/pages/qiankun/basic/chapters/SectionChildBuild.tsx`
- Create: `src/pages/qiankun/basic/chapters/SectionChildEntry.tsx`
- Create: `src/pages/qiankun/basic/chapters/SectionChildRouter.tsx`
- Create: `src/pages/qiankun/basic/chapters/SectionHostRegister.tsx`
- Create: `src/pages/qiankun/basic/chapters/SectionMountContainer.tsx`

**说明：** 每个章节组件使用 Ant Design 的 Typography 展示标题和段落，使用 `CodeDiff` 组件展示代码对比。统一从 `data.ts` 读取文本，从 `demos/` 通过 `?raw` 引入代码。

- [ ] **Step 1: SectionIntro.tsx**

Create: `src/pages/qiankun/basic/chapters/SectionIntro.tsx`

```tsx
import React from 'react';
import { Typography, Card } from 'antd';
import { introData } from '../data';

const SectionIntro: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{introData.title}</Typography.Title>

      <Typography.Title level={4}>一、现象/问题</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {introData.phenomenon.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>二、底层原因</Typography.Title>
      <Typography.Paragraph>{introData.cause}</Typography.Paragraph>

      <Typography.Title level={4}>三、如何解决</Typography.Title>
      <Card>
        <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: 14 }}>
{`用户访问 /dashboard/micro-vue/list
            ↓
主应用路由匹配 /dashboard/micro-vue/*
            ↓
qiankun activeRule 命中
            ↓
请求 entry（//localhost:8082）
            ↓
解析 HTML → 提取 JS/CSS
            ↓
挂载到 #micro-viewport
            ↓
子应用 Vue Router 接管 /list`}
        </pre>
      </Card>

      <Typography.Title level={4}>四、为什么要这样解决</Typography.Title>
      <Typography.Paragraph>{introData.solution}</Typography.Paragraph>

      <Typography.Title level={4}>五、核心原理</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {introData.principle.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>
    </section>
  );
};

export default SectionIntro;
```

- [ ] **Step 2: SectionChildBuild.tsx**

Create: `src/pages/qiankun/basic/chapters/SectionChildBuild.tsx`

```tsx
import React from 'react';
import { Typography, List, Alert } from 'antd';
import CodeDiff from '../../../../components/CodeDiff';
import { childBuildData } from '../data';
import badCode from '../demos/child-vite-config.bad.ts?raw';
import goodCode from '../demos/child-vite-config.good.ts?raw';

const SectionChildBuild: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{childBuildData.title}</Typography.Title>

      <Typography.Title level={4}>一、现象/问题</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {childBuildData.phenomenon.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>二、底层原因</Typography.Title>
      <Typography.Paragraph>{childBuildData.cause}</Typography.Paragraph>

      <Typography.Title level={4}>三、如何解决</Typography.Title>
      <CodeDiff
        oldValue={badCode}
        newValue={goodCode}
        leftTitle="❌ 反面教材"
        rightTitle="✅ 最佳实践"
        type="error"
        hideDiffMarkers={true}
      />

      <Typography.Title level={4}>四、为什么要这样解决</Typography.Title>
      <Typography.Paragraph>{childBuildData.solution}</Typography.Paragraph>

      <Typography.Title level={4}>五、核心原理</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {childBuildData.principle.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Alert
        type="warning"
        message="注意事项"
        description={
          <List
            size="small"
            dataSource={childBuildData.notes}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        }
      />
    </section>
  );
};

export default SectionChildBuild;
```

- [ ] **Step 3: SectionChildEntry.tsx**

Create: `src/pages/qiankun/basic/chapters/SectionChildEntry.tsx`

```tsx
import React from 'react';
import { Typography, List, Alert } from 'antd';
import CodeDiff from '../../../../components/CodeDiff';
import { childEntryData } from '../data';
import badCode from '../demos/child-main-js.bad.ts?raw';
import goodCode from '../demos/child-main-js.good.ts?raw';

const SectionChildEntry: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{childEntryData.title}</Typography.Title>

      <Typography.Title level={4}>一、现象/问题</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {childEntryData.phenomenon.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>二、底层原因</Typography.Title>
      <Typography.Paragraph>{childEntryData.cause}</Typography.Paragraph>

      <Typography.Title level={4}>三、如何解决</Typography.Title>
      <CodeDiff
        oldValue={badCode}
        newValue={goodCode}
        leftTitle="❌ 反面教材"
        rightTitle="✅ 最佳实践"
        type="error"
        hideDiffMarkers={true}
      />

      <Typography.Title level={4}>四、为什么要这样解决</Typography.Title>
      <Typography.Paragraph>{childEntryData.solution}</Typography.Paragraph>

      <Typography.Title level={4}>五、核心原理</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {childEntryData.principle.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Alert
        type="warning"
        message="注意事项"
        description={
          <List
            size="small"
            dataSource={childEntryData.notes}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        }
      />
    </section>
  );
};

export default SectionChildEntry;
```

- [ ] **Step 4: SectionChildRouter.tsx**

Create: `src/pages/qiankun/basic/chapters/SectionChildRouter.tsx`

```tsx
import React from 'react';
import { Typography, List, Alert } from 'antd';
import CodeDiff from '../../../../components/CodeDiff';
import { childRouterData } from '../data';
import badCode from '../demos/child-router.bad.ts?raw';
import goodCode from '../demos/child-router.good.ts?raw';

const SectionChildRouter: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{childRouterData.title}</Typography.Title>

      <Typography.Title level={4}>一、现象/问题</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {childRouterData.phenomenon.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>二、底层原因</Typography.Title>
      <Typography.Paragraph>{childRouterData.cause}</Typography.Paragraph>

      <Typography.Title level={4}>三、如何解决</Typography.Title>
      <CodeDiff
        oldValue={badCode}
        newValue={goodCode}
        leftTitle="❌ 反面教材"
        rightTitle="✅ 最佳实践"
        type="error"
        hideDiffMarkers={true}
      />

      <Typography.Title level={4}>四、为什么要这样解决</Typography.Title>
      <Typography.Paragraph>{childRouterData.solution}</Typography.Paragraph>

      <Typography.Title level={4}>五、核心原理</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {childRouterData.principle.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Alert
        type="warning"
        message="注意事项"
        description={
          <List
            size="small"
            dataSource={childRouterData.notes}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        }
      />
    </section>
  );
};

export default SectionChildRouter;
```

- [ ] **Step 5: SectionHostRegister.tsx**

Create: `src/pages/qiankun/basic/chapters/SectionHostRegister.tsx`

```tsx
import React from 'react';
import { Typography, List, Alert } from 'antd';
import CodeDiff from '../../../../components/CodeDiff';
import { hostRegisterData } from '../data';
import badCode from '../demos/host-register-js.bad.ts?raw';
import goodCode from '../demos/host-register-js.good.ts?raw';

const SectionHostRegister: React.FC = () => {
  return (
    <section>
      <Typography.Title level={2}>{hostRegisterData.title}</Typography.Title>

      <Typography.Title level={4}>一、现象/问题</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {hostRegisterData.phenomenon.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>二、底层原因</Typography.Title>
      <Typography.Paragraph>{hostRegisterData.cause}</Typography.Paragraph>

      <Typography.Title level={4}>三、如何解决</Typography.Title>
      <CodeDiff
        oldValue={badCode}
        newValue={goodCode}
        leftTitle="❌ 反面教材"
        rightTitle="✅ 最佳实践"
        type="error"
        hideDiffMarkers={true}
      />

      <Typography.Title level={4}>四、为什么要这样解决</Typography.Title>
      <Typography.Paragraph>{hostRegisterData.solution}</Typography.Paragraph>

      <Typography.Title level={4}>五、核心原理</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {hostRegisterData.principle.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Alert
        type="warning"
        message="注意事项"
        description={
          <List
            size="small"
            dataSource={hostRegisterData.notes}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        }
      />
    </section>
  );
};

export default SectionHostRegister;
```

- [ ] **Step 6: SectionMountContainer.tsx**

Create: `src/pages/qiankun/basic/chapters/SectionMountContainer.tsx`

```tsx
import React from 'react';
import { Typography, List, Alert } from 'antd';
import CodeDiff from '../../../../components/CodeDiff';
import { mountContainerData } from '../data';
import badCode from '../demos/host-layout-html.bad.html?raw';
import goodCode from '../demos/host-layout-html.good.tsx?raw';

const SectionMountContainer: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{mountContainerData.title}</Typography.Title>

      <Typography.Title level={4}>一、现象/问题</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {mountContainerData.phenomenon.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>二、底层原因</Typography.Title>
      <Typography.Paragraph>{mountContainerData.cause}</Typography.Paragraph>

      <Typography.Title level={4}>三、如何解决</Typography.Title>
      <CodeDiff
        oldValue={badCode}
        newValue={goodCode}
        leftTitle="❌ 反面教材"
        rightTitle="✅ 最佳实践"
        type="error"
        hideDiffMarkers={true}
      />

      <Typography.Title level={4}>四、为什么要这样解决</Typography.Title>
      <Typography.Paragraph>{mountContainerData.solution}</Typography.Paragraph>

      <Typography.Title level={4}>五、核心原理</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {mountContainerData.principle.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Alert
        type="warning"
        message="注意事项"
        description={
          <List
            size="small"
            dataSource={mountContainerData.notes}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        }
      />
    </section>
  );
};

export default SectionMountContainer;
```

- [ ] **Step 7: 验证 TypeScript**

Run: `npx tsc --noEmit`
Expected: 通过。

> **Note:** 项目 `vite-env.d.ts` 中已经声明了 `declare module '*?raw'`，因此 `*.html?raw`、`*.ts?raw` 等所有 raw 导入类型均被覆盖，无需为每种扩展名单独声明。

- [ ] **Step 8: Commit**

```bash
git add src/pages/qiankun/basic/chapters/
git commit -m "feat(qiankun): add six chapter components for qiankun basic"
```

---

## Task 5: 创建 LiveDemo 组件

**Files:**
- Create: `src/pages/qiankun/basic/LiveDemo.tsx`

**说明：** 静态交互演示，不加载真实子应用。通过一组 Switch 开关，让用户选择关键配置项，然后实时判断当前配置是否可运行。

- [ ] **Step 1: 编写 LiveDemo.tsx**

Create: `src/pages/qiankun/basic/LiveDemo.tsx`

```tsx
import React, { useState, useMemo } from 'react';
import { Card, Switch, Typography, Alert, Space, Collapse, List, Tag } from 'antd';
import { liveDemoData } from './data';

type SwitchKey = 'childPlugin' | 'childCors' | 'childEntry' | 'childRouter' | 'hostActiveRule' | 'hostContainer';

const initialState: Record<SwitchKey, boolean> = {
  childPlugin: false,
  childCors: false,
  childEntry: false,
  childRouter: false,
  hostActiveRule: false,
  hostContainer: false,
};

const sectionMap: Record<SwitchKey, string> = {
  childPlugin: '二、子应用打包配置',
  childCors: '二、子应用打包配置',
  childEntry: '三、子应用入口改造',
  childRouter: '四、子应用内部路由',
  hostActiveRule: '五、父应用注册',
  hostContainer: '六、挂载容器',
};

const LiveDemo: React.FC = () => {
  const [state, setState] = useState<Record<SwitchKey, boolean>>(initialState);

  const allEnabled = useMemo(() => Object.values(state).every(Boolean), [state]);

  const missingKeys = useMemo(
    () => (Object.keys(state) as SwitchKey[]).filter((key) => !state[key]),
    [state]
  );

  const toggle = (key: SwitchKey) => {
    setState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card title={liveDemoData.title}>
      <Typography.Paragraph>{liveDemoData.description}</Typography.Paragraph>

      <Space direction="vertical" style={{ width: '100%' }}>
        {liveDemoData.switches.map((item) => (
          <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{item.label}</span>
            <Switch
              checked={state[item.key as SwitchKey]}
              onChange={() => toggle(item.key as SwitchKey)}
            />
          </div>
        ))}
      </Space>

      <Alert
        style={{ marginTop: 24 }}
        type={allEnabled ? 'success' : 'error'}
        message={allEnabled ? '配置可运行' : '配置仍有缺失'}
        description={allEnabled ? liveDemoData.successText : liveDemoData.errorText}
        showIcon
      />

      {!allEnabled && (
        <div style={{ marginTop: 16 }}>
          <Typography.Text type="danger">未启用的配置项：</Typography.Text>
          <List
            size="small"
            bordered
            dataSource={missingKeys}
            renderItem={(key) => (
              <List.Item>
                <Tag color="error">{liveDemoData.switches.find((s) => s.key === key)?.label}</Tag>
                <span style={{ marginLeft: 8 }}>对应章节：{sectionMap[key]}</span>
              </List.Item>
            )}
          />
        </div>
      )}

      <Collapse style={{ marginTop: 24 }}>
        <Collapse.Panel header={liveDemoData.checklistTitle} key="checklist">
          <Typography.Title level={5}>子应用侧</Typography.Title>
          <ul>
            <li>vite.config.ts 中使用 vite-plugin-qiankun</li>
            <li>server.headers 配置 Access-Control-Allow-Origin</li>
            <li>main.js 中使用 renderWithQiankun 暴露生命周期</li>
            <li>router/index.ts 中根据 __POWERED_BY_QIANKUN__ 切换 base</li>
          </ul>
          <Typography.Title level={5}>父应用侧</Typography.Title>
          <ul>
            <li>registerMicroApps 中正确配置 name / entry / container / activeRule</li>
            <li>调用 start()</li>
            <li>布局中预留 #micro-viewport 容器并设置合理高度</li>
          </ul>
        </Collapse.Panel>
      </Collapse>
    </Card>
  );
};

export default LiveDemo;
```

- [ ] **Step 2: 验证 TypeScript**

Run: `npx tsc --noEmit`
Expected: 通过。

- [ ] **Step 3: Commit**

```bash
git add src/pages/qiankun/basic/LiveDemo.tsx
git commit -m "feat(qiankun): add static live demo for qiankun basic config"
```

---

## Task 6: 创建页面入口 index.tsx

**Files:**
- Create: `src/pages/qiankun/basic/index.tsx`

**说明：** 组合所有章节组件和 LiveDemo，使用 Ant Design 的 Typography 和 Space 布局。

- [ ] **Step 1: 编写 index.tsx**

Create: `src/pages/qiankun/basic/index.tsx`

```tsx
import React from 'react';
import { Typography, Space, Divider } from 'antd';
import { pageData } from './data';
import LiveDemo from './LiveDemo';
import SectionIntro from './chapters/SectionIntro';
import SectionChildBuild from './chapters/SectionChildBuild';
import SectionChildEntry from './chapters/SectionChildEntry';
import SectionChildRouter from './chapters/SectionChildRouter';
import SectionHostRegister from './chapters/SectionHostRegister';
import SectionMountContainer from './chapters/SectionMountContainer';

const QiankunBasicPage: React.FC = () => {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Typography.Title>{pageData.title}</Typography.Title>
      <Typography.Paragraph type="secondary">{pageData.subtitle}</Typography.Paragraph>

      <Divider />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <SectionIntro />

        <LiveDemo />

        <SectionChildBuild />
        <SectionChildEntry />
        <SectionChildRouter />
        <SectionHostRegister />
        <SectionMountContainer />
      </Space>
    </div>
  );
};

export default QiankunBasicPage;
```

- [ ] **Step 2: 验证 TypeScript**

Run: `npx tsc --noEmit`
Expected: 通过。

- [ ] **Step 3: Commit**

```bash
git add src/pages/qiankun/basic/index.tsx
git commit -m "feat(qiankun): add qiankun basic page entry component"
```

---

## Task 7: 注册路由

**Files:**
- Modify: `src/router/config.tsx`

**说明：** 等页面组件存在后再注册路由，避免构建失败。

- [ ] **Step 1: 添加懒加载导入**

在 `src/router/config.tsx` 的懒加载组件区域新增：

```tsx
const QiankunBasicPage = lazy(() => import('../pages/qiankun/basic/index'));
```

- [ ] **Step 2: 添加 qiankun 专题菜单**

在 `dashboardRoutes` 数组中合适位置（例如 React API 学习之后、性能优化专题之前）新增：

```tsx
  {
    path: '/dashboard/qiankun',
    label: 'qiankun 专题',
    icon: <ApiOutlined />,
    children: [
      {
        path: '/dashboard/qiankun/basic',
        label: '乾坤基础',
        element: <QiankunBasicPage />,
      },
    ],
  },
```

- [ ] **Step 3: 验证类型检查**

Run: `npm run typecheck` 或 `npx tsc --noEmit`
Expected: 通过。

- [ ] **Step 4: Commit**

```bash
git add src/router/config.tsx
git commit -m "feat(router): register qiankun basic route"
```

---

## Task 8: 运行 lint 和类型检查

**Files:**
- 不修改文件，只运行命令。

- [ ] **Step 1: 运行 lint**

Run: `npm run lint`
Expected: 无新增错误（允许修复本任务新增文件中的 lint 问题）。

- [ ] **Step 2: 运行类型检查**

Run: `npm run typecheck` 或 `npx tsc --noEmit`
Expected: 通过。

- [ ] **Step 3: 运行 dev 服务器验证页面**

Run: `npm run dev`
Expected: 服务器正常启动，访问 `http://localhost:5173/#/dashboard/qiankun/basic` 能看到"qiankun 专题：乾坤基础"页面，6 个章节和 Live Demo 正常渲染。

- [ ] **Step 4: Commit（如未提交）**

如果 lint 或类型检查有修复，提交这些修复：

```bash
git add -A
git commit -m "style(qiankun): fix lint and typecheck issues"
```

---

## Execution Handoff

在继续执行之前，请选择本计划的执行方式：

### Option A: Subagent-Driven Execution（推荐）

- **使用子技能：** `superpowers:subagent-driven-development`
- **适用场景：** 希望由子代理按任务顺序自动完成实现、验证和提交。
- **执行方式：** 子代理会逐条读取 Task 1 至 Task 8，调用工具创建/修改文件，运行命令验证，并标记复选框。遇到错误时，子代理会暂停并反馈。
- **推荐原因：** 对于多步骤、跨文件、需要验证和提交的实现计划，子代理能保持一致性并减少遗漏。

### Option B: Inline Execution

- **使用子技能：** `superpowers:executing-plans`
- **适用场景：** 希望在当前会话中直接执行计划，逐步完成任务。
- **执行方式：** 执行者按照 Task 1 至 Task 8 的顺序，逐步创建/修改文件、运行命令并标记复选框。每完成一步即验证，不跨步跳跃。
- **注意事项：** 请确保在修改 `src/router/config.tsx` 前后分别运行类型检查，避免提前注册未就绪的页面组件。

> 无论选择哪种方式，都请严格遵循"先回退路由、最后注册路由"的顺序，并在每个 Task 完成后运行对应的验证命令。

---

## 验收标准检查

- [ ] 主应用菜单新增 `qiankun 专题` → `乾坤基础`；
- [ ] 访问 `/dashboard/qiankun/basic` 能正常打开页面；
- [ ] 页面包含 6 个小节，每个小节都有"五维度"结构；
- [ ] 每个小节至少包含一个 CodeDiff，代码从 `demos/` 通过 `?raw` 引入；
- [ ] 代码注释详尽，中文，覆盖字段含义和注意事项；
- [ ] Live Demo 是静态配置开关，能判断当前配置是否可运行；
- [ ] 不依赖 micro-vue 实际运行，不改动子应用源码；
- [ ] 通过 `npm run lint` 和 `npm run typecheck`。

---

## 自我审查

### Spec 覆盖检查

- 引言：Task 4 Step 1 SectionIntro.tsx ✓
- 子应用打包配置：Task 3 Step 1-2 + Task 4 Step 2 ✓
- 子应用入口改造：Task 3 Step 3-4 + Task 4 Step 3 ✓
- 子应用内部路由：Task 3 Step 5-6 + Task 4 Step 4 ✓
- 父应用注册：Task 3 Step 7-8 + Task 4 Step 5 ✓
- 挂载容器：Task 3 Step 9-10 + Task 4 Step 6 ✓
- Live Demo：Task 5 ✓
- 路由注册：Task 7 ✓
- 回退提前注册的路由：Task 1 ✓

### Placeholder 检查

- 无 TBD / TODO / implement later ✓
- 无未定义函数引用 ✓
- 所有步骤都包含完整代码或命令 ✓

### 类型一致性检查

- `SwitchKey` 类型与 `liveDemoData.switches` 的 `key` 字段一致 ✓
- `sectionMap` 键与 `SwitchKey` 一致 ✓
- 所有章节组件统一使用 `data.ts` 中的数据 ✓
