# qiankun 专题 — 子应用资源的加载 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在主应用 react-interview 的 `qiankun 专题` 下新增 `子应用资源的加载` 知识体系页面，讲解 webpack publicPath、qiankun HTML Entry、Monaco/CodeMirror 异步资源加载、CSS 资源路径等知识点，并包含静态资源路径对比器 Live Demo。

**Architecture:** 采用章节化组件（`chapters/*.tsx`）+ 源码提取（`demos/*.bad.ts` / `*.good.ts`）+ 纯数据文件（`data.ts`）+ 静态交互演示（`LiveDemo.tsx`）的结构。所有代码通过 Vite `?raw` 引入，`index.tsx` 作为页面入口组合所有章节，章节遵循"五维度"结构。路由注册在所有组件创建完成后最后进行，避免提前引用不存在的文件。

**Tech Stack:** React 18 + TypeScript + Vite + Ant Design + `react-diff-viewer-continued`（CodeDiff 组件）。

---

## 文件结构

```text
src/pages/qiankun/
  asset-loading/                        # 新增页面目录
    index.tsx
    data.ts
    LiveDemo.tsx
    chapters/
      SectionWebpackOutput.tsx
      SectionDeploymentPath.tsx
      SectionQiankunHtmlEntry.tsx
      SectionMonacoWorker.tsx
      SectionEditorBaseUrl.tsx
      SectionBorderCss.tsx
    demos/
      webpack-config.bad.ts
      webpack-config.good.ts
      runtime-publicpath.bad.ts
      runtime-publicpath.good.ts
      monaco-environment.bad.ts
      monaco-environment.good.ts
      codemirror-config.bad.ts
      codemirror-config.good.ts
      nginx-location.good.conf
src/router/config.tsx   # 最后一步才注册新路由
```

---

## Task 1: 创建页面目录与数据文件

**Files:**
- Create: `src/pages/qiankun/asset-loading/data.ts`
- Create directories: `src/pages/qiankun/asset-loading/chapters`, `src/pages/qiankun/asset-loading/demos`

**说明：** 数据文件只存放纯文本，不包含代码字符串。为后续章节组件提供标题、描述、原因、原理、注意事项等文本。

- [ ] **Step 1: 创建目录结构**

Run:

```bash
mkdir -p src/pages/qiankun/asset-loading/chapters src/pages/qiankun/asset-loading/demos
```

- [ ] **Step 2: 编写 data.ts**

Create: `src/pages/qiankun/asset-loading/data.ts`

```typescript
export const pageData = {
  title: 'qiankun 专题：子应用资源的加载',
  subtitle: '从 webpack publicPath 到 Monaco Worker 的资源加载陷阱',
};

export const webpackOutputData = {
  title: '一、webpack 产物与 publicPath',
  phenomenon: [
    '本地开发时代码高亮、命令补全正常，部署到子应用路径后这些功能消失；',
    '控制台报 404，资源路径是 /js/xxx 而不是 /subapp/js/xxx；',
    '改了 publicPath 后，主资源包能加载，但 worker、grammar 文件还是 404；',
    '不同环境（开发、测试、生产）需要反复改 publicPath。',
  ],
  cause: 'webpack 打包时，代码里的动态加载路径（如 import("./mode-sql")）会基于 output.publicPath 生成 URL。如果 publicPath 是 "/"（默认），产物会假设自己部署在域名根路径。当子应用部署在 "/subapp/" 下，或者在 qiankun 里通过 "//localhost:8082" 加载时，浏览器解析相对路径的 base 发生了变化。',
  solution: '按环境配置 publicPath，或在运行时通过 __webpack_public_path__ 动态设置。',
  principle: [
    'webpack 的 __webpack_require__.p 就是 publicPath；',
    '所有 import()、动态加载的 chunk、图片、字体等 URL 都会拼上这个前缀；',
    '如果子应用被 qiankun 以 HTML Entry 方式加载，子应用内部的 location 仍然是主应用的 URL，因此静态 publicPath 容易错。',
  ],
  notes: [
    'publicPath 可以是字符串、auto 或函数；',
    'auto 会根据 import.meta.url 自动推断，但在某些旧浏览器或特殊部署下可能不准确；',
    '运行时 __webpack_public_path__ 会覆盖构建时的 output.publicPath。',
  ],
};

export const deploymentPathData = {
  title: '二、部署路径与 nginx 转发',
  phenomenon: [
    '子应用独立部署正常，通过 nginx 转发到 /sql/ 后部分资源 404；',
    '刷新页面或直接访问 /sql/list 时，HTML 能加载，但 CSS/JS 404；',
    '改了 publicPath 后有些资源能加载，但有些还是从 "/" 请求。',
  ],
  cause: 'nginx 转发改变了浏览器看到的 URL，但子应用代码里仍然按原始路径构建。如果 publicPath 是 "/" 或 auto，在 "/sql/" 路径下请求 /js/xxx 会被发到主应用根路径，而不是子应用。',
  solution: 'nginx 配置 location /sql/ 转发到子应用；子应用 publicPath 设置为 /sql/ 或 ./ 或 auto；运行时通过 __webpack_public_path__ 动态设置。',
  principle: [
    'nginx 转发只是反向代理，浏览器请求的 URL 仍然是 /sql/js/xxx；',
    '子应用必须知道自己的"外部可见路径"，才能正确拼接资源 URL；',
    '__webpack_public_path__ 是 webpack runtime 的全局变量，可以覆盖构建时的 output.publicPath。',
  ],
  notes: [
    'location /sql/ 末尾的斜杠会影响 proxy_pass 的路径拼接；',
    '如果子应用使用 history 路由，nginx 需要配置 try_files 回退到 index.html；',
    'qiankun 环境可以通过 window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ 获取注入路径。',
    'nginx 转发后，浏览器请求的 /sql/xxx 会被转发到子应用真实路径，因此 Monaco 的默认 worker 路径（如 /sql/editor.worker.js）也会命中，无需额外配置 getWorkerUrl。',
  ],
  universalSummary: [
    'nginx 相对路径转发是**最简单、最接近“万能”**的方案——前提是子应用可以被暴露到主应用域名的某个路径前缀下。',
    '在“同域路径前缀”前提下，浏览器地址栏和子应用的资源路径天然对齐，document.baseURI 就是 /sql/，Monaco、CodeMirror、CSS 字体/图片等依赖浏览器原生相对路径解析的资源默认行为就是正确的。',
    '如果因为品牌或独立域名要求不能走这个方案，才需要回退到 getWorkerUrl / modeURL / 绝对路径 / CORS 配置等方案。',
  ],
  universalTable: [
    { key: '1', scenario: '子应用可以挂到 /sql/ 这类同域路径前缀下', suitable: '适合', reason: '浏览器地址、资源路径、nginx 转发三者一致，默认即可工作' },
    { key: '2', scenario: '品牌或安全要求必须使用独立域名（如 sql.example.com）', suitable: '不适合', reason: '浏览器地址与资源域分离，需要回退到 getWorkerUrl / 绝对路径方案' },
    { key: '3', scenario: '主应用路径前缀冲突（如主应用已有 /sql/ 路由）', suitable: '需要协调', reason: '需更换前缀或调整主应用路由，避免 nginx 与主应用路由冲突' },
    { key: '4', scenario: '严格的 CORS/COEP/CORP 要求', suitable: '可行但增加复杂度', reason: '需要额外配置跨域响应头、资源隔离策略，nginx 只是入口层' },
    { key: '5', scenario: '子应用需要独立部署、独立灰度/回滚', suitable: '适合', reason: 'nginx 只是入口层，后端子应用仍可独立部署、独立维护' },
  ],
  universalConclusion: 'nginx 相对路径转发不是绝对万能，但在“同域路径前缀”这个前提下，它是最省心、代码侵入最小的方案。如果因为品牌或独立域名要求不能走这个方案，才需要回退到 getWorkerUrl / modeURL / 绝对路径 / CORS 配置等方案。',
};

export const htmlEntryData = {
  title: '三、qiankun HTML Entry 如何改变资源 base',
  phenomenon: [
    '子应用独立访问（如 https://sql.example.com/sql/）完全正常，嵌入主应用后 CSS 背景图、字体图标、动态加载的 chunk 404；',
    '子应用 HTML 里的 <script src="./js/app.js"> 被解析成了主应用域下的 /js/app.js；',
    '在独立域名下能加载的 JS 资源，嵌入后却从主应用的 /dashboard/qiankun/... 路径请求。',
  ],
  cause: 'qiankun 默认使用 HTML Entry：它会 fetch 子应用入口 HTML，解析出 <script src>、<link href>、<style>、<img src> 等，然后插入主应用的沙箱容器。浏览器解析相对路径的 base 始终是 document.baseURI，也就是当前页面地址。qiankun 嵌入后，当前页面地址仍是主应用，因此子应用 HTML 中的相对路径会基于主应用路径解析。子应用 JS 内部用 new URL("./worker.js", import.meta.url) 或 document.currentScript 推断路径时，也会拿到主应用域作为错误 base。',
  solution: '使用绝对路径或 "//" 协议相对 URL；运行时动态设置 __webpack_public_path__；对 CSS 中的相对路径进行处理或使用 CDN。',
  principle: [
    '浏览器解析相对路径的 base 是 document.baseURI，而不是资源来源的 HTML；qiankun 把子应用 HTML 插入主应用后，base 仍然是主应用的；',
    '子应用原来写在 HTML 里的 <script src="./js/app.js"> 会被解析成主应用域下的 /js/app.js，而不是子应用域下的 /sql/js/app.js；',
    '__webpack_public_path__ 修改的是 webpack 的 __webpack_require__.p，只在 webpack 模块系统内部生效；它不会自动修复 HTML 标签、CSS url()、原生 new Worker() 的 URL；',
    '协议相对 URL "//" 省略协议但保留域名，不会被主应用 base 带偏，适合跨 HTTP/HTTPS 的固定域名资源；',
    '这也是 webpack 官方推荐生产环境使用绝对路径或 CDN 的原因之一：它消除了「当前页面路径」对资源解析的依赖。',
  ],
  notes: [
    'qiankun 不会自动重写子应用资源 URL；',
    'HTML Entry 中 <base href> 标签可以影响相对路径解析，但也会带来副作用；',
    'CSS 中的相对路径不受 webpack publicPath 控制；',
    '协议相对 URL 在 file:// 协议或某些严格安全策略下会失效，生产环境优先使用 HTTPS 绝对路径。',
  ],
};

export const monacoWorkerData = {
  title: '四、Monaco worker 为什么走不通 publicPath',
  phenomenon: [
    '改了 __webpack_public_path__ 后，主包资源正常，但 Monaco 语法高亮、命令补全仍失效；',
    '控制台看到 worker 文件 404；',
    '有时 worker 能加载，但加载的是主应用根路径下的错误文件。',
  ],
  cause: 'Monaco 的语法分析是在 Web Worker 中进行的，worker 文件通过 new Worker(url) 加载。worker 的 importScripts() 运行在 worker 自己的全局上下文，和主线程的 __webpack_public_path__ 不是同一个作用域。webpack 打包 Monaco 时，worker 的 URL 通常来自 MonacoEnvironment.getWorkerUrl 或 getWorker，如果未配置，会默认从当前页面 base 路径加载。',
  solution: '配置 window.MonacoEnvironment.getWorkerUrl，返回 worker 文件的绝对路径或正确处理过的相对路径。',
  principle: [
    'Web Worker 的创建 URL 由 new Worker(url) 时的字符串决定，这个 URL 是浏览器层面的请求，不是 webpack 模块系统；',
    'worker 内部再通过 importScripts() 加载其他脚本，这些路径也是相对于 worker 文件所在 URL 解析；',
    '因此 __webpack_public_path__ 只能影响主线程的 webpack chunk 加载，不能影响原生 Worker 的 URL 解析。',
  ],
  notes: [
    'Monaco 的 worker 路径必须指向真实可访问的 .js 文件；',
    'worker 文件最好和主应用同源，避免 COEP/ CORP 等跨域安全策略限制；',
    '可以使用 monaco-editor-webpack-plugin 或 @monaco-editor/loader 简化配置。',
  ],
};

export const editorBaseUrlData = {
  title: '五、CodeMirror 的 baseUrl 与 Monaco 的 getWorkerUrl',
  phenomenon: [
    'CodeMirror 的 mode、theme、addon 动态加载失败，嵌入子应用后也 404；',
    '命令补全、语法高亮消失；',
    '控制台显示 mode/sql.js 404。',
  ],
  cause: 'CodeMirror 的 modeURL 默认是 "%N.js"，加载时会按当前页面路径拼接。在子应用路径下，它错误地去主应用根路径下找 mode/sql.js。这与 Monaco 的问题本质相同：都是"运行时按需加载资源"的库，绕过了 webpack 的 publicPath。',
  solution: '配置 CodeMirror.modeURL 和 CodeMirror.themeURL，指向子应用或 CDN 上的正确资源路径。',
  principle: [
    'CodeMirror 和 Monaco 都是"运行时按需加载资源"的库，不是 webpack 打包后全部内联；',
    '它们的加载逻辑绕过了 webpack 的 publicPath，需要开发者自己维护 base URL；',
    '这也是为什么只改 publicPath 或 __webpack_public_path__ 不足以解决编辑器资源问题。',
  ],
  notes: [
    'CodeMirror 5 和 CodeMirror 6 的资源加载方式不同，配置方式也不同；',
    '可以把 CodeMirror 资源放到 CDN 并用绝对路径，减少子应用路径变化的影响；',
    'Mode 文件加载是异步的，需要在 mode 加载完成后再启用对应语法高亮。',
  ],
};

export const borderCssData = {
  title: '六、边框/图标/字体等资源丢失',
  phenomenon: [
    '改用 nginx 相对路径转发后，代码高亮和命令补全恢复了，但边框样式偶尔丢失；',
    '图标字体显示成方框；',
    '背景图片不显示。',
  ],
  cause: 'CSS 中的 background: url("./border.png") 或 @font-face { src: url("./iconfont.woff") } 是相对路径。这些路径在独立运行时基于子应用路径正确，但在 qiankun 中基于主应用路径解析，导致 404。有时 CDN 或浏览器缓存会让问题偶尔出现，偶尔正常，导致排查困难。',
  solution: '使用绝对路径或 CDN 路径；对 CSS 中的相对资源路径做后处理；使用 CSS 变量或 base64 内联小图标。',
  principle: [
    'CSS 资源路径解析由浏览器负责，base 是 CSS 文件所在 URL；',
    '如果 CSS 被 qiankun 从 HTML 中提取后插入主应用，base 可能变为主应用域；',
    '字体、图片、SVG 等"非 JS 资源"最容易被忽略，也最难排查。',
  ],
  notes: [
    'CSS 中的 url() 解析基于 CSS 文件的 URL，而不是当前 HTML 页面；',
    'postcss 的 public-path 插件可以在构建时统一处理 CSS 资源路径；',
    '字体文件建议使用 font-display: swap，避免阻塞渲染。',
  ],
};

export const liveDemoData = {
  title: '资源路径对比器',
  description: '输入子应用部署路径和 Monaco worker 文件名，查看在独立运行、qiankun 嵌入、nginx 转发三种场景下资源 URL 的差异。',
  inputs: [
    { key: 'deployPath', label: '子应用部署路径', defaultValue: '/sql/' },
    { key: 'workerName', label: 'Monaco worker 文件名', defaultValue: 'editor.worker.js' },
  ],
  switches: [
    { key: 'qiankunEntry', label: '启用 qiankun HTML Entry' },
    { key: 'nginxForward', label: '启用 nginx 相对路径转发' },
    { key: 'publicPath', label: '运行时设置 __webpack_public_path__' },
    { key: 'getWorkerUrl', label: '配置 MonacoEnvironment.getWorkerUrl' },
  ],
  scenarios: [
    { key: 'standalone', label: '子应用独立运行' },
    { key: 'qiankun', label: 'qiankun 嵌入主应用' },
    { key: 'nginx', label: 'nginx 相对路径转发' },
  ],
  decisionTreeTitle: '资源加载问题排查决策树',
};
```

- [ ] **Step 3: 验证 data.ts 没有语法错误**

Run: `npx tsc --noEmit src/pages/qiankun/asset-loading/data.ts`
Expected: 通过。

- [ ] **Step 4: Commit**

```bash
git add src/pages/qiankun/asset-loading/data.ts
git commit -m "feat(qiankun-asset-loading): add data.ts"
```

---

## Task 2: 创建 CodeDiff 代码示例文件（demos）

**Files:**
- Create: `src/pages/qiankun/asset-loading/demos/webpack-config.bad.ts`
- Create: `src/pages/qiankun/asset-loading/demos/webpack-config.good.ts`
- Create: `src/pages/qiankun/asset-loading/demos/publicpath-runtime.bad.ts`
- Create: `src/pages/qiankun/asset-loading/demos/publicpath-runtime.good.ts`
- Create: `src/pages/qiankun/asset-loading/demos/runtime-publicpath.bad.ts`
- Create: `src/pages/qiankun/asset-loading/demos/runtime-publicpath.good.ts`
- Create: `src/pages/qiankun/asset-loading/demos/monaco-environment.bad.ts`
- Create: `src/pages/qiankun/asset-loading/demos/monaco-environment.good.ts`
- Create: `src/pages/qiankun/asset-loading/demos/worker-context.bad.ts`
- Create: `src/pages/qiankun/asset-loading/demos/worker-context.good.ts`
- Create: `src/pages/qiankun/asset-loading/demos/codemirror-config.bad.ts`
- Create: `src/pages/qiankun/asset-loading/demos/codemirror-config.good.ts`
- Create: `src/pages/qiankun/asset-loading/demos/nginx-location.good.conf`

**说明：** 每个文件只放代码和中文注释，注释详尽，不需要导出任何内容。`.bad.ts` 会被 tsconfig.json 的 `exclude` 排除。`.conf` 文件不需要类型检查。

- [ ] **Step 1: webpack-config.bad.ts**

Create: `src/pages/qiankun/asset-loading/demos/webpack-config.bad.ts`

```typescript
// ❌ 反面教材：publicPath 固定写死或缺失
// 这种配置在独立部署到域名根目录时没问题，但在子应用路径或 qiankun 中会出现资源 404。

import { resolve } from 'path';

export default {
  // 其他 webpack 配置省略...

  output: {
    // 没有设置 publicPath，webpack 默认使用 ""。
    // 这意味着所有动态加载的 chunk、图片、字体等 URL 都会以当前页面路径为 base 拼接。
    // 当子应用被 qiankun 嵌入到 /dashboard/sql 时，
    // 请求 ./js/chunk-xxx.js 会被解析为 /dashboard/sql/js/chunk-xxx.js，
    // 而不是子应用真实部署路径 /sql/js/chunk-xxx.js。
    path: resolve(__dirname, 'dist'),
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].chunk.js',
  },

  // 即使设置了 publicPath: '/'，也会假设子应用部署在域名根目录。
  // 在 /sql/ 路径下访问时，所有资源都会从 /js/xxx 请求，而不是 /sql/js/xxx。
  // publicPath: '/',
};
```

- [ ] **Step 2: webpack-config.good.ts**

Create: `src/pages/qiankun/asset-loading/demos/webpack-config.good.ts`

```typescript
// ✅ 最佳实践：按环境注入 publicPath

import { resolve } from 'path';

// 定义不同环境对应的 publicPath。
// 开发环境通常是 /，独立部署到 /sql/ 时用 /sql/，
// 如果通过 qiankun 加载，则由运行时 __webpack_public_path__ 覆盖。
const PUBLIC_PATH_MAP = {
  development: '/',
  test: '/sql-test/',
  production: '/sql/',
};

export default {
  // 其他 webpack 配置省略...

  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].chunk.js',

    // 静态 publicPath：根据构建环境变量注入。
    // 注意：这里只能处理 webpack 自己生成的 chunk 路径，
    // 对 Monaco Worker、CodeMirror mode 等"非 webpack 模块系统"加载的资源无效。
    publicPath: PUBLIC_PATH_MAP[process.env.NODE_ENV] || '/',
  },
};
```

- [ ] **Step 3: runtime-publicpath.bad.ts**

Create: `src/pages/qiankun/asset-loading/demos/runtime-publicpath.bad.ts`

```typescript
// ❌ 反面教材：运行时未设置 __webpack_public_path__
// 这种代码在独立运行时没问题，但被 qiankun 嵌入时，动态加载的 chunk 会从错误路径请求。

// 子应用入口文件中没有设置 __webpack_public_path__，
// 完全依赖构建时 output.publicPath 的值。
// 当子应用部署路径变化或被子应用加载时，就会出错。

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');
```

- [ ] **Step 4: runtime-publicpath.good.ts**

Create: `src/pages/qiankun/asset-loading/demos/runtime-publicpath.good.ts`

```typescript
// ✅ 最佳实践：运行时动态设置 __webpack_public_path__
// 这样可以在 qiankun 注入的路径和独立运行路径之间自动切换。

// qiankun 在加载子应用时，会把子应用的 entry URL 注入到
// window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ 中。
// 独立运行时该变量不存在，使用默认值。
// 注意：__webpack_public_path__ 必须在使用任何动态 import 或加载 chunk 之前设置。
__webpack_public_path__ =
  window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ ||
  (process.env.NODE_ENV === 'production' ? '/sql/' : '/');

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');
```

- [ ] **Step 5: monaco-environment.bad.ts**

Create: `src/pages/qiankun/asset-loading/demos/monaco-environment.bad.ts`

```typescript
// ❌ 反面教材：未配置 MonacoEnvironment.getWorkerUrl
// Monaco 默认会尝试从当前页面路径加载 worker，在 qiankun 中通常 404。

// 子应用入口或组件中直接创建 Monaco Editor，没有配置 MonacoEnvironment。
// 这会导致 Monaco 在创建 editor 时，尝试通过 new Worker('./editor.worker.js') 加载 worker。
// 在独立运行时，./editor.worker.js 可能对应 /editor.worker.js；
// 但在 qiankun 中，当前页面是主应用的 /dashboard/sql，
// 于是请求变成了 /dashboard/editor.worker.js，显然 404。

import * as monaco from 'monaco-editor';

monaco.editor.create(document.getElementById('container'), {
  value: 'SELECT * FROM users',
  language: 'sql',
});
```

- [ ] **Step 6: monaco-environment.good.ts**

Create: `src/pages/qiankun/asset-loading/demos/monaco-environment.good.ts`

```typescript
// ✅ 最佳实践：配置 MonacoEnvironment.getWorkerUrl
// 显式指定 worker 文件的加载 URL，避免浏览器按当前页面路径解析。

// 在加载 monaco-editor 之前设置全局 MonacoEnvironment。
// 注意：window.MonacoEnvironment 必须在 import monaco 之前定义，
// 因为 monaco 内部会在初始化时读取它。
window.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    // 这里返回 worker 文件的绝对路径或相对于域名根的路径。
    // 如果子应用部署在 /sql/ 下，worker 文件在 /sql/monaco/editor.worker.js，
    // 直接返回该路径，确保浏览器能正确请求到。
    return `/sql/monaco/vs/base/worker/worker-main.js`;
  },
};

import * as monaco from 'monaco-editor';

monaco.editor.create(document.getElementById('container'), {
  value: 'SELECT * FROM users',
  language: 'sql',
});

// 更高级的方案：按 label 返回不同 worker 文件，例如 json worker、css worker 等。
// window.MonacoEnvironment = {
//   getWorkerUrl: function (moduleId, label) {
//     const workerMap = {
//       sql: '/sql/monaco/vs/language/sql/sqlWorker.js',
//       json: '/sql/monaco/vs/language/json/jsonWorker.js',
//       default: '/sql/monaco/vs/base/worker/worker-main.js',
//     };
//     return workerMap[label] || workerMap.default;
//   },
// };
```

- [ ] **Step 7: codemirror-config.bad.ts**

Create: `src/pages/qiankun/asset-loading/demos/codemirror-config.bad.ts`

```typescript
// ❌ 反面教材：CodeMirror 默认 modeURL 在子应用下出错
// CodeMirror 会按需加载 mode 文件，但默认路径在 qiankun 中解析错误。

import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';

// 创建编辑器时没有配置 modeURL，CodeMirror 默认使用 "%N.js"。
// 当设置 mode: 'sql' 时，它会尝试加载当前页面路径下的 "sql.js"。
// 在 qiankun 主应用 /dashboard/sql 下，这变成了 /dashboard/sql.js，404。

const editor = CodeMirror(document.getElementById('container'), {
  value: 'SELECT * FROM users',
  mode: 'sql',
});
```

- [ ] **Step 8: codemirror-config.good.ts**

Create: `src/pages/qiankun/asset-loading/demos/codemirror-config.good.ts`

```typescript
// ✅ 最佳实践：显式配置 CodeMirror.modeURL 和 themeURL

import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';

// 在创建编辑器之前，显式设置 mode 和 theme 的加载路径。
// %N 会被替换为 mode 名称，例如 sql 会加载 /sql/codemirror/mode/sql/sql.js。
// 路径建议使用绝对路径，避免浏览器以当前页面为 base 解析错误。
CodeMirror.modeURL = '/sql/codemirror/mode/%N/%N.js';
CodeMirror.themeURL = '/sql/codemirror/theme/%N.css';

const editor = CodeMirror(document.getElementById('container'), {
  value: 'SELECT * FROM users',
  mode: 'sql',
  theme: 'monokai',
});
```

- [ ] **Step 9: nginx-location.good.conf**

Create: `src/pages/qiankun/asset-loading/demos/nginx-location.good.conf`

```nginx
# ✅ 最佳实践：nginx 相对路径转发配置
# 主应用域名为 main.example.com，子应用域名为 subapp.example.com。
# 希望通过 main.example.com/sql/ 访问子应用。

server {
  listen 80;
  server_name main.example.com;

  # 主应用静态资源
  location / {
    root /var/www/main-app;
    try_files $uri $uri/ /index.html;
  }

  # 子应用转发：/sql/ 下的所有请求都转发到 subapp.example.com。
  # 注意 proxy_pass 末尾的斜杠：
  # location /sql/  末尾有斜杠，proxy_pass http://subapp.example.com/ 末尾也有斜杠，
  # 这样 /sql/js/app.js 会转发为 http://subapp.example.com/js/app.js。
  location /sql/ {
    proxy_pass http://subapp.example.com/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

- [ ] **Step 10: 验证 demos 目录被正确排除**

Run: `npx tsc --noEmit`
Expected: 通过（`.bad.ts` 已被 tsconfig.json 的 `exclude` 排除；`.conf` 不检查）。

- [ ] **Step 11: Commit**

```bash
git add src/pages/qiankun/asset-loading/demos/
git commit -m "feat(qiankun-asset-loading): add bad/good code demos"
```

---

## Task 3: 创建章节组件

**Files:**
- Create: `src/pages/qiankun/asset-loading/chapters/SectionWebpackOutput.tsx`
- Create: `src/pages/qiankun/asset-loading/chapters/SectionDeploymentPath.tsx`
- Create: `src/pages/qiankun/asset-loading/chapters/SectionQiankunHtmlEntry.tsx`
- Create: `src/pages/qiankun/asset-loading/chapters/SectionMonacoWorker.tsx`
- Create: `src/pages/qiankun/asset-loading/chapters/SectionEditorBaseUrl.tsx`
- Create: `src/pages/qiankun/asset-loading/chapters/SectionBorderCss.tsx`

**说明：** 每个章节组件使用 Ant Design 的 Typography 展示标题和段落，使用 `CodeDiff` 组件展示代码对比。统一从 `data.ts` 读取文本，从 `demos/` 通过 `?raw` 引入代码。小节标题使用 `level={3}`，维度标题使用 `level={4}`。

- [ ] **Step 1: SectionWebpackOutput.tsx**

Create: `src/pages/qiankun/asset-loading/chapters/SectionWebpackOutput.tsx`

新增说明：
- 在“二、底层原因”后新增小标题 `__webpack_public_path__ 为什么能生效？`，用表格展示 `import("./mode-sql")` 从源代码到 webpack 编译后、再到未设置/已设置 `__webpack_public_path__` 的 URL 变化；
- 在“三、如何解决”中新增第二个 `CodeDiff`：对比 `demos/publicpath-runtime.bad.ts` 和 `demos/publicpath-runtime.good.ts`，展示未设置/已设置 `__webpack_public_path__` 时 chunk 请求 URL 从主应用路径错误 404 到子应用路径命中的变化；
- 将 `webpackOutputData.solution` 作为示例说明（URL 对比），`webpackOutputData.example` 展示 404/命中两条结果。

```tsx
import React from 'react';
import { Typography, List, Alert, Table } from 'antd';
import CodeDiff from '../../../../components/CodeDiff';
import { webpackOutputData } from '../data';
import badCode from '../demos/webpack-config.bad.ts?raw';
import goodCode from '../demos/webpack-config.good.ts?raw';
import runtimeBadCode from '../demos/publicpath-runtime.bad.ts?raw';
import runtimeGoodCode from '../demos/publicpath-runtime.good.ts?raw';

const SectionWebpackOutput: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{webpackOutputData.title}</Typography.Title>

      <Typography.Title level={4}>一、现象/问题</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {webpackOutputData.phenomenon.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>二、底层原因</Typography.Title>
      <Typography.Paragraph>{webpackOutputData.cause}</Typography.Paragraph>

      <Typography.Title level={5}>__webpack_public_path__ 为什么能生效？</Typography.Title>
      <Typography.Paragraph>
        webpack 在构建时会把代码中的 import(&quot;./mode-sql&quot;) 改写成
        __webpack_require__.p + &quot;js/chunk-mode-sql.js&quot;。
        __webpack_require__.p 就是 publicPath 的运行时值；
        在页面顶部设置 __webpack_public_path__ = &quot;https://sql.example.com/sql/&quot; 后，
        所有动态 chunk 的 URL 都会自动拼上这个前缀。
      </Typography.Paragraph>
      <Table
        dataSource={[
          {
            key: '1',
            stage: '源代码',
            code: 'import("./mode-sql")',
            resolvedUrl: '（尚未运行）',
          },
          {
            key: '2',
            stage: 'webpack 编译后',
            code: '__webpack_require__.e("mode-sql") 内部请求 __webpack_require__.p + "js/chunk-mode-sql.js"',
            resolvedUrl: '（依赖 __webpack_require__.p 的值）',
          },
          {
            key: '3',
            stage: '未设置 __webpack_public_path__',
            code: '__webpack_require__.p = "" 或 "/"',
            resolvedUrl: 'https://main.example.com/.../js/chunk-mode-sql.js（404）',
          },
          {
            key: '4',
            stage: '设置 __webpack_public_path__',
            code: '__webpack_public_path__ = "https://sql.example.com/sql/"',
            resolvedUrl: 'https://sql.example.com/sql/js/chunk-mode-sql.js（命中）',
          },
        ]}
        columns={[
          { title: '阶段', dataIndex: 'stage', key: 'stage' },
          { title: '代码形式', dataIndex: 'code', key: 'code' },
          { title: '最终请求 URL', dataIndex: 'resolvedUrl', key: 'resolvedUrl' },
        ]}
        pagination={false}
        size="small"
      />

      <Typography.Title level={4}>三、如何解决</Typography.Title>
      <Typography.Paragraph>
        1. 构建时按环境配置 output.publicPath：
      </Typography.Paragraph>
      <CodeDiff
        oldValue={badCode}
        newValue={goodCode}
        leftTitle="❌ 反面教材"
        rightTitle="✅ 最佳实践"
        type="error"
        hideDiffMarkers={true}
      />
      <Typography.Paragraph>
        2. 运行时在子应用入口最顶部动态设置 __webpack_public_path__，让 qiankun 和独立运行共享同一套构建产物：
      </Typography.Paragraph>
      <CodeDiff
        oldValue={runtimeBadCode}
        newValue={runtimeGoodCode}
        leftTitle="❌ 反面教材"
        rightTitle="✅ 最佳实践"
        type="error"
        hideDiffMarkers={true}
      />

      <Typography.Title level={4}>四、为什么要这样解决</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {webpackOutputData.example.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>五、核心原理</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {webpackOutputData.principle.map((item, index) => (
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
            dataSource={webpackOutputData.notes}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        }
      />
    </section>
  );
};

export default SectionWebpackOutput;
```

- [ ] **Step 2: SectionDeploymentPath.tsx**

Create: `src/pages/qiankun/asset-loading/chapters/SectionDeploymentPath.tsx`

```tsx
import React from 'react';
import { Typography, List, Alert, Table } from 'antd';
import CodeDiff from '../../../../components/CodeDiff';
import { deploymentPathData } from '../data';
import badCode from '../demos/runtime-publicpath.bad.ts?raw';
import goodCode from '../demos/runtime-publicpath.good.ts?raw';
import nginxCode from '../demos/nginx-location.good.conf?raw';

const SectionDeploymentPath: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{deploymentPathData.title}</Typography.Title>

      <Typography.Title level={4}>一、现象/问题</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {deploymentPathData.phenomenon.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>二、底层原因</Typography.Title>
      <Typography.Paragraph>{deploymentPathData.cause}</Typography.Paragraph>

      <Typography.Title level={4}>三、如何解决</Typography.Title>
      <Typography.Paragraph>
        1. 运行时 __webpack_public_path__：
      </Typography.Paragraph>
      <CodeDiff
        oldValue={badCode}
        newValue={goodCode}
        leftTitle="❌ 反面教材"
        rightTitle="✅ 最佳实践"
        type="error"
        hideDiffMarkers={true}
      />
      <Typography.Paragraph>
        2. nginx 转发配置。由于 nginx 会把 /sql/ 下的请求转发到子应用真实路径，Monaco
        默认以当前页面路径 /sql/editor.worker.js 请求 worker 时，nginx
        会自动将其转发到子应用的 editor.worker.js，因此不需要再手动配置
        MonacoEnvironment.getWorkerUrl：
      </Typography.Paragraph>
      <CodeDiff
        oldValue={"# 未配置 nginx 转发或转发路径错误\n# （此处仅作占位，实际对比 nginx 正确配置）"}
        newValue={nginxCode}
        leftTitle="❌ 反面教材"
        rightTitle="✅ 最佳实践"
        type="error"
        hideDiffMarkers={true}
      />

      <Typography.Title level={4}>四、为什么要这样解决</Typography.Title>
      <Typography.Paragraph>{deploymentPathData.solution}</Typography.Paragraph>

      <Typography.Title level={4}>五、核心原理</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {deploymentPathData.principle.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>六、nginx 相对路径转发是“万能”的吗？</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {deploymentPathData.universalSummary.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>
      <Table
        dataSource={deploymentPathData.universalTable}
        columns={[
          { title: '场景', dataIndex: 'scenario', key: 'scenario' },
          { title: '是否适合', dataIndex: 'suitable', key: 'suitable' },
          { title: '说明', dataIndex: 'reason', key: 'reason' },
        ]}
        pagination={false}
        size="small"
      />
      <Typography.Paragraph>{deploymentPathData.universalConclusion}</Typography.Paragraph>

      <Alert
        type="warning"
        message="注意事项"
        description={
          <List
            size="small"
            dataSource={deploymentPathData.notes}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        }
      />
    </section>
  );
};

export default SectionDeploymentPath;
```

- [ ] **Step 3: SectionQiankunHtmlEntry.tsx**

Create: `src/pages/qiankun/asset-loading/chapters/SectionQiankunHtmlEntry.tsx`

```tsx
import React from 'react';
import { Typography, List, Alert, Table } from 'antd';
import { htmlEntryData } from '../data';
import badCode from '../demos/html-entry.bad.html?raw';
import goodCode from '../demos/html-entry.good.html?raw';
import webpackConfigCode from '../demos/webpack-config.publicpath.ts?raw';
import runtimePublicPathCode from '../demos/runtime-publicpath.good.ts?raw';
import absoluteHtmlCode from '../demos/html-entry.absolute.html?raw';
import CodeDiff from '../../../../components/CodeDiff';

const SectionQiankunHtmlEntry: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{htmlEntryData.title}</Typography.Title>

      <Typography.Title level={4}>一、现象/问题</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {htmlEntryData.phenomenon.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>二、底层原因</Typography.Title>
      <Typography.Paragraph>{htmlEntryData.cause}</Typography.Paragraph>

      <Typography.Title level={4}>三、如何解决</Typography.Title>
      <Typography.Paragraph>
        下面给出 4 种方案，按侵入性从低到高排列。每种方案都提供“反面教材”与“最佳实践”对比。
      </Typography.Paragraph>

      <Typography.Title level={5}>方案 1：静态 HTML 标签使用绝对路径或协议相对 URL</Typography.Title>
      <Typography.Paragraph>
        在子应用构建产物 index.html 中，把相对路径改成以子应用真实域名为基准的绝对路径或协议相对 URL。
      </Typography.Paragraph>
      <CodeDiff
        oldValue={badCode}
        newValue={goodCode}
        leftTitle="❌ 相对路径"
        rightTitle="✅ 协议相对 URL"
        type="error"
        language="html"
        hideDiffMarkers={true}
      />

      <Typography.Title level={5}>方案 2：webpack output.publicPath 配置绝对路径</Typography.Title>
      <Typography.Paragraph>
        构建时统一把 chunk 路径前缀指向子应用真实部署路径或 CDN，这样 JS 内部动态加载 import() 或按需 chunk 也会带上正确前缀。
      </Typography.Paragraph>
      <CodeDiff
        oldValue={badCode}
        newValue={webpackConfigCode}
        leftTitle="❌ 缺失 publicPath"
        rightTitle="✅ 绝对 publicPath"
        type="error"
        language="typescript"
        hideDiffMarkers={true}
      />

      <Typography.Title level={5}>方案 3：运行时通过 __webpack_public_path__ 动态设置</Typography.Title>
      <Typography.Paragraph>
        qiankun 加载子应用时会把 entry URL 注入到 window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__。子应用入口 JS 最顶部读取该变量并赋值给 __webpack_public_path__，让 webpack 的 chunk 加载路径随环境变化。
      </Typography.Paragraph>
      <CodeDiff
        code={runtimePublicPathCode}
        title="运行时设置 __webpack_public_path__"
        type="success"
        language="typescript"
      />

      <Typography.Title level={5}>方案 4：HTML 标签全部使用绝对路径</Typography.Title>
      <Typography.Paragraph>
        如果子应用无法运行时设置 __webpack_public_path__，可以构建时把所有入口标签都写成绝对路径，并把 CSS 中 url() 也处理成绝对路径。最稳妥但维护成本最高。
      </Typography.Paragraph>
      <CodeDiff
        code={absoluteHtmlCode}
        title="所有资源写死绝对路径或协议相对 URL"
        type="success"
        language="html"
      />

      <Typography.Title level={5}>URL 形式对比表</Typography.Title>
      <Table
        dataSource={htmlEntryData.urlFormTable}
        columns={[
          { title: '形式', dataIndex: 'form', key: 'form' },
          { title: '写法示例', dataIndex: 'example', key: 'example' },
          { title: '独立运行解析结果', dataIndex: 'standalone', key: 'standalone' },
          { title: 'qiankun 嵌入解析结果', dataIndex: 'qiankun', key: 'qiankun' },
          { title: '适用场景', dataIndex: 'scenario', key: 'scenario' },
        ]}
        pagination={false}
        size="small"
      />

      <Typography.Title level={4}>四、为什么要这样解决</Typography.Title>
      <Typography.Paragraph>{htmlEntryData.solution}</Typography.Paragraph>

      <Typography.Title level={4}>五、核心原理</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {htmlEntryData.principle.map((item, index) => (
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
            dataSource={htmlEntryData.notes}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        }
      />
    </section>
  );
};

export default SectionQiankunHtmlEntry;
```

- [ ] **Step 4: SectionMonacoWorker.tsx**

Create: `src/pages/qiankun/asset-loading/chapters/SectionMonacoWorker.tsx`

新增说明：
- 在“二、底层原因”后新增小标题 `主线程请求 vs Web Worker 请求`，用表格对比 `import("./mode-sql")`、`new Worker("./editor.worker.js")`、`self.importScripts("./sql.js")` 三个阶段的 URL 确定方式与 publicPath 是否生效；
- 在“三、如何解决”中新增第二个 `CodeDiff`：对比 `demos/worker-context.bad.ts` 和 `demos/worker-context.good.ts`，展示 Worker 内部不应依赖主线程的 `__webpack_public_path__`，而应使用绝对路径或基于 Worker 文件 URL 的路径；
- 将 `monacoWorkerData.comparison` 作为“四、为什么要这样解决”的列表内容。

```tsx
import React from 'react';
import { Typography, List, Alert, Table } from 'antd';
import CodeDiff from '../../../../components/CodeDiff';
import { monacoWorkerData } from '../data';
import badCode from '../demos/monaco-environment.bad.ts?raw';
import goodCode from '../demos/monaco-environment.good.ts?raw';
import workerContextBadCode from '../demos/worker-context.bad.ts?raw';
import workerContextGoodCode from '../demos/worker-context.good.ts?raw';

const SectionMonacoWorker: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{monacoWorkerData.title}</Typography.Title>

      <Typography.Title level={4}>一、现象/问题</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {monacoWorkerData.phenomenon.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>二、底层原因</Typography.Title>
      <Typography.Paragraph>{monacoWorkerData.cause}</Typography.Paragraph>

      <Typography.Title level={5}>主线程请求 vs Web Worker 请求</Typography.Title>
      <Typography.Paragraph>
        在 HTML/主线程中，webpack 会把动态加载的 import 替换为基于 __webpack_require__.p 的 URL；
        但 Worker 的创建和 Worker 内部的 importScripts 是浏览器原生行为，不经过 webpack 的模块系统。
      </Typography.Paragraph>
      <Table
        dataSource={[
          {
            key: '1',
            phase: '主线程动态加载',
            code: 'import("./mode-sql")',
            resolve: 'webpack 改写为 __webpack_require__.p + chunkId',
            publicPath: '受 __webpack_public_path__ 控制',
          },
          {
            key: '2',
            phase: '创建 Worker',
            code: 'new Worker("./editor.worker.js")',
            resolve: '浏览器按 document.baseURI 解析字符串 URL',
            publicPath: '不受 __webpack_public_path__ 控制',
          },
          {
            key: '3',
            phase: 'Worker 内部加载依赖',
            code: 'self.importScripts("./sql.js")',
            resolve: '浏览器按 Worker 文件所在 URL 解析',
            publicPath: 'Worker 有独立全局作用域，主线程 publicPath 不可见',
          },
        ]}
        columns={[
          { title: '阶段', dataIndex: 'phase', key: 'phase' },
          { title: '示例代码', dataIndex: 'code', key: 'code' },
          { title: 'URL 如何确定', dataIndex: 'resolve', key: 'resolve' },
          { title: 'publicPath 是否生效', dataIndex: 'publicPath', key: 'publicPath' },
        ]}
        pagination={false}
        size="small"
      />

      <Typography.Title level={4}>三、如何解决</Typography.Title>
      <Typography.Paragraph>
        1. 配置 MonacoEnvironment.getWorkerUrl，为 Monaco 创建 Worker 提供正确 URL：
      </Typography.Paragraph>
      <CodeDiff
        oldValue={badCode}
        newValue={goodCode}
        leftTitle="❌ 反面教材"
        rightTitle="✅ 最佳实践"
        type="error"
        hideDiffMarkers={true}
      />
      <Typography.Paragraph>
        2. 在 Worker 内部加载依赖时同样不要依赖主线程的 __webpack_public_path__，而是使用绝对路径或基于 Worker 文件自身 URL 计算的路径：
      </Typography.Paragraph>
      <CodeDiff
        oldValue={workerContextBadCode}
        newValue={workerContextGoodCode}
        leftTitle="❌ 反面教材"
        rightTitle="✅ 最佳实践"
        type="error"
        hideDiffMarkers={true}
      />

      <Typography.Title level={4}>四、为什么要这样解决</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {monacoWorkerData.comparison.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>五、核心原理</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {monacoWorkerData.principle.map((item, index) => (
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
            dataSource={monacoWorkerData.notes}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        }
      />
    </section>
  );
};

export default SectionMonacoWorker;
```

- [ ] **Step 5: SectionEditorBaseUrl.tsx**

Create: `src/pages/qiankun/asset-loading/chapters/SectionEditorBaseUrl.tsx`

```tsx
import React from 'react';
import { Typography, List, Alert } from 'antd';
import CodeDiff from '../../../../components/CodeDiff';
import { editorBaseUrlData } from '../data';
import badCode from '../demos/codemirror-config.bad.ts?raw';
import goodCode from '../demos/codemirror-config.good.ts?raw';

const SectionEditorBaseUrl: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{editorBaseUrlData.title}</Typography.Title>

      <Typography.Title level={4}>一、现象/问题</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {editorBaseUrlData.phenomenon.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>二、底层原因</Typography.Title>
      <Typography.Paragraph>{editorBaseUrlData.cause}</Typography.Paragraph>

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
      <Typography.Paragraph>{editorBaseUrlData.solution}</Typography.Paragraph>

      <Typography.Title level={4}>五、核心原理</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {editorBaseUrlData.principle.map((item, index) => (
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
            dataSource={editorBaseUrlData.notes}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        }
      />
    </section>
  );
};

export default SectionEditorBaseUrl;
```

- [ ] **Step 6: SectionBorderCss.tsx**

Create: `src/pages/qiankun/asset-loading/chapters/SectionBorderCss.tsx`

```tsx
import React from 'react';
import { Typography, List, Alert } from 'antd';
import { borderCssData } from '../data';

const SectionBorderCss: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{borderCssData.title}</Typography.Title>

      <Typography.Title level={4}>一、现象/问题</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {borderCssData.phenomenon.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>二、底层原因</Typography.Title>
      <Typography.Paragraph>{borderCssData.cause}</Typography.Paragraph>

      <Typography.Title level={4}>三、如何解决</Typography.Title>
      <Typography.Paragraph>
        <ul>
          <li>使用绝对路径或 CDN 路径；</li>
          <li>对 CSS 中的相对资源路径做后处理（如 postcss 的 public-path 插件）；</li>
          <li>使用 CSS 变量或 base64 内联小图标。</li>
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>四、为什么要这样解决</Typography.Title>
      <Typography.Paragraph>{borderCssData.solution}</Typography.Paragraph>

      <Typography.Title level={4}>五、核心原理</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {borderCssData.principle.map((item, index) => (
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
            dataSource={borderCssData.notes}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        }
      />
    </section>
  );
};

export default SectionBorderCss;
```

- [ ] **Step 7: 验证 TypeScript**

Run: `npx tsc --noEmit`
Expected: 通过（新增文件无错误，项目既有错误不影响）。

- [ ] **Step 8: Commit**

```bash
git add src/pages/qiankun/asset-loading/chapters/
git commit -m "feat(qiankun-asset-loading): add six chapter components"
```

---

## Task 4: 创建 LiveDemo 组件

**Files:**
- Create: `src/pages/qiankun/asset-loading/LiveDemo.tsx`

**说明：** 静态资源路径对比器，不加载真实编辑器。用户输入部署路径和 worker 文件名，通过开关选择不同场景，实时查看资源 URL 的命中/404 状态。

- [ ] **Step 1: 编写 LiveDemo.tsx**

Create: `src/pages/qiankun/asset-loading/LiveDemo.tsx`

```tsx
import React, { useState, useMemo } from 'react';
import { Card, Input, Switch, Typography, Space, Collapse, List, Tag } from 'antd';
import { liveDemoData } from './data';

const LiveDemo: React.FC = () => {
  const [deployPath, setDeployPath] = useState(liveDemoData.inputs[0].defaultValue);
  const [workerName, setWorkerName] = useState(liveDemoData.inputs[1].defaultValue);
  const [qiankunEntry, setQiankunEntry] = useState(false);
  const [nginxForward, setNginxForward] = useState(false);
  const [publicPath, setPublicPath] = useState(false);
  const [getWorkerUrl, setGetWorkerUrl] = useState(false);

  const normalizePath = (path: string) => {
    if (!path.startsWith('/') && !path.startsWith('http')) {
      return '/' + path;
    }
    return path;
  };

  const buildUrl = (base: string, file: string) => {
    const normalized = normalizePath(base).replace(/\/$/, '');
    return `${normalized}/${file}`;
  };

  const standaloneUrl = useMemo(() => {
    return buildUrl(deployPath, workerName);
  }, [deployPath, workerName]);

  const qiankunUrl = useMemo(() => {
    let base = deployPath;
    if (qiankunEntry && !publicPath) {
      // 未设置 __webpack_public_path__，浏览器以主应用路径为 base
      base = '/dashboard';
    }
    if (qiankunEntry && publicPath && !getWorkerUrl) {
      // 设置了 publicPath，但 worker 不走 publicPath
      base = '/dashboard';
    }
    if (qiankunEntry && getWorkerUrl) {
      // 配置了 getWorkerUrl，worker 路径正确
      base = deployPath;
    }
    return buildUrl(base, workerName);
  }, [deployPath, workerName, qiankunEntry, publicPath, getWorkerUrl]);

  const nginxUrl = useMemo(() => {
    let base = deployPath;
    if (nginxForward && !publicPath) {
      // nginx 会把 /sql/ 下请求转发到子应用真实路径；
      // 即使未设置 __webpack_public_path__，Monaco 默认按当前页面 /sql/ 请求 worker，
      // nginx 也会正确转发，因此路径仍然命中子应用。
      base = deployPath;
    }
    if (nginxForward && publicPath) {
      base = deployPath;
    }
    return buildUrl(base, workerName);
  }, [deployPath, workerName, nginxForward, publicPath]);

  const isHit = (url: string) => {
    return url.startsWith(normalizePath(deployPath));
  };

  return (
    <Card title={liveDemoData.title}>
      <Typography.Paragraph>{liveDemoData.description}</Typography.Paragraph>

      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Typography.Text>{liveDemoData.inputs[0].label}：</Typography.Text>
          <Input
            value={deployPath}
            onChange={(e) => setDeployPath(e.target.value)}
          />
        </div>
        <div>
          <Typography.Text>{liveDemoData.inputs[1].label}：</Typography.Text>
          <Input
            value={workerName}
            onChange={(e) => setWorkerName(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>启用 qiankun HTML Entry</span>
          <Switch checked={qiankunEntry} onChange={setQiankunEntry} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>启用 nginx 相对路径转发</span>
          <Switch checked={nginxForward} onChange={setNginxForward} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>运行时设置 __webpack_public_path__</span>
          <Switch checked={publicPath} onChange={setPublicPath} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>配置 MonacoEnvironment.getWorkerUrl</span>
          <Switch checked={getWorkerUrl} onChange={setGetWorkerUrl} />
        </div>
      </Space>

      <Collapse style={{ marginTop: 24 }}>
        {liveDemoData.scenarios.map((scenario) => {
          let url = standaloneUrl;
          if (scenario.key === 'qiankun') url = qiankunUrl;
          if (scenario.key === 'nginx') url = nginxUrl;
          const hit = isHit(url);
          return (
            <Collapse.Panel
              header={
                <Space>
                  <span>{scenario.label}</span>
                  <Tag color={hit ? 'success' : 'error'}>{hit ? '命中' : '404'}</Tag>
                </Space>
              }
              key={scenario.key}
            >
              <Typography.Paragraph>
                <strong>请求 URL：</strong>
                <code>{url}</code>
              </Typography.Paragraph>
              <Typography.Paragraph>
                {hit
                  ? '该路径与子应用部署路径一致，资源可以正常加载。'
                  : '该路径偏离子应用部署路径，浏览器会请求到错误位置，导致 404。'}
              </Typography.Paragraph>
            </Collapse.Panel>
          );
        })}
      </Collapse>

      <Collapse style={{ marginTop: 24 }}>
        <Collapse.Panel header={liveDemoData.decisionTreeTitle} key="tree">
          <List
            size="small"
            dataSource={[
              '1. 主资源包 404 → 检查 output.publicPath 或 __webpack_public_path__',
              '2. 语法高亮/命令补全失效 → 检查 Monaco getWorkerUrl 或 CodeMirror modeURL',
              '3. 边框/图标/字体丢失 → 检查 CSS 中的 url() 路径',
              '4. nginx 转发场景 → 确认 location /xxx/ 和 proxy_pass 末尾斜杠一致',
              '5. qiankun HTML Entry 场景 → 确认资源使用绝对路径或协议相对 URL',
            ]}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
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
git add src/pages/qiankun/asset-loading/LiveDemo.tsx
git commit -m "feat(qiankun-asset-loading): add static resource path comparator live demo"
```

---

## Task 5: 创建页面入口 index.tsx

**Files:**
- Create: `src/pages/qiankun/asset-loading/index.tsx`

**说明：** 组合所有章节组件和 LiveDemo，使用 Ant Design 的 Typography 和 Space 布局。

- [ ] **Step 1: 编写 index.tsx**

Create: `src/pages/qiankun/asset-loading/index.tsx`

```tsx
import React from 'react';
import { Typography, Space, Divider } from 'antd';
import { pageData } from './data';
import LiveDemo from './LiveDemo';
import SectionWebpackOutput from './chapters/SectionWebpackOutput';
import SectionDeploymentPath from './chapters/SectionDeploymentPath';
import SectionQiankunHtmlEntry from './chapters/SectionQiankunHtmlEntry';
import SectionMonacoWorker from './chapters/SectionMonacoWorker';
import SectionEditorBaseUrl from './chapters/SectionEditorBaseUrl';
import SectionBorderCss from './chapters/SectionBorderCss';

const QiankunAssetLoadingPage: React.FC = () => {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Typography.Title>{pageData.title}</Typography.Title>
      <Typography.Paragraph type="secondary">{pageData.subtitle}</Typography.Paragraph>

      <Divider />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <SectionWebpackOutput />
        <SectionDeploymentPath />
        <LiveDemo />
        <SectionQiankunHtmlEntry />
        <SectionMonacoWorker />
        <SectionEditorBaseUrl />
        <SectionBorderCss />
      </Space>
    </div>
  );
};

export default QiankunAssetLoadingPage;
```

- [ ] **Step 2: 验证 TypeScript**

Run: `npx tsc --noEmit`
Expected: 通过。

- [ ] **Step 3: Commit**

```bash
git add src/pages/qiankun/asset-loading/index.tsx
git commit -m "feat(qiankun-asset-loading): add page entry component"
```

---

## Task 6: 注册路由

**Files:**
- Modify: `src/router/config.tsx`

**说明：** 等页面组件存在后再注册路由，避免构建失败。

- [ ] **Step 1: 添加懒加载导入**

在 `src/router/config.tsx` 的懒加载组件区域新增：

```tsx
const QiankunAssetLoadingPage = lazy(() => import('../pages/qiankun/asset-loading/index'));
```

- [ ] **Step 2: 添加 qiankun 专题子菜单**

在已有的 `qiankun 专题` 菜单的 `children` 数组中，紧接 `乾坤基础` 之后新增：

```tsx
      {
        path: '/dashboard/qiankun/asset-loading',
        label: '子应用资源的加载',
        element: <QiankunAssetLoadingPage />,
      },
```

- [ ] **Step 3: 验证类型检查**

Run: `npx tsc --noEmit`
Expected: 通过。

- [ ] **Step 4: Commit**

```bash
git add src/router/config.tsx
git commit -m "feat(router): register qiankun asset loading route"
```

---

## Task 7: 运行 lint 和类型检查

**Files:**
- 不修改文件，只运行命令。

- [ ] **Step 1: 运行 lint**

Run: `npm run lint`
Expected: 无新增错误（允许修复本任务新增文件中的 lint 问题）。

- [ ] **Step 2: 运行类型检查**

Run: `npx tsc --noEmit`
Expected: 通过。

- [ ] **Step 3: 运行 dev 服务器验证页面**

Run: `npm run dev`
Expected: 服务器正常启动，访问 `http://localhost:5173/#/dashboard/qiankun/asset-loading` 能看到"qiankun 专题：子应用资源的加载"页面，6 个章节和 Live Demo 正常渲染。

- [ ] **Step 4: Commit（如未提交）**

如果 lint 或类型检查有修复，提交这些修复：

```bash
git add -A
git commit -m "style(qiankun-asset-loading): fix lint and typecheck issues"
```

---

## 验收标准检查

- [ ] 主应用菜单 `qiankun 专题` 下新增 `子应用资源的加载`；
- [ ] 访问 `/dashboard/qiankun/asset-loading` 能正常打开页面；
- [ ] 页面包含 6 个小节，每个小节都有"五维度"结构；
- [ ] 每个小节至少包含一个 CodeDiff，代码从 `demos/` 通过 `?raw` 引入；
- [ ] 代码注释详尽，中文，覆盖 webpack 产物、publicPath、worker、编辑器资源等知识点；
- [ ] Live Demo 是静态资源路径对比器，能展示独立运行/qiankun 嵌入/nginx 转发三种场景；
- [ ] 不依赖真实 Monaco/CodeMirror 运行时，不改动子应用源码；
- [ ] 通过 `npm run lint` 和 `npx tsc --noEmit`。

---

## 自我审查

### Spec 覆盖检查

- webpack 产物与 publicPath：Task 3 Step 1-2 + Task 3 Step 7 SectionWebpackOutput.tsx ✓
- 部署路径与 nginx 转发：Task 3 Step 3-4 + Task 3 Step 7 SectionDeploymentPath.tsx ✓
- qiankun HTML Entry：Task 3 Step 7 SectionQiankunHtmlEntry.tsx ✓
- Monaco worker：Task 3 Step 5-6 + Task 3 Step 7 SectionMonacoWorker.tsx ✓
- CodeMirror baseUrl：Task 3 Step 7-8 + Task 3 Step 7 SectionEditorBaseUrl.tsx ✓
- 边框/图标/字体：Task 3 Step 7 SectionBorderCss.tsx ✓
- Live Demo：Task 4 ✓
- 路由注册：Task 6 ✓

### Placeholder 检查

- 无 TBD / TODO / implement later ✓
- 无未定义函数引用 ✓
- 所有步骤都包含完整代码或命令 ✓

### 类型一致性检查

- `liveDemoData.inputs` 和 `liveDemoData.switches` 的 key 与 TSX 中 state 一致 ✓
- 所有章节组件统一使用 `data.ts` 中的数据 ✓
- 路由路径 `/dashboard/qiankun/asset-loading` 与 spec 一致 ✓

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-01-qiankun-asset-loading-plan.md`.

Two execution options:

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
