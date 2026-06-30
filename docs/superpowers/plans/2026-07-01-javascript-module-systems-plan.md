# JavaScript 模块化（CommonJS vs ES Module）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `react-interview` 主应用的 `JavaScript 基础` 菜单下新增 `JavaScript 模块化` 单页面专题，系统讲解 CommonJS 与 ES Module 的语法、数据结构、循环依赖、Webpack 打包差异及 V8 执行模型关联。

**Architecture:** 采用线性递进式单页面，主页面组合多个章节组件；数据与代码分离，所有代码示例通过 Vite `?raw` 从 `demos/` 提取；互动演示使用阶段推进器展示 CommonJS 状态机、ES Module 三阶段数据结构、Webpack 产物对比。

**Tech Stack:** React 18 + TypeScript + Vite + Ant Design + React Router + `src/components/CodeDiff.tsx`

---

## 文件结构

```
src/pages/js-basics/module-systems/
├── index.tsx                        # 主页面
├── data.ts                          # 纯数据
├── LiveDemo.tsx                     # 互动演示
├── demos/
│   ├── commonjs-native.bad.cjs
│   ├── commonjs-native.good.cjs
│   ├── commonjs-circular.bad.cjs
│   ├── commonjs-circular.good.cjs
│   ├── esm-circular.bad.mjs
│   ├── esm-circular.good.mjs
│   ├── webpack-cjs-vs-esm.bad.ts
│   └── webpack-cjs-vs-esm.good.ts
└── sections/
    ├── CommonJSIntro.tsx
    ├── ESModuleIntro.tsx
    ├── Comparison.tsx
    ├── WebpackBundling.tsx
    └── V8Relation.tsx
```

---

## Task 1: 创建目录结构与空文件

**Files:**
- Create: `src/pages/js-basics/module-systems/index.tsx`
- Create: `src/pages/js-basics/module-systems/data.ts`
- Create: `src/pages/js-basics/module-systems/LiveDemo.tsx`
- Create: `src/pages/js-basics/module-systems/sections/CommonJSIntro.tsx`
- Create: `src/pages/js-basics/module-systems/sections/ESModuleIntro.tsx`
- Create: `src/pages/js-basics/module-systems/sections/Comparison.tsx`
- Create: `src/pages/js-basics/module-systems/sections/WebpackBundling.tsx`
- Create: `src/pages/js-basics/module-systems/sections/V8Relation.tsx`
- Create: `src/pages/js-basics/module-systems/demos/commonjs-native.bad.cjs`
- Create: `src/pages/js-basics/module-systems/demos/commonjs-native.good.cjs`
- Create: `src/pages/js-basics/module-systems/demos/commonjs-circular.bad.cjs`
- Create: `src/pages/js-basics/module-systems/demos/commonjs-circular.good.cjs`
- Create: `src/pages/js-basics/module-systems/demos/esm-circular.bad.mjs`
- Create: `src/pages/js-basics/module-systems/demos/esm-circular.good.mjs`
- Create: `src/pages/js-basics/module-systems/demos/webpack-cjs-vs-esm.bad.ts`
- Create: `src/pages/js-basics/module-systems/demos/webpack-cjs-vs-esm.good.ts`

- [ ] **Step 1: 创建目录与空文件**

```bash
mkdir -p src/pages/js-basics/module-systems/sections
mkdir -p src/pages/js-basics/module-systems/demos
touch src/pages/js-basics/module-systems/index.tsx
touch src/pages/js-basics/module-systems/data.ts
touch src/pages/js-basics/module-systems/LiveDemo.tsx
touch src/pages/js-basics/module-systems/sections/CommonJSIntro.tsx
touch src/pages/js-basics/module-systems/sections/ESModuleIntro.tsx
touch src/pages/js-basics/module-systems/sections/Comparison.tsx
touch src/pages/js-basics/module-systems/sections/WebpackBundling.tsx
touch src/pages/js-basics/module-systems/sections/V8Relation.tsx
touch src/pages/js-basics/module-systems/demos/commonjs-native.bad.cjs
touch src/pages/js-basics/module-systems/demos/commonjs-native.good.cjs
touch src/pages/js-basics/module-systems/demos/commonjs-circular.bad.cjs
touch src/pages/js-basics/module-systems/demos/commonjs-circular.good.cjs
touch src/pages/js-basics/module-systems/demos/esm-circular.bad.mjs
touch src/pages/js-basics/module-systems/demos/esm-circular.good.mjs
touch src/pages/js-basics/module-systems/demos/webpack-cjs-vs-esm.bad.ts
touch src/pages/js-basics/module-systems/demos/webpack-cjs-vs-esm.good.ts
```

- [ ] **Step 2: 检查 tsconfig 是否已排除 bad 文件**

确认 `tsconfig.json` 中 `exclude` 包含 `**/*.bad.*` 或类似规则，避免 `.bad.ts` 被类型检查。必要时添加：

```json
{
  "exclude": ["node_modules", "dist", "**/*.bad.*"]
}
```

- [ ] **Step 3: 提交**

```bash
git add src/pages/js-basics/module-systems/
git commit -m "chore: create module-systems directory structure"
```

---

## Task 2: 编写 data.ts 元数据与纯数据

**Files:**
- Create: `src/pages/js-basics/module-systems/data.ts`

- [ ] **Step 1: 写入元数据、现象描述、对比表、面试题等**

```typescript
/**
 * JavaScript 模块化 - 元数据与纯数据
 * 纯数据文件：不包含 Bad/Good Code，这些已提取到 demos/ 目录中
 */

export const ModuleSystemsMeta = {
  title: 'JavaScript 模块化',

  description:
    'JavaScript 模块化是面试与工程中的核心考点。本页系统对比 CommonJS 与 ES Module 两种主流方案：从语法、运行时数据结构、循环依赖处理，到 Webpack 打包差异与 V8 执行模型，帮助你避开 TDZ、undefined 导出等常见陷阱。',

  phenomenon: `在没有模块化方案时，前端代码通常通过 script 标签全局加载，带来以下问题：

1. 全局变量污染：不同文件容易定义同名变量，导致运行时互相覆盖。
2. 依赖关系不透明：无法从代码中直观看出某个文件依赖了哪些模块。
3. 加载顺序不可控：script 标签的执行顺序依赖 HTML 中的书写顺序。
4. 难以按需加载：所有代码一次性加载，不利于首屏优化和代码拆分。

面试中常见疑问：
- 为什么 import 不能放在 if 语句里？
- CommonJS 和 ES Module 能混用吗？
- 循环依赖下为什么 CommonJS 会读到 undefined，ES Module 有时却会抛 TDZ 错误？
- Webpack 为什么需要 ES Module 才能做 tree-shaking？`,

  reason: `CommonJS 设计之初服务于服务端（Node.js），强调同步加载与运行时灵活性；ES Module 则是 ECMAScript 标准，强调静态分析与编译期优化。两者在导出机制、执行模型、循环依赖处理上存在本质差异：

- CommonJS 的 module.exports 是对象引用，require 返回的是执行完成后的对象快照。
- ES Module 使用 live binding，import 实际上绑定到被导出模块的内存槽位，求值后自动同步更新。
- Webpack 需要静态 import/export 结构才能安全删除未使用代码。`,

  whySolveThisWay: `理解两种模块系统的数据结构与执行阶段，可以帮助我们在实际开发中：

1. 避免循环依赖中的 undefined / TDZ 陷阱。
2. 在需要热更新或绑定同步的场景选择命名导出而非默认导出。
3. 在 Webpack 项目中统一使用 ESM 语法，提升 tree-shaking 效果。
4. 在 Node.js 或工具链中正确混用 CJS 与 ESM，避免打包产物异常。`,

  principle: `核心原理：两种模块系统的本质差异

1. CommonJS 是运行时模块系统
   - require 是同步函数调用，模块在第一次 require 时立即执行。
   - Module._cache 缓存已加载模块，保证同一模块只执行一次。
   - module.exports 初始为 {}，执行后返回最终对象；exports 只是它的引用，不能重新赋值。

2. ES Module 是三阶段模块系统
   - 构造阶段：建立 Module Map，记录所有依赖关系。
   - 实例化阶段：为 export/import 创建 binding 并建立链接，此时值尚未初始化。
   - 求值阶段：执行顶层代码，binding 从 uninitialized 变为具体值。

3. 循环依赖处理
   - CommonJS：返回半成品 module.exports，后续代码继续填充它，但先访问方可能拿到旧值或 undefined。
   - ES Module：通过预先建立的 binding 链接，求值后自动同步更新，但先求值模块访问后求值模块可能触发 TDZ。

4. 与 V8 的关系
   - CommonJS：每次 require 直接触发 V8 的解析→编译→执行流水线。
   - ES Module：构造阶段在 V8 外部完成；实例化阶段由 V8 创建 Module Environment Record；求值阶段调用 V8 执行模块脚本。`,
};

export const comparisonData = [
  {
    key: '1',
    dimension: '加载时机',
    commonjs: '运行时同步加载',
    esm: '构建/解析时静态分析，运行时分三阶段执行',
  },
  {
    key: '2',
    dimension: '导出类型',
    commonjs: '值的拷贝（对象引用或基本类型快照）',
    esm: '动态绑定（live binding）',
  },
  {
    key: '3',
    dimension: '顶层 this',
    commonjs: '当前模块对象（module.exports）',
    esm: 'undefined',
  },
  {
    key: '4',
    dimension: '静态分析',
    commonjs: '否，require 路径可动态计算',
    esm: '是，import 路径必须在顶层且为字符串字面量',
  },
  {
    key: '5',
    dimension: '循环依赖',
    commonjs: '返回半成品 module.exports',
    esm: '返回未初始化的 binding，求值后自动更新',
  },
  {
    key: '6',
    dimension: '动态导入',
    commonjs: 'require 本身动态，但同步',
    esm: 'import() 异步，返回 Promise',
  },
  {
    key: '7',
    dimension: '执行模型',
    commonjs: '解析 → 立即执行脚本',
    esm: '构造 → 实例化 → 求值',
  },
  {
    key: '8',
    dimension: '打包友好性',
    commonjs: '不利于 tree-shaking 和 scope hoisting',
    esm: '利于 tree-shaking 和 scope hoisting',
  },
  {
    key: '9',
    dimension: '在 if/for 中使用',
    commonjs: '可以',
    esm: '不可以（语法错误）',
  },
];

export const interviewQuestions = [
  {
    key: '1',
    question: '为什么 CommonJS 的 exports 不能直接赋值？',
    answer: 'exports 只是 module.exports 的引用。若执行 exports = { ... }，会把 exports 指向新对象，但 module.exports 仍指向原来的 {}，外部 require 仍返回 module.exports，因此读取不到新对象。',
  },
  {
    key: '2',
    question: 'CommonJS 循环依赖为什么会读到 undefined？如何避免？',
    answer: '当 a 执行到 require("./b") 时暂停，b 又 require("./a")，此时 a 的 module.exports 已存在但尚未填充。若 b 立即读取 a 的导出，会拿到 undefined。避免方法：延迟访问、导出函数并在调用时读取。',
  },
  {
    key: '3',
    question: 'ES Module 的 TDZ 在什么时候出现？与 let/const 的 TDZ 有何异同？',
    answer: '实例化阶段会为所有 export 创建 binding，但值为 uninitialized。若一个模块在自身顶层代码执行前（或循环依赖中先求值时）访问另一个尚未求值的 import，就会触发 TDZ。这与 let/const 的 TDZ 本质相同：变量存在但尚未初始化。',
  },
  {
    key: '4',
    question: 'ES Module 的 live binding 是如何实现的？',
    answer: '实例化阶段，import 创建 Import Binding，指向被导出模块 export 对应的内存槽位。求值阶段，被导出模块执行 export const x = 1 时，该槽位从 uninitialized 变为具体值，所有 import 方自动读取到最新值。',
  },
  {
    key: '5',
    question: 'export default 与命名导出的绑定行为有什么区别？',
    answer: 'export default 导出的是表达式求值后的值（快照），不支持 live binding；命名导出（export const / export let）绑定到内存槽位，支持 live binding。因此热更新等场景应优先使用命名导出。',
  },
  {
    key: '6',
    question: 'Webpack 为什么需要 ESM 才能做 tree-shaking？',
    answer: 'tree-shaking 依赖静态分析确定哪些导出被使用。ESM 的 import/export 是静态声明，Webpack 可以安全分析；而 CommonJS 的 require/module.exports 是运行时动态行为，无法保证删除未使用导出不会破坏程序。',
  },
  {
    key: '7',
    question: '动态 import() 返回的是快照还是绑定？',
    answer: 'import() 返回的 Module Namespace Object 是快照：它的属性在 Promise resolve 时被读取并固定。若后续被导入模块重新赋值命名导出，Namespace Object 不会自动更新。',
  },
];
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/js-basics/module-systems/data.ts
git commit -m "feat: add module-systems data file"
```

---

## Task 3: 编写 CommonJS 示例代码（demos）

**Files:**
- Create: `src/pages/js-basics/module-systems/demos/commonjs-native.bad.cjs`
- Create: `src/pages/js-basics/module-systems/demos/commonjs-native.good.cjs`
- Create: `src/pages/js-basics/module-systems/demos/commonjs-circular.bad.cjs`
- Create: `src/pages/js-basics/module-systems/demos/commonjs-circular.good.cjs`

- [ ] **Step 1: 写入 commonjs-native.bad.cjs**

```javascript
// 反面教材：错误理解 exports 与 module.exports 的关系

// utils.js
exports = {
  foo: 'foo',
};

// main.js
const utils = require('./utils');
console.log(utils.foo); // undefined
```

- [ ] **Step 2: 写入 commonjs-native.good.cjs**

```javascript
// 最佳实践：统一使用 module.exports 导出

// utils.js
module.exports = {
  foo: 'foo',
  bar: 'bar',
};

// main.js
const utils = require('./utils');
console.log(utils.foo); // 'foo'
```

- [ ] **Step 3: 写入 commonjs-circular.bad.cjs**

```javascript
// 反面教材：循环依赖中立即读取对方导出，导致 undefined

// a.js
const b = require('./b');
console.log('in a, b.value =', b.value); // undefined
module.exports = { value: 'a' };

// b.js
const a = require('./a');
module.exports = { value: 'b', aValue: a.value }; // a.value 为 undefined
```

- [ ] **Step 4: 写入 commonjs-circular.good.cjs**

```javascript
// 最佳实践：导出函数，延迟访问

// a.js
const b = require('./b');
module.exports = {
  getValue: () => 'a',
  getBValue: () => b.getValue(),
};

// b.js
const a = require('./a');
module.exports = {
  getValue: () => 'b',
  getAValue: () => a.getValue(), // 调用时 a 已求值完成
};

// main.js
const a = require('./a');
console.log(a.getBValue()); // 'b'
```

- [ ] **Step 5: 提交**

```bash
git add src/pages/js-basics/module-systems/demos/commonjs-*.cjs
git commit -m "feat: add commonjs demo code"
```

---

## Task 4: 编写 ES Module 示例代码（demos）

**Files:**
- Create: `src/pages/js-basics/module-systems/demos/esm-circular.bad.mjs`
- Create: `src/pages/js-basics/module-systems/demos/esm-circular.good.mjs`

- [ ] **Step 1: 写入 esm-circular.bad.mjs**

```javascript
// 反面教材：循环依赖中在顶层立即访问对方命名导出，触发 TDZ

// a.mjs
import { b } from './b.mjs';
export const a = 'a';
console.log('in a, b =', b); // 可能触发 ReferenceError: Cannot access 'b' before initialization

// b.mjs
import { a } from './a.mjs';
export const b = 'b';
console.log('in b, a =', a); // 可能触发 TDZ
```

- [ ] **Step 2: 写入 esm-circular.good.mjs**

```javascript
// 最佳实践：循环依赖中导出函数，避免在顶层立即读取

// a.mjs
import { getB } from './b.mjs';
export const a = 'a';
export function getA() {
  return a;
}
export function fetchB() {
  return getB(); // 调用时 b 已完成求值
}

// b.mjs
import { getA } from './a.mjs';
export const b = 'b';
export function getB() {
  return b;
}
export function fetchA() {
  return getA(); // 调用时 a 已完成求值
}

// main.mjs
import { fetchB } from './a.mjs';
console.log(fetchB()); // 'b'
```

- [ ] **Step 3: 提交**

```bash
git add src/pages/js-basics/module-systems/demos/esm-*.mjs
git commit -m "feat: add es module circular dependency demos"
```

---

## Task 5: 编写 Webpack 对比示例代码（demos）

**Files:**
- Create: `src/pages/js-basics/module-systems/demos/webpack-cjs-vs-esm.bad.ts`
- Create: `src/pages/js-basics/module-systems/demos/webpack-cjs-vs-esm.good.ts`

- [ ] **Step 1: 写入 webpack-cjs-vs-esm.bad.ts**

```typescript
// 反面教材：混用 CommonJS 导致 Webpack 无法静态分析，tree-shaking 失效

// utils.ts
export const used = 'used';
export const unused = 'unused';

// main.ts
const utils = require('./utils');
console.log(utils.used);
```

- [ ] **Step 2: 写入 webpack-cjs-vs-esm.good.ts**

```typescript
// 最佳实践：使用静态 import，让 Webpack 可以安全 tree-shaking

// utils.ts
export const used = 'used';
export const unused = 'unused';

// main.ts
import { used } from './utils';
console.log(used);
```

- [ ] **Step 3: 提交**

```bash
git add src/pages/js-basics/module-systems/demos/webpack-*.ts
git commit -m "feat: add webpack cjs vs esm demos"
```

---

## Task 6: 实现 CommonJS 详解章节组件

**Files:**
- Create: `src/pages/js-basics/module-systems/sections/CommonJSIntro.tsx`

- [ ] **Step 1: 导入依赖并读取 demo 源码**

```tsx
import React from 'react';
import { Card, Typography, List, Alert } from 'antd';
import CodeDiff from '@/components/CodeDiff';
import badCode from '../demos/commonjs-native.bad.cjs?raw';
import goodCode from '../demos/commonjs-native.good.cjs?raw';
import badCircular from '../demos/commonjs-circular.bad.cjs?raw';
import goodCircular from '../demos/commonjs-circular.good.cjs?raw';

const { Title, Paragraph, Text } = Typography;
```

- [ ] **Step 2: 写入 CommonJS 详解组件**

```tsx
const CommonJSIntro: React.FC = () => {
  return (
    <>
      <Card title="语法与核心概念" style={{ marginBottom: 24 }}>
        <Paragraph>
          <Text code>require(id)</Text> 是同步加载函数，返回 <Text code>module.exports</Text>。
          <Text code>module.exports</Text> 初始为 <Text code>{ }</Text>，是真正的导出对象。
          <Text code>exports</Text> 只是 <Text code>module.exports</Text> 的引用，只能附加属性，不能整体赋值。
        </Paragraph>
      </Card>

      <Card title="运行时数据结构" style={{ marginBottom: 24 }}>
        <List>
          <List.Item>
            <Text strong>Module 对象：</Text>包含 id、filename、exports、parent、children、loaded 等字段
          </List.Item>
          <List.Item>
            <Text strong>require.cache / Module._cache：</Text>缓存已加载模块，避免重复执行
          </List.Item>
          <List.Item>
            <Text strong>module.exports：</Text>初始为 {'{}'}，顶层代码执行后可能被替换为新的对象或基本类型
          </List.Item>
        </List>
      </Card>

      <Card title="执行流程" style={{ marginBottom: 24 }}>
        <List ordered>
          <List.Item>require('x') 调用 Module._resolveFilename 解析路径</List.Item>
          <List.Item>Module._load 检查缓存，若未加载则创建 Module 实例</List.Item>
          <List.Item>调用 Module.load 读取文件内容并包装成函数</List.Item>
          <List.Item>同步执行模块顶层代码，填充 module.exports</List.Item>
          <List.Item>返回 module.exports</List.Item>
        </List>
      </Card>

      <Card title="常见错误：exports 被重新赋值" style={{ marginBottom: 24 }}>
        <CodeDiff
          oldValue={badCode}
          newValue={goodCode}
          leftTitle="❌ 反面教材"
          rightTitle="✅ 最佳实践"
          type="error"
          hideDiffMarkers={true}
        />
      </Card>

      <Card title="循环依赖" style={{ marginBottom: 24 }}>
        <Alert
          message="循环依赖中的半成品导出"
          description="当 a 执行到 require('./b') 时暂停，b 又 require('./a')，此时 a 的 module.exports 已存在但尚未填充。若 b 立即读取 a 的导出，会拿到 undefined。"
          type="warning"
          showIcon
        />
        <div style={{ marginTop: 16 }}>
          <CodeDiff
            oldValue={badCircular}
            newValue={goodCircular}
            leftTitle="❌ 立即读取导致 undefined"
            rightTitle="✅ 导出函数延迟访问"
            type="error"
            hideDiffMarkers={true}
          />
        </div>
      </Card>
    </>
  );
};

export default CommonJSIntro;
```

- [ ] **Step 3: 提交**

```bash
git add src/pages/js-basics/module-systems/sections/CommonJSIntro.tsx
git commit -m "feat: add CommonJS intro section"
```

---

## Task 7: 实现 ES Module 详解章节组件

**Files:**
- Create: `src/pages/js-basics/module-systems/sections/ESModuleIntro.tsx`

- [ ] **Step 1: 导入依赖并读取 demo 源码**

```tsx
import React from 'react';
import { Card, Typography, List, Alert } from 'antd';
import CodeDiff from '@/components/CodeDiff';
import badCircular from '../demos/esm-circular.bad.mjs?raw';
import goodCircular from '../demos/esm-circular.good.mjs?raw';

const { Title, Paragraph, Text } = Typography;
```

- [ ] **Step 2: 写入 ES Module 详解组件**

```tsx
const ESModuleIntro: React.FC = () => {
  return (
    <>
      <Card title="语法与核心概念" style={{ marginBottom: 24 }}>
        <Paragraph>
          <Text code>import {'{'} a {'}'} from './a.mjs'</Text> 与{' '}
          <Text code>export const a = 1</Text> 是静态声明。
          <Text code>export default</Text> 导出表达式的值，命名导出绑定到内存槽位。
          <Text code>import * as mod</Text> 创建模块命名空间对象；
          <Text code>import('./mod.mjs')</Text> 返回 Promise。
        </Paragraph>
      </Card>

      <Card title="三阶段与数据结构" style={{ marginBottom: 24 }}>
        <Title level={5}>阶段一：构造（Construction）</Title>
        <Paragraph>
          解析入口模块，递归发现并加载所有依赖。为每个模块创建 Module Record，记录 RequestedModules、ImportEntries、LocalExportEntries 等。使用 Module Map 去重，保证同一模块只加载一次。
        </Paragraph>

        <Title level={5}>阶段二：实例化（Instantiation）</Title>
        <Paragraph>
          为每个模块创建 Module Environment Record，为 export 分配 binding（初始为 uninitialized，即 TDZ），为 import 创建 Import Binding 指向被导出模块的 binding 槽位。
        </Paragraph>

        <Title level={5}>阶段三：求值（Evaluation）</Title>
        <Paragraph>
          按深度优先执行模块顶层代码。执行到 export const x = 1 时，binding 从 uninitialized 变为具体值。由于 import 是绑定引用，后续重新赋值也会同步到所有导入方。
        </Paragraph>
      </Card>

      <Card title="循环依赖" style={{ marginBottom: 24 }}>
        <Alert
          message="循环依赖中的 TDZ"
          description="实例化阶段 a 和 b 的 binding 都已存在，但值未初始化。求值顺序取决于入口，先求值的模块访问后求值模块可能触发 TDZ。"
          type="warning"
          showIcon
        />
        <div style={{ marginTop: 16 }}>
          <CodeDiff
            oldValue={badCircular}
            newValue={goodCircular}
            leftTitle="❌ 顶层访问触发 TDZ"
            rightTitle="✅ 导出函数延迟访问"
            type="error"
            hideDiffMarkers={true}
          />
        </div>
      </Card>

      <Card title="常见 bug 与最佳实践" style={{ marginBottom: 24 }}>
        <List>
          <List.Item>在模块顶层代码执行前访问 import 变量会触发 TDZ</List.Item>
          <List.Item>在循环依赖中读取 export const 可能拿到未初始化的 binding</List.Item>
          <List.Item>export default 导出的是值快照，不支持 live binding</List.Item>
          <List.Item>动态 import() 返回的 Namespace Object 是快照，后续重新赋值不会同步</List.Item>
          <List.Item>推荐：命名导出优先用于需要热更新/绑定同步的场景；循环依赖时导出函数并延迟调用</List.Item>
        </List>
      </Card>
    </>
  );
};

export default ESModuleIntro;
```

- [ ] **Step 3: 提交**

```bash
git add src/pages/js-basics/module-systems/sections/ESModuleIntro.tsx
git commit -m "feat: add ES Module intro section"
```

---

## Task 8: 实现对比章节组件

**Files:**
- Create: `src/pages/js-basics/module-systems/sections/Comparison.tsx`

- [ ] **Step 1: 写入 Comparison 组件**

```tsx
import React from 'react';
import { Card, Table, Typography, Tag } from 'antd';
import { comparisonData } from '../data';

const { Title } = Typography;

const columns = [
  {
    title: '对比维度',
    dataIndex: 'dimension',
    key: 'dimension',
    render: (text: string) => <Tag color="purple">{text}</Tag>,
  },
  {
    title: 'CommonJS',
    dataIndex: 'commonjs',
    key: 'commonjs',
  },
  {
    title: 'ES Module',
    dataIndex: 'esm',
    key: 'esm',
  },
];

const Comparison: React.FC = () => {
  return (
    <Card title="CommonJS vs ES Module 对比" style={{ marginBottom: 24 }}>
      <Table dataSource={comparisonData} columns={columns} pagination={false} bordered size="small" />
    </Card>
  );
};

export default Comparison;
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/js-basics/module-systems/sections/Comparison.tsx
git commit -m "feat: add comparison section"
```

---

## Task 9: 实现 Webpack 打包差异章节组件

**Files:**
- Create: `src/pages/js-basics/module-systems/sections/WebpackBundling.tsx`

- [ ] **Step 1: 导入依赖并读取 demo 源码**

```tsx
import React from 'react';
import { Card, Typography, List } from 'antd';
import CodeDiff from '@/components/CodeDiff';
import badCode from '../demos/webpack-cjs-vs-esm.bad.ts?raw';
import goodCode from '../demos/webpack-cjs-vs-esm.good.ts?raw';

const { Title, Paragraph, Text } = Typography;
```

- [ ] **Step 2: 写入 WebpackBundling 组件**

```tsx
const WebpackBundling: React.FC = () => {
  return (
    <>
      <Card title="产物形态" style={{ marginBottom: 24 }}>
        <Paragraph>
          ESM 被转译为 <Text code>__webpack_require__.d(__webpack_exports__, {'{'} foo: () ={'>'} foo {'}'})</Text>，使用 getter 实现 live binding。
          CJS 被转译为 <Text code>module.exports = ...</Text> 或 <Text code>__webpack_require__.n</Text> 兼容包装器。
          动态 import() 被拆分为单独 chunk，使用 <Text code>__webpack_require__.e</Text> 加载。
        </Paragraph>
      </Card>

      <Card title="对 tree-shaking 的影响" style={{ marginBottom: 24 }}>
        <List>
          <List.Item>Webpack 需要静态分析才能确定哪些导出被使用</List.Item>
          <List.Item>如果源码中存在 require 或 module.exports，Webpack 无法安全删除未使用导出</List.Item>
          <List.Item>sideEffects 配置在 ESM 项目下才能准确标记无副作用模块</List.Item>
        </List>
      </Card>

      <Card title="源码写法对比" style={{ marginBottom: 24 }}>
        <CodeDiff
          oldValue={badCode}
          newValue={goodCode}
          leftTitle="❌ 混用 CJS 导致 tree-shaking 失效"
          rightTitle="✅ 全部 ESM 利于静态分析"
          type="error"
          hideDiffMarkers={true}
        />
      </Card>
    </>
  );
};

export default WebpackBundling;
```

- [ ] **Step 3: 提交**

```bash
git add src/pages/js-basics/module-systems/sections/WebpackBundling.tsx
git commit -m "feat: add webpack bundling section"
```

---

## Task 10: 实现 V8 执行模型关联章节组件

**Files:**
- Create: `src/pages/js-basics/module-systems/sections/V8Relation.tsx`

- [ ] **Step 1: 写入 V8Relation 组件**

```tsx
import React from 'react';
import { Card, Typography, List, Steps } from 'antd';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

const V8Relation: React.FC = () => {
  return (
    <>
      <Card title="V8 执行流水线" style={{ marginBottom: 24 }}>
        <Steps direction="horizontal" current={3}>
          <Step title="解析" description="Parser / Pre-parser 生成 AST" />
          <Step title="编译" description="Ignition 字节码 / TurboFan 机器码" />
          <Step title="执行" description="运行字节码或机器码" />
        </Steps>
      </Card>

      <Card title="CommonJS 与 V8" style={{ marginBottom: 24 }}>
        <Paragraph>
          每次 require 时，Node.js 读取文件内容并通过包装函数执行。这直接触发 V8 的解析→编译→执行流程，没有独立的实例化阶段。
          因此 module.exports 是执行后得到的对象快照，不支持 live binding。
        </Paragraph>
      </Card>

      <Card title="ES Module 与 V8" style={{ marginBottom: 24 }}>
        <List>
          <List.Item>
            <Text strong>构造阶段：</Text>模块加载器在 V8 外部维护 Module Map，不直接执行 V8
          </List.Item>
          <List.Item>
            <Text strong>实例化阶段：</Text>V8 创建 Module Environment Record，分配 bindings；由模块加载器驱动
          </List.Item>
          <List.Item>
            <Text strong>求值阶段：</Text>调用 V8 的 Module::Evaluate，执行顶层代码，触发解析→编译→执行
          </List.Item>
          <List.Item>
            <Text strong>循环依赖：</Text>evaluating 状态由模块加载器维护，V8 只负责执行单个模块的脚本
          </List.Item>
        </List>
      </Card>
    </>
  );
};

export default V8Relation;
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/js-basics/module-systems/sections/V8Relation.tsx
git commit -m "feat: add V8 relation section"
```

---

## Task 11: 实现 LiveDemo 互动演示组件

**Files:**
- Create: `src/pages/js-basics/module-systems/LiveDemo.tsx`

- [ ] **Step 1: 写入 LiveDemo 组件**

```tsx
import React, { useState } from 'react';
import { Card, Tabs, Steps, Button, Table, Typography, Tag } from 'antd';

const { TabPane } = Tabs;
const { Step } = Steps;
const { Title, Paragraph, Text } = Typography;

const LiveDemo: React.FC = () => {
  const [esmStep, setEsmStep] = useState(0);

  const esmStages = [
    {
      title: '构造阶段',
      content: '建立 Module Map，a.mjs 和 b.mjs 的 Module Record 已创建，Status 为 uninstantiated。',
      records: [
        { module: 'a.mjs', status: 'uninstantiated', bindings: 'a: uninitialized, b: (import from a)' },
        { module: 'b.mjs', status: 'uninstantiated', bindings: 'b: uninitialized, a: (import from b)' },
      ],
    },
    {
      title: '实例化阶段',
      content: '为每个模块创建 Environment Record，export 分配 binding 并标记为 uninitialized；import 建立 Import Binding 链接。',
      records: [
        { module: 'a.mjs', status: 'instantiated', bindings: 'a: uninitialized, b: → b.binding.b' },
        { module: 'b.mjs', status: 'instantiated', bindings: 'b: uninitialized, a: → a.binding.a' },
      ],
    },
    {
      title: '求值阶段',
      content: '执行顶层代码，binding 从 uninitialized 变为具体值。循环依赖通过 evaluating 状态避免重复执行。',
      records: [
        { module: 'a.mjs', status: 'evaluated', bindings: 'a: "a", b: "b"' },
        { module: 'b.mjs', status: 'evaluated', bindings: 'b: "b", a: "a"' },
      ],
    },
  ];

  const columns = [
    { title: '模块', dataIndex: 'module', key: 'module' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (text: string) => <Tag color="blue">{text}</Tag> },
    { title: 'Bindings', dataIndex: 'bindings', key: 'bindings' },
  ];

  return (
    <Card title="互动演示：模块状态推进器">
      <Tabs defaultActiveKey="cjs">
        <TabPane tab="CommonJS 状态机" key="cjs">
          <Paragraph>
            CommonJS 中，a → b → a 循环依赖时，a 的 module.exports 在 b 执行时已经存在，但可能还是空对象 {'{}'}。
          </Paragraph>
          <Steps direction="vertical" current={2}>
            <Step title="a 开始执行" description="module.exports = {}" />
            <Step title="a 执行 require('./b')" description="b 开始执行，a 暂停" />
            <Step title="b 执行 require('./a')" description="从缓存拿到 a 的半成品 exports，可能为 {}" />
            <Step title="b 执行完成" description="返回 b 的 module.exports" />
            <Step title="a 继续执行" description="填充并最终返回 module.exports" />
          </Steps>
        </TabPane>

        <TabPane tab="ES Module 三阶段" key="esm">
          <Steps current={esmStep} onChange={setEsmStep} direction="horizontal">
            {esmStages.map((s, idx) => (
              <Step key={idx} title={s.title} />
            ))}
          </Steps>
          <Paragraph style={{ marginTop: 16 }}>
            <Text strong>{esmStages[esmStep].title}</Text>：{esmStages[esmStep].content}
          </Paragraph>
          <Table dataSource={esmStages[esmStep].records} columns={columns} pagination={false} bordered size="small" />
          <Button.Group style={{ marginTop: 16 }}>
            <Button disabled={esmStep === 0} onClick={() => setEsmStep(esmStep - 1)}>
              上一步
            </Button>
            <Button disabled={esmStep === esmStages.length - 1} onClick={() => setEsmStep(esmStep + 1)}>
              下一步
            </Button>
          </Button.Group>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default LiveDemo;
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/js-basics/module-systems/LiveDemo.tsx
git commit -m "feat: add module systems live demo"
```

---

## Task 12: 实现主页面 index.tsx

**Files:**
- Create: `src/pages/js-basics/module-systems/index.tsx`

- [ ] **Step 1: 导入所有章节组件**

```tsx
import React from 'react';
import { Card, Typography, Divider, List } from 'antd';
import { ModuleSystemsMeta, interviewQuestions } from './data';
import CommonJSIntro from './sections/CommonJSIntro';
import ESModuleIntro from './sections/ESModuleIntro';
import Comparison from './sections/Comparison';
import WebpackBundling from './sections/WebpackBundling';
import V8Relation from './sections/V8Relation';
import LiveDemo from './LiveDemo';

const { Title, Paragraph } = Typography;
```

- [ ] **Step 2: 写入主页面组件**

```tsx
const ModuleSystems: React.FC = () => {
  return (
    <div>
      <Title level={2}>{ModuleSystemsMeta.title}</Title>
      <Paragraph type="secondary">{ModuleSystemsMeta.description}</Paragraph>

      <Card title="一、为什么需要模块化" style={{ marginBottom: 24 }}>
        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{ModuleSystemsMeta.phenomenon}</Paragraph>
      </Card>

      <Card title="二、CommonJS 详解" style={{ marginBottom: 24 }}>
        <CommonJSIntro />
      </Card>

      <Card title="三、ES Module 详解" style={{ marginBottom: 24 }}>
        <ESModuleIntro />
      </Card>

      <Card title="四、CommonJS vs ES Module 对比" style={{ marginBottom: 24 }}>
        <Comparison />
      </Card>

      <Card title="五、Webpack 打包差异" style={{ marginBottom: 24 }}>
        <WebpackBundling />
      </Card>

      <Card title="六、与 V8 执行模型的关系" style={{ marginBottom: 24 }}>
        <V8Relation />
      </Card>

      <Card title="七、互动演示" style={{ marginBottom: 24 }}>
        <LiveDemo />
      </Card>

      <Card title="八、核心原理与面试考点" style={{ background: '#f0f5ff' }}>
        <List
          dataSource={interviewQuestions}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={<Text strong>{item.question}</Text>}
                description={<Paragraph type="secondary">{item.answer}</Paragraph>}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default ModuleSystems;
```

- [ ] **Step 3: 提交**

```bash
git add src/pages/js-basics/module-systems/index.tsx
git commit -m "feat: add module systems main page"
```

---

## Task 13: 注册路由

**Files:**
- Modify: `src/router/config.tsx`

- [ ] **Step 1: 在懒加载组件区域添加 ModuleSystems**

在 `src/router/config.tsx` 中，找到 `const UndefinedVsNull = lazy(...)` 附近，添加：

```tsx
const ModuleSystems = lazy(() => import('../pages/js-basics/module-systems/index'));
```

- [ ] **Step 2: 在 /dashboard/js-basics 路由 children 中新增子项**

```tsx
{
  path: '/dashboard/js-basics',
  label: 'JavaScript 基础',
  icon: <FileTextOutlined />,
  children: [
    {
      path: '/dashboard/js-basics/undefined-vs-null',
      label: 'undefined 与 null 的区别',
      element: <UndefinedVsNull />,
    },
    {
      path: '/dashboard/js-basics/module-systems',
      label: 'JavaScript 模块化',
      element: <ModuleSystems />,
    },
  ],
},
```

- [ ] **Step 3: 提交**

```bash
git add src/router/config.tsx
git commit -m "feat: register module-systems route"
```

---

## Task 14: 验证与测试

- [ ] **Step 1: 运行类型检查**

```bash
npm run typecheck
```

如果 `typecheck` 命令不存在，尝试：

```bash
npx tsc --noEmit
```

- [ ] **Step 2: 运行 lint**

```bash
npm run lint
```

- [ ] **Step 3: 启动开发服务器并验证页面**

```bash
npm run dev
```

打开浏览器访问 `http://localhost:5173/dashboard/js-basics/module-systems`（端口号以实际输出为准），确认：
- 页面标题、描述、章节正常渲染
- CodeDiff 代码对比正常显示
- LiveDemo 的 Tabs 和 Steps 可正常切换
- 菜单中新增 "JavaScript 模块化" 项

- [ ] **Step 4: 提交最终验证**

```bash
git add .
git commit -m "chore: verify module-systems page"
```

---

## 自我检查

- **Spec coverage:** 所有设计文档章节均已对应到任务：目录结构、data.ts、CommonJS、ES Module、对比、Webpack、V8、LiveDemo、主页面、路由、验证。
- **Placeholder scan:** 未发现 TBD/TODO/等占位符，每步均包含具体代码或命令。
- **Type consistency:** 所有组件使用 `React.FC`，`CodeDiff` 接收 `oldValue`/`newValue` 字符串，与现有 `undefined-vs-null` 页面一致。
- **注意：** 项目 `AGENTS.md` 要求数据与代码分离，所有 Bad/Good Code 已放入 `demos/` 并通过 `?raw` 导入；主页面只负责组合展示。

---

## 执行交接

**Plan complete and saved to `docs/superpowers/plans/2026-07-01-javascript-module-systems-plan.md`. Two execution options:**

1. **Subagent-Driven (recommended)** - 每个任务分派独立子代理，任务间审查，快速迭代
2. **Inline Execution** - 在本会话中直接按任务执行，批量推进并设置检查点

**Which approach?**
