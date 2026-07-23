export interface QuizItem {
  id: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TopicSection {
  key: string;
  title: string;
  content: string;
  codeExample?: string;
}

export const interviewQuestions: QuizItem[] = [
  {
    id: 1,
    question:
      'TypeScript 中 `any`、`unknown`、`never` 三者的核心区别是什么？',
    options: [
      '三者没有区别，只是命名不同',
      'any 和 unknown 都是 top type（任何值可赋给它们），但 any 放弃编译检查而 unknown 强制收窄；never 是 bottom type（空集），可赋给任何类型',
      'unknown 是 any 的类型安全版本，必须收窄后才能操作；never 表示不可能的值',
      'any 只能赋值给 any 类型，unknown 可以赋值给任意类型',
    ],
    answer: 2,
    explanation:
      '三者从类型层级、赋值规则、操作限制三个维度有本质区别：\n\n' +
      '1. **类型层级**：any 和 unknown 都是顶级类型（top type），意味着"任何类型都可以赋值给它们"；never 是底部类型（bottom type），"never 可以赋值给任何类型"。\n\n' +
      '2. **作为源头（赋给别人）**：any→任何类型（放弃检查✅），unknown→只能赋给 any 自身（必须收窄后才能赋给别人❌），never→任何类型（空集是子集✅）。\n\n' +
      '3. **作为目标（别人赋给它）**：any 接收任何类型✅，unknown 接收任何类型✅，never 只接收 never❌。\n\n' +
      '4. **操作限制**：any 可以任意调用方法/访问属性（编译不报错但可能运行时崩溃）；unknown 必须先通过 typeof/instanceof 等类型守卫收窄才能操作；never 不可能持有值（没有操作可言）。',
    difficulty: 'hard',
  },
  {
    id: 2,
    question:
      '什么是类型推断（Type Inference）？以下代码中 `result` 的类型是什么？\n\n```ts\nconst add = (a: number, b: number) => a + b;\nconst result = add(1, 2);\n```',
    options: [
      'TypeScript 无法推断 result 的类型',
      'result 的类型是 `any`',
      'result 的类型是 `number`，因为 TypeScript 会根据返回值自动推断',
      'result 的类型是 `string`',
    ],
    answer: 2,
    explanation:
      'TypeScript 编译器能根据函数的实现自动推断返回类型。`add` 函数返回 `a + b`（两个 number 相加），所以返回类型被推断为 `number`，`result` 也因此被推断为 `number`。',
    difficulty: 'easy',
  },
  {
    id: 3,
    question:
      '类型断言 `as` 和 `<Type>` 语法在 JSX 中的使用时有什么区别？',
    options: [
      '完全等价，没有区别',
      '`as` 是 ES 标准语法，`<Type>` 是 TS 语法',
      '在 JSX 中 `<Type>` 语法与 JSX 标签冲突，必须使用 `as` 语法',
      '`<Type>` 性能更好，推荐使用',
    ],
    answer: 2,
    explanation:
      '在 JSX/TSX 文件中，`<Type>value` 语法会被解析为 JSX 标签，导致冲突。因此 TypeScript 官方推荐在 TSX 中统一使用 `value as Type` 语法。在非 JSX 的 `.ts` 文件中两者等价。',
    difficulty: 'easy',
  },
  {
    id: 4,
    question:
      '以下代码会导致 TypeScript 编译错误吗？\n\n```ts\ninterface A { name: string; }\ninterface B { age: number; }\ntype C = A & B;\nconst obj: C = { name: "Tom" };\n```',
    options: [
      '不会报错，交叉类型允许只满足部分条件',
      '会报错，因为 obj 缺少 `age` 属性',
      '会报错，因为 A 和 B 不能交叉',
      '不会报错，TypeScript 会自动给 age 赋默认值',
    ],
    answer: 1,
    explanation:
      '交叉类型 `A & B` 要求对象同时满足 A 和 B 的所有属性。`obj` 缺少 `age: number`，因此 TypeScript 会报错：类型 `{ name: string }` 不能赋值给类型 `C`。',
    difficulty: 'easy',
  },
  {
    id: 5,
    question:
      '`as const` 断言的作用是什么？以下代码中 `status` 的类型是？\n\n```ts\nconst status = "success" as const;\n```',
    options: [
      'status 的类型是 `string`',
      'status 的类型是 `"success"`（字面量类型），且为 readonly',
      'status 的类型是 `any`',
      'status 的类型是 `const string`',
    ],
    answer: 1,
    explanation:
      '`as const` 是 const 断言，它告诉 TypeScript 将值推断为最具体的类型——字面量类型，且所有属性变为 readonly。`"success" as const` 的类型是 `"success"` 而不是 `string`，这常用于联合类型的字面量、枚举替代等场景。',
    difficulty: 'medium',
  },
  {
    id: 6,
    question:
      '联合类型 `|` 和交叉类型 `&` 的区别是什么？',
    options: [
      '`|` 表示取交集，`&` 表示取并集',
      '`|` 表示值可以是其中任意一种类型，`&` 表示值必须同时满足所有类型',
      '两者没有区别',
      '`|` 只能用于原始类型，`&` 只能用于对象类型',
    ],
    answer: 1,
    explanation:
      '联合类型 `A | B` 表示值可以是 A 类型或 B 类型（"或"的关系）。交叉类型 `A & B` 表示值必须同时满足 A 和 B（"与"的关系）。联合的关键是"一员即可"，交叉的关键是"全部包含"。',
    difficulty: 'easy',
  },
  {
    id: 7,
    question:
      '什么是字面量类型（Literal Types）？以下哪个代码片段使用了字面量类型？',
    options: [
      '```ts\nlet name: string = "hello";\n```',
      '```ts\nlet count: number = 42;\n```',
      '```ts\ntype Direction = "up" | "down" | "left" | "right";\nconst dir: Direction = "up";\n```',
      '```ts\nconst arr: number[] = [1, 2, 3];\n```',
    ],
    answer: 2,
    explanation:
      '字面量类型是指使用具体的值作为类型，如 `"up"`、`42`、`true`。常用于联合类型来限制变量只能取特定的值集合，比 `string` 更加精确安全。',
    difficulty: 'easy',
  },
  {
    id: 8,
    question:
      '元组类型（Tuple）和数组类型（Array）的关键区别是什么？',
    options: [
      '没有区别，元组就是数组的别名',
      '元组限制了每个位置的元素类型和长度，数组只限制元素类型',
      '数组可以有任意长度，元组必须是两个元素',
      '元组只能存储相同类型的元素',
    ],
    answer: 1,
    explanation:
      '数组类型 `number[]` 只限制元素类型为 number，长度不限。元组如 `[string, number]` 精确约束了每个位置的类型和数组长度。元组比数组更"定型"——它描述了结构而非集合。',
    difficulty: 'easy',
  },
  {
    id: 9,
    question:
      'TypeScript 中 `enum` 和 `const enum` 的区别是什么？',
    options: [
      '`const enum` 在编译后会被内联消除，不生成 JavaScript 代码',
      '`const enum` 不能使用字符串值',
      '`const enum` 和 `enum` 运行时行为完全相同',
      '`const enum` 只能用于数字枚举',
    ],
    answer: 0,
    explanation:
      '`const enum` 在编译时会被内联（inline），枚举成员直接替换为对应的字面量值，不生成 JavaScript 枚举对象代码。这减少了运行时开销（摇树优化），但意味着不能反向映射（通过值获取名称）。普通 `enum` 会生成双向映射的 JS 对象。',
    difficulty: 'hard',
  },
  {
    id: 10,
    question:
      '什么是类型收窄（Type Narrowing）？以下代码中 `printId` 函数使用了哪种收窄方式？\n\n```ts\nfunction printId(id: string | number) {\n  if (typeof id === "string") {\n    console.log(id.toUpperCase());\n  }\n}\n```',
    options: [
      '使用了类型断言进行收窄',
      '使用了 typeof 类型守卫进行收窄，将联合类型缩小到具体的分支类型',
      '没有进行类型收窄，代码会报错',
      '使用了 instanceof 类型守卫',
    ],
    answer: 1,
    explanation:
      '类型收窄（Narrowing）是指 TypeScript 通过条件分支（typeof、instanceof、in 等）将宽泛的类型缩小为更具体的子类型。在 if 块内，`id` 的类型从 `string | number` 收窄为 `string`，因此可以安全调用 `toUpperCase()`。',
    difficulty: 'medium',
  },
  {
    id: 11,
    question:
      'TypeScript 中 `void` 和 `undefined` 的区别是什么？',
    options: [
      '完全等价，void 就是 undefined 的别名',
      'void 表示函数没有返回值或返回 undefined，而 undefined 是一个具体的值类型',
      'void 只能用于函数返回值，undefined 可以用于变量声明',
      'void 类型不能赋值 undefined',
    ],
    answer: 1,
    explanation:
      '`void` 是函数返回值的类型注解，表示函数不返回有意义的值（返回 `undefined` 或 `null` 都不报错）。而 `undefined` 是一个具体值及其类型。在严格模式下，`void` 类型的变量只能被赋值为 `undefined` 或 `null`（非 strict 模式下），但 `undefined` 类型变量只能被赋值为 `undefined`。',
    difficulty: 'medium',
  },
  {
    id: 12,
    question:
      '以下代码的编译结果是什么？\n\n```ts\nlet x: number | null | undefined;\nx = 42;\nx = null;\nx = undefined;\n```',
    options: [
      '编译正常，所有赋值都合法',
      '第三行 `x = null` 会报错',
      '第四行 `x = undefined` 会报错',
      '第二行 `x = 42` 会报错',
    ],
    answer: 0,
    explanation:
      '变量 `x` 的类型是联合类型 `number | null | undefined`，因此它可以接收 `number` 值、`null` 和 `undefined`。所有赋值都合法。但在实际代码中，使用 `x` 前需要先通过类型守卫收窄才能调用 number 的方法。',
    difficulty: 'easy',
  },
];

export const topicSections = [
  {
    key: 'primitive',
    title: '原始类型与对象类型',
    content: `TypeScript 的原始类型包括 number、string、boolean、null、undefined、symbol、bigint。对象类型则通过接口（interface）、类（class）或类型别名（type）来定义。`,
  },
  {
    key: 'inference',
    title: '类型注解与类型推断',
    content: `类型注解（Type Annotation）是显式声明变量的类型；类型推断（Type Inference）是 TypeScript 编译器根据赋值或返回值自动推导类型。`,
  },
  {
    key: 'assertion',
    title: '类型断言',
    content: `类型断言（Type Assertion）告诉编译器"我知道这个值的类型是什么"，不会进行运行时转换。使用 as 语法或尖括号语法。`,
  },
  {
    key: 'union-intersection',
    title: '联合类型与交叉类型',
    content: `联合类型（|）表示值可以是多种类型中的一种；交叉类型（&）表示值必须同时满足所有类型的约束。`,
  },
  {
    key: 'literal',
    title: '字面量类型与 const 断言',
    content: `字面量类型使用具体的值作为类型，可以结合联合类型限制变量取值的集合。as const 将表达式推断为最具体的字面量类型。`,
  },
  {
    key: 'tuple-enum',
    title: '元组与枚举',
    content: `元组精确约束每个位置的类型和数组长度；枚举定义有命名的一组常量。const enum 编译时内联消除，不生成代码。`,
  },
];
