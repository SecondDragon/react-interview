# qiankun 专题 — 子应用资源的加载设计文档

> 创建日期：2026-07-01
> 所属系统：react-interview（主应用）
> 文档类型：UI/知识体系页面设计
> 状态：待实现

## 1. 设计目标

在主应用（react-interview）的 `qiankun 专题` 下新增第二个菜单项 **"子应用资源的加载"**。本页面以一个真实的生产案例为切入点：在 qiankun 微前端架构中，子应用使用 Monaco Editor / CodeMirror 作为 SQL 编辑器时，语法高亮、命令补全、边框样式、图标字体等资源为什么会 404 或失效。

页面要做到：

- 从 webpack 产物结构、`output.publicPath`、运行时 `__webpack_public_path__` 讲起；
- 讲解独立部署、nginx 相对路径转发、qiankun HTML Entry 三种场景下资源 base 的变化；
- 深入解释为什么 `__webpack_public_path__` 对 Monaco Worker、CodeMirror mode 等异步资源无效；
- 给出 Monaco `getWorkerUrl`、CodeMirror `modeURL`、CSS 资源路径、nginx 转发的解决方案；
- 重点说明：为什么 nginx 相对路径转发后，甚至可以不用 `getWorkerUrl`；
- 让读者理解"资源加载不是配一个 publicPath 就万事大吉"。

## 2. 页面范围与边界

### 2.1 在本次设计中完成

- 主应用路由注册：
  - 父级菜单已存在：`qiankun 专题`（`/dashboard/qiankun`）
  - 新增二级菜单：`子应用资源的加载`（`/dashboard/qiankun/asset-loading`）
- 页面组件目录：`src/pages/qiankun/asset-loading/`
- 6 个小节，每个小节遵循"五维度"结构：
  1. 现象/问题
  2. 底层原因
  3. 如何解决（Bad vs Good 代码对比）
  4. 为什么要这样解决 + Live Demo 互动
  5. 核心原理
- 代码示例全部使用 `?raw` 从 `demos/` 提取，注释详尽、中文；
- Live Demo：资源路径对比器，展示不同场景下的资源 URL 与命中/404 状态。

### 2.2 明确不在本次范围

- 不修改 `qiankun/basic` 已实现的"乾坤基础"页面；
- 不引入真实 Monaco/CodeMirror 运行时；
- 不讨论 qiankun 应用间通信、样式沙箱、预加载等无关话题；
- 不改动 micro-vue 子应用源码。

## 3. 文件结构

```text
src/pages/qiankun/
  asset-loading/                        # 新增页面目录
    index.tsx                             # 页面入口
    data.ts                               # 纯文本数据
    LiveDemo.tsx                          # 资源路径对比器
    chapters/
      SectionWebpackOutput.tsx            # 1. webpack 产物与 publicPath
      SectionDeploymentPath.tsx           # 2. 部署路径与 nginx 转发
      SectionQiankunHtmlEntry.tsx         # 3. qiankun HTML Entry 如何改变资源 base
      SectionMonacoWorker.tsx             # 4. Monaco worker 为什么走不通 publicPath
      SectionEditorBaseUrl.tsx            # 5. CodeMirror 的 baseUrl 与 Monaco 的 getWorkerUrl
      SectionBorderCss.tsx                # 6. 边框/图标/字体等资源丢失
    demos/
      webpack-config.bad.ts               # 反面：publicPath 固定写死或缺失
      webpack-config.good.ts              # 正面：publicPath 按环境注入
      runtime-publicpath.bad.ts           # 反面：__webpack_public_path__ 未设置
      runtime-publicpath.good.ts          # 正面：__webpack_public_path__ 按 location/qiankun 注入设置
      monaco-environment.bad.ts           # 反面：未配置 MonacoEnvironment.getWorkerUrl
      monaco-environment.good.ts          # 正面：配置 getWorkerUrl 指向正确 worker 路径
      codemirror-config.bad.ts            # 反面：CodeMirror 默认 modeURL 在子应用下出错
      codemirror-config.good.ts           # 正面：CodeMirror 显式配置 modeURL/themeURL
      nginx-location.good.conf            # 正面：nginx 相对路径转发配置
```

## 4. 路由注册

在主应用 [src/router/config.tsx](file:///d:/测试人工智能/前端面试/react-interview/src/router/config.tsx#L105) 的 `qiankun 专题` 菜单下新增子菜单：

```tsx
const QiankunAssetLoadingPage = lazy(() => import('../pages/qiankun/asset-loading/index'));

export const dashboardRoutes: RouteConfig[] = [
  // ... 已有路由 ...
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
      {
        path: '/dashboard/qiankun/asset-loading',
        label: '子应用资源的加载',
        element: <QiankunAssetLoadingPage />,
      },
    ],
  },
  // ... 其他路由 ...
];
```

> 注意：吸取上次"乾坤基础"的教训，路由注册必须在页面组件全部创建完成后进行，避免提前引用不存在的文件。

## 5. 组件结构

### 5.1 页面入口 `index.tsx`

职责：
- 使用 Ant Design 的 `Typography`、`Space`、`Card`、`Divider` 组织页面；
- 引入 `data.ts` 的文本数据；
- 按顺序渲染 6 个章节组件；
- 在合适位置插入 `LiveDemo`（建议放在 SectionWebpackOutput 之后、SectionMonacoWorker 之前）。

### 5.2 数据文件 `data.ts`

职责：
- 只存放纯文本数据，不包含代码字符串；
- 提供每个小节的标题、现象、原因、解决方案说明、核心原理、注意事项列表；
- 提供 Live Demo 的输入标签、示例值和提示文本。

### 5.3 章节组件 `chapters/*.tsx`

每个章节组件统一结构：

```tsx
const SectionXxx = () => {
  return (
    <section>
      <Typography.Title level={3}>X. 小节标题</Typography.Title>

      <Typography.Title level={4}>一、现象/问题</Typography.Title>
      <Typography.Paragraph>...</Typography.Paragraph>

      <Typography.Title level={4}>二、底层原因</Typography.Title>
      <Typography.Paragraph>...</Typography.Paragraph>

      <Typography.Title level={4}>三、如何解决</Typography.Title>
      <CodeDiff oldValue={badCode} newValue={goodCode} leftTitle="❌ 反面教材" rightTitle="✅ 最佳实践" type="error" hideDiffMarkers={true} />

      <Typography.Title level={4}>四、为什么要这样解决</Typography.Title>
      <Typography.Paragraph>...</Typography.Paragraph>
      {/* 可选：与本小节相关的 Live Demo 子区域 */}

      <Typography.Title level={4}>五、核心原理</Typography.Title>
      <Typography.Paragraph>...</Typography.Paragraph>
    </section>
  );
};
```

### 5.4 Live Demo `LiveDemo.tsx`

静态交互演示，不加载真实编辑器。功能：
- 提供输入项：
  - 子应用部署路径（如 `/sql/`、`//sql.example.com/`）
  - Monaco worker 文件名（如 `editor.worker.js`）
  - 是否启用 qiankun HTML Entry
  - 是否启用 nginx 相对路径转发
  - 是否配置 `MonacoEnvironment.getWorkerUrl`
  - 是否配置 `__webpack_public_path__`
- 根据输入，实时计算并展示三种场景下的资源 URL：
  1. 子应用独立运行
  2. 通过 qiankun 嵌入主应用
  3. 通过 nginx 相对路径转发
- 用红色/绿色标识哪些 URL 会 404、哪些会命中；
- 展示一个"资源加载决策树"：遇到高亮/补全丢失时，先检查 publicPath，再检查 worker 配置，再检查 CSS 资源；
- 特别标注 nginx 转发场景下 worker 默认路径是否正确，和 qiankun 独立域名加载场景形成对比。

## 6. 各小节详细内容

### 6.1 小节 1：webpack 产物与 publicPath

**一、现象/问题**

本地开发时代码高亮、命令补全正常，部署到子应用路径后：
- 控制台报 404，资源路径是 `/js/xxx` 而不是 `/subapp/js/xxx`；
- 改了 `publicPath` 后，主资源包能加载，但 worker、grammar 文件还是 404；
- 不同环境（开发、测试、生产）需要反复改 publicPath。

**二、底层原因**

webpack 打包时，代码里的动态加载路径（如 `import("./mode-sql")`）会被编译成基于 `__webpack_require__.p` 的 URL。`__webpack_require__.p` 就是 `output.publicPath`（或运行时 `__webpack_public_path__`）的值。如果它是空字符串或 `/`，产物会假设自己部署在当前页面路径或域名根路径。当子应用部署在 `/subapp/` 下，或者在 qiankun 里通过 HTML Entry 加载时，浏览器当前页面地址仍是主应用，导致动态 chunk 被拼到主应用路径上。

**__webpack_public_path__ 为什么能生效？**

webpack 在构建时会改写源代码：

```javascript
// 源代码
import("./mode-sql")

// 编译后等价于
__webpack_require__.e("mode-sql"); // 内部请求 __webpack_require__.p + "js/chunk-mode-sql.js"
```

`__webpack_require__.p` 就是 publicPath 的运行时值。在页面顶部设置：

```javascript
__webpack_public_path__ = "https://sql.example.com/sql/";
```

等价于把 `__webpack_require__.p` 改成这个值，所有动态 chunk 都会自动拼上这个前缀。

**URL 变化对比**

| 阶段 | 代码形式 | 最终请求 URL |
|---|---|---|
| 源代码 | `import("./mode-sql")` | （尚未运行） |
| webpack 编译后 | `__webpack_require__.p + "js/chunk-mode-sql.js"` | 依赖 `__webpack_require__.p` 的值 |
| 未设置 `__webpack_public_path__` | `__webpack_require__.p = ""` 或 `"/"` | `https://main.example.com/.../js/chunk-mode-sql.js`（404） |
| 已设置 `__webpack_public_path__` | `__webpack_public_path__ = "https://sql.example.com/sql/"` | `https://sql.example.com/sql/js/chunk-mode-sql.js`（命中） |

**三、如何解决**

`demos/webpack-config.good.ts` 展示：
- 按环境配置 `publicPath`：开发 `/`、生产 `/sql/` 或 `auto`；
- 在运行时通过 `__webpack_public_path__` 动态设置。

`demos/webpack-config.bad.ts` 展示固定 `publicPath: '/'` 或不配置的问题。

`demos/publicpath-runtime.good.ts` 和 `demos/publicpath-runtime.bad.ts` 展示一个具体场景：
- 主应用地址是 `https://main.example.com/dashboard/qiankun/sql/`；
- 子应用真实部署在 `https://sql.example.com/sql/`；
- 未设置 `__webpack_public_path__` 时，`import("./mode-sql")` 会请求 `https://main.example.com/dashboard/qiankun/sql/js/chunk-mode-sql.js`（404）；
- 设置 `__webpack_public_path__ = "https://sql.example.com/sql/"` 后，请求变成 `https://sql.example.com/sql/js/chunk-mode-sql.js`（命中）。

**四、为什么要这样解决**

静态 `publicPath` 在构建时就决定了，但部署路径可能在不同环境不同。运行时设置 `__webpack_public_path__` 可以让子应用根据当前 `location` 或 qiankun 注入的路径自动修正，避免为每个环境打一份包。

**五、核心原理**

- webpack 的 `__webpack_require__.p` 就是 publicPath；
- 所有 `import()`、动态加载的 chunk、图片、字体等 URL 都会拼上 `__webpack_require__.p`；
- 运行时 `__webpack_public_path__ = "https://sql.example.com/sql/"` 等价于把 `__webpack_require__.p` 改成这个值；
- 如果子应用被 qiankun 以 HTML Entry 方式加载，子应用内部的 `location` 仍然是主应用的 URL，因此静态 publicPath 容易错，需要运行时动态修正。

### 6.2 小节 2：部署路径与 nginx 转发

**一、现象/问题**

子应用独立部署在 `https://subapp.example.com/`，通过 nginx 转发到 `https://main.example.com/sql/`：
- 改了 `publicPath` 后有些资源能加载，但有些还是从 `/` 请求；
- 刷新页面或直接访问 `/sql/list` 时，子应用 HTML 能加载，但 CSS/JS 404。

**二、底层原因**

nginx 转发改变了浏览器看到的 URL，但子应用代码里仍然按原始路径构建。如果 `publicPath` 是 `/` 或 `auto`，在 `/sql/` 路径下请求 `/js/xxx` 会被发到主应用根路径，而不是子应用。

**关键点：nginx 转发后为什么 Monaco 不需要 `getWorkerUrl`？**

- 当浏览器地址栏是 `main.example.com/sql/` 时，`document.baseURI` 就是 `main.example.com/sql/`；
- Monaco 默认的 worker 加载逻辑使用 `new Worker('./editor.worker.js')`，浏览器会相对于 `main.example.com/sql/` 解析，得到 `main.example.com/sql/editor.worker.js`；
- 只要 nginx 把 `/sql/*` 正确转发到子应用的真实资源路径，这个请求就会命中；
- 也就是说，nginx 转发让子应用"看起来"就部署在 `/sql/` 下， Monaco 的默认相对路径行为反而正确了。

这和 qiankun 直接加载独立域名子应用的场景完全不同：后者浏览器地址是主应用路径，而 worker 文件在子应用域名下，所以必须靠 `getWorkerUrl` 强制指定绝对路径。

**三、如何解决**

`demos/nginx-location.good.conf` 展示 nginx 配置：
```nginx
location /sql/ {
    proxy_pass http://subapp.example.com/;
}
```

`demos/runtime-publicpath.good.ts` 展示运行时动态设置：
```typescript
__webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ || '/sql/';
```

`demos/runtime-publicpath.bad.ts` 展示未设置或硬编码的问题。

**四、为什么要这样解决**

统一域名下通过路径区分子应用，是最常见的部署模式。相对路径 `/` 和 `/sql/` 的差别会导致大量资源 404。运行时设置 publicPath 能适配 qiankun 注入和独立运行两种环境。

**补充：nginx 转发 vs. `getWorkerUrl` 的取舍**

| 部署方式 | worker 路径行为 | 是否需要 `getWorkerUrl` | 原因 |
|---|---|---|---|
| qiankun 直接加载子应用独立域名 | 相对于主应用路径解析，会 404 | 需要 | 浏览器地址和 worker 真实地址不在同一域名/路径下，必须显式指定绝对 URL |
| nginx 相对路径转发 | 相对于 `/sql/` 解析，正确 | 不需要 | 浏览器地址已经变成子应用部署路径，nginx 会转发 worker 请求到真实子应用 |

因此，如果你的部署方案允许使用 nginx 相对路径转发，优先用这种方案：它能让 Monaco/CodeMirror 的默认相对路径加载行为正确，减少代码侵入。如果必须使用跨域独立域名加载，才需要 `getWorkerUrl` / `modeURL` 这种显式配置。

**nginx 相对路径转发是“万能”的吗？**

nginx 相对路径转发是**最简单、最接近“万能”**的方案——前提是子应用可以被暴露到主应用域名的某个路径前缀下。在这个前提下：
- 浏览器地址栏和子应用的资源路径天然对齐，`document.baseURI` 就是 `/sql/`，所有相对路径资源都会自然落在 `/sql/*` 下；
- Monaco、CodeMirror、CSS 字体/图片等依赖浏览器原生相对路径解析的资源，默认行为就是正确的；
- 子应用几乎不需要额外配置 `getWorkerUrl`、`modeURL` 或运行时 `__webpack_public_path__`，代码侵入最小。

| 场景 | 是否适合 nginx 相对路径转发 | 说明 |
|---|---|---|
| 子应用可以挂到 `/sql/` 这类同域路径前缀下 | 适合 | 浏览器地址、资源路径、nginx 转发三者一致，默认即可工作 |
| 品牌或安全要求必须使用独立域名（如 `sql.example.com`） | 不适合 | 浏览器地址与资源域分离，需要回退到 `getWorkerUrl` / 绝对路径方案 |
| 主应用路径前缀冲突（如主应用已有 `/sql/` 路由） | 需要协调 | 需更换前缀或调整主应用路由，避免 nginx 与主应用路由冲突 |
| 严格的 CORS/COEP/CORP 要求 | 可行但增加复杂度 | 需要额外配置跨域响应头、资源隔离策略，nginx 只是入口层 |
| 子应用需要独立部署、独立灰度/回滚 | 适合 | nginx 只是入口层，后端子应用仍可独立部署、独立维护 |

nginx 相对路径转发不是绝对万能，但在“同域路径前缀”这个前提下，它是最省心、代码侵入最小的方案。如果因为品牌或独立域名要求不能走这个方案，才需要回退到 `getWorkerUrl` / `modeURL` / 绝对路径 / CORS 配置等方案。

**五、核心原理**

- nginx 转发只是反向代理，浏览器请求的 URL 仍然是 `/sql/js/xxx`；
- 子应用必须知道自己的"外部可见路径"，才能正确拼接资源 URL；
- `__webpack_public_path__` 是 webpack runtime 的全局变量，可以覆盖构建时的 `output.publicPath`。

### 6.3 小节 3：qiankun HTML Entry 如何改变资源 base

**一、现象/问题**

子应用独立访问（如 `https://sql.example.com/sql/`）完全正常，但一嵌入主应用就掉链子：
- 页面控制台报 `404`，丢失的资源是 `app.js`、`chunk.js`、CSS、背景图、字体图标；
- 子应用 HTML 里的 `<script src="./js/app.js">` 被解析成了主应用域下的 `/js/app.js`；
- 在独立域名下能加载的 JS 资源，嵌入后却从主应用的 `/dashboard/qiankun/...` 路径请求。

具体表现：假设子应用部署在 `https://sql.example.com/sql/`，HTML 里写了 `<script src="./js/app.js"></script>`。
- 独立运行时，浏览器当前地址是 `https://sql.example.com/sql/`，相对路径 `./js/app.js` 解析为 `https://sql.example.com/sql/js/app.js`；
- qiankun 嵌入时，浏览器地址仍是主应用 `https://main.example.com/dashboard/qiankun/...`，qiankun 把子应用 HTML 插入到主应用容器里，但 `document.baseURI` 还是主应用，于是 `./js/app.js` 被解析为 `https://main.example.com/js/app.js`，这通常不是主应用资源，导致 404。

**二、底层原因**

qiankun 默认使用 HTML Entry：它会 fetch 子应用的入口 HTML（如 `https://sql.example.com/sql/index.html`），解析出 `<script src>`、`<link href>`、`<style>`、`<img src>` 等，然后把脚本/样式插入到主应用的沙箱容器。这个过程中，浏览器并不会因为资源来自子应用 HTML，就自动用子应用域作为 base 来解析相对路径。

浏览器解析相对路径的 base 始终是 `document.baseURI`，也就是当前页面地址。qiankun 嵌入后，当前页面地址还是主应用，所以：
- 子应用 HTML 中的相对路径 `./js/app.js` 会基于主应用路径解析；
- 子应用 JS 内部用 `new URL('./worker.js', import.meta.url)` 或 `document.currentScript` 推断路径时，也会拿到主应用域作为 base；
- webpack 打包出来的动态 chunk，如果 `publicPath` 是 `/` 或空，会按主应用根路径拼接。

**协议相对 URL `//` 是什么？**

`//cdn.example.com/js/app.js` 这种写法叫「协议相对 URL」。它省略了 `http:` 或 `https:`，浏览器会自动使用当前页面所用的协议。
- 优点：同时兼容 HTTP 与 HTTPS，不会触发混合内容（Mixed Content）问题；写法简短，CDN 场景常用；
- 缺点：如果页面用 `file://` 协议直接打开，会解析失败；不指定协议也无法在本地文件或某些安全策略下使用；
- 适用场景：同一个资源在 HTTP 和 HTTPS 站点都要使用，且资源域名固定的 CDN 或公共资源。

在 qiankun 子应用里，如果 `<script src="//sql.example.com/sql/js/app.js">`，浏览器无论主应用是 HTTP 还是 HTTPS，都会使用同一协议，并且始终以 `sql.example.com` 为域名，不会被主应用 base 带偏。

**三、如何解决**

有 4 种常见方案，按侵入性从低到高排列：

**方案 1：静态 HTML 标签写绝对路径**

在子应用构建产物 `index.html` 中，把相对路径改成以子应用真实域名为基准的绝对路径或协议相对 URL。

```html
<!-- ❌ 反面教材：相对路径，在 qiankun 中会被解析到主应用域 -->
<script src="./js/app.js"></script>

<!-- ✅ 最佳实践：绝对路径，明确指向子应用真实资源 -->
<script src="https://sql.example.com/sql/js/app.js"></script>

<!-- ✅ 替代写法：协议相对 URL，自动跟随主应用协议 -->
<script src="//sql.example.com/sql/js/app.js"></script>
```

**方案 2：webpack output.publicPath 配置绝对路径**

构建时统一把 chunk 路径前缀指向子应用真实部署路径或 CDN，这样 JS 内部动态加载 `import()` 或按需 chunk 也会带上正确前缀。

```typescript
// webpack.config.js
export default {
  output: {
    publicPath: 'https://sql.example.com/sql/',
    // 或协议相对 URL：'//sql.example.com/sql/'
  },
};
```

**方案 3：运行时通过 `__webpack_public_path__` 动态设置**

qiankun 加载子应用时会把子应用的 entry URL 注入到 `window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__`。子应用入口 JS 的最顶部读取该变量，并赋值给 `__webpack_public_path__`，让 webpack 的 chunk 加载路径也随当前环境变化。

```typescript
// 必须放在所有 import 和动态加载之前
__webpack_public_path__ =
  window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ ||
  (process.env.NODE_ENV === 'production' ? 'https://sql.example.com/sql/' : '/');

import { createApp } from 'vue';
import App from './App.vue';
createApp(App).mount('#app');
```

**方案 4：HTML 标签全部使用绝对路径 + 关闭自动 publicPath 注入**

如果子应用确实无法运行时设置 `__webpack_public_path__`，可以构建时把所有入口标签（`<script>`、`<link>`）都写成绝对路径，并把 CSS 中 `url()` 也处理成绝对路径。这种方法最稳妥但维护成本最高，适合资源完全托管在 CDN 的场景。

```html
<!-- 所有资源全部写死绝对路径或协议相对 URL -->
<link rel="stylesheet" href="//sql.example.com/sql/css/app.css" />
<script src="//sql.example.com/sql/js/app.js"></script>
```

**URL 形式对比表**

| 形式 | 写法示例 | 独立运行解析结果 | qiankun 嵌入解析结果 | 适用场景 |
|---|---|---|---|---|
| 相对路径 | `./js/app.js` | `https://sql.example.com/sql/js/app.js` | `https://main.example.com/js/app.js`（404） | 单页面独立部署，且与资源同域同路径 |
| 根路径 | `/js/app.js` | `https://sql.example.com/js/app.js` | `https://main.example.com/js/app.js`（404） | 资源部署在域名根路径，且只有一个应用 |
| 协议相对 URL | `//sql.example.com/sql/js/app.js` | `https://sql.example.com/sql/js/app.js` | `https://sql.example.com/sql/js/app.js`（命中） | 需要同时兼容 HTTP/HTTPS，且资源域名固定 |
| 绝对路径 | `https://sql.example.com/sql/js/app.js` | `https://sql.example.com/sql/js/app.js` | `https://sql.example.com/sql/js/app.js`（命中） | 资源域名和协议都固定，qiankun 嵌入场景最稳 |
| 运行时注入 | `__webpack_public_path__ + 'js/app.js'` | `https://sql.example.com/sql/js/app.js` | `https://sql.example.com/sql/js/app.js`（命中） | 同一套构建产物需要同时适配独立运行和 qiankun 嵌入 |

**四、为什么要这样解决且新增互动演示（Live Demo）**

qiankun 不会自动重写子应用资源 URL，这是设计上的选择：HTML Entry 只负责把子应用的 HTML/JS/CSS 拿到主应用里执行，资源路径仍然由浏览器解析。因此子应用必须自己保证「浏览器看到的 URL 指向真实资源」。

- 绝对路径/协议相对 URL 最直接，完全不受主应用 base 影响；
- `__webpack_public_path__` 最灵活，同一份构建产物可以同时跑独立和嵌入两种模式；
- 写死 HTML 绝对路径适合静态资源托管到 CDN 的场景，但换域名就要重新构建；
- 没有银弹，实际项目通常是「运行时 `__webpack_public_path__` + 关键资源协议相对 URL」组合使用。

Live Demo 在本小节展示一个「资源 base 切换器」：给定一个资源 `js/app.js`，用户输入子应用真实域名和路径，选择不同 URL 形式（相对、根、协议相对、绝对、运行时注入），实时看到独立运行和 qiankun 嵌入下最终请求的 URL，并用 404/命中 标记。

**五、核心原理**

- 浏览器解析相对路径的 base 是 `document.baseURI`，而不是资源来源的 HTML；qiankun 把子应用 HTML 插入主应用后，base 仍然是主应用的；
- 子应用原来写在 HTML 里的 `<script src="./js/app.js">` 会被解析成主应用域下的 `/js/app.js`，而不是子应用域下的 `/sql/js/app.js`；
- `__webpack_public_path__` 修改的是 webpack 的 `__webpack_require__.p`，只在 webpack 模块系统内部生效；它不会自动修复 HTML 标签、CSS `url()`、原生 `new Worker()` 的 URL；
- 协议相对 URL `//` 省略协议但保留域名，因此不会被主应用 base 带偏，适合跨 HTTP/HTTPS 的固定域名资源；
- 这也是 webpack 官方推荐生产环境使用绝对路径或 CDN 的原因之一：它消除了「当前页面路径」对资源解析的依赖。

### 6.4 小节 4：Monaco worker 为什么走不通 publicPath

**一、现象/问题**

改了 `__webpack_public_path__` 后，主包资源正常，但 Monaco 的语法高亮、命令补全仍失效：
- 控制台看到 worker 文件 404；
- 有时 worker 能加载，但加载的是主应用根路径下的错误文件。

**二、底层原因**

Monaco 的语法分析是在 Web Worker 中进行的。worker 文件通过 `new Worker(url)` 加载，这个 URL 的解析与主线程 webpack 的 `__webpack_public_path__` 完全无关：浏览器收到的是普通字符串 URL，会按 `document.baseURI` 解析。worker 被创建后，其内部执行 `importScripts` 时运行在 worker 自己的全局上下文，也看不到主线程的 `__webpack_public_path__`。因此，即使主线程已经正确设置 publicPath，worker 及其依赖脚本仍可能从错误路径请求。

**主线程请求 vs Web Worker 请求**

| 阶段 | 示例代码 | URL 如何确定 | publicPath 是否生效 |
|---|---|---|---|
| 主线程动态加载 | `import("./mode-sql")` | webpack 改写为 `__webpack_require__.p + chunkId` | 受 `__webpack_public_path__` 控制 |
| 创建 Worker | `new Worker("./editor.worker.js")` | 浏览器按 `document.baseURI` 解析字符串 URL | 不受 `__webpack_public_path__` 控制 |
| Worker 内部加载依赖 | `self.importScripts("./sql.js")` | 浏览器按 Worker 文件所在 URL 解析 | Worker 有独立全局作用域，主线程 publicPath 不可见 |

**三、如何解决**

`demos/monaco-environment.good.ts` 展示：

```typescript
window.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    return '/sql/monaco/vs/base/worker/worker-main.js';
  }
};
```

`demos/monaco-environment.bad.ts` 展示未配置或错误配置的问题。

`demos/worker-context.good.ts` 和 `demos/worker-context.bad.ts` 展示 Worker 全局作用域与主线程 publicPath 的隔离：
- 主线程可以设置 `__webpack_public_path__`，但 Worker 内部有自己的 `self` 和 `location`；
- Worker 创建时的 URL 是浏览器原生解析，不经过 webpack 模块系统；
- Worker 内部 `importScripts` 应该使用绝对路径或基于 Worker 文件 URL 计算的路径，而不是依赖主线程的 publicPath。

**四、为什么要这样解决**

- 主线程：`import("./mode-sql")` → webpack 编译成 `__webpack_require__.e("mode-sql")` → 最终请求 `__webpack_require__.p + "js/mode-sql.chunk.js"`；`__webpack_public_path__` 设置的就是 `__webpack_require__.p`。
- Worker：`new Worker("./editor.worker.js")` → 浏览器直接解析为 `当前页面 base + "./editor.worker.js"`；`__webpack_public_path__` 不参与。
- Worker 内部：`self.importScripts("./sql.js")` → 浏览器基于 Worker 文件 URL 解析；同样与 `__webpack_public_path__` 无关。

**五、核心原理**

- HTML/主线程中的动态 `import` 会被 webpack 改写为 `__webpack_require__.p + chunkId`，因此 `__webpack_public_path__` 能控制这些 URL；
- Web Worker 的创建 URL 由 `new Worker(url)` 时的字符串决定，这是浏览器原生 API，不走 webpack 的模块系统；
- Worker 创建后运行在一个独立全局上下文，`self.importScripts` 加载其他脚本时基于 worker 文件所在 URL 解析，主线程的 `__webpack_public_path__` 不会传递给它；
- 因此 `__webpack_public_path__` 只能影响主线程的 webpack chunk 加载，不能影响原生 Worker 的 URL 解析。

### 6.5 小节 5：CodeMirror 的 baseUrl 与 Monaco 的 getWorkerUrl

**一、现象/问题**

CodeMirror 的 mode、theme、addon 是通过 `loadScript` 动态加载的，嵌入子应用后也 404：
- 命令补全、语法高亮消失；
- 控制台显示 `mode/sql.js` 404。

**二、底层原因**

CodeMirror 的 `modeURL` 默认是 `'%N.js'`，加载时会按当前页面路径拼接。在子应用路径下，它错误地去主应用根路径下找 `mode/sql.js`。这与 Monaco 的问题本质相同：都是"运行时按需加载资源"的库，绕过了 webpack 的 publicPath。

**三、如何解决**

`demos/codemirror-config.good.ts` 展示：
```typescript
CodeMirror.modeURL = '/sql/codemirror/mode/%N/%N.js';
CodeMirror.themeURL = '/sql/codemirror/theme/%N.css';
```

`demos/codemirror-config.bad.ts` 展示默认配置的问题。

**四、为什么要这样解决**

CodeMirror 不是 webpack 模块化的，它自己管理资源加载路径。与 Monaco 类似，需要显式告诉它资源在哪里。

**五、核心原理**

- CodeMirror 和 Monaco 都是"运行时按需加载资源"的库，不是 webpack 打包后全部内联；
- 它们的加载逻辑绕过了 webpack 的 publicPath，需要开发者自己维护 base URL；
- 这也是为什么只改 `publicPath` 或 `__webpack_public_path__` 不足以解决编辑器资源问题。

### 6.6 小节 6：边框/图标/字体等资源丢失

**一、现象/问题**

改用 nginx 相对路径转发后，代码高亮和命令补全恢复了，但：
- 边框样式偶尔丢失；
- 图标字体显示成方框；
- 背景图片不显示。

**二、底层原因**

CSS 中的 `background: url('./border.png')` 或 `@font-face { src: url('./iconfont.woff') }` 是相对路径。这些路径在独立运行时基于子应用路径正确，但在 qiankun 中基于主应用路径解析，导致 404。有时 CDN 或浏览器缓存会让问题偶尔出现，偶尔正常，导致排查困难。

**三、如何解决**

- 使用绝对路径或 CDN 路径；
- 对 CSS 中的相对资源路径做后处理（如 postcss 的 `public-path` 插件）；
- 使用 CSS 变量或 base64 内联小图标；
- 对字体文件使用 `font-display: swap` 并确认路径正确。

**四、为什么要这样解决**

CSS 资源路径解析由浏览器负责，base 是 CSS 文件所在 URL。如果 CSS 被 qiankun 从 HTML 中提取后插入主应用，base 可能变为主应用域。需要构建时或部署时确保路径正确。

**五、核心原理**

- CSS 中的 `url()` 解析基于 CSS 文件的 URL，而不是当前 HTML 页面；
- qiankun 提取子应用 CSS 后，如果 CSS 文件本身是相对路径或内联，base 可能出错；
- 字体、图片、SVG 等"非 JS 资源"最容易被忽略，也最难排查。

## 7. 数据与代码分离

- `data.ts` 只存放标题、段落、列表、原理说明等纯文本；
- 所有代码示例通过 `import xxx from './demos/xxx.bad.ts?raw'` 引入；
- `.bad.ts` 文件会被 `tsconfig.json` 的 `exclude` 排除，避免类型检查报错；
- 代码注释使用中文，详尽解释每个字段、函数、坑点。

## 8. 代码规范

- 使用 Ant Design 组件：Typography、Card、Space、Alert、Switch、Input、Collapse、List；
- 使用 `CodeDiff` 组件展示 Bad/Good 对比；
- 组件内部不使用 styled-components，样式变量统一放在页面最后（如需）；
- 所有代码注释和文档解释使用中文；
- 路由页面组件单独放在 `qiankun/asset-loading/` 目录下，相关文件全部放在该目录内。

## 9. 验收标准

- [ ] 主应用菜单 `qiankun 专题` 下新增 `子应用资源的加载`；
- [ ] 访问 `/dashboard/qiankun/asset-loading` 能正常打开页面；
- [ ] 页面包含 6 个小节，每个小节都有"五维度"结构；
- [ ] 每个小节至少包含一个 CodeDiff，代码从 `demos/` 通过 `?raw` 引入；
- [ ] 代码注释详尽，中文，覆盖 webpack 产物、publicPath、worker、编辑器资源等知识点；
- [ ] Live Demo 是静态资源路径对比器，能展示独立运行/qiankun 嵌入/nginx 转发三种场景；
- [ ] 不依赖真实 Monaco/CodeMirror 运行时，不改动子应用源码；
- [ ] 通过 `npm run lint` 和 `npm run typecheck`（或项目当前等效命令）。

## 10. 后续可扩展项

- 子应用：样式隔离与沙箱机制；
- 子应用：预加载与性能优化；
- 子应用：公共依赖共享与依赖治理；
- 子应用：应用间通信（props、全局事件、shared state）。
