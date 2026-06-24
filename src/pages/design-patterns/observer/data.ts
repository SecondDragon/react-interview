/**
 * 观察者模式专题纯数据
 * 包含描述文本、原理要点、对比表格数据、优缺点清单等
 * 不含代码字符串（代码通过 demos/ 目录下的 ?raw 导入）
 */

export const ObserverMeta = {
  title: '观察者模式 (Observer Pattern)',
  description:
    '定义对象间的一种一对多依赖关系，当一个对象（Subject）状态发生改变时，所有依赖于它的对象（Observer）都得到通知并被自动更新。',
};

// 模式总览信息
export const patternOverview = {
  definition:
    '观察者模式是一种行为型设计模式，它定义了对象之间的一对多依赖关系，使得每当一个对象状态发生改变时，其相关依赖对象皆得到通知并被自动更新。',
  roles: [
    { name: 'Subject（主题）', desc: '维护观察者列表，提供 attach/detach/notify 方法' },
    { name: 'Observer（观察者）', desc: '定义更新接口，接收主题通知' },
    { name: 'ConcreteSubject（具体主题）', desc: '存储具体状态，状态变更时通知所有观察者' },
    { name: 'ConcreteObserver（具体观察者）', desc: '实现更新接口，维护与主题状态的一致性' },
  ],
  umlDescription: `
Subject <>-- Observer : 维护列表
Subject : +attach(Observer)
Subject : +detach(Observer)
Subject : +notify()
Observer : +update()
ConcreteSubject --|> Subject
ConcreteObserver --|> Observer
ConcreteSubject --> ConcreteObserver : 通知更新
  `,
};

// 章节一：基础观察者实现
export const basicObserverData = {
  intent: '手写 Subject + Observer 类，展示最原始的观察者模式实现。解决"状态变更后需要手动通知多个依赖组件"的问题。',
  principle: `
1. Subject 维护一个观察者列表（数组）
2. 观察者通过 attach() 方法注册到主题
3. 观察者通过 detach() 方法从主题注销
4. 主题状态变更时，调用 notify() 遍历所有观察者，执行 update() 方法
5. 每个观察者收到通知后，根据自身逻辑更新状态
  `,
  scenarios: {
    suitable: [
      '需要实现简单的状态订阅机制',
      '多个对象需要监听同一个数据源',
      '需要解耦数据生产者与消费者',
    ],
    unsuitable: [
      '观察者链路过长，导致性能问题',
      '需要精确控制通知顺序',
      '观察者之间需要复杂的依赖关系',
    ],
  },
  prosCons: [
    { type: 'pro', text: '实现了主题与观察者之间的松耦合' },
    { type: 'pro', text: '支持广播通信，一个主题可以通知多个观察者' },
    { type: 'pro', text: '符合开闭原则，新增观察者无需修改主题代码' },
    { type: 'con', text: '如果观察者过多，通知开销较大' },
    { type: 'con', text: '观察者之间可能存在循环依赖' },
    { type: 'con', text: '通知顺序不确定，可能导致竞态条件' },
  ],
  deepPrinciple: `
观察者模式的核心在于"依赖倒置"：主题不依赖于具体的观察者，而是依赖于抽象的 Observer 接口。

在 JavaScript 中，由于语言特性，我们可以直接用函数作为观察者，也可以用类来模拟。关键在于：
1. 主题只关心"观察者有一个 update 方法"，不关心观察者具体是谁
2. 这种抽象使得系统可以灵活扩展，新增观察者类型不需要修改主题
3. 这也是发布订阅模式与观察者模式的本质区别：观察者模式中主题知道观察者的存在，而发布订阅模式中发布者和订阅者完全解耦
  `,
};

// 章节二：EventEmitter 发布订阅
export const eventEmitterData = {
  intent: 'Node.js 风格的 EventEmitter 在前端的应用。解决"事件名硬编码、无类型安全、全局变量传递事件"的问题。',
  principle: `
1. EventEmitter 维护一个事件名到监听器数组的映射（Map<string, Function[]>）
2. on(event, listener) 将监听器注册到对应事件名
3. off(event, listener) 从对应事件名移除监听器
4. emit(event, ...args) 触发事件，遍历并调用所有监听器
5. 支持事件命名空间，便于管理和清理
  `,
  scenarios: {
    suitable: [
      '需要实现跨组件的事件通信',
      '需要支持动态的事件订阅和取消',
      '需要类型安全的事件系统',
    ],
    unsuitable: [
      '事件名管理混乱，难以追踪',
      '过度使用导致代码难以维护',
      '需要同步的、确定性的调用顺序',
    ],
  },
  prosCons: [
    { type: 'pro', text: '发布者和订阅者完全解耦，彼此不知道对方存在' },
    { type: 'pro', text: '支持一对多、多对多的通信模式' },
    { type: 'pro', text: '可以动态添加和移除监听器' },
    { type: 'con', text: '事件名硬编码，容易出错' },
    { type: 'con', text: '内存泄漏风险（忘记移除监听器）' },
    { type: 'con', text: '调试困难，难以追踪事件流向' },
  ],
  deepPrinciple: `
EventEmitter 是观察者模式的变体，核心区别在于"中间层"的引入。

在经典观察者模式中，Subject 直接维护 Observer 列表；而在 EventEmitter 中：
1. 发布者（Publisher）只负责 emit 事件，不关心谁监听
2. 事件中心（EventCenter）维护事件名到监听器的映射
3. 订阅者（Subscriber）只负责 on/off 事件，不关心谁发布

这种三层架构实现了完全的解耦，但也带来了调试困难的问题。TypeScript 可以通过类型定义来改善事件名的类型安全。

内存泄漏是 EventEmitter 的常见问题：如果组件销毁时忘记 off 事件，监听器函数及其闭包中的引用将无法被 GC 回收。
  `,
};

// 章节三：React Context 订阅
export const reactContextData = {
  intent: 'React 中跨层级组件通信。解决"props drilling 多层传递、不必要的重渲染"的问题。',
  principle: `
1. React.createContext 创建一个 Context 对象
2. Context.Provider 提供数据，包裹需要共享数据的组件树
3. useContext(Context) 在子组件中订阅数据变化
4. 当 Provider 的 value 变化时，所有订阅该 Context 的组件都会重新渲染
5. 使用 useMemo/useCallback 优化，避免不必要的重渲染
6. 拆分 Context 为多个独立的 Context，避免大范围更新
  `,
  scenarios: {
    suitable: [
      '需要跨多层组件传递数据',
      '主题、语言等全局状态共享',
      '小型应用的状态管理',
    ],
    unsuitable: [
      '频繁更新的数据（会导致大量重渲染）',
      '大型应用的全局状态管理（建议使用 Redux/Zustand）',
      '需要精确控制订阅粒度的场景',
    ],
  },
  prosCons: [
    { type: 'pro', text: '避免 props drilling，代码更简洁' },
    { type: 'pro', text: 'React 原生支持，无需额外库' },
    { type: 'pro', text: '与组件生命周期集成良好' },
    { type: 'con', text: 'Context 变化会导致所有订阅组件重渲染' },
    { type: 'con', text: '不适合高频更新的场景' },
    { type: 'con', text: '调试相对困难，数据流向不透明' },
  ],
  deepPrinciple: `
React Context 的底层实现基于 React 的"订阅-发布"机制。

当 Provider 的 value 变化时：
1. React 会标记该 Provider 下所有消费了该 Context 的组件为"需要更新"
2. 在 reconciliation 阶段，这些组件会重新执行 render 函数
3. 如果使用了 React.memo 或 useMemo，可以跳过不必要的渲染

性能优化关键点：
1. 拆分 Context：将高频变化和低频变化的数据拆分到不同的 Context
2. 使用 useMemo 包裹 value 对象，避免每次渲染都创建新引用
3. 使用 useSelector 模式（如 react-redux 的 useSelector）精确选择需要的字段

Context 与 Redux 的区别：
- Context 是 React 的"依赖注入"机制，不是专门的状态管理方案
- Redux 提供了更完善的状态管理工具链（中间件、时间旅行调试、DevTools）
- 对于简单场景，Context + useReducer 可以替代 Redux
  `,
};

// 章节四：自定义 Hook 封装
export const customHookData = {
  intent: '将观察者模式封装为可复用的 React Hook。解决"每个组件重复实现订阅逻辑、内存泄漏"的问题。',
  principle: `
1. useObserver Hook：接收一个 Subject，自动订阅和清理
2. useSubject Hook：提供状态管理和通知功能
3. 使用 useEffect 的 cleanup 函数确保组件卸载时自动取消订阅
4. 支持选择器优化（selector），仅监听特定字段变更
5. 使用 useSyncExternalStore（React 18+）实现与外部存储的同步
  `,
  scenarios: {
    suitable: [
      '需要在多个组件中复用订阅逻辑',
      '需要自动管理订阅的生命周期',
      '需要与外部状态管理库集成',
    ],
    unsuitable: [
      '简单的父子组件通信（直接用 props）',
      '只需要一次性的订阅（直接在 useEffect 中写即可）',
      '对性能要求极高的场景（需要更精细的控制）',
    ],
  },
  prosCons: [
    { type: 'pro', text: '逻辑复用，避免重复代码' },
    { type: 'pro', text: '自动管理订阅生命周期，防止内存泄漏' },
    { type: 'pro', text: '与 React 组件模型完美融合' },
    { type: 'con', text: '增加了抽象层级，理解成本上升' },
    { type: 'con', text: 'Hook 之间可能存在隐式依赖' },
    { type: 'con', text: '调试时需要理解 Hook 内部逻辑' },
  ],
  deepPrinciple: `
自定义 Hook 是 React 16.8 引入 Hooks 后最重要的模式创新。它将组件逻辑提取到可复用的函数中，同时保持与 React 生命周期的绑定。

useObserver 的实现要点：
1. 在 useEffect 中执行订阅，返回清理函数执行取消订阅
2. 使用 useState 或 useSyncExternalStore 存储订阅的数据
3. 使用 useCallback 缓存事件处理函数，避免不必要的重订阅

useSyncExternalStore（React 18）：
这是 React 官方推荐的与外部存储同步的方式。它处理了：
1. 服务端渲染的 hydration 问题
2. 并发渲染下的 tearing 问题（数据不一致）
3. 自动管理订阅和清理

内存泄漏防护：
Hook 的 cleanup 函数是防止内存泄漏的关键。当组件卸载时，React 会自动调用 cleanup 函数，确保：
1. 事件监听器被移除
2. 定时器被清除
3. 外部订阅被取消
4. 闭包中的引用被释放
  `,
};

// 模式关联对比表
export const patternComparison = [
  {
    dimension: '耦合程度',
    observer: 'Subject 知道 Observer 存在（直接引用）',
    pubSub: '发布者和订阅者完全解耦（通过事件中心）',
    mediator: '所有对象通过中介者通信，彼此不知道对方',
  },
  {
    dimension: '通信方式',
    observer: '一对一或一对多（直接通知）',
    pubSub: '一对多或多对多（通过事件名）',
    mediator: '多对多（通过中介者转发）',
  },
  {
    dimension: '适用场景',
    observer: '状态同步、数据绑定',
    pubSub: '跨模块通信、事件总线',
    mediator: '复杂对象间的协调、聊天室',
  },
  {
    dimension: '调试难度',
    observer: '较低（调用链清晰）',
    pubSub: '较高（事件流向不透明）',
    mediator: '中等（集中在中介者）',
  },
];

export const comparisonColumns = [
  {
    title: '对比维度',
    dataIndex: 'dimension',
    key: 'dimension',
  },
  {
    title: '观察者模式',
    dataIndex: 'observer',
    key: 'observer',
  },
  {
    title: '发布订阅模式',
    dataIndex: 'pubSub',
    key: 'pubSub',
  },
  {
    title: '中介者模式',
    dataIndex: 'mediator',
    key: 'mediator',
  },
];
