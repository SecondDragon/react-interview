# react-interview 项目知识库

## 项目定位

前端面试知识体系系统的主应用（Host），基于 React 19 + Vite 8 + Ant Design 6。
负责整体布局、路由分发、权限管理，通过 **qiankun** 集成 Vue 等子应用。

## 技术栈

| 类别       | 选型                                           |
| ---------- | ---------------------------------------------- |
| 框架       | React 19 + TypeScript 5.9                      |
| 构建工具   | Vite 8（Rolldown）                             |
| UI 组件库  | Ant Design 6                                   |
| 样式方案   | Tailwind CSS 4 + styled-components 6           |
| 路由       | React Router 7（BrowserRouter）                |
| 状态管理   | Zustand 5                                      |
| 微前端     | qiankun 2                                      |
| 代码展示   | react-syntax-highlighter + react-diff-viewer   |
| 虚拟列表   | @tanstack/react-virtual + react-virtuoso       |

## 目录结构

```
src/
├── router/config.tsx    ← 路由 + 菜单配置（核心文件）
├── layout/MainLayout.tsx ← 主布局（侧边栏 + 标签页 + 内容区）
├── pages/               ← 按专题分目录
├── components/          ← 通用组件（CodeDiff, CodeBlock, AudioPlayer）
├── store/               ← Zustand stores
└── hooks/               ← 自定义 hooks
```

## 路由与菜单

路由和菜单统一在 `src/router/config.tsx` 的 `dashboardRoutes` 数组中定义。
`App.tsx` 中的 `renderFlattenRoutes` 递归展平所有路由，自动处理 `/dashboard/` 前缀。

**新增页面的步骤：**
1. 在 `src/pages/<专题>/<页面名>/` 下创建 `index.tsx`（页面组件）+ `Examples.ts`（元数据）
2. 在 `router/config.tsx` 顶部添加 `lazy(() => import(...))`
3. 在 `dashboardRoutes` 中添加路由条目（path / label / icon / element / children）

**目录 vs 菜单页：**
- 只有 `children`、没有 `element` 的是目录（展开子菜单，不可点击）
- 有 `element` 的是菜单页（可点击打开标签页）

## 页面编写规范

### 兼容性问题页面 (`src/pages/compatibility/**`)

必须按五维结构组织，每个维度一个 Card：
1. **Bug 出现的现象** — 直观错误表现 + 平台差异
2. **Bug 的底层原因** — 浏览器内核 / 系统机制 / W3C 规范偏离
3. **Bug 如何解决** — 用 `CodeDiff` 对比 Bad vs Good
4. **互动演示** — 必须有可交互的 Live Demo（Ant Design 组件模拟）
5. **核心原理** — 背后的硬核逻辑

**多方案时**：每种方案一个独立组件文件，主页面负责组合展示 + 综合对比。

### 性能优化页面 (`src/pages/performance/**`)

六段结构（`Waterfall/**` 除外）：
1. 性能问题现象
2. 底层原因（JS 加载 / 打包策略 / 浏览器加载）
3. 适用场景（贴近日常开发）
4. 互动演示（Live Demo）
5. 代码演示（CodeDiff）
6. 核心原理

### 其他专题页面

参照上述标准，但至少应包含：问题描述 → 原理分析 → 代码对比 → Live Demo → 核心原理。

## 代码风格硬规则

- **所有注释和文案用中文**
- **代码对比用 `CodeDiff` 组件**，代码展示用 `CodeBlock` 组件
- **元数据和组件分离**：案例描述、Bad/Good Code 放在 `Examples.ts`，页面组件放 `index.tsx`
- **每个路由页面一个独立文件夹**，所有相关文件放一起
- **styled-components 样式变量放在文件末尾**，不干扰组件代码阅读
- 使用 `@/` 别名引用 src 下的模块（如 `@/components/CodeDiff`）

## 子应用集成

qiankun 在 `MainLayout.tsx` 中初始化。新增子应用页面时：
1. 在 `router/config.tsx` 中添加路由项
2. 确保子应用内部路由与主应用路径前缀一致

## 可用通用组件

| 组件 | 路径 | 用途 |
|------|------|------|
| `CodeDiff` | `@/components/CodeDiff` | 代码对比（Bad vs Good） |
| `CodeBlock` | `@/components/CodeBlock` | 单段代码高亮展示 |
| `AudioPlayer` | `@/components/AudioPlayer` | 自定义音频播放器 |

## 优先级

本文件覆盖一切通用偏好。跨系统协作、路由集成标准参照根目录 AGENTS.md。
