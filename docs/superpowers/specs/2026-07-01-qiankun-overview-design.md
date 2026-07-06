# qiankun 专题 — 概览设计文档

> 创建日期：2026-07-01
> 所属系统：react-interview（主应用）
> 文档类型：UI/知识体系页面设计
> 状态：待实现

## 1. 设计目标

在主应用（react-interview）的 `qiankun 专题` 下新增第三个菜单项 **"概览"**。核心话题是 **qiankun vs iframe 的全面对比**。

本页面的目标：

- 覆盖微前端面试最高频问题之一："为什么不用 iframe？"
- 不是简单结论"qiankun 好 iframe 坏"，而是**把 10 个维度的权衡讲透**；
- 每个维度给出具体代码示例，让读者能直观感受差异；
- 给出一个场景化的选择决策树；
- 保持与 `asset-loading` 一致的 `content.mdx` 单文件结构。

## 2. 页面范围与边界

### 2.1 在本次设计中完成

- 主应用路由注册：
  - 父级菜单已存在：`qiankun 专题`（`/dashboard/qiankun`）
  - 新增二级菜单：`概览`（`/dashboard/qiankun/overview`）
- 页面组件目录：`src/pages/qiankun/overview/`
- 使用 `content.mdx` 单文件结构，与 `styled-components-cssom` 保持一致
- 4 个大节：
  - 一、引言
  - 二、qiankun vs iframe 全面对比（10 个维度，每个维度用表格 + demo 代码对比）
  - 三、核心结论（决策树）
  - 四、Live Demo：对比决策器
- 代码示例全部从 `demos/` 通过 `?raw` 引入

### 2.2 明确不在本次范围

- 不深入讨论 JS 沙箱实现细节（留作后续独立子菜单）；
- 不讨论应用间通信的 props 底层原理；
- 不改动已有 3 个子菜单的现有内容。

## 3. 文件结构

```text
src/pages/qiankun/overview/                          # 新增页面目录
  index.tsx                                           # 页面入口，仅渲染 <Content />
  content.mdx                                         # 所有章节内容
  data.ts                                             # 纯数据（表格数据、列表）
  LiveDemo.tsx                                        # 对比决策器
  demos/
    iframe-basic.html                                 # iframe 基础嵌入示例
    iframe-communication.html                         # iframe postMessage 通信
    iframe-auto-height.html                           # iframe 自适应高度示例
    iframe-memory-leak.html                           # iframe 内存泄漏示例
    qiankun-register.tsx                              # qiankun registerMicroApps
    qiankun-communication.tsx                         # qiankun initGlobalState
    qiankun-style-sharing.tsx                         # qiankun 样式集成（Ant Design 共享）
```

## 4. 路由注册

在主应用 [src/router/config.tsx](file:///d:/测试人工智能/前端面试/react-interview/src/router/config.tsx#L105) 的 `qiankun 专题` 菜单下新增子菜单：

```tsx
const QiankunOverviewPage = lazy(() => import('../pages/qiankun/overview/index'));

export const dashboardRoutes: RouteConfig[] = [
  // ... 已有路由 ...
  {
    path: '/dashboard/qiankun',
    label: 'qiankun 专题',
    icon: <ApiOutlined />,
    children: [
      // ... 已有子菜单 ...
      {
        path: '/dashboard/qiankun/overview',
        label: '概览',
        element: <QiankunOverviewPage />,
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

const QiankunOverviewPage: React.FC = () => {
  return <Content />;
};

export default QiankunOverviewPage;
```

### 5.2 内容文件 `content.mdx`

- 使用 import 引入 Ant Design 组件、`CodeDiff`、`LiveDemo`、`MermaidViewer` 等；
- 每个维度使用一个或多个 Card 包装，包含表格描述 + CodeDiff 演示；
- 使用 `Divider` 分隔大节，使用 `<hr />` 分隔维度。

### 5.3 数据文件 `data.ts`

存放：

- 10 个维度的对比数据（统一表格结构）
- 决策树的条件与推荐配置
- Live Demo 的场景选项数组

### 5.4 Live Demo `LiveDemo.tsx`

"对比决策器"：
- 用户选择自己的场景条件（多选开关）
- 根据条件实时计算出推荐方案
- 展示推荐理由和注意事项

## 6. 内容设计

### 6.1 一、引言

- 微前端面试高频题："为什么不用 iframe？"
- 常见的面试答案：iframe 太重、通信复杂、SEO 差、URL 不同步、白屏时间长
- 但 iframe 也在很多场景下是**最成熟的方案**
- 本章目标不是"哪个更好"，而是"什么场景选什么"

### 6.2 二、qiankun vs iframe 全面对比

每个维度使用统一结构：

```
### 2.N 维度名称

一句话概括。

**qiankun 的表现：** ...
**iframe 的表现：** ...

**直观对比：**

<Table dataSource={...} />

**代码示例：**
<CodeDiff oldValue={iframeCode} newValue={qiankunCode} />
```

#### 2.1 架构本质

| 对比项 | qiankun | iframe |
|---|---|---|
| 浏览器上下文 | 同一 Document，共享 DOM Tree | 独立 Document，独立 Window |
| 渲染方式 | 子应用元素直接挂到主应用 DOM 上 | `<iframe>` 内独立渲染 |
| URL 归属 | 主应用地址栏 | iframe 有自己独立的地址栏（不可见） |

**代码示例：**
- Bad（iframe）：`<iframe src="https://subapp.example.com">`，整个 DOM 是黑盒
- Good（qiankun）：`registerMicroApps` 注册后，子应用组件直接嵌入主应用布局

#### 2.2 路由与 URL 体验

| 对比项 | qiankun | iframe |
|---|---|---|
| 浏览器地址 | 共享主应用地址，可通过 activeRule 做路径映射 | iframe 内部路由变化不改变主应用地址栏 |
| 前进后退 | 子应用内部路由切换在主应用 history 中，浏览器前进后退正常 | iframe 内部 history 操作不会触发主应用 popstate |
| 刷新行为 | 刷新主应用，qiankun 自动重新激活子应用 | 刷新主应用，iframe 的 src 不变，但 iframe 内状态全丢 |
| 书签 | 可以收藏子应用的具体页面 URL | 只能收藏主应用 URL |

**代码示例：**
- Bad（iframe）：`<a href="/sql/query?id=123">` 书签分享，实际是主应用路径，iframe 需额外同步
- Good（qiankun）：子应用的路由就是主应用路由的一部分 `/dashboard/qiankun/basic`

#### 2.3 应用间通信

| 对比项 | qiankun | iframe |
|---|---|---|
| 通信机制 | props + `initGlobalState` / `onGlobalStateChange` | `postMessage` + `addEventListener` |
| 数据类型 | 引用传递，对象直接共享 | 结构化克隆算法（structured clone），函数/Proxy 等无法传递 |
| 通信延迟 | 同进程同步调用 | 异步消息队列 |
| 调试难度 | 断点同进程，容易跟踪 | 需要两边 DevTools，消息序列化后难以追溯 |

**代码示例：**
- Bad（iframe）：`postMessage` 传一个回调函数 — 传不过去，报错
- Good（qiankun）：`props.onGlobalStateChange` 直接订阅状态变化

**Demo：**
- `demos/iframe-communication.html` — iframe 与主应用 postMessage 通信完整示例
- `demos/qiankun-communication.tsx` — qiankun initGlobalState 通信示例

#### 2.4 DOM 与布局集成

| 对比项 | qiankun | iframe |
|---|---|---|
| 布局方式 | 子应用元素直接在主应用 DOM 树中，可共享 CSS 变量、主题 | `<iframe>` 是一个固定宽高的独立窗口 |
| 自适应 | 子应用可以响应主应用容器尺寸变化，无需额外逻辑 | iframe 高度需要手动计算并通过 postMessage 同步 |
| 弹窗/浮层 | 子应用弹窗可以直接覆盖到主应用上（z-index 可调） | iframe 内的弹窗被限制在 iframe 边框内 |
| 加载体验 | 子应用可以渐进式渲染 | iframe 白屏，直到子应用完全加载后才显示 |

**代码示例：**
- Bad（iframe）：需要主应用监听 iframe 内容高度变化，postMessage 通知，手动设置 iframe 高度
- Good（qiankun）：子应用 `render({ container })` 直接挂载到指定 DOM 节点

**Demo：**
- `demos/iframe-auto-height.html` — iframe 自适应高度示例（繁杂）

#### 2.5 样式隔离

| 对比项 | qiankun | iframe |
|---|---|---|
| 隔离程度 | 实验性、有坑（styled-components 案例就是典型） | 天然完全隔离，不会互相影响 |
| 隔离方式 | `experimentalStyleIsolation` + 沙箱 DOM 劫持 | Shadow DOM 天然隔离 |
| 样式共享 | 子应用可以使用主应用的 Ant Design 主题变量 | 需要额外加载主应用主题文件 |
| 适用性 | 需要处理 styled-components、CSS-in-JS 等特殊情况 | 任何前端框架都不会有样式冲突 |

**代码示例：**
- Bad（iframe）：无法复用主应用 Ant Design 主题，子应用需独立维护一份
- Good（qiankun）：主应用和子应用共享 Ant Design 的 ConfigProvider 主题

**Demo：**
- `demos/qiankun-style-sharing.tsx` — qiankun 下共享 Ant Design 主题示例

#### 2.6 JS 隔离与安全

| 对比项 | qiankun | iframe |
|---|---|---|
| 隔离方式 | Proxy 沙箱（`proxySandbox`），拦截 window 操作 | 浏览器进程级隔离 |
| 安全性 | 有沙箱逃逸风险（如 `Object.prototype` 污染） | 天然沙箱，互不影响 |
| 全局变量 | 沙箱模拟隔离，mount 时创建，unmount 时回收 | 完全独立不共享 |
| 安全策略 | 需要子应用配合 qiankun 生命周期 | 浏览器同源策略（CSP）管理 |

**代码示例：**
- Bad（iframe）：如果子应用需要操作主应用的某些 DOM（比如全屏蒙层），非常困难
- Good（iframe）：如果子应用是第三方不可信代码，iframe 是最安全的选择

#### 2.7 资源加载与性能

| 对比项 | qiankun | iframe |
|---|---|---|
| 基础库加载 | 可共享，主应用已加载的 React/Vue/AntD 子应用复用 | 每个 iframe 独立加载，重新下载 |
| 预加载 | qiankun 支持 `prefetchApps`，空闲时预加载子应用资源 | 不支持 |
| 连接数 | 与主应用共享 TCP 连接（同域时） | 独立建立连接 |
| 首屏速度 | 第一次加载子应用时需要请求 HTML Entry 和 JS | iframe 加载完整 HTML 文档，首屏更慢 |
| 内存占用 | 子应用与主应用共享内存空间 | 每个 iframe 是独立进程（浏览器多进程架构） |

**代码示例：**
- Bad（iframe）：子应用也用了 React 和 Ant Design，主应用已经加载了，iframe 又加载一遍

#### 2.8 SEO 与首屏

| 对比项 | qiankun | iframe |
|---|---|---|
| 搜索引擎 | 子应用内容与主应用在同一 Document 中，可被爬虫索引 | 搜索引擎不抓取 iframe 内容 |
| SSR/SSG 友好 | 可以配合 SSR，子应用首屏 HTML 由服务端渲染 | 子应用 SSR 对主应用无意义 |
| 首屏白屏 | 主应用先渲染，子应用异步加载 | 主应用先渲染，iframe 独立加载，子应用页面完全白屏后才出现 |

**代码示例：**
- Bad（iframe）：子应用页面内容对搜索引擎不可见
- Good（qiankun）：子应用可在主应用内做 SSR

#### 2.9 跨域能力

| 对比项 | qiankun | iframe |
|---|---|---|
| 跨域资源加载 | 需要主应用配置 CORS 头，或通过 nginx 反向代理 | 天然支持跨域加载，`src` 可以是任意域名 |
| 跨域通信 | qiankun 本身不提供跨域功能，需要搭配 CORS | `postMessage` 天然支持跨域，W3C 标准 |
| 跨域限制 | fetch HTML Entry、子应用 JS/CSS 都需要 CORS | iframe 内的跨域请求受浏览器同源策略限制 |

**代码示例：**
- Bad（qiankun）：子应用在 `https://subapp.example.com`，主应用在 `https://main.example.com`，需要配置 CORS
- Good（iframe）：`<iframe src="https://subapp.example.com">` 跨域直接生效

#### 2.10 开发体验与调试

| 对比项 | qiankun | iframe |
|---|---|---|
| 独立开发 | 子应用可以独立运行，热更新正常 | 子应用可以独立运行，热更新正常 |
| 联调 | 需要在主应用内一起跑，但有 qiankun dev mode（vite-plugin-qiankun） | 需要不断刷新主应用页面看 iframe 效果 |
| 调试 | 子应用代码在主应用 DevTools 中，断点同进程 | 需要在主应用和 iframe 各自 DevTools 中切换 |
| 构建部署 | 需要配置子应用打包出口，相对路径等 | 简单的静态部署即可 |

**代码示例：**
- Bad（iframe）：在主应用本地开发时，需要修改 iframe src 指向本地开发服务器

### 6.3 三、核心结论

总结为一个决策树：

```
是否需要统一路由/URL体验？
  ├── 是 → 是否需要完全样式隔离？
  │     ├── 是 → 综合考虑：qiankun + 额外样式隔离措施
  │     └── 否 → 推荐 qiankun
  └── 否 → 是否需要跨域加载不可信内容？
        ├── 是 → 推荐 iframe（安全沙箱天然隔离）
        └── 否 → 推荐 iframe（简单场景下最省心）
```

补充三句话：

1. **"iframe 是最成熟的微前端方案，但不是最好的"** — 适合简单集成、跨域隔离场景；
2. **"qiankun 是最流行的微前端框架，但不是万能的"** — 适合统一 UX、共享资源、路由同步场景；
3. **"选型没有银弹，只有取舍"**。

并给出一个场景对照表：

| 场景 | 推荐方案 | 原因 |
|---|---|---|
| 企业内部后台系统集成为统一平台 | qiankun | 统一路由、统一 UI、共享登录态 |
| 嵌入第三方不可信的广告/插件 | iframe | 安全隔离，沙箱不可突破 |
| 需要一个表格工具作为主应用功能点 | qiankun | 无缝 UI 集成，自适应布局 |
| 两个完全独立的系统，只需要"使用"对方的一个页面 | iframe | 简单，改动最小 |
| 需要所有子应用有独立域名 | qiankun + nginx 转发 | iframe 的 URL 不与主应用同步 |
| 对 SEO 有要求的子应用整合 | qiankun | 同 Document，搜索引擎可爬取 |

### 6.4 四、Live Demo：对比决策器

- 用户通过选择开关/下拉框，描述自己的场景：
  - 是否需要统一路由/URL 体验？
  - 是否需要完全样式隔离？
  - 是否需要跨域加载？
  - 是否是可信的子应用？
  - 是否需要 SEO？
  - 子应用是否使用相同技术栈？
- 根据输入，实时计算推荐方案
- 展示推荐理由和相关章节引用

## 7. 数据与代码分离

- `data.ts` 存放：10 个维度的对比数据、决策树配置、场景对照表数据
- 所有代码示例通过 `import xxx from './demos/xxx?raw'` 引入
- `.bad.ts` 文件会被 `tsconfig.json` 的 `exclude` 排除，避免类型检查报错

## 8. 代码规范

- 使用 Ant Design 组件：Typography、Card、Table、Alert、Tag、Divider、Collapse、List
- 使用 `CodeDiff` 组件展示 Bad/Good 代码对比
- 使用 `MermaidViewer` 展示流程图或架构图（如有需要）
- 所有代码注释和文档解释使用中文

## 9. 验收标准

- [ ] 主应用菜单 `qiankun 专题` 下新增 `概览`
- [ ] 访问 `/dashboard/qiankun/overview` 能正常打开页面
- [ ] 页面包含 4 个大节：引言、全面对比、核心结论、Live Demo
- [ ] 全面对比覆盖 10 个维度，每个维度有表格 + CodeDiff
- [ ] 决策树给出场景化推荐，不是简单的"哪个好"
- [ ] Live Demo 是场景决策器，根据用户选择推荐方案
- [ ] 代码注释详尽，中文
- [ ] 不依赖真实 Monaco/CodeMirror 运行时
- [ ] 通过 `npm run dev` 验证

## 10. 后续可扩展

- JS 沙箱原理（单独子菜单）
- 应用间通信深入（单独子菜单）
- qiankun vs Module Federation 对比（可以作为后续概览的扩展）
