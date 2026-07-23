export interface ChapterItem {
  key: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  topics: string[];
  path?: string;
}

export const chapters: ChapterItem[] = [
  {
    key: 'basics',
    order: 1,
    title: '基础类型系统',
    subtitle: 'Type System Fundamentals',
    description:
      '从原始类型到联合/交叉类型，从类型推断到类型断言，系统掌握 TypeScript 类型系统的核心概念。',
    topics: [
      '原始类型与对象类型',
      '类型注解与类型推断',
      '类型断言与非空断言',
      '联合类型与交叉类型',
      '字面量类型与 const 断言',
      '元组与枚举',
    ],
    path: '/dashboard/typescript/basics',
  },
  {
    key: 'interface-type',
    order: 2,
    title: '接口与类型别名',
    subtitle: 'Interface vs Type',
    description:
      '深入对比 Interface 和 Type 的异同，掌握索引签名、映射类型、声明合并等进阶用法。',
    topics: [
      'Interface 的核心特性',
      'Type 别名的能力边界',
      '索引签名与 keyof',
      '映射类型（Mapped Types）',
      '声明合并',
    ],
  },
  {
    key: 'generics',
    order: 3,
    title: '泛型编程',
    subtitle: 'Generic Programming',
    description:
      '从泛型函数到泛型约束，从条件类型到 infer 推导，掌握 TypeScript 最强大的抽象工具。',
    topics: [
      '泛型函数与泛型类',
      '泛型约束（extends）',
      '条件类型（Conditional Types）',
      'infer 类型推导',
      '分布式条件类型',
    ],
  },
  {
    key: 'class-oop',
    order: 4,
    title: '类与面向对象',
    subtitle: 'Classes & OOP',
    description:
      'TypeScript 对 ES6 Class 的类型增强，包括访问修饰符、抽象类、implements 与装饰器。',
    topics: [
      'public / private / protected',
      'readonly 与参数属性',
      '抽象类与抽象方法',
      'implements 与 interface',
      '装饰器（Decorators）',
    ],
  },
  {
    key: 'type-guards',
    order: 5,
    title: '类型守卫与类型操作',
    subtitle: 'Type Guards & Narrowing',
    description:
      '掌握类型收窄的多种方式，从 typeof 到自定义类型守卫，确保代码的类型安全。',
    topics: [
      'typeof / instanceof 类型守卫',
      'in 操作符与字面量收窄',
      '自定义类型谓词（is）',
      '可辨识联合（Discriminated Union）',
      '断言函数（asserts）',
    ],
  },
  {
    key: 'advanced-types',
    order: 6,
    title: '高级类型系统',
    subtitle: 'Advanced Types',
    description:
      '深入映射类型、模板字面量类型、递归类型，领略类型系统"图灵完备"的编程能力。',
    topics: [
      'keyof 与 Lookup Types',
      '映射类型的修饰符',
      '模板字面量类型',
      '递归类型',
      '类型体操实战',
    ],
  },
  {
    key: 'utility-types',
    order: 7,
    title: '工具类型实现原理',
    subtitle: 'Utility Types Deep Dive',
    description:
      '手写实现 TypeScript 内置工具类型，不仅会用更懂其底层实现机制。',
    topics: [
      'Partial / Required / Readonly',
      'Pick / Omit / Exclude',
      'Extract / NonNullable',
      'ReturnType / Parameters',
      'Record / PickByType',
    ],
  },
  {
    key: 'declaration',
    order: 8,
    title: '声明文件',
    subtitle: 'Declaration Files',
    description:
      '掌握 .d.ts 文件的编写规范，理解 @types 运作机制，为任意 JS 库编写类型声明。',
    topics: [
      '.d.ts 基本结构',
      '模块声明与全局声明',
      '@types 与 DefinitelyTyped',
      '三斜线指令',
      '模块增强（Module Augmentation）',
    ],
  },
  {
    key: 'config',
    order: 9,
    title: 'TS 配置与工程化',
    subtitle: 'Configuration & Engineering',
    description:
      '从 tsconfig 核心配置到项目引用（Project References），全面理解 TS 工程化最佳实践。',
    topics: [
      'tsconfig 核心配置详解',
      'strict 系列配置',
      'Project References',
      'TS 与 Babel / SWC 集成',
      'Monorepo 中的 TS 配置',
    ],
  },
  {
    key: 'type-challenges',
    order: 10,
    title: '类型体操实战',
    subtitle: 'Type Challenges',
    description:
      '精选面试高频的类型体操题，从 Easy 到 Hard 逐级进阶，彻底攻克 TS 面试难点。',
    topics: [
      '实现 Pick / Readonly / TupleToObject',
      '实现 ReturnType / Omit / Last',
      '实现 Promise.all / GetReturnType',
      '字符串类型操作',
      '联合类型的全排列',
    ],
  },
];
