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
