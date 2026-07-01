# qiankun 专题 — 乾坤基础设计文档

> 创建日期：2026-07-01
> 所属系统：react-interview（主应用）
> 文档类型：UI/知识体系页面设计
> 状态：待实现

## 1. 设计目标

在主应用（react-interview）中新增一个 **qiankun 专题**，专题下的第一个菜单项为 **"乾坤基础"**。本页面面向前端面试者与实际开发者，系统讲解基于路由加载的 qiankun 微前端方案：

- 子应用如何通过 `vite-plugin-qiankun` 完成打包改造；
- 子应用入口如何暴露 `bootstrap / mount / unmount / update` 生命周期；
- 子应用内部路由如何适配 qiankun 的激活路径；
- 父应用如何注册子应用、配置 `activeRule`、预留挂载容器；
- 挂载入口的 DOM 与样式注意事项。

页面要做到：**按照页面给出的配置清单，读者可以一步步配出一个可用的父子应用**。优化、通信、共享状态等高级话题不进入本页，放到后续菜单项。

## 2. 页面范围与边界

### 2.1 在本次设计中完成

- 主应用路由注册：
  - 一级菜单：`qiankun 专题`
  - 二级菜单：`乾坤基础`
  - 路径：`/dashboard/qiankun/basic`
- 页面组件目录：`src/pages/qiankun/basic/`
- 6 个小节，每个小节遵循"五维度"结构：
  1. 现象/问题
  2. 底层原因
  3. 如何解决（Bad vs Good 代码对比）
  4. 为什么要这样解决 + Live Demo 互动
  5. 核心原理
- 代码示例全部使用 `?raw` 从 `demos/` 提取，注释详尽、中文；
- 静态 Live Demo：配置开关 + 可用性判断清单。

### 2.2 明确不在本次范围

- 不修改 micro-vue 子应用源码；
- 不引入真实微应用运行时加载；
- 不讨论 qiankun 优化、样式隔离、应用间通信、共享状态、沙箱细节；
- 不写其他 qiankun 专题菜单项（如通信、优化），只留扩展结构。

## 3. 文件结构

```text
src/pages/qiankun/
  basic/
    index.tsx                      # 页面入口，组合所有章节
    data.ts                        # 纯文本数据：标题、描述、原因、原理、注意点
    LiveDemo.tsx                   # 静态配置演示与可用性判断
    chapters/
      SectionIntro.tsx             # 1. 引言：基于路由加载的 qiankun 是什么
      SectionChildBuild.tsx        # 2. 子应用打包配置（Vite + vite-plugin-qiankun）
      SectionChildEntry.tsx        # 3. 子应用入口改造与生命周期
      SectionChildRouter.tsx       # 4. 子应用内部路由 base 适配
      SectionHostRegister.tsx      # 5. 父应用注册与激活规则
      SectionMountContainer.tsx    # 6. 挂载容器 DOM 与样式约定
    demos/
      child-vite-config.bad.ts     # 反面：没有 qiankun 插件的 Vite 配置
      child-vite-config.good.ts    # 正面：接入 vite-plugin-qiankun 的 Vite 配置
      child-main-js.bad.ts         # 反面：普通 createApp 入口
      child-main-js.good.ts        # 正面：renderWithQiankun + 生命周期
      child-router.bad.ts          # 反面：base 固定为 "/"
      child-router.good.ts         # 正面：根据 __POWERED_BY_QIANKUN__ 切换 base
      host-register-js.bad.ts      # 反面：activeRule/entry 错误
      host-register-js.good.ts     # 正面：完整 registerMicroApps + start
      host-layout-html.bad.html    # 反面：没有挂载容器
      host-layout-html.good.tsx    # 正面：主应用预留 #micro-viewport
```

## 4. 路由注册

在主应用 [src/router/config.tsx](file:///d:/测试人工智能/前端面试/react-interview/src/router/config.tsx#L104) 中新增：

```tsx
const QiankunBasicPage = lazy(() => import('../pages/qiankun/basic/index'));

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
    ],
  },
];
```

## 5. 组件结构

### 5.1 页面入口 `index.tsx`

职责：
- 使用 Ant Design 的 `Typography`、`Space`、`Card` 或 `Collapse` 组织页面；
- 引入 `data.ts` 的文本数据；
- 按顺序渲染 6 个章节组件；
- 在合适位置插入 `LiveDemo`。

### 5.2 数据文件 `data.ts`

职责：
- 只存放纯文本数据，不包含代码字符串；
- 提供每个小节的标题、现象、原因、解决方案说明、核心原理、注意事项列表；
- 提供 Live Demo 的开关标签和提示文本。

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

静态交互演示，不加载真实子应用。功能：
- 提供一组开关，对应关键配置项：
  - 子应用是否使用 `vite-plugin-qiankun`
  - 子应用是否配置 `Access-Control-Allow-Origin`
  - 子应用入口是否使用 `renderWithQiankun`
  - 子应用路由是否根据 `__POWERED_BY_QIANKUN__` 切换 base
  - 父应用是否正确注册 `activeRule`
  - 父应用是否预留 `#micro-viewport` 容器
- 根据开关状态，实时显示：
  - 绿色通过项清单；
  - 红色缺失项清单及对应的小节链接/提示；
  - 顶部总状态："当前配置可运行" / "当前配置仍有缺失，无法保证子应用正常加载"。
- 提供一个可折叠的"最小可用配置清单"，汇总好子应用与父应用的关键配置。

## 6. 各小节详细内容

### 6.1 小节 1：引言 — 基于路由加载的 qiankun 是什么

**一、现象/问题**

很多开发者第一次接触 qiankun 时，会混淆"子应用如何被加载"与"子应用路由如何工作"。常见困惑：
- 子应用明明能独立跑，嵌入主应用后白屏；
- 子应用路由和主应用路由互相覆盖；
- 刷新后子应用直接 404；
- 不知道 `entry` 填 HTML 入口还是 JS 入口。

**二、底层原因**

qiankun 的"基于路由加载"是指：主应用通过监听 URL 变化，当 URL 匹配某个子应用的 `activeRule` 时，去请求该子应用的 `entry`（默认 HTML Entry），并把解析后的 DOM/JS 插入主应用指定的 `container` 中。子应用接管 container 内部渲染，同时主应用框架继续存在。

**三、如何解决**

用一张架构图说明流程：

```text
用户访问 /dashboard/micro-vue/list
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
子应用 Vue Router 接管 /list
```

**四、为什么要这样解决**

路由驱动加载是微前端最自然的集成方式：用户无感知，URL 统一，刷新行为可控。相比手动 `loadMicroApp`，路由加载更适合多页后台系统。

**五、核心原理**

- `single-spa` 提供路由变化监听与生命周期调度；
- qiankun 在 `single-spa` 之上增加了 HTML Entry、JS 隔离、样式隔离、预加载；
- `activeRule` 决定何时加载，`entry` 决定加载什么，`container` 决定挂载到哪里。

### 6.2 小节 2：子应用打包配置（Vite + vite-plugin-qiankun）

**一、现象/问题**

直接把普通 Vite Vue 项目作为 qiankun 子应用，父应用加载时会出现：
- 控制台报 `ReferenceError: xx is not defined`（因为子应用没有 UMD/IIFE 暴露）；
- 样式加载正常但 JS 不执行，或执行后直接接管整个 `document`；
- 开发环境父应用请求子应用资源时触发 CORS 错误。

**二、底层原因**

qiankun 默认以 HTML Entry 方式加载子应用。它会通过 `fetch` 请求子应用的入口 HTML，然后解析出所有 `<script>`、`<link>`，再插入沙箱执行。如果子应用打包产物不是浏览器可独立运行的格式，或者开发服务器没有允许跨域，父应用就无法正确拿到资源。

**三、如何解决**

`demos/child-vite-config.good.ts` 展示完整配置：
- 使用 `vite-plugin-qiankun`；
- 开发环境配置 `server.headers['Access-Control-Allow-Origin'] = '*'`；
- 简要说明生产环境配置 `build.lib` / `rollupOptions` 输出 UMD/IIFE（给出注释但不一定需要完整代码）。

`demos/child-vite-config.bad.ts` 展示缺失这些配置时的普通 Vite 配置。

**四、为什么要这样解决**

- `vite-plugin-qiankun` 在构建时注入 qiankun 需要的生命周期与沙箱兼容代码；
- `useDevMode: true` 在开发时让 helper 直接暴露生命周期，避免手动写 UMD；
- 跨域头是开发环境必须，生产环境一般由 Nginx/CDN 配置。

**五、核心原理**

- `vite-plugin-qiankun` 通过 Vite 插件钩子改写入口代码，使 Vue 应用在 qiankun 环境下导出 `bootstrap / mount / unmount / update`；
- 沙箱中执行子应用 JS 时，全局 `window` 被代理，因此子应用必须避免直接污染全局变量；
- HTML Entry 让父应用可以按资源粒度加载 JS/CSS，而不是只加载一个 bundle。

### 6.3 小节 3：子应用入口改造与生命周期

**一、现象/问题**

子应用独立运行正常，但嵌入主应用后：
- 第一次进入页面能看到内容，切换其他主应用菜单再回来，子应用不渲染或报错；
- 重复挂载导致内存泄漏、事件重复绑定；
- 子应用卸载后 DOM 残留。

**二、底层原因**

普通 Vue 入口 `createApp(App).mount('#app')` 一执行就渲染，没有给 qiankun 调度的机会。qiankun 需要子应用在正确的生命周期做正确的事：
- `bootstrap`：只初始化一次；
- `mount`：每次激活时渲染，并接收父应用传来的 `container`；
- `unmount`：每次切换走时彻底清理；
- `update`：父应用传参更新时响应。

**三、如何解决**

`demos/child-main-js.good.ts` 展示：
- 使用 `renderWithQiankun` 暴露生命周期；
- `mount` 时根据 `props.container` 决定挂载点；
- `unmount` 时调用 `app.unmount()` 并清空引用；
- 独立运行判断 `if (!qiankunWindow.__POWERED_BY_QIANKUN__)`。

`demos/child-main-js.bad.ts` 展示普通入口。

**四、为什么要这样解决**

- `container.querySelector('#app')` 保证子应用渲染在 qiankun 提供的容器内，而不是整个 `document`；
- 卸载时清理引用，避免 Vue 组件实例、定时器、事件监听残留；
- 独立运行判断让子应用开发时不依赖父应用也能跑。

**五、核心原理**

- `renderWithQiankun` 本质是 qiankun 约定的协议：子应用必须暴露生命周期函数；
- qiankun 通过 `single-spa` 在路由变化时调用 `mount/unmount`，子应用不能自己抢跑；
- `qiankunWindow` 是 `vite-plugin-qiankun` 提供的对真实 `window` 的引用，用于判断运行环境而不破坏沙箱。

### 6.4 小节 4：子应用内部路由 base 适配

**一、现象/问题**

子应用内部路由跳转正常，但嵌入主应用后：
- 从 `/dashboard/micro-vue/list` 跳 `/dashboard/micro-vue/detail`，子应用内部路由不响应；
- 刷新 `/dashboard/micro-vue/detail` 直接 404；
- 子应用 `router.push('/list')` 把主应用 URL 改成了 `/list`，跳出子应用范围。

**二、底层原因**

Vue Router 的 `createWebHistory` 需要一个 `base`，独立运行时 base 是 `/`，但在主应用里子应用挂载在 `/dashboard/micro-vue` 下。如果子应用仍然以 `/` 为 base，它的 `history` 对象会错误解析路径，导致路由不匹配或主应用路由被污染。

**三、如何解决**

`demos/child-router.good.ts` 展示：
- 根据 `qiankunWindow.__POWERED_BY_QIANKUN__` 切换 base；
- base 在主应用环境中设为 `/dashboard/micro-vue` 或对应前缀；
- 子应用内部路由路径仍然以 `/micro-vue/list`、`/micro-vue/detail` 等相对 base 的路径定义。

`demos/child-router.bad.ts` 展示固定 base 为 `/` 的情况。

**四、为什么要这样解决**

- qiankun 不会自动改写子应用路由 base，这是开发者必须显式处理的部分；
- base 一致后，子应用路由和主应用 URL 才能同步；
- 独立运行时 base 回退到 `/`，不影响本地开发。

**五、核心原理**

- HTML5 History API 的 `history.pushState` 路径是相对于 `base` 的；
- qiankun 通过 `popstate` 监听 URL 变化，并匹配 `activeRule`，子应用路由必须在同一命名空间下工作；
- 如果子应用和主应用都使用 `createWebHistory`，base 必须错开或嵌套正确，否则两者会抢 `location.pathname` 的解释权。

### 6.5 小节 5：父应用注册与激活规则

**一、现象/问题**

父应用配置后，子应用加载失败：
- `activeRule` 写错了，子应用永远不激活；
- `activeRule` 写太宽泛，多个子应用同时激活；
- `entry` 协议写错，浏览器报 `Failed to fetch`；
- `start()` 没调用，qiankun 只注册不工作。

**二、底层原因**

`registerMicroApps` 只是注册表，`start()` 才开始监听路由并激活。`activeRule` 负责判断当前 URL 是否属于该子应用，`entry` 是加载入口，`name` 是唯一标识，`container` 是挂载点。任何一个字段不对，都会链式失败。

**三、如何解决**

`demos/host-register-js.good.ts` 展示完整配置：
- `name` 唯一且与子应用自身一致；
- `entry` 使用 `//localhost:8082` 或 `https://cdn.example.com/child/`；
- `container` 使用 `#micro-viewport`；
- `activeRule` 使用函数或字符串匹配主应用路径；
- 调用 `start()`。

`demos/host-register-js.bad.ts` 展示常见错误配置。

**四、为什么要这样解决**

- `name` 唯一避免 qiankun 缓存和加载冲突；
- `entry` 使用协议相对或完整 URL，开发/生产切换方便；
- 函数式 `activeRule` 适合 hash 路由或复杂前缀匹配；
- `start()` 是启动监听的必要一步，很多人忘记。

**五、核心原理**

- qiankun 基于 `single-spa` 的 `registerApplication` 封装；
- `activeRule` 可以是字符串、函数或数组，函数形式最灵活；
- 使用 HTML Entry 时，qiankun 会请求 `entry` 对应的 HTML，解析资源并插入沙箱；
- 子应用 `name` 会被用于 dom 隔离、样式前缀、错误提示等。

### 6.6 小节 6：挂载容器 DOM 与样式约定

**一、现象/问题**

子应用实际加载成功，但页面看不到：
- 主应用没有 `#micro-viewport` 元素，qiankun 找不到挂载点；
- 容器高度为 0，子应用渲染了但不可见；
- 主应用和子应用样式冲突，子应用按钮被主应用全局样式覆盖；
- 子应用卸载后，容器内残留样式或 DOM 片段。

**二、底层原因**

qiankun 把子应用整个 HTML 的内容插入 `container`，但 `container` 本身由父应用提供。如果父应用没有预留、高度为 0、或被隐藏，子应用就无法正常展示。样式隔离在 qiankun 中不是绝对隔离，主应用的全局样式仍可能影响子应用。

**三、如何解决**

`demos/host-layout-html.good.tsx` 展示：
- 在主应用布局中预留 `<div id="micro-viewport" />`；
- 给容器设置最小高度，如 `minHeight: 500px`；
- 容器使用 `overflow: auto` 或 `position: relative`；
- 提示：不要把 `#micro-viewport` 放在会被 `display: none` 包裹的组件里。

`demos/host-layout-html.bad.html` 展示没有容器或高度为 0 的情况。

**四、为什么要这样解决**

- 子应用本身不能控制自己的根容器，它只能渲染到 qiankun 指定的 DOM 节点；
- 高度、overflow、定位由父应用决定，才能保证子应用滚动和布局正常；
- 样式冲突需要父应用尽量避免写全局标签选择器。

**五、核心原理**

- qiankun 在 mount 时会把子应用 `entry` 的 `<body>` 内内容克隆到 `container`，子应用的 `#app` 也会被移入容器；
- 子应用 `document` 和 `window` 被代理，但 CSSOM 中的选择器不会被自动改写，因此需要父应用控制全局样式；
- 容器高度、定位、滚动策略是父应用布局的责任，不是子应用能决定的。

## 7. 数据与代码分离

- `data.ts` 只存放标题、段落、列表、原理说明等纯文本；
- 所有代码示例通过 `import xxx from './demos/xxx.bad.ts?raw'` 引入；
- `.bad.ts` 文件会被 `tsconfig.json` 的 `exclude` 排除，避免类型检查报错；
- 代码注释使用中文，详尽解释每个字段、函数、坑点。

## 8. 代码规范

- 使用 Ant Design 组件：Typography、Card、Space、Alert、Switch、Collapse、List；
- 使用 `CodeDiff` 组件展示 Bad/Good 对比；
- 组件内部不使用 styled-components，样式变量统一放在页面最后（如需）；
- 所有代码注释和文档解释使用中文；
- 路由页面组件单独放在 `qiankun/basic/` 目录下，相关文件全部放在该目录内。

## 9. 验收标准

- [ ] 主应用菜单新增 `qiankun 专题` → `乾坤基础`；
- [ ] 访问 `/dashboard/qiankun/basic` 能正常打开页面；
- [ ] 页面包含 6 个小节，每个小节都有"五维度"结构；
- [ ] 每个小节至少包含一个 CodeDiff，代码从 `demos/` 通过 `?raw` 引入；
- [ ] 代码注释详尽，中文，覆盖字段含义和注意事项；
- [ ] Live Demo 是静态配置开关，能判断当前配置是否可运行；
- [ ] 不依赖 micro-vue 实际运行，不改动子应用源码；
- [ ] 通过 `npm run lint` 和 `npm run typecheck`（或项目当前等效命令）。

## 10. 后续可扩展项

- 子应用：应用间通信（props、全局事件、shared state）；
- 子应用：样式隔离与沙箱机制；
- 子应用：预加载与性能优化；
- 子应用：子应用独立部署与加载策略；
- 子应用：公共依赖共享与依赖治理。
