# 自定义组件接入标准 (Widget Standard)

要让一个自定义组件能被底层的 `ProFormGenerator`（基于 Ant Design Form）顺利识别并自动收集数据，它**必须**遵循一个标准的“契约格式”。

## 1. 核心契约：`value` 与 `onChange`

在 Ant Design 的表单体系下，一个合格的自定义表单控件必须具备以下两个核心属性，这被称为“受控组件”契约：

1.  **`value` 属性**：
    - **作用**：接收来自外部（Form 容器）的状态值。
    - **职责**：组件内部应该根据这个值来展示当前的 UI 状态。
2.  **`onChange` 属性**：
    - **作用**：这是一个回调函数 `(newValue: any) => void`。
    - **职责**：当用户在 UI 上进行了操作（点击、输入、勾选）导致值发生变化时，组件**必须**调用这个函数，并将最新的值作为参数传回去。

### 代码模版：

```tsx
const MyWidget = ({ value, onChange, ...restProps }) => {
  return <div onClick={() => onChange('new_value')}>当前值是：{value}</div>;
};
```

## 2. 为什么不需要 `useState`？

这是初学者最容易犯的错误。在动态表单中，状态的“单一数据源”是在 Form 容器里的。

- **错误做法**：在自定义组件内部又搞一个 `const [val, setVal] = useState()`。这会导致状态同步极其混乱。
- **正确做法**：完全“相信” Props。组件本身只是一个纯粹的“渲染器”，它只管展示 `value`，并在变动时通知 `onChange`。

## 3. 复杂数据的处理

如果你的组件非常复杂（比如地址选择器返回的是一个对象 `{ province: '..', city: '..' }`），契约依然成立：

- `value` 将接收整个对象。
- `onChange` 应该传入更新后的整个对象。

## 4. Props 的透传机制

你在 Schema 中定义的 `props` 字段：

```json
{
  "widget": "MyWidget",
  "props": { "theme": "dark", "size": "large" }
}
```

引擎在渲染时，会通过 React 的解构赋值将这些属性完整地传递给你的组件。这意味着你的自定义组件可以定义任意数量的业务属性，只要在 Schema 中配置即可。

## 5. 总结

只要满足 `value/onChange` 契约，你的自定义组件就能像 Antd 原生的 `Input` 一样，在动态表单引擎中实现“自动闭环”，享受自动校验、自动收集、自动联动等所有高级功能。
