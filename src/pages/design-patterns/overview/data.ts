/**
 * 设计模式概览页纯数据
 * 包含所有设计模式的分类、描述、场景等信息
 */

export type PatternCategory = 'creational' | 'structural' | 'behavioral' | 'frontend';

export interface DesignPattern {
  key: string;
  name: string;
  description: string;
  scenarios: string[];
  path: string;
  available: boolean;
}

export interface PatternCategoryData {
  type: PatternCategory;
  patterns: DesignPattern[];
}

export const patternCategories: PatternCategoryData[] = [
  {
    type: 'creational',
    patterns: [
      {
        key: 'singleton',
        name: '单例模式',
        description: '确保一个类只有一个实例，并提供一个全局访问点。常用于全局状态管理、配置对象等场景。',
        scenarios: ['全局状态管理', '配置对象', '缓存实例'],
        path: '/dashboard/design-patterns/singleton',
        available: false,
      },
      {
        key: 'factory',
        name: '工厂模式',
        description: '定义一个创建对象的接口，让子类决定实例化哪一个类。将对象创建逻辑与使用逻辑分离。',
        scenarios: ['组件工厂', 'API 客户端创建', '跨平台适配'],
        path: '/dashboard/design-patterns/factory',
        available: false,
      },
      {
        key: 'builder',
        name: '建造者模式',
        description: '将一个复杂对象的构建与其表示分离，使得同样的构建过程可以创建不同的表示。',
        scenarios: ['复杂表单配置', '链式调用构建对象', 'SQL 构建器'],
        path: '/dashboard/design-patterns/builder',
        available: false,
      },
    ],
  },
  {
    type: 'structural',
    patterns: [
      {
        key: 'adapter',
        name: '适配器模式',
        description: '将一个类的接口转换成客户希望的另外一个接口。使得原本由于接口不兼容而不能一起工作的类可以协同工作。',
        scenarios: ['第三方库封装', 'API 响应格式转换', '旧代码兼容'],
        path: '/dashboard/design-patterns/adapter',
        available: false,
      },
      {
        key: 'decorator',
        name: '装饰器模式',
        description: '动态地给一个对象添加一些额外的职责。就增加功能来说，比生成子类更为灵活。',
        scenarios: ['高阶组件(HOC)', '中间件', 'AOP 编程'],
        path: '/dashboard/design-patterns/decorator',
        available: false,
      },
      {
        key: 'proxy',
        name: '代理模式',
        description: '为其他对象提供一种代理以控制对这个对象的访问。可以在访问对象时添加额外逻辑。',
        scenarios: ['虚拟代理(图片懒加载)', '保护代理(权限控制)', '缓存代理'],
        path: '/dashboard/design-patterns/proxy',
        available: false,
      },
      {
        key: 'facade',
        name: '外观模式',
        description: '为子系统中的一组接口提供一个统一的高层接口。使得子系统更容易使用。',
        scenarios: ['复杂 API 封装', '子系统统一入口', 'SDK 封装'],
        path: '/dashboard/design-patterns/facade',
        available: false,
      },
    ],
  },
  {
    type: 'behavioral',
    patterns: [
      {
        key: 'observer',
        name: '观察者模式',
        description: '定义对象间的一种一对多依赖关系，当一个对象状态发生改变时，所有依赖于它的对象都得到通知并被自动更新。',
        scenarios: ['事件监听', '状态订阅', '数据绑定'],
        path: '/dashboard/design-patterns/observer',
        available: true,
      },
      {
        key: 'strategy',
        name: '策略模式',
        description: '定义一系列算法，把它们一个个封装起来，并且使它们可以互相替换。让算法的变化独立于使用它的客户。',
        scenarios: ['表单验证策略', '排序算法切换', '支付方式选择'],
        path: '/dashboard/design-patterns/strategy',
        available: false,
      },
      {
        key: 'command',
        name: '命令模式',
        description: '将一个请求封装为一个对象，从而使你可用不同的请求对客户进行参数化。支持撤销/重做操作。',
        scenarios: ['撤销/重做', '操作队列', '宏命令'],
        path: '/dashboard/design-patterns/command',
        available: false,
      },
      {
        key: 'iterator',
        name: '迭代器模式',
        description: '提供一种方法顺序访问一个聚合对象中的各个元素，而又不需要暴露该对象的内部表示。',
        scenarios: ['自定义遍历逻辑', '异步数据流遍历', '树形结构遍历'],
        path: '/dashboard/design-patterns/iterator',
        available: false,
      },
      {
        key: 'state',
        name: '状态模式',
        description: '允许一个对象在其内部状态改变时改变它的行为。对象看起来似乎修改了它的类。',
        scenarios: ['状态机实现', '页面流程控制', '游戏状态管理'],
        path: '/dashboard/design-patterns/state',
        available: false,
      },
    ],
  },
  {
    type: 'frontend',
    patterns: [
      {
        key: 'composite',
        name: '组合模式',
        description: '将对象组合成树形结构以表示"部分-整体"的层次结构。使得用户对单个对象和组合对象的使用具有一致性。',
        scenarios: ['React 组件树', '嵌套菜单', '文件树'],
        path: '/dashboard/design-patterns/composite',
        available: false,
      },
      {
        key: 'hooks-pattern',
        name: 'Hooks 模式',
        description: 'React 特有的逻辑复用模式，通过自定义 Hook 将组件逻辑提取到可复用的函数中。',
        scenarios: ['状态逻辑复用', '副作用封装', '自定义 Hook'],
        path: '/dashboard/design-patterns/hooks-pattern',
        available: false,
      },
      {
        key: 'render-props',
        name: 'Render Props',
        description: '通过 props 传递一个函数，让组件决定如何渲染。实现组件逻辑复用的一种模式。',
        scenarios: ['组件逻辑复用', '跨组件状态共享', '动态渲染'],
        path: '/dashboard/design-patterns/render-props',
        available: false,
      },
      {
        key: 'hoc',
        name: 'HOC 高阶组件',
        description: '接收一个组件并返回一个新组件的函数。用于增强组件功能，实现横切关注点分离。',
        scenarios: ['权限控制', '日志记录', '数据注入'],
        path: '/dashboard/design-patterns/hoc',
        available: false,
      },
      {
        key: 'pub-sub',
        name: '发布订阅模式',
        description: '一种消息范式，发送者（发布者）不会将消息直接发送给特定的接收者（订阅者），而是通过一个调度中心进行转发。',
        scenarios: ['EventBus', '全局消息中心', '跨组件通信'],
        path: '/dashboard/design-patterns/pub-sub',
        available: false,
      },
    ],
  },
];
