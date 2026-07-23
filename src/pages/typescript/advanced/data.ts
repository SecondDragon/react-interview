import React from 'react';
import { Tag, Typography } from 'antd';

export interface QuizItem {
  id: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const interviewQuestions: QuizItem[] = [
  // ===== 泛型 (1-4) =====
  {
    id: 1,
    question: '泛型函数中，类型参数 T 的默认行为是什么？\n\n```ts\nfunction first<T>(arr: T[]): T | undefined {\n  return arr[0];\n}\n```',
    options: [
      'T 在调用时由 TypeScript 自动推断，也可显式指定',
      'T 必须显式传入，无法推断',
      'T 只能是 string 或 number',
      'T 只能在 class 中使用',
    ],
    answer: 0,
    explanation: '泛型函数的类型参数 T 会在调用时根据传入的参数自动推断。如 `first([1,2,3])` 推断 T 为 number，`first(["a","b"])` 推断为 string。也可以显式指定：`first<number>([1,2,3])`。',
    difficulty: 'easy',
  },
  {
    id: 2,
    question: '以下代码的编译结果是什么？\n\n```ts\nfunction getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}\n\nconst person = { name: "Tom", age: 25 };\nconst name = getProperty(person, "name");\nconst invalid = getProperty(person, "email");\n```',
    options: [
      '两行都编译通过',
      '`name` 编译通过（类型为 string），`invalid` 报错：email 不在 keyof T 中',
      '两行都编译报错',
      '`name` 编译通过但类型为 any',
    ],
    answer: 1,
    explanation: '`keyof T` 约束了 K 必须是 T 的已知键。"name" 是 person 的键（返回类型 string），"email" 不是，因此编译报错。这就是泛型约束的典型应用——在运行时保护前确保键存在。',
    difficulty: 'medium',
  },
  {
    id: 3,
    question: '以下代码中，泛型约束 `<T extends { length: number }>` 的作用是什么？\n\n```ts\nfunction logLength<T extends { length: number }>(arg: T): number {\n  return arg.length;\n}\n```',
    options: [
      'T 必须是一个数组',
      'T 可以是任何具有 length 属性的类型（string、Array、TypedArray 等）',
      'T 只能是 string 类型',
      '这个约束对 T 没有实际限制',
    ],
    answer: 1,
    explanation: '泛型约束 `<T extends { length: number }>` 要求传入的类型必须满足"具有一个 number 类型的 length 属性"。因此 `logLength("hello")`（string 有 length）、`logLength([1,2,3])`（数组有 length）都合法，但 `logLength(123)` 报错（number 没有 length）。',
    difficulty: 'medium',
  },
  {
    id: 4,
    question: '下面代码中泛型 class 的类型推断结果是什么？\n\n```ts\nclass Box<T> {\n  constructor(public value: T) {}\n  getValue(): T {\n    return this.value;\n  }\n}\nconst box = new Box(42);\nconst val = box.getValue();\n```',
    options: [
      'box 的类型是 Box<number>，val 的类型是 number',
      'box 的类型是 Box<any>，val 的类型是 any',
      'box 的类型是 Box<42>，val 的类型是 42（字面量）',
      'box 的类型是 Box<number | string>',
    ],
    answer: 0,
    explanation: 'TypeScript 会从构造函数参数 `new Box(42)` 推断类型参数 T 为 number。因此 `box` 的类型是 `Box<number>`，`getValue()` 返回类型为 number。这是"从初始化值推断"在泛型 class 上的应用。',
    difficulty: 'easy',
  },

  // ===== 条件类型 (5-8) =====
  {
    id: 5,
    question: '条件类型 `T extends U ? X : Y` 在联合类型上的行为是什么？\n\n```ts\ntype Result<T> = T extends string ? "is_string" : "not_string";\ntype Test = Result<string | number>;\n```',
    options: [
      'Test 的类型是 "not_string"（整个联合不满足条件）',
      'Test 的类型是 "is_string"（部分满足即整体满足）',
      'Test 的类型是 "is_string" | "not_string"（分布式条件类型，联合成员各自计算后合并）',
      'Test 的类型是 never',
    ],
    answer: 2,
    explanation: '当条件类型作用于裸类型参数（无 [] 包裹）时，TypeScript 会将联合类型分布式计算：`Result<string | number>` = `Result<string> | Result<number>` = `"is_string" | "not_string"`。这就是"分布式条件类型"（Distributive Conditional Types）的核心机制。',
    difficulty: 'hard',
  },
  {
    id: 6,
    question: '以下代码中, `Str` 的类型是什么？\n\n```ts\ntype GetString<T> = T extends (infer R)[] ? R : never;\ntype Str = GetString<string[]>;\n```',
    options: [
      'Str 是 string[]',
      'Str 是 string',
      'Str 是 never',
      'Str 是 any',
    ],
    answer: 1,
    explanation: '`infer R` 在条件类型中声明一个待推断的类型变量 R。`T extends (infer R)[]` 匹配任意数组类型，并将数组元素类型绑定到 R。`string[]` 匹配 `(infer R)[]`，R 被推断为 string。这和 ReturnType、Parameters 等工具类型的实现原理相同。',
    difficulty: 'hard',
  },
  {
    id: 7,
    question: '条件类型中的 `never` 分发有什么特殊行为？\n\n```ts\ntype IsNever<T> = T extends never ? true : false;\ntype Test1 = IsNever<never>;\ntype Test2 = IsNever<string>;\n```',
    options: [
      'Test1 = true, Test2 = false',
      'Test1 = never（因为 never 作为裸参数分发时，空联合产生空结果），Test2 = false',
      'Test1 = boolean, Test2 = false',
      'Test1 = never, Test2 = never',
    ],
    answer: 1,
    explanation: '这是一个重要的陷阱。当 `never` 作为裸类型参数传入条件类型时，由于 never 是"空联合"，分布式条件类型会分发到一个空联合上，结果还是 never。所以 `IsNever<never>` 返回 never 而不是 true。正确的写法是 `type IsNever<T> = [T] extends [never] ? true : false`——用元组包装避免分发。',
    difficulty: 'hard',
  },
  {
    id: 8,
    question: '以下代码中，`Flatten` 类型的作用是什么？\n\n```ts\ntype Flatten<T> = T extends any[] ? T[number] : T;\ntype A = Flatten<number[]>;   // number\ntype B = Flatten<string>;     // string\ntype C = Flatten<[string, number]>;\n```',
    options: [
      '将数组类型展平为元素类型；元组类型展平为联合类型',
      '将所有类型转为数组',
      '仅为 number[] 提供支持',
      '没有任何作用',
    ],
    answer: 0,
    explanation: '`T extends any[]` 匹配任意数组或元组。`T[number]` 是索引访问类型（Lookup Type），对数组返回元素类型的联合（如 `(string | number)[]` → `string | number`；`[string, number]` → `string | number`）。非数组类型原样返回。',
    difficulty: 'medium',
  },

  // ===== 映射类型 (9-12) =====
  {
    id: 9,
    question: '以下映射类型代码的作用是？\n\n```ts\ntype MyReadonly<T> = {\n  readonly [P in keyof T]: T[P];\n};\n```',
    options: [
      '将所有属性改为可选',
      '将所有属性改为 readonly',
      '删除所有属性',
      '将所有属性改为必填',
    ],
    answer: 1,
    explanation: '映射类型 `[P in keyof T]` 遍历 T 的所有键，`readonly` 修饰符将每个属性标记为只读。这是 TypeScript 内置 `Readonly<T>` 工具类型的实现原理。',
    difficulty: 'easy',
  },
  {
    id: 10,
    question: '以下 `Pick<T, K>` 的实现中，为什么需要 `K extends keyof T` 约束？\n\n```ts\ntype MyPick<T, K extends keyof T> = {\n  [P in K]: T[P];\n};\n```',
    options: [
      '不需要这个约束，去掉也能工作',
      '约束确保 K 的每个成员都是 T 的合法键，防止传入不存在于 T 中的键',
      '这个约束限制了 T 只能是对象类型',
      '这个约束让 K 自动变为 keyof T',
    ],
    answer: 1,
    explanation: '`K extends keyof T` 限制了 K 只能是 T 的已知键的子集。如果没有这个约束，传入 `MyPick<{a:1,b:2}, "c">` 时，`T["c"]` 会报错。加上约束后 TypeScript 会在调用时检查："c" 不在 keyof T 中，直接编译报错。',
    difficulty: 'medium',
  },
  {
    id: 11,
    question: 'TypeScript 4.1+ 的 `as` 重映射语法有什么作用？\n\n```ts\ntype Getters<T> = {\n  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];\n};\n```',
    options: [
      '将 T 的所有属性改为 getter 方法',
      '根据 T 的键生成新的键名（如 name → getName），值为返回 T[K] 的函数',
      '删除 T 的所有属性',
      '将 T 的所有值转为函数类型',
    ],
    answer: 1,
    explanation: '`as` 重映射（Key Remapping）允许在映射类型中变换键名。`Capitalize<string & K>` 将键名首字母大写（如 "name" → "Name"），`get` 前缀拼接后得到 "getName"。这是 TS 4.1 引入的强大特性，常用于生成 API 类型、getter/setter 等。',
    difficulty: 'hard',
  },
  {
    id: 12,
    question: '以下代码的 `FilterKeys` 类型是什么效果？\n\n```ts\ntype FilterKeys<T, U> = {\n  [K in keyof T]: T[K] extends U ? K : never;\n}[keyof T];\n```',
    options: [
      '返回 T 中所有键的集合',
      '返回 T 中值类型满足 U 的键名联合',
      '返回 T 中所有值类型',
      '返回 U 中所有键的集合',
    ],
    answer: 1,
    explanation: '这是一个"两步走"的映射+查询模式：第一步映射 `[K in keyof T]` 创建一个新类型，其中值类型满足 U 的键保留为 K，不满足的变为 never；第二步 `[keyof T]` 查询所有值（即索引访问），过滤掉 never，只留下符合条件的键名联合。常用于按值类型筛选属性。',
    difficulty: 'hard',
  },

  // ===== 类型守卫 (13-16) =====
  {
    id: 13,
    question: '自定义类型守卫中，`x is Type` 和 `asserts x is Type` 的区别是什么？',
    options: [
      '没有区别，只是语法不同',
      '`x is Type` 返回 boolean 用于条件分支收窄；`asserts x is Type` 不返回值，在断言通过后收窄，通不过则抛出异常',
      '`asserts x is Type` 只能在 class 中使用',
      '`x is Type` 只能用于原始类型',
    ],
    answer: 1,
    explanation: '`x is Type`（类型谓词）返回 boolean，true 表示值属于 Type；`asserts x is Type`（断言函数）不返回值，如果值不属于 Type 则抛出错误（如 `assert(typeof x === "string")`），通过后剩余代码中 x 被收窄为 string。两者都是"编译时收窄"机制，但运行时行为不同。',
    difficulty: 'hard',
  },
  {
    id: 14,
    question: '可辨识联合（Discriminated Union）的关键要素是什么？\n\n```ts\ntype Shape =\n  | { kind: "circle"; radius: number }\n  | { kind: "square"; side: number }\n  | { kind: "triangle"; base: number; height: number };\n```',
    options: [
      '任意联合类型都是可辨识联合',
      '必须有一个字面量类型的共有属性（如 kind）作为"辨识标签"，用于在 switch/case 中收窄',
      '必须使用 enum 作为辨识标签',
      '可辨识联合不能有泛型',
    ],
    answer: 1,
    explanation: '可辨识联合的三个要素：(1) 联合类型的所有成员都有一个共有属性（称为"标签"或"辨识符"）；(2) 该属性的类型是字面量类型（如 "circle" | "square"）；(3) TypeScript 在 switch/case 中通过该属性的值收窄到具体分支，提供精确的类型推断。',
    difficulty: 'medium',
  },
  {
    id: 15,
    question: '以下代码中，`isString` 函数的返回类型 `x is string` 是什么？\n\n```ts\nfunction isString(x: unknown): x is string {\n  return typeof x === "string";\n}\n\nconst value: unknown = "hello";\nif (isString(value)) {\n  // value 在这里是什么类型？\n}\n```',
    options: [
      'value 在 if 块内仍然是 unknown',
      'value 在 if 块内被收窄为 string',
      'value 在 if 块内是 never',
      'value 在 if 块内是 boolean',
    ],
    answer: 1,
    explanation: '返回类型 `x is string` 是一个"类型谓词"（Type Predicate）。当函数返回 true 时，TypeScript 编译器会将 `x` 在 true 分支内收窄为 `string`。这是自定义类型守卫的核心机制——让运行时检查的结果反映到编译时的类型系统中。',
    difficulty: 'medium',
  },
  {
    id: 16,
    question: '以下代码中 TypeScript 会报错吗？\n\n```ts\nfunction assertString(x: unknown): asserts x is string {\n  if (typeof x !== "string") {\n    throw new Error("Not a string!");\n  }\n}\n\nconst val: unknown = "hello";\nassertString(val);\nconsole.log(val.toUpperCase());\n```',
    options: [
      '会报错：assertString 后 val 仍然是 unknown',
      '不会报错：assertString 后 val 被收窄为 string，可以安全调用 toUpperCase()',
      '会报错：asserts x is string 语法不正确',
      '不会报错：但 toUpperCase 返回 any',
    ],
    answer: 1,
    explanation: '`asserts x is string` 是一个"断言守卫"（Assertion Guard）。当函数返回（即没有抛出异常）时，TypeScript 在后续代码中将 val 收窄为 string。因此 `val.toUpperCase()` 编译通过且类型安全。断言守卫在参数校验、类型收窄方面非常有用。',
    difficulty: 'hard',
  },
];
