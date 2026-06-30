# JavaScript 模块化（CommonJS vs ES Module）- 设计文档

## 1. 项目概述

**目标**：在 `react-interview` 主应用的 `JavaScript 基础` 专题下新增一个菜单项，系统性讲解 JavaScript 的两种模块化方案：CommonJS 与 ES Module，覆盖语法、运行时数据结构、执行流程、循环依赖、常见 bug、Webpack 打包差异及与 V8 执行模型的关系。

**范围**：本次实现一个单页面专题 `/dashboard/js-basics/module-systems`，包含 CommonJS 详解、ES Module 详解、两者对比、Webpack 打包差异、V8 执行模型关联、互动演示及面试高频考点。

---

## 2. 目录结构

```
src/pages/js-basics/module-systems/
├── index.tsx                        # 主页面，按章节组合展示
├── data.ts                          # 纯数据：描述、对比表、原理要点、面试题
├── LiveDemo.tsx                     # 互动演示：阶段推进器 + 循环依赖数据结构
├── demos/                           # 源码提取目录（Vite ?raw 导入，不编译执行）
│   ├── commonjs-native.bad.cjs      # 反面：错误使用 require 时机 / 值引用
│   ├── commonjs-native.good.cjs     # 正面：正确理解 module.exports 与 require 时序
│   ├── commonjs-circular.bad.cjs    # 反面：循环依赖中读取到 undefined
│   ├── commonjs-circular.good.cjs   # 正面：延迟访问 / 导出函数绕过循环依赖
│   ├── esm-circular.bad.mjs         # 反面：循环依赖中触发 TDZ
│   ├── esm-circular.good.mjs        # 正面：导出函数 / 避免在顶层立即访问
│   ├── webpack-cjs-vs-esm.bad.ts    # 反面：混用 CJS 导致 tree-shaking 失效
│   └── webpack-cjs-vs-esm.good.ts   # 正面：全部使用 ESM 并开启静态使用
└── sections/                        # 各章节组件（主页面仅组合展示）
    ├── CommonJSIntro.tsx            # 一、CommonJS 详解
    ├── ESModuleIntro.tsx            # 二、ES Module 详解
    ├── Comparison.tsx               # 三、CommonJS vs ES Module 对比
    ├── WebpackBundling.tsx          # 四、Webpack 打包差异
    └── V8Relation.tsx               # 五、与 V8 执行模型的关系
```

---

## 3. 路由配置

在 `src/router/config.tsx` 中新增：

```tsx
// 懒加载组件
const ModuleSystems = lazy(() => import('../pages/js-basics/module-systems/index'));

// 在 /dashboard/js-basics 路由下新增子项
{
  path: '/dashboard/js-basics/module-systems',
  label: 'JavaScript 模块化',
  element: <ModuleSystems />,
}
```

---

## 4. 页面结构

主页面按以下线性递进结构组织，每章使用 Ant Design `Card` + `Typography` 展示，代码示例使用 `CodeDiff` 组件对比 Bad/Good：

### 4.1 一、问题现象：为什么需要模块化

- 全局变量污染、命名冲突、依赖关系难以维护
- 代码加载顺序不可控，难以按需加载
- 面试高频：为什么 `import` 不能放在 `if` 语句里？CommonJS 与 ES Module 能混用吗？

### 4.2 二、CommonJS 详解（CommonJSIntro.tsx）

#### 4.2.1 语法与核心概念
- `require(id)`：同步加载模块，返回 `module.exports`
- `module.exports`：模块真正的导出对象，初始为 `{}`
- `exports`：`module.exports` 的引用，只能附加属性，不能整体赋值

#### 4.2.2 运行时数据结构
- `Module` 对象：包含 `id`、`filename`、`exports`、`parent`、`children`、`loaded` 等字段
- `require.cache` / `Module._cache`：已加载模块缓存，避免重复执行
- `module.exports` 初始为 `{}`，顶层代码执行后可能替换为新的对象或基本类型

#### 4.2.3 执行流程（以 Node.js 原生为例）
1. `require('x')` 调用 `Module._resolveFilename` 解析路径
2. `Module._load` 检查缓存，若未加载则创建 `Module` 实例
3. 调用 `Module.load` 读取文件内容并包装成函数
4. 同步执行模块顶层代码，填充 `module.exports`
5. 返回 `module.exports`

#### 4.2.4 循环依赖示例

以 `a.js → b.js → a.js` 为例：
- `a` 开始执行，执行到 `require('./b')` 时暂停
- `b` 开始执行，执行到 `require('./a')` 时，从缓存中拿到 `a` 的半成品 `module.exports`
- `b` 执行完成返回其 `module.exports`
- `a` 继续执行，最终完成自己的 `module.exports`

展示数据结构的要点：缓存中 `a` 的 `module.exports` 在 `b` 执行时已经存在，但尚未被完全填充。

#### 4.2.5 常见 bug 与最佳实践
- `exports = { ... }` 导致引用断开，外部模块读取不到
- 在循环依赖中读取到 `undefined`（对方模块尚未执行到导出语句）
- 用 `module.exports = function` 后又继续 `exports.x = ...` 导致失效
- 推荐：始终通过 `module.exports` 统一导出，循环依赖时尽量导出函数并延迟调用

### 4.3 三、ES Module 详解（ESModuleIntro.tsx）

#### 4.3.1 语法与核心概念
- 静态声明：`import { a } from './a.mjs'`、`export const a = 1`
- 默认导出：`export default`、命名导出：`export const` / `export { ... }`
- 命名空间导入：`import * as mod from './mod.mjs'`
- 动态导入：`const mod = await import('./mod.mjs')`，返回 Module Namespace Object

#### 4.3.2 三阶段与数据结构

以带循环依赖的 `a.mjs → b.mjs → a.mjs` 为例，详细展示每一步：

**阶段一：构造（Construction）**
- 解析入口模块，递归发现并加载所有依赖
- 为每个模块创建 **Module Record**（记录 `RequestedModules`、`ImportEntries`、`LocalExportEntries`、`IndirectExportEntries`、`StarExportEntries`）
- 使用 **Module Map**（URL → Module Record）去重，保证同一模块只被加载一次
- 循环依赖在此阶段被识别为已存在的键，不会重复加载

数据结构变化：
- Module Map 新增 `a.mjs`、`b.mjs`
- 每个 Module Record 的 `Status` 为 `new` → `uninstantiated`

**阶段二：实例化（Instantiation）**
- 为每个模块创建 **Module Environment Record**（词法环境记录）
- 为所有 `export` 声明分配内存槽位（binding），初始为 `uninitialized`（即 TDZ）
- 为所有 `import` 声明创建 **Import Binding**，指向被导入模块对应 export 的内存槽位
- 循环依赖通过预先建立 Import Binding 解决：`b` 对 `a` 的 import 直接引用 `a` 的 binding 槽位，而不是求值后的快照

数据结构变化：
- 每个模块的 `[[Environment]]` 被创建
- `export` 对应的 binding 被标记为 `uninitialized`
- `import` 被解析为 `[[ImportBinding]]`：`(module, bindingName)` 二元组
- Module Map 中模块状态变为 `instantiated`

**阶段三：求值（Evaluation）**
- 按后序遍历（深度优先）执行模块顶层代码
- 遇到循环依赖时，通过 `Status` 标记（`evaluating` / `evaluated`）避免重复执行
- 执行到 `export const x = 1` 时，对应的 binding 从 `uninitialized` 变为具体值
- 由于 `import` 是绑定引用，一旦 `a` 的 binding 被填充，`b` 中读取到的值自动同步更新

数据结构变化：
- 模块 `Status`：`uninstantiated` → `evaluating` → `evaluated`
- binding 值：`uninitialized` → 具体值
- 循环依赖中，先进入求值的模块状态为 `evaluating`，返回时变为 `evaluated`

#### 4.3.3 循环依赖示例

`a.mjs`：
```js
import { b } from './b.mjs';
export const a = 'a';
console.log('in a, b =', b); // b 已经实例化但可能尚未求值完成
```

`b.mjs`：
```js
import { a } from './a.mjs';
export const b = 'b';
console.log('in b, a =', a); // a 处于 TDZ 或已求值
```

展示要点：
- 实例化阶段 `a` 和 `b` 的 binding 都已存在，但值未初始化
- 求值顺序取决于入口，先求值的模块访问后求值模块可能触发 TDZ
- 推荐循环依赖中导出函数，避免在顶层立即访问对方变量

#### 4.3.4 常见 bug 与最佳实践
- 在模块顶层代码执行前访问 `import` 变量会触发 **TDZ（Temporal Dead Zone）** 错误
- 在循环依赖中读取 `export const` 可能拿到未初始化的 binding
- `export default` 导出的是表达式求值后的值，而不是绑定（与命名导出不同）
- 动态 `import()` 返回的 Namespace Object 是快照，后续重新赋值不会同步
- 推荐：命名导出优先用于需要热更新/绑定同步的场景；循环依赖时导出函数并延迟调用

### 4.4 四、CommonJS vs ES Module 对比（Comparison.tsx）

| 维度 | CommonJS | ES Module |
|------|----------|-----------|
| 加载时机 | 运行时同步加载 | 构建/解析时静态分析，运行时分阶段执行 |
| 导出类型 | 值的拷贝（对象引用或基本类型快照） | 动态绑定（live binding） |
| 顶层 this | 当前模块对象（`module.exports`） | `undefined` |
| 静态分析 | 否，`require` 路径可动态计算 | 是，`import` 路径必须在顶层且为字符串字面量 |
| 循环依赖 | 返回半成品 `module.exports` | 返回未初始化的 binding，求值后自动更新 |
| 动态导入 | `require` 本身动态，但同步 | `import()` 异步，返回 Promise |
| 执行模型 | 解析→立即执行脚本 | 构造→实例化→求值三阶段 |
| 打包友好性 | 不利于 tree-shaking 和 scope hoisting | 利于 tree-shaking 和 scope hoisting |
| 在 if/for 中使用 | 可以 | 不可以（语法错误） |

### 4.5 五、Webpack 打包差异（WebpackBundling.tsx）

#### 4.5.1 源码写法差异
- 全部使用 ESM：`import { foo } from './foo'`
- 混用 CJS：`const foo = require('./foo')` 或 `module.exports = ...`

#### 4.5.2 产物形态
- ESM 被转译为 `__webpack_require__.d(__webpack_exports__, { foo: () => foo })`：使用 getter 实现 live binding
- CJS 被转译为 `module.exports = ...` 或 `__webpack_require__.n` 兼容包装器
- 动态 `import()` 被拆分为单独 chunk，使用 `__webpack_require__.e` 加载

#### 4.5.3 对 tree-shaking 的影响
- Webpack 需要静态分析才能确定哪些导出被使用
- 如果源码中存在 `require` 或 `module.exports`，Webpack 无法安全删除未使用导出，tree-shaking 效果下降
- `sideEffects` 配置在 ESM 项目下才能准确标记无副作用模块

#### 4.5.4 最佳实践
- 新项目统一使用 ESM 语法
- 需要兼容 CJS 时，使用 `export default` 或 `export =`（TS）并配合 `esModuleInterop`
- 避免在 ESM 源码中混用 `require`，除非显式使用 `createRequire`

### 4.6 六、与 V8 执行模型的关系（V8Relation.tsx）

#### 4.6.1 V8 执行流水线
- 解析（Parser / Pre-parser）：生成 AST
- 编译（Ignition 字节码 / TurboFan 优化机器码）
- 执行：运行字节码或机器码

#### 4.6.2 CommonJS 与 V8 的关系
- 每次 `require` 时，Node.js 读取文件内容并通过 `vm.runInThisContext` 或包装函数执行
- 直接触发 V8 的解析→编译→执行流程，没有独立的实例化阶段
- 因此 `module.exports` 是执行后得到的对象快照，不支持 live binding

#### 4.6.3 ES Module 与 V8 的关系
- 构造阶段：模块加载器在 V8 外部维护 Module Map，不直接执行 V8
- 实例化阶段：V8 创建模块的 **Module Environment Record**，分配 bindings；这一步发生在 V8 内部，但由模块加载器驱动
- 求值阶段：调用 V8 的 `Module::Evaluate`，执行顶层代码，触发解析→编译→执行
- 循环依赖中的 `evaluating` 状态由模块加载器维护，V8 只负责执行单个模块的脚本

### 4.7 七、互动演示（LiveDemo.tsx）

使用 Ant Design `Tabs` + `Steps` + `Card` + `Table` 实现阶段推进器：

- **Tab 1：CommonJS 模块状态机**
  - 展示 `a → b → a` 循环依赖中 `module.exports` 从 `{}` 到最终值的变化
  - 每步显示缓存状态、当前执行模块、已导出字段

- **Tab 2：ES Module 三阶段**
  - 使用 Steps 切换构造→实例化→求值
  - 展示 Module Map、Module Record、Environment Record、Bindings
  - 支持循环依赖开关，展示 TDZ 状态与求值后状态

- **Tab 3：Webpack 产物对比**
  - 展示 ESM 源码与 CJS 源码分别被 Webpack 转译后的产物片段
  - 用 `CodeDiff` 对比 `__webpack_require__.d` 与 `module.exports`

### 4.8 八、核心原理与面试考点

- 为什么 CommonJS 的 `exports` 不能直接赋值？
- CommonJS 循环依赖为什么会读到 `undefined`？如何避免？
- ES Module 的 TDZ 在什么时候出现？与 `let/const` 的 TDZ 有何异同？
- ES Module 的 live binding 是如何实现的？
- `export default` 与命名导出的绑定行为有什么区别？
- Webpack 为什么需要 ESM 才能做 tree-shaking？
- 动态 `import()` 返回的是快照还是绑定？

---

## 5. 代码组织规范

### 5.1 数据与代码分离
- `data.ts` 只存放纯数据：描述文本、对比表、原理要点、面试题
- 所有通过 `CodeDiff` 展示的代码必须提取到 `demos/` 目录，通过 `?raw` 导入

### 5.2 源码提取规范
```typescript
import commonjsBadCode from './demos/commonjs-native.bad.cjs?raw';
import commonjsGoodCode from './demos/commonjs-native.good.cjs?raw';

<CodeDiff
  oldValue={commonjsBadCode}
  newValue={commonjsGoodCode}
  leftTitle="❌ 反面教材"
  rightTitle="✅ 最佳实践"
  type="error"
  hideDiffMarkers={true}
/>
```

### 5.3 文件命名约定
- 反面教材：`.bad.cjs` / `.bad.mjs` / `.bad.ts` 后缀
- 最佳实践：`.good.cjs` / `.good.mjs` / `.good.ts` 后缀
- `.bad.*` 文件不参与类型检查，仅用于展示

### 5.4 样式规范
- 所有 styled-components 生成的样式变量放在组件文件最后
- 优先使用 Ant Design 组件和现有样式系统
- 所有注释和文档解释使用中文

---

## 6. 实现顺序

1. 创建目录结构 `src/pages/js-basics/module-systems/`
2. 实现 `data.ts` 元数据与对比数据
3. 实现 `demos/` 下的 Bad/Good 代码文件
4. 实现 `LiveDemo.tsx` 阶段推进器
5. 实现各章节组件 `sections/*.tsx`
6. 实现主页面 `index.tsx` 组合所有章节
7. 在 `src/router/config.tsx` 中注册新路由
8. 验证路由可访问、页面渲染正常、类型检查通过

---

## 7. 注意事项

- 所有代码注释和文档解释必须使用中文
- 遵循现有项目的代码风格和命名规范
- 懒加载组件以优化首屏性能
- `.bad.cjs` / `.bad.mjs` / `.bad.ts` 文件必须被 TypeScript 排除，避免编译错误
- 确保新路由与 qiankun 微应用集成无冲突
- 互动演示中的数据结构展示应准确反映 ECMAScript 规范语义，避免过于简化导致误导
