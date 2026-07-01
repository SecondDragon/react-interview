import { Tag } from 'antd';

/**
 * JavaScript 模块化 - 纯数据文件
 *
 * 职责说明：
 * 本文件只存放组件需要的数据：对比表格、面试题、Live Demo 的状态数据等。
 * 所有概念性讲解、流程说明、代码对比已经迁移到 content.mdx 中。
 * 注意：本文件禁止写 JSX，列定义请放在 ComparisonTable.tsx 中。
 */

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
    question: '手动删除未使用代码和 tree-shaking 有什么区别？',
    answer: '手动删除适合清理你自己项目源码里的死代码和未使用导出；tree-shaking 负责你改不到的代码，比如第三方库 lodash、UI 组件库 antd、跨项目复用的内部共享库，以及运行时条件才用到的导出。两者是互补关系，不是替代关系。',
  },
  {
    key: '8',
    question: '动态 import() 返回的是快照还是绑定？',
    answer: 'import() 返回的 Module Namespace Object 是快照：它的属性在 Promise resolve 时被读取并固定。若后续被导入模块重新赋值命名导出，Namespace Object 不会自动更新。',
  },
];

/**
 * Live Demo 中 CommonJS 状态机的步骤数据
 */
export const cjsLiveDemoSteps = [
  {
    title: 'a 开始执行',
    description: 'Node.js 为 a 创建 Module 对象，module.exports 初始化为 {}',
  },
  {
    title: 'a 执行 require("./b")',
    description: '检查缓存未发现 b，暂停 a 的执行，开始加载并执行 b',
  },
  {
    title: 'b 执行 require("./a")',
    description: '从缓存中拿到 a 的 Module 对象，但 a 此时只执行到 require("./b")，module.exports 仍然是空对象 {}',
  },
  {
    title: 'b 读取 a.x 并执行完成',
    description: '由于 a.x 尚未赋值，b 读取到 undefined。随后 b 的 module.exports 被填充并返回',
  },
  {
    title: 'a 继续执行并返回',
    description: 'a 的 require("./b") 返回，a 继续填充 module.exports，最终返回完整导出对象',
  },
];

/**
 * Live Demo 中 ES Module 三阶段数据
 */
export const esmLiveDemoStages = [
  {
    title: '构造阶段',
    content: '从入口模块开始，递归解析所有 import 声明。为每个模块创建 Module Record，记录其 RequestedModules、ImportEntries、LocalExportEntries。使用 Module Map 去重，确保同一模块只加载一次。',
    records: [
      { module: 'a.mjs', status: 'uninstantiated', bindings: 'export a: uninitialized; import b: 来自 b.mjs' },
      { module: 'b.mjs', status: 'uninstantiated', bindings: 'export b: uninitialized; import a: 来自 a.mjs' },
    ],
  },
  {
    title: '实例化阶段',
    content: '为每个模块创建 Module Environment Record。export 声明分配 binding，初始状态为 uninitialized（处于 TDZ）。import 创建 Import Binding，指向被导出模块的 binding 槽位。',
    records: [
      { module: 'a.mjs', status: 'instantiated', bindings: 'a: uninitialized; b: → b.mjs 的 b binding' },
      { module: 'b.mjs', status: 'instantiated', bindings: 'b: uninitialized; a: → a.mjs 的 a binding' },
    ],
  },
  {
    title: '求值阶段',
    content: '按深度优先顺序执行模块顶层代码。当执行 export const a = 1 时，a 的 binding 从 uninitialized 变为具体值。由于 import 是绑定引用，所有引用方自动读取到最新值。',
    records: [
      { module: 'a.mjs', status: 'evaluated', bindings: 'a: "a-value"; b: "b-value"' },
      { module: 'b.mjs', status: 'evaluated', bindings: 'b: "b-value"; a: "a-value"' },
    ],
  },
];

/**
 * Tree Shaking Demo 数据
 *
 * 模拟一个“大而全”的工具库 @utils/core，其中包含 6 个导出函数。
 * 业务项目只用到其中一部分。Demo 通过勾选使用哪些导出，
 * 实时展示 tree-shaking 后 bundle 中保留和剔除的内容。
 */
export interface TreeShakingExportItem {
  key: string;
  name: string;
  size: number; // 单位 KB，模拟值
  description: string;
  code: string;
}

export const treeShakingExports: TreeShakingExportItem[] = [
  {
    key: 'debounce',
    name: 'debounce',
    size: 2.1,
    description: '防抖函数，延迟执行高频触发的事件回调',
    code: `export function debounce(fn, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}`,
  },
  {
    key: 'throttle',
    name: 'throttle',
    size: 1.8,
    description: '节流函数，限制高频事件的触发频率',
    code: `export function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}`,
  },
  {
    key: 'deepClone',
    name: 'deepClone',
    size: 3.5,
    description: '深拷贝，递归复制对象与数组',
    code: `export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  const clone = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    clone[key] = deepClone(obj[key]);
  }
  return clone;
}`,
  },
  {
    key: 'formatDate',
    name: 'formatDate',
    size: 4.2,
    description: '日期格式化，支持多种输出模板',
    code: `export function formatDate(date, fmt = 'yyyy-MM-dd') {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  const map = {
    'yyyy': d.getFullYear(),
    'MM': pad(d.getMonth() + 1),
    'dd': pad(d.getDate()),
  };
  return fmt.replace(/yyyy|MM|dd/g, (k) => map[k]);
}`,
  },
  {
    key: 'uuid',
    name: 'uuid',
    size: 1.5,
    description: '生成唯一标识字符串',
    code: `export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}`,
  },
  {
    key: 'validatePhone',
    name: 'validatePhone',
    size: 0.8,
    description: '中国大陆手机号校验正则',
    code: `export function validatePhone(phone) {
  return /^1[3-9]\\d{9}$/.test(String(phone));
}`,
  },
];

/**
 * 手动删除 vs tree-shaking 对比表数据
 */
export const treeShakingComparisonData = [
  {
    key: '1',
    scenario: '你自己项目里有一个没用的导出',
    webstorm: '✅ 能标灰提示',
    manualDelete: '✅ 可以直接删除，最干净',
    treeShaking: '❌ 不需要，也不该依赖它',
  },
  {
    key: '2',
    scenario: '第三方库 lodash 你只用到 debounce',
    webstorm: '❌ 无法进入 node_modules 分析',
    manualDelete: '❌ 不能修改 node_modules',
    treeShaking: '✅ 只保留 debounce，其余剔除',
  },
  {
    key: '3',
    scenario: 'UI 组件库 antd 你只用到 Button',
    webstorm: '❌ 无法决定哪些组件该删',
    manualDelete: '❌ 组件库源码不属于你',
    treeShaking: '✅ 只打包 Button 相关代码',
  },
  {
    key: '4',
    scenario: '运行时条件渲染的组件',
    webstorm: '⚠️ 不一定能判断',
    manualDelete: '❌ 运行时才知用哪个',
    treeShaking: '✅ 先剔除明确未被引用的',
  },
  {
    key: '5',
    scenario: '内部共享库被多个项目复用',
    webstorm: '❌ 跨项目无法分析',
    manualDelete: '❌ 不能拆成 50 个子包',
    treeShaking: '✅ 各项目按需取用',
  },
];
