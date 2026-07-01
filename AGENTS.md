# react-interview - 主系统规范

## 项目概述

**react-interview** 是前端面试知识体系系统的主应用（Host），负责整体布局、权限管理、路由分发，以及 React 相关和通用前端知识（如网络、安全、性能优化等）的演示。

所有子应用（如 `@micro-vue`）均通过 **qiankun** 集成至本主应用。

---

## 核心开发指令 (Mandates)

### 1. 兼容性案例页面标准 (`@src/pages/compatibility/**`)

当在该目录下新建或重构组件以解决兼容性/特定类型 Bug 时，**必须**严格遵循以下五个维度的结构进行内容组织：

1. **一、Bug 出现的现象：**
   - 描述直观的错误表现（如：光标跳变、样式错位、功能失效）。
   - 区分不同平台（iOS/Android/Windows/Mac/信创）的差异化表现。
2. **二、Bug 出现的底层原因：**
   - 从浏览器内核（Chromium/WebKit/Gecko）、系统底层机制、W3C 规范偏离等角度深度剖析"为什么会坏"。
3. **三、Bug 如何解决：**
   - 提供清晰、简洁的修复方案。
   - 使用 `CodeDiff` 组件对比"反面教材 (Bad Practice)"与"最佳实践 (Best Practice)"。
4. **四、为什么要这样解决且新增互动演示 (Live Demo)：**
   - 阐述选择该方案的权衡（性能、兼容性、维护成本）。
   - **必须**包含一个可交互的 `Live Demo` 区域（使用 Ant Design 组件模拟 Bug 场景与修复后的对比），让用户能亲手感触差异。
5. **五、Bug 能解决的核心原理：**
   - 挖掘代码背后的"硬核"逻辑。
   - 例如：`font-family` 的字符级回退机制、`requestAnimationFrame` 对宏任务的时序控制、`VisualViewport` 的真实视口偏移计算等。

#### 多方案章节规范

当一个问题存在**多种解决方案**时，**每种方案都必须被视为一个独立的章节**，各自遵循完整的 Five Dimensions 结构，并包含该方案的**优缺点清单**（使用 List 组件展示）。每种方案应拆分为独立的组件文件，主页面仅负责组合展示和综合对比。

### 2. 性能优化页面标准 (`@src/pages/performance/**`)

参考兼容性案例标准，性能优化页面遵循以下结构：

1. **一、性能问题出现的现象：**
   - 描述如果不采用优化方式，在这个页面出现的时候可能会导致什么问题（如：页面白屏时间过长、弹窗加载过慢等）。
2. **二、性能问题出现的底层原因：**
   - 例如从 JS 的加载、webpack 或者 vite 的打包方式、浏览器的加载策略等方面来进行解释。
3. **三、这种优化方法一般在开发中适合在哪些场景中使用：**
   - 举出比较适合使用这种优化方法的场景，一定要贴近日常开发。
4. **四、为什么要这样解决且新增互动演示 (Live Demo)：**
   - 阐述选择该方案的权衡（性能、兼容性、维护成本）。
   - **必须**包含一个可交互的 `Live Demo` 区域，使用 Ant Design 组件模拟场景与修复后的对比，让用户能亲手感触差异。
   - 针对性能优化，如果同一个组件在优化之后无法直接显示差异，可以使用不同的但具有说服力的组件来展示优化效果。
5. **四、代码演示：**
   - 提供清晰、简洁的优化方案。
   - 使用 `CodeDiff` 组件对比"反面教材 (Bad Practice)"与"最佳实践 (Best Practice)"。
6. **五、核心原理解释：**
   - 挖掘代码背后的"硬核"逻辑。

> `@src/pages/performance/Waterfall/**` 下的组件可以不遵循上述标准。

---

## 新增：MDX 内容承载规范

### 3. 新页面默认使用 MDX 承载内容 (`@src/pages/**/*.mdx`)

从本规范生效之日起，**新创建的教程页面**默认使用 `.mdx` 文件承载文字、图表、代码对比与结构说明；React 组件仅负责承载交互逻辑（Live Demo、性能组件、控制面板等）。

旧页面保持原有 `data.ts + chapters/` 结构不变，除非用户明确要求重构。

#### 3.1 目录结构

```text
pages/SomeTopic/
├── index.tsx          # 主页面，导入并渲染 content.mdx
├── content.mdx        # 教程正文：文字、图表、代码对比、组件嵌入
├── data.ts            # 纯组件数据：配置、初始状态、对比表格、小型 snippet
├── LiveDemo.tsx       # 互动演示组件（如需要）
├── SomeComponent.tsx  # 性能组件或其他需要渲染的真实组件
└── demos/
    ├── topic-name.bad.tsx    # 反面教材（仅用于 ?raw 提取，不编译执行）
    └── topic-name.good.tsx   # 最佳实践（仅用于 ?raw 提取）
```

#### 3.2 `content.mdx` 编写规范

`.mdx` 文件中可以写 Markdown 原生内容，也可以直接 import React 组件和 `?raw` 源码。

```mdx
import { CodeDiff } from '@/components/CodeDiff';
import { LiveDemo } from './LiveDemo';
import { OptimizedList } from './OptimizedList';
import badCode from './demos/topic.bad.tsx?raw';
import goodCode from './demos/topic.good.tsx?raw';

# 标题

这里是文字说明。

## 代码对比

<CodeDiff
  oldValue={badCode}
  newValue={goodCode}
  leftTitle="❌ 反面教材"
  rightTitle="✅ 最佳实践"
  type="error"
  hideDiffMarkers={true}
/>

## 互动演示

<LiveDemo />
```

#### 3.3 代码对比必须使用 `CodeDiff` 组件

MDX 中需要展示左右并排代码或 diff 对比时，**统一使用项目已有的 `CodeDiff` 组件**，通过 `?raw` 导入 `demos/` 目录下的源码。禁止在 `.mdx` 中手写大段代码字符串用于对比。

#### 3.4 性能组件直接作为 React 组件渲染

性能优化专题中需要展示真实优化组件时，应将该组件作为独立 React 组件实现，并在 `.mdx` 中 import 渲染。

```mdx
import { UnoptimizedList } from './UnoptimizedList';
import { OptimizedList } from './OptimizedList';

<div className="grid grid-cols-2 gap-4">

<div>
**未优化版本**
<UnoptimizedList data={mockData} />
</div>

<div>
**优化版本**
<OptimizedList data={mockData} />
</div>

</div>
```

#### 3.5 `data.ts` 职责边界

`data.ts` **只存放 React 组件需要的数据**，包括但不限于：

- Live Demo 的初始状态、配置项
- 对比表格数据
- 小型 snippet（用于组件内部逻辑）
- 性能测试用的 mock 数据

`data.ts` **不再存放**：

- 大段文字说明
- 概念性解释
- 图表说明
- 步骤性讲解

上述内容必须迁移到 `.mdx` 文件中。

---

#### 3.6 MDX 文件只允许顶层 import/export

`.mdx` 文件本质上是编译为 JSX 的模块，**仅支持顶层 `import` 和 `export` 语句**，不支持运行时语句（如变量声明、函数声明、解构赋值等）。

因此，如果需要使用组件的属性或解构子组件，**必须通过完整路径调用**，禁止在 `.mdx` 中写解构赋值。

✅ 正确示例：

```mdx
import { Card, Typography } from 'antd';

<Typography.Title level={2}>标题</Typography.Title>

<Card title="内容">
  ...
</Card>
```

❌ 错误示例：

```mdx
import { Card, Typography } from 'antd';

const { Title } = Typography;

<Title>标题</Title>
```

同理，像 `const { Meta } = Card`、`const { Paragraph } = Typography` 等解构写法均不允许。应使用 `Card.Meta`、`Typography.Paragraph` 等完整路径。

> 说明：MDX 编译器会将 `.mdx` 文件视为 ES Module，文件中除 import/export 外的顶层语句会破坏模块结构，导致运行时错误（如 `Expected component X to be defined`）。

---

#### 3.7 Mermaid 图表使用规范

在 `.mdx` 中使用 Mermaid 图表时，应遵循以下规范：

1. **图表源文件独立存放**：将 Mermaid 源码保存为独立的 `.mmd` 文件，统一放在页面目录下的 `diagrams/` 子目录中：
   ```text
   pages/SomeTopic/
   ├── content.mdx
   ├── diagrams/
   │   └── flowchart.mmd
   └── ...
   ```

2. **通过 `?raw` 导入图表源文件**：与 `demos/` 源码提取规范保持一致，禁止在 `.mdx` 中直接写大段 Mermaid 字符串。

   ✅ 正确示例：
   ```mdx
   import MermaidViewer from '@/components/MermaidViewer';
   import flowchart from './diagrams/flowchart.mmd?raw';

   <MermaidViewer source={flowchart} />
   ```

   ❌ 错误示例：
   ```mdx
   <MermaidViewer source={`
   graph TD
     A --> B
   `} />
   ```

3. **使用统一的 `MermaidViewer` 组件**：所有 `.mdx` 文件必须通过 `@/components/MermaidViewer` 渲染图表，禁止自行引入 `mermaid` 或在 `.mdx` 中直接调用 `mermaid.render`。

4. **图表职责边界**：图表用于表达流程、结构、决策关系等概念，文字解释仍应写在 `.mdx` 正文中。不要在 `.mmd` 文件中写注释性说明（少量中文注释除外）。

5. **命名约定**：`.mmd` 文件名应与图表内容对应，使用 kebab-case，例如 `fallback-flow.mmd`、`request-lifecycle.mmd`。

6. **Mermaid 图表类型选择**：

   - **流程图（`flowchart` / `graph TD`）**：优先用于展示**静态结构、依赖关系、binding 指向、模块状态变化**等非时序概念。例如：
     - 模块依赖图（`main.mjs → a.mjs → b.mjs`）
     - Module Environment Record 中 binding 槽位的互相指向
     - 构造 / 实例化 / 求值三个阶段的状态变迁
   - **序列图（`sequenceDiagram`）**：优先用于展示**按时间顺序的交互流程**、函数调用时序、执行步骤。例如：
     - CommonJS `require` 的执行流程
     - ES Module 循环依赖中模块按顺序求值的过程
   - **状态图（`stateDiagram`）**：优先用于展示**单一实体或模块的状态机转移**。
   - **选择原则**：当需要展示“实体长什么样、互相怎么指向”时用流程图；当需要展示“谁先做什么、后做什么”时用序列图。同一知识点可以两种图并存，以互补方式展示结构与流程。

---

## 代码风格与工具要求
- **代码块展示：** 优先使用 `@src/components/CodeDiff.tsx` 组件进行代码对比展示。

- **源码提取规范（?raw 模式）：**
  - 使用 Vite 的 `?raw` 语法在构建时自动提取源码字符串，替代手写在模板字符串中的代码示例。
  - Bad/Good Code 应提取为独立的 `.tsx` / `.css` 文件，统一放在 `demos/` 子目录下。
  - 命名约定：反面教材使用 `.bad.tsx` 后缀，最佳实践使用 `.good.tsx` 后缀。
  - `.bad.tsx` 文件已被 Vite 的 `?raw` 导入，TypeScript 编译器通过 `tsconfig.json` 中的 `exclude` 排除，不会参与类型检查。

- **数据 vs 代码分离原则：**
  - `data.ts` 只存放纯数据：描述文本、原理要点、对比表格数据、互动演示的代码片段（小型 snippet 可保留字符串形式）。
  - 所有通过 `CodeDiff` 展示的 Bad/Good Code 必须提取到 `demos/` 目录下的独立文件中，通过 `?raw` 导入。
  - 示例：
    ```typescript
    import badCode from './demos/topic-name.bad.tsx?raw';
    import goodCode from './demos/topic-name.good.tsx?raw';

    <CodeDiff
      oldValue={badCode}
      newValue={goodCode}
      leftTitle="❌ 反面教材"
      rightTitle="✅ 最佳实践"
      type="error"
      hideDiffMarkers={true}
    />
    ```

- **路由页面组织：** 当新建一个路由页面组件时，要给这个组件一个单独的文件夹，它相关的所有组件内的信息都应该放到这个单独的文件夹里。
- **样式变量位置：** 所有 styled-components 生成的样式变量都放在组件页面的最后，以免影响对组件代码的阅读。

---

## 教学文档生成规范

当使用 `teach` 技能生成 HTML 教学文档时，应遵循以下要求：

1. **内容源格式：** 生成的教学文档内容源应为 `.mdx` 文件，HTML 是最终渲染形态。概念讲解、文字说明、图表、代码对比均应在 `.mdx` 中组织。
2. **结构要求：** 必须遵循本文档定义的 Five Dimensions 结构（兼容性）或性能优化六段式结构，确保知识点讲解完整。
3. **实机演示：** 必须包含可交互的 `Live Demo` 或真实组件渲染，让用户可以亲手操作、观察差异。
4. **组件解耦：** 文字性内容留在 `.mdx`，交互逻辑封装为独立 React 组件，在 `.mdx` 中 import 使用。
5. **代码对比：** 使用 `CodeDiff` 组件展示 Bad/Good 代码，源码通过 `?raw` 从 `demos/` 提取。
6. **参考文档：** 同步生成 `teach` 工作区下的 `./reference/*.html` 类型参考文档，压缩关键知识点，作为独立技术手册，便于用户后续快速查阅。参考文档不强制集成进 `react-interview` 主应用，保持独立、可打印。
7. **教程中引用参考文档：** 在 `.mdx` 或生成的 HTML 教学文档中，当讲解到概念、术语、对比表等适合速查的内容时，应通过相对链接 `./reference/<filename>.html` 指向对应的参考文档。参考文档文件名应与知识点对应，例如 `flexbox-cheatsheet.html`、`event-loop-glossary.html`。

---

## 架构改进技能衔接

当使用 `improve-codebase-architecture` 技能对教程页面或教学组件进行架构评审时：

1. 评审应关注 `.mdx` 内容与 React 组件之间的边界是否清晰。
2. 应检查 `data.ts` 是否仍包含大量文字说明，若存在则建议迁移至 `.mdx`。
3. 应检查 `Live Demo` 组件是否具备良好接口（输入配置、输出状态），便于在 `.mdx` 中复用。
4. 应检查 `CodeDiff` 调用的源码是否均来自 `demos/` 目录，避免代码字符串散落在 `.mdx` 或 `data.ts` 中。

---

## 子应用路由集成

所有子应用（如 `@micro-vue`）均通过 **qiankun** 集成至本主应用。

**操作要求：** 每当子应用中新增功能菜单或演示页面时，必须在本主应用中同步完成注册：

1. **主应用路由注册：** 在 `@react-interview/src/router/config.tsx` 中为该子应用页面配置对应的路由项，确保 URL 能够触发子应用的挂载。
2. **子应用内部路由：** 确保子应用内部的路由配置与主应用定义的路径前缀保持一致，实现无缝跳转。

---

## 优先级说明

- 本文件定义了主系统内的最高优先级规则，覆盖一切通用偏好。
- 涉及跨系统协作、路由集成标准时，必须遵循根目录下的 `AGENTS.md`。
- 旧页面在未被明确要求重构前，继续遵循其创建时的规范。
