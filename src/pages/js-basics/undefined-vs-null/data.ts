/**
 * undefined 与 null 的区别 - 元数据
 * 纯数据文件：不包含 Bad/Good Code，这些已提取到 demos/ 目录中
 */

export const UndefinedVsNullMeta = {
  title: 'undefined 与 null 的区别',

  description:
    'undefined 与 null 是 JavaScript 中最容易混淆的两个原始值。它们不仅在语义上代表不同的"空"，在类型转换、运算符行为、JSON 序列化、TypeScript 类型系统等层面都有显著差异。本页从 10+ 个维度系统拆解这对面试高频考点。',

  phenomenon:
    '日常开发与面试中，开发者经常对以下问题产生困惑：\n\n1. typeof null 为什么是 "object" 而不是 "null"？\n2. null == undefined 为 true，null === undefined 为什么为 false？\n3. Number(null) 是 0，Number(undefined) 为什么是 NaN？\n4. JSON.stringify({ a: undefined, b: null }) 的结果为什么只有 b？\n5. 函数参数默认值在什么情况下生效？传 null 和 undefined 一样吗？\n6. 解构赋值时，默认值对 null 和 undefined 的处理有什么不同？\n7. 可选链 ?. 遇到 null 和 undefined 时行为是否一致？\n8. 空值合并运算符 ?? 为什么只"合并" undefined 和 null？\n9. 为什么有的 API 返回 null（如 document.getElementById 找不到元素），而有的返回 undefined（如对象不存在的属性）？\n10. TypeScript 中，null 和 undefined 分别如何影响类型推断和 strictNullChecks？',

  reason:
    'JavaScript 语言设计上的历史包袱，加上 ECMAScript 规范对两个值的精确定义不同，导致它们在表达式求值、类型转换、运算符语义上表现各异。理解这些差异的本质，需要回到 ECMAScript 规范、Brendan Eich 的设计初衷以及现代 TypeScript 的类型系统。',

  whySolveThisWay: `为什么要严格区分 undefined 和 null？\n\n1. 语义清晰\n   - undefined："此处应有值，但目前没有"（未初始化、未传入、未找到）\n   - null："此处本可以有值，但被显式置为空"（用户清空、API 表示无结果）\n\n2. 避免隐式类型转换陷阱\n   - Number(undefined) === NaN，Number(null) === 0\n   - 不加区分地使用 +value 可能导致难以追踪的 bug\n\n3. 与 JSON / 后端协议对齐\n   - undefined 不会被 JSON 序列化，null 会\n   - GraphQL、protobuf 等协议对两者的处理也不同\n\n4. TypeScript strictNullChecks 的要求\n   - 开启严格空检查后，undefined 和 null 不能随意赋值给其他类型\n   - 明确区分能大幅降低运行时空值错误`,

  principle: `核心原理：ECMAScript 规范视角\n\n1. undefined 是全局对象的属性\n   - globalThis.undefined 可被覆盖（严格模式下不可）\n   - 变量未初始化、函数无返回值、对象无此属性时都返回 undefined\n\n2. null 是一个字面量（literal），不是全局属性\n   - 表示对 Object 类型值的有意缺失\n   -  historically  typeof null === 'object' 是早期实现遗留 bug\n\n3. 抽象相等比较（==）\n   - 规范规定 null == undefined 为 true，且它们只与对方相等\n   - 这是为了兼容历史代码，但在严格相等（===）下不成立\n\n4. ToNumber 转换\n   - ToNumber(undefined) → NaN\n   - ToNumber(null) → +0\n\n5. JSON 序列化\n   - JSON.stringify 会跳过值为 undefined 的属性\n   - null 会被序列化为 null\n\n6. 默认值触发条件\n   - 函数默认参数：仅当实参为 undefined 时触发\n   - 解构默认值：仅当值为 undefined 时触发\n   - 空值合并 ??：仅当左操作数为 null 或 undefined 时返回右操作数`,
};

/**
 * 对比维度数据（用于表格展示）
 */
export const comparisonData = [
  {
    key: '1',
    dimension: '语义',
    undefinedDesc: '未定义：变量声明了但未赋值、函数无返回值、对象无此属性',
    nullDesc: '空对象指针：表示此处本可以有对象值，但被显式置为空',
  },
  {
    key: '2',
    dimension: 'typeof',
    undefinedDesc: '"undefined"',
    nullDesc: '"object"（历史 bug，建议用 value === null 判断）',
  },
  {
    key: '3',
    dimension: '== / ===',
    undefinedDesc: 'undefined == null 为 true；undefined === null 为 false',
    nullDesc: 'null == undefined 为 true；null === undefined 为 false',
  },
  {
    key: '4',
    dimension: 'Number 转换',
    undefinedDesc: 'Number(undefined) === NaN',
    nullDesc: 'Number(null) === 0',
  },
  {
    key: '5',
    dimension: 'JSON.stringify',
    undefinedDesc: '属性值为 undefined 时会被忽略',
    nullDesc: '属性值为 null 时会序列化为 null',
  },
  {
    key: '6',
    dimension: '函数默认参数',
    undefinedDesc: '传 undefined 会触发默认参数',
    nullDesc: '传 null 不会触发默认参数，函数内得到 null',
  },
  {
    key: '7',
    dimension: '解构默认值',
    undefinedDesc: '解构值为 undefined 时触发默认值',
    nullDesc: '解构值为 null 时不触发默认值',
  },
  {
    key: '8',
    dimension: '可选链 ?.',
    undefinedDesc: '对象不存在属性时返回 undefined',
    nullDesc: 'null?.prop 返回 undefined，不会报错',
  },
  {
    key: '9',
    dimension: '空值合并 ??',
    undefinedDesc: "undefined ?? 'default' 返回 'default'",
    nullDesc: "null ?? 'default' 返回 'default'",
  },
  {
    key: '10',
    dimension: 'Object.prototype.toString',
    undefinedDesc: '[object Undefined]',
    nullDesc: '[object Null]',
  },
];

/**
 * 工程实践建议
 */
export const bestPracticeData = [
  {
    key: '1',
    scenario: '变量初始值',
    recommendation: '尽量使用 undefined 或 let 声明后自然保持 undefined',
    reason: 'undefined 是 JavaScript 的"默认空值"，与未初始化语义一致',
  },
  {
    key: '2',
    scenario: 'API 返回值表示"无结果"',
    recommendation: '使用 null',
    reason: 'null 更明确地表达"此处有意为空"，例如 document.querySelector 找不到元素',
  },
  {
    key: '3',
    scenario: '函数可选参数',
    recommendation: '使用 undefined 表示"未传入"',
    reason: '默认参数和解构默认值只对 undefined 生效',
  },
  {
    key: '4',
    scenario: '用户显式清空字段',
    recommendation: '使用 null',
    reason: '与"未设置"区分开，后端接口通常用 null 表示清空',
  },
  {
    key: '5',
    scenario: '判断空值',
    recommendation: '同时判断两者用 value == null；严格区分用 ===',
    reason: "value == null 能覆盖 undefined 和 null，且不会误判 0 / '' / false",
  },
  {
    key: '6',
    scenario: '提供默认值',
    recommendation: '使用空值合并运算符 ??',
    reason: "?? 只在 null/undefined 时 fallback，不会把 0 / '' / false 替换掉",
  },
];

/**
 * 互动演示代码
 */
export const liveDemoSnippets = {
  typeofCheck: `typeof undefined;     // 'undefined'
typeof null;          // 'object'（历史遗留）
Object.prototype.toString.call(undefined); // '[object Undefined]'
Object.prototype.toString.call(null);      // '[object Null]'`,

  equalityCheck: `null == undefined;   // true
null === undefined;  // false
undefined == 0;     // false
null == 0;          // false`,

  numberConversion: `Number(undefined); // NaN
Number(null);      // 0
undefined + 1;     // NaN
null + 1;          // 1`,

  jsonStringify: `JSON.stringify({ a: undefined, b: null });
// '{"b":null}'

JSON.stringify([undefined, null]);
// '[null,null]'（数组中 undefined 会转为 null）`,

  defaultParams: `function demo(a = 'default') {
  return a;
}
demo(undefined); // 'default'
demo(null);      // null`,

  destructuring: `const { a = 'default' } = { a: undefined };
// a === 'default'

const { b = 'default' } = { b: null };
// b === null`,

  optionalChaining: `const obj = { inner: null };
obj.inner?.foo;        // undefined
obj.missing?.foo;      // undefined
// 两者都不会抛 TypeError`,

  nullishCoalescing: `0 ?? 'default';        // 0
'' ?? 'default';       // ''
false ?? 'default';    // false
null ?? 'default';     // 'default'
undefined ?? 'default'; // 'default'`,
};