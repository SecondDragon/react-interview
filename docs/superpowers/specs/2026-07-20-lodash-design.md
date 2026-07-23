# lodash 手写函数库专题设计

## 1. 目标

在 `react-interview` 主应用内新增一个“lodash 手写函数库”专题，帮助面试者/学习者从最简单可运行的版本开始，逐步理解并实现接近真实 lodash 的 `debounce` 与 `throttle`。未来可横向扩展更多函数（如 `cloneDeep`、`isEqual`、`groupBy` 等）。

## 2. 范围

- 概览页：列出常用 lodash 函数，重点高亮已实现的函数并提供入口。
- 函数页（本次实现）：`debounce`、`throttle`。
- 每个函数页内部提供三个版本：最简版（Simple）→ 复杂版（Complex）→ 完全版（Complete），使用 Tabs 切换。
- 每个版本必须包含：完整源码、演进说明、可交互的 LiveDemo。

## 3. 目录与路由

### 3.1 文件目录

```
src/pages/lodash/
├── overview/                 # 专题概览页
│   ├── index.tsx
│   ├── content.mdx
│   └── data.ts
├── debounce/                 # 防抖专题
│   ├── index.tsx
│   ├── content.mdx
│   ├── data.ts
│   ├── LiveDemo.tsx
│   └── demos/
│       ├── simple.ts
│       ├── complex.ts
│       └── complete.ts
└── throttle/                 # 节流专题
    ├── index.tsx
    ├── content.mdx
    ├── data.ts
    ├── LiveDemo.tsx
    └── demos/
        ├── simple.ts
        ├── complex.ts
        └── complete.ts
```

### 3.2 路由

| 路径 | 页面 | 说明 |
| --- | --- | --- |
| `/dashboard/lodash/overview` | 概览页 | 左侧菜单入口为“lodash 手写函数库” |
| `/dashboard/lodash/debounce` | 防抖 | 子菜单项“防抖（debounce）” |
| `/dashboard/lodash/throttle` | 节流 | 子菜单项“节流（throttle）” |

路由注册在 `src/router/config.tsx` 中按现有懒加载模式新增。

## 4. 页面结构

### 4.1 概览页

`content.mdx` 负责文字内容：

- 专题说明：为什么要手写 lodash？
- 常用函数分类卡片（函数控制、集合/数组、对象、Lang、字符串、数学）。
- 已实现的函数（debounce、throttle）使用高亮卡片，并链接到对应子页面。
- 未实现函数置灰展示，提示后续更新。

`data.ts` 存放分类和函数列表的结构化数据。

`index.tsx` 只负责渲染 `content.mdx`。

### 4.2 函数页（debounce / throttle）

`content.mdx` 文字内容：

- 函数概念简述。
- 三个 Tab 的通用说明：最简版、复杂版、完全版分别要掌握什么。
- 每个 Tab 内渲染对应的代码展示和 LiveDemo。

`data.ts` 存放：

- Tab 配置（key、label、对应源码文件路径字符串用于说明）。
- Demo 用的配置项（默认 wait 时间、最大 wait 选项等）。
- 版本对比要点（用列表/表格展示）。

`index.tsx` 使用 `Tabs` 管理当前激活版本，并渲染 `content.mdx`。Tabs 的 activeKey 通过 React Context 或 props 透传给 `content.mdx`，但 `.mdx` 中只负责调用 `LiveDemo` 组件，不直接管理状态。

## 5. 版本演进定义

### 5.1 debounce 三版本

| 版本 | 核心能力 | 与 lodash 的差异 |
| --- | --- | --- |
| 最简版 | 利用 `setTimeout` + `clearTimeout` 延迟执行 | 无 leading/trailing、无 cancel/flush、this 和 arguments 处理不完整 |
| 复杂版 | 增加 `leading` / `trailing` 选项，支持 `cancel` | 无 `maxWait`，返回值未精确模拟，this 和 args 使用 `apply` 正确传递 |
| 完全版 | 增加 `maxWait`、正确的 `flush`、函数返回最后一次实际调用结果、完整的 `pending()` 查询 | 接近 lodash 行为，但实现保持可读，不引入 lodash 内部工具函数 |

### 5.2 throttle 三版本

| 版本 | 核心能力 | 与 lodash 的差异 |
| --- | --- | --- |
| 最简版 | 基于时间戳或 `setTimeout` 限制执行频率 | 无 leading/trailing 控制、无 cancel |
| 复杂版 | 基于 `debounce` 实现，支持 `leading` / `trailing` 选项 | 未完整处理 `maxWait` 和返回值 |
| 完全版 | 完整 leading/trailing 组合，支持 `cancel`、`flush`、返回上一次执行结果 | 与 lodash `throttle` 语义一致 |

## 6. 代码展示规范

- 三个版本的源码分别放在 `demos/simple.ts`、`demos/complex.ts`、`demos/complete.ts`。
- `content.mdx` 通过 `?raw` 导入源码：

  ```mdx
  import simpleCode from './demos/simple.ts?raw';
  import complexCode from './demos/complex.ts?raw';
  import completeCode from './demos/complete.ts?raw';
  ```

- 使用 `CodeDiff` 展示版本演进：
  - 最简版：仅展示完整代码。
  - 复杂版：Diff 从 `simple.ts` → `complex.ts`。
  - 完全版：Diff 从 `complex.ts` → `complete.ts`。
- 每个 Tab 同时提供“当前版本完整代码”的 CodeBlock，确保满足“每个章节要有完整代码”的要求。
- `demos/` 下的 `.ts` 文件不参与运行时执行，仅用于 `?raw` 提取；通过 `tsconfig.json` 的 `exclude` 或模块命名避免影响编译（参考项目已有 `demos/*.bad.tsx` 模式）。

## 7. LiveDemo 设计

### 7.1 debounce LiveDemo

- 输入框：用户连续输入，实时统计“原始触发次数”和“实际执行次数”。
- 控制项：wait 时间滑块（0ms / 200ms / 500ms / 1000ms）。
- 可选：leading/trailing 开关（在复杂版/完全版启用）。
- 时间轴：用 Ant Design 的 Timeline/Steps 展示每次输入和防抖后执行时刻。
- 重置按钮：清空统计。

### 7.2 throttle LiveDemo

- 按钮/滑块：用户高频点击或拖动，统计原始事件次数和节流后执行次数。
- 控制项：wait 时间滑块；leading/trailing 开关（复杂版/完全版）。
- 可视化：进度条或时间轴展示 leading/trailing 执行点。
- 重置按钮。

## 8. MDX 规范

- `content.mdx` 只做两件事：写 markdown 文本、导入组件并调用。
- 禁止在 `.mdx` 中写 `.map()`、条件渲染、解构赋值等运行时语句。
- 顶层 import 使用完整组件路径，例如 `import { Typography } from 'antd';` 后使用 `<Typography.Title>`，而非 `const { Title } = Typography;`。
- 交互逻辑封装在 `LiveDemo.tsx`，`content.mdx` 只负责 `<LiveDemo />`。

## 9. 路由与菜单

- 在 `src/router/config.tsx` 中新增 `lodash` 路由组：

  ```tsx
  const LodashOverview = lazy(() => import('../pages/lodash/overview/index'));
  const LodashDebounce = lazy(() => import('../pages/lodash/debounce/index'));
  const LodashThrottle = lazy(() => import('../pages/lodash/throttle/index'));
  ```

- 菜单结构：

  ```
  lodash 手写函数库
  ├── 概览
  ├── 防抖（debounce）
  └── 节流（throttle）
  ```

## 10. 测试与验证

- 实现完成后运行 `npm run lint`（或项目对应命令）检查格式与规则。
- 运行 `npm run build`（或 `npx tsc --noEmit`）检查类型。
- 在浏览器中打开三个路由，验证：
  - 概览页菜单和链接可正常跳转。
  - debounce / throttle 三个版本 Tab 可切换。
  - LiveDemo 能正确统计次数并展示时间轴。
  - CodeDiff 和 CodeBlock 正确显示源码。

## 11. 后续扩展（本次不实现）

- 在概览页中“未实现”的函数卡片后续可扩展为新的子页面，例如 `cloneDeep`、`isEqual`、`groupBy`、`chunk`、`uniqBy`、`get/set` 等。
- 新函数页面遵循与 debounce/throttle 相同的目录结构：三个版本 + LiveDemo + content.mdx + data.ts。
