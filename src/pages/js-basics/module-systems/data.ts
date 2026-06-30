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
