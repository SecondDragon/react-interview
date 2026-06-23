# 核心架构的思路说明 (Dynamic Form Generator)

## 1. 核心需求与设计目标

在 B 端复杂的后台系统中，往往存在大量具有高度共性的表单页面。如果我们每次都去手写 `Form.Item`、`Input` 等组件，会造成极高的维护成本与代码冗余。因此，本组件通过接收一套高度抽象的 **JSON Schema** 协议，自动化地渲染表单内容。

## 2. 动态联动设计思路

表单项之间的联动（如：当类型选择“企业”时，才显示“企业税号”输入框），传统的做法是在组件顶层保存所有的状态变量。但这样很容易将业务组件变得臃肿，并且增加了与视图树耦合的副作用。
本组件在 `JSON Schema` 中新增了 `visibleOn` 配置。

- 通过拦截这个字段，并借助 Ant Design 表单的 `shouldUpdate` 机制对字段级别的依赖进行订阅。
- 渲染层使用 `render-props` 的方式获取特定字段的实时值，进行动态比对判断是否渲染该 DOM 节点。

## 3. 高性能状态管理机制 (避免全量重渲染)

如果使用 React 默认的 state 结合原生的 input 进行表单管理，每次输入都会引发外层大表单及内部所有子组件的全量重组（Re-render）。
而本方案中由于采用类似 `React Hook Form` 的思路，利用底层的 **发布-订阅 (Pub-Sub) 模式** 来分离组件的视图状态和数据状态（在此组件中通过 Antd 底层的 `rc-field-form` 实现）：

- 所有表单项的 `value` 不交由外层 `React Component State` 进行管理，而是托管在独立的 Store 对象中。
- 当用户输入某个字符时，仅触发对应的单个 `Form.Item` 更新机制，而不是触发表单顶层组件重新 Render。这样极大提升了超大型表单的输入流畅性。

## 4. JSON Schema 数据结构定义

```typescript
interface FormSchemaItem {
  type: 'Input' | 'Select' | 'DatePicker' | 'InputNumber'; // 定义需要渲染的控件类型
  name: string; // 表单字段名，提交给后端的 key
  label: string; // UI 上的文案标签
  required?: boolean; // 是否必填校验
  message?: string; // 校验失败提示
  props?: Record<string, any>; // 直接透传给最终组件的原生或第三方属性
  options?: { label: string; value: any }[]; // 如果是选择器，所需的选项数据源
  visibleOn?: {
    // 表单联动依赖，声明字段及预期值
    field: string;
    value: any;
  };
}

type FormSchema = FormSchemaItem[];
```
