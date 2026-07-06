# MDX 内容与组件分离规范

## 核心原则

### 1. `content.mdx` 只做两件事

- 导入组件（`import XxxSection from './XxxSection'`）
- 写 markdown 文本（标题、段落、列表、加粗、行内代码）
- 调用组件（`<XxxSection />`）

❌ 禁止在 `.mdx` 中出现的模式：
- `.map()` / `.filter()` / `.reduce()` 等数组操作
- `dangerouslySetInnerHTML`
- 三元表达式 + JSX（如 `{condition && <Component />}`）
- `{data.map(item => ...)}` 渲染列表
- 内联 `render` 函数（如 `columns: [{ render: (text) => ... }]`）

### 2. 文本类的排版内容必须放在 `.mdx`，不能放在 `data.ts`

✅ 正确做法：
```mdx
// content.mdx
## 一、引言

在微前端架构中，主应用和子应用运行在同一页面的不同生命周期中。

**核心问题：**
- 主应用的登录状态如何同步到子应用？
- 子应用 A 修改了数据，子应用 B 怎么知道？
```

❌ 错误做法：
```typescript
// data.ts
export const introData = {
  content: [
    '在微前端架构中...',
    '<strong>核心问题：</strong>',
  ],
};
```

### 3. `data.ts` 只存放结构化数据

- 表格数据（Table 的 `columns` + `dataSource`）
- API 参考列表
- 配置文件、枚举值
- 复杂的数据结构（不适合直接用 markdown 表达的）

✅ 正确的 `data.ts` 内容示例：
```typescript
export const apiTableData = {
  columns: [
    { title: 'API', dataIndex: 'api', key: 'api' },
    { title: '说明', dataIndex: 'desc', key: 'desc' },
  ],
  dataSource: [
    { key: '1', api: 'initGlobalState(state)', desc: '初始化全局状态' },
  ],
};
```

✅ 正确的 `content.mdx` 引用方式：
```mdx
import ApiTable from './ApiTable';

<ApiTable />
```

### 4. 组件负责 JSX 逻辑

- `.map()` / `.filter()` 等列表渲染
- 表格、CodeDiff 等复杂 UI 组合
- 事件处理、状态管理
- 条件渲染

### 总结：三者的职责

| 文件 | 职责 | 示例内容 |
|---|---|---|
| `content.mdx` | markdown 文本 + 组件调用 | 标题、段落、加粗、`<XxxSection />` |
| `components/*.tsx` | JSX 逻辑 | `data.map()`, `<Table>`, `<CodeDiff>`, hooks |
| `data.ts` | 结构化数据 | 表格 `dataSource`, API 列表, 配置项 |
