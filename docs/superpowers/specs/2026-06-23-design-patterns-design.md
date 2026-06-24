# 设计模式专题 - 设计文档

## 1. 项目概述

**目标**：在 `react-interview` 主应用中新增一个"设计模式专题"大文件夹，用于系统性地展示前端常用设计模式的知识体系。

**范围**：
- 本次实现：设计模式概览页 + 观察者模式专题（含多个应用方式章节）
- 其他设计模式：纳入设计文档规划，标注为"后续讨论生成"

## 2. 目录结构

```
src/pages/design-patterns/
├── overview/                    # 概览页
│   ├── index.tsx               # 设计模式分类导航主页面
│   └── data.ts                 # 概览页纯数据（模式列表、分类、描述）
├── observer/                    # 观察者模式专题（本次实现）
│   ├── index.tsx               # 主页面，组合各应用章节
│   ├── data.ts                 # 纯数据（描述、原理、对比表等，不含代码字符串）
│   ├── LiveDemo.tsx            # 互动演示组件（可交互的观察者模式演示）
│   ├── demos/                   # 源码提取目录（Vite ?raw 导入）
│   │   ├── basic.bad.tsx       # 基础实现 - 反面教材（仅用于 ?raw 提取，不编译执行）
│   │   ├── basic.good.tsx      # 基础实现 - 最佳实践（仅用于 ?raw 提取）
│   │   ├── event-emitter.bad.tsx
│   │   ├── event-emitter.good.tsx
│   │   ├── react-context.bad.tsx
│   │   ├── react-context.good.tsx
│   │   ├── custom-hook.bad.tsx
│   │   └── custom-hook.good.tsx
│   └── chapters/              # 各应用方式章节组件（独立文件，主页面组合展示）
│       ├── BasicObserver.tsx    # 章节一：基础观察者实现（Subject + Observer 类）
│       ├── EventEmitter.tsx     # 章节二：EventEmitter 发布订阅模式
│       ├── ReactContext.tsx     # 章节三：React Context + useContext 订阅
│       └── CustomHook.tsx       # 章节四：自定义 Hook 封装（useObserver / useSubject）
├── singleton/                   # 单例模式（后续讨论生成）
├── factory/                     # 工厂模式（后续讨论生成）
├── adapter/                     # 适配器模式（后续讨论生成）
├── decorator/                   # 装饰器模式（后续讨论生成）
├── proxy/                       # 代理模式（后续讨论生成）
├── facade/                      # 外观模式（后续讨论生成）
├── strategy/                    # 策略模式（后续讨论生成）
├── command/                     # 命令模式（后续讨论生成）
├── iterator/                    # 迭代器模式（后续讨论生成）
├── state/                       # 状态模式（后续讨论生成）
├── builder/                     # 建造者模式（后续讨论生成）
└── composite/                   # 组合模式（后续讨论生成）
```

## 3. 路由配置

在主应用路由文件 `src/router/config.tsx` 中新增：

```tsx
// 懒加载组件
const DesignPatternsOverview = lazy(() => import('../pages/design-patterns/overview/index'));
const ObserverPattern = lazy(() => import('../pages/design-patterns/observer/index'));

// 路由配置
{
  path: '/dashboard/design-patterns',
  label: '设计模式专题',
  icon: <AppstoreOutlined />,  // 或选择合适的图标
  children: [
    {
      path: '/dashboard/design-patterns/overview',
      label: '设计模式概览',
      element: <DesignPatternsOverview />,
    },
    {
      path: '/dashboard/design-patterns/observer',
      label: '观察者模式',
      element: <ObserverPattern />,
    },
    // 其他模式路由后续添加
  ],
}
```

## 4. 页面结构规范

### 4.1 概览页结构 (`overview/index.tsx`)

概览页采用分类卡片布局，展示所有设计模式：

1. **页面标题**："设计模式专题"
2. **分类卡片区域**：按四大类分组展示
   - 创建型模式（单例、工厂、建造者）
   - 结构型模式（适配器、装饰器、代理、外观）
   - 行为型模式（观察者、策略、命令、迭代器、状态）
   - 前端特有模式（组合、Hooks、Render Props、HOC、发布订阅）
3. **每个模式卡片包含**：
   - 模式名称
   - 一句话定义
   - 典型应用场景标签
   - 点击跳转至对应专题页

### 4.2 观察者模式专题页结构 (`observer/index.tsx`)

主页面组合展示，顶部为模式总览，下方为各应用方式章节：

```
观察者模式专题页
├── 模式总览卡片
│   ├── 模式定义（一句话）
│   ├── 核心角色（Subject、Observer、ConcreteSubject、ConcreteObserver）
│   └── 结构关系简述
├── 章节一：基础观察者实现（BasicObserver.tsx）
├── 章节二：EventEmitter 发布订阅（EventEmitter.tsx）
├── 章节三：React Context 订阅（ReactContext.tsx）
├── 章节四：自定义 Hook 封装（CustomHook.tsx）
└── 模式关联与对比卡片（观察者 vs 发布订阅 vs 中介者）
```

### 4.3 每个应用方式章节结构（六维度）

每个章节组件（如 `BasicObserver.tsx`）遵循以下六维度结构：

| 维度 | 内容 | 组件 |
|------|------|------|
| **一、模式意图** | 该应用方式解决什么具体问题 | Card + Typography |
| **二、结构原理** | 角色关系、数据流向、UML 描述 | Card + 文字描述 + 可选图表 |
| **三、代码实现** | Bad vs Good 代码对比 | CodeDiff（?raw 引入 demos/） |
| **四、前端实战场景** | 何时使用、何时避免、优缺点清单 | Card + List/Table |
| **五、Live Demo** | 可交互演示 | Card + LiveDemo 组件 |
| **六、核心原理与模式关联** | 深层机制、与其他模式的区别 | Card（蓝色背景）+ Typography |

## 5. 代码组织规范

### 5.1 数据与代码分离原则

- `data.ts` 只存放纯数据：描述文本、原理要点、对比表格数据、优缺点清单
- 所有通过 `CodeDiff` 展示的 Bad/Good Code 必须提取到 `demos/` 目录下的独立文件中，通过 `?raw` 导入

### 5.2 源码提取规范（?raw 模式）

```typescript
// 在章节组件中导入
import basicBadCode from './demos/basic.bad.tsx?raw';
import basicGoodCode from './demos/basic.good.tsx?raw';

// 在 JSX 中使用
<CodeDiff
  oldValue={basicBadCode}
  newValue={basicGoodCode}
  leftTitle="❌ 反面教材"
  rightTitle="✅ 最佳实践"
  type="error"
  hideDiffMarkers={true}
/>
```

### 5.3 文件命名约定

- 反面教材：`.bad.tsx` 后缀
- 最佳实践：`.good.tsx` 后缀
- `.bad.tsx` 文件通过 `tsconfig.json` 中的 `exclude` 排除，不参与类型检查

### 5.4 样式规范

- 所有 styled-components 生成的样式变量都放在组件页面的最后
- 优先使用 Ant Design 组件和现有样式系统

## 6. 观察者模式应用方式规划（本次实现）

### 章节一：基础观察者实现（BasicObserver）

**场景**：手写 Subject + Observer 类，展示最原始的观察者模式实现

**Bad Code**：
- 直接修改全局状态，组件间强耦合
- 状态变更后手动通知每个依赖组件

**Good Code**：
- 定义 Subject 基类（维护观察者列表、提供 attach/detach/notify 方法）
- 定义 Observer 接口（update 方法）
- 具体 Subject 和 Observer 实现

### 章节二：EventEmitter 发布订阅（EventEmitter）

**场景**：Node.js 风格的 EventEmitter 在前端的应用

**Bad Code**：
- 使用全局变量传递事件
- 事件名硬编码，无类型安全

**Good Code**：
- 封装类型安全的 EventEmitter 类
- 支持事件命名空间
- 自动清理未使用的事件监听

### 章节三：React Context 订阅（ReactContext）

**场景**：React 中跨层级组件通信

**Bad Code**：
- props drilling 多层传递
- 不必要的重渲染

**Good Code**：
- Context + useContext 实现订阅
- 使用 useMemo/useCallback 优化重渲染
- 拆分 Context 避免大范围更新

### 章节四：自定义 Hook 封装（CustomHook）

**场景**：将观察者模式封装为可复用的 React Hook

**Bad Code**：
- 每个组件重复实现订阅逻辑
- 内存泄漏（未清理订阅）

**Good Code**：
- useObserver Hook：自动订阅和清理
- useSubject Hook：提供状态管理和通知功能
- 支持选择器优化（仅监听特定字段变更）

## 7. 其他设计模式规划（后续讨论生成）

以下模式纳入设计文档规划，但本次不实现，后续逐个讨论生成：

### 创建型模式
- **单例模式（Singleton）**：全局状态管理、配置对象、缓存实例
- **工厂模式（Factory）**：组件工厂、API 客户端创建、跨平台适配
- **建造者模式（Builder）**：复杂表单配置、链式调用构建对象

### 结构型模式
- **适配器模式（Adapter）**：第三方库封装、API 响应格式转换、旧代码兼容
- **装饰器模式（Decorator）**：高阶组件（HOC）、中间件、AOP 编程
- **代理模式（Proxy）**：虚拟代理（图片懒加载）、保护代理（权限控制）、缓存代理
- **外观模式（Facade）**：复杂 API 封装、子系统统一入口

### 行为型模式
- **策略模式（Strategy）**：表单验证策略、排序算法切换、支付方式选择
- **命令模式（Command）**：撤销/重做、操作队列、宏命令
- **迭代器模式（Iterator）**：自定义遍历逻辑、异步数据流遍历
- **状态模式（State）**：状态机实现、页面流程控制、游戏状态管理

### 前端特有模式
- **组合模式（Composite）**：React 组件树、嵌套菜单、文件树
- **Hooks 模式**：useEffect、useState、自定义 Hook 的组合使用
- **Render Props**：组件逻辑复用、跨组件状态共享
- **HOC 高阶组件**：权限控制、日志记录、数据注入
- **发布订阅模式（Pub/Sub）**：EventBus、全局消息中心

## 8. 组件复用说明

- **CodeDiff**：复用 `src/components/CodeDiff.tsx` 进行代码对比展示
- **LiveDemo**：每个模式专题自行实现互动演示组件
- **Ant Design 组件**：Card、Typography、Tag、Table、List、Alert、Divider、Steps 等

## 9. 实现顺序

1. 创建目录结构
2. 实现概览页 (`overview/`)
3. 实现观察者模式主页面 (`observer/index.tsx`)
4. 实现观察者模式数据文件 (`observer/data.ts`)
5. 实现观察者模式 LiveDemo (`observer/LiveDemo.tsx`)
6. 实现各章节组件和对应的 demos/ 文件
7. 配置路由
8. 验证和测试

## 10. 注意事项

- 所有代码注释和文档解释必须使用中文
- 遵循现有项目的代码风格和命名规范
- 确保新路由与 qiankun 微应用集成无冲突
- 懒加载组件以优化首屏性能
- `.bad.tsx` 文件必须被 TypeScript 排除，避免编译错误
