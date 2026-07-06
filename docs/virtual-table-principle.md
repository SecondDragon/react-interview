# 虚拟滚动表格实现原理完全解析

> 基于 `TanStack Table` + `TanStack Virtual` + `React` 的生产级实现

## 一、架构全景

```
┌─────────────────────────────────────────────────────────────────────┐
│                         useReactTable()                             │
│  TanStack Table 负责逻辑层：                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ • 数据模型（data → rows）                                     │  │
│  │ • 列定义（columns → ColumnDef）                                │  │
│  │ • 勾选状态（RowSelectionState）                                │  │
│  │ • 排序、过滤、分组等（本文未展开）                             │  │
│  └───────────────┬──────────────────────────────────────┘          │
│                  │ 输出: rowModel.rows (所有行的数据)                │
│                  ▼                                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    useVirtualizer()                            │  │
│  │  TanStack Virtual 负责展示层：                                 │  │
│  │  • 计算视口内可见行的索引                                      │  │
│  │  • 管理滚动位置和总高度                                        │  │
│  │  • 处理 overscan 缓冲区                                       │  │
│  └───────┬──────────────────────────────────────────────┘          │
│          │ 输出: virtualRows (仅视口内的行)                         │
│          ▼                                                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  DOM 渲染层                                    │  │
│  │  • sticky thead：固定在容器顶部                                │  │
│  │  • tbody > tr（spacer）：撑出 totalSize 高度                  │  │
│  │  • virtualRows → div（absolute + translateY 定位）            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

          数据流: rows[virtualRow.index] → 取一行的数据渲染一个 div
```

## 二、TanStack Table 详解（useReactTable）

### 2.1 输入参数

```typescript
const table = useReactTable({
  data,                     // 原始数据数组
  columns,                  // 列定义
  state: { rowSelection },  // 外部状态
  onRowSelectionChange,     // 状态变更回调
  getCoreRowModel: getCoreRowModel(), // 核心行模型
  getRowId: (row) => row.id,          // 行 ID 生成函数
})
```

### 2.2 核心产出物

`useReactTable` 返回的 `table` 对象包含以下关键内容：

| API | 返回类型 | 说明 |
|-----|---------|------|
| `table.getRowModel()` | `{ rows: Row[] }` | 所有数据行的完整模型，`rows` 是包含所有列的数组 |
| `table.getHeaderGroups()` | `HeaderGroup[]` | 表头分组，每个分组包含该行所有 `Header` 对象 |
| `table.getTotalSize()` | `number` | 所有列宽度之和（本例中 = 50+100+200+120+250+150 = 870） |
| `table.getIsAllRowsSelected()` | `boolean` | 是否所有行被勾选 |
| `table.getToggleAllRowsSelectedHandler()` | `() => void` | 全选勾选的事件处理函数 |
| `table.getAllColumns()` | `Column[]` | 所有列的元信息 |

#### 每行的关键 API

| API | 说明 |
|-----|------|
| `row.getIsSelected()` | 该行是否被勾选 |
| `row.getVisibleCells()` | 返回该行所有可见的 Cell 对象（按列顺序） |
| `row.getCanSelect()` | 该行是否可被勾选 |

#### 每个 Col / Header / Cell 的关键 API

| API | 说明 |
|-----|------|
| `header.getSize()` | 该列的设定宽度（即 `columnDef.size` 的值） |
| `cell.column.getSize()` | 同上，从 cell 角度获取列宽度 |
| `header.column.columnDef.header` | 列头显示内容（ReactNode 或渲染函数） |
| `cell.column.columnDef.cell` | 单元格渲染函数 |

#### flexRender 的作用

```typescript
flexRender(header.column.columnDef.header, header.getContext())
// ↑ 等价于：调用 columnDef.header ，并将上下文传入
// 如果 header 是 ReactNode，直接渲染
// 如果 header 是函数（({ table }) => <Checkbox />），调用之并传入 context
```

`flexRender` 本质上是一个"通用渲染器"，它帮你处理了"传入的是组件、函数还是静态节点"的差异。它的内部逻辑大致是：

```typescript
function flexRender(renderable: any, props: any) {
  if (typeof renderable === 'function') return renderable(props)
  return renderable
}
```

### 2.3 ColumnDef 的完整定义

```typescript
type ColumnDef<T> = {
  id?: string                    // 列的唯一标识
  accessorKey?: string           // 从 data 中取值的 key（如 'id', 'name'）
  header?: ReactNode | (({ table, column }) => ReactNode)  // 列头
  cell?: ReactNode | (({ getValue(), row, column }) => ReactNode)  // 单元格
  size?: number                  // 列宽（默认 150）
  minSize?: number               // 最小宽度
  maxSize?: number               // 最大宽度
  enableSorting?: boolean        // 是否允许排序
  // ...
}
```

## 三、TanStack Virtual 详解（useVirtualizer）

### 3.1 输入参数

```typescript
const rowVirtualizer = useVirtualizer({
  count: rows.length,                     // ⚠️ 这是逻辑行总数，不是 DOM 数！
  getScrollElement: () => parentRef.current, // 滚动容器引用
  estimateSize: () => 50,                 // ⚠️ 预估行高（单位 px）
  overscan: 300,                          // ⚠️ 视口外额外渲染的像素数
})
```

### 3.2 核心产出物

| API | 返回类型 | 说明 |
|-----|---------|------|
| `rowVirtualizer.getVirtualItems()` | `VirtualItem[]` | 当前应该渲染的虚拟行数组 |
| `rowVirtualizer.getTotalSize()` | `number` | **总内容高度** = count * estimateSize（用于撑开滚动条） |
| `rowVirtualizer.scrollToIndex(index)` | `void` | 滚动到指定行 |
| `rowVirtualizer.scrollOffset` | `number` | 当前滚动偏移（响应式） |

#### VirtualItem 的结构

```typescript
type VirtualItem = {
  key: string         // 唯一 key，用于 React 列表渲染
  index: number       // 在 rows 数组中的索引
  start: number       // 该行在滚动容器中的起始位置（px）
  end: number         // 该行在滚动容器中的结束位置（px）
  size: number        // 该行的高度（由 estimateSize 返回的值，可动态变化）
  lane: number        // 在多列虚拟化中使用，单列固定为 0
}
```

### 3.3 内部工作原理（多图解析）

#### 渲染窗口模型

```
                                    ╔═══════════════════╗
                                    ║   视口 (Viewport)  ║  ← 用户看到的区域
                                    ║  clientHeight=500  ║
╔═══════════════════════════════════╬═══════════════════╬══════════════════════════════════╗
║  不可见内容                       ║                   ║  不可见内容                       ║
║  (scrollTop 之前的行)             ║  ╔═══════════╗    ║  (scrollTop + clientHeight       ║
║                                   ║  ║ visible   ║    ║   之后的行)                       ║
║                                   ║  ║ rows #5-#15  ║  ║  但 overscan = 300px            ║
║  overscan 区域也计入              ║  ╚═══════════╝    ║  也会被渲染                       ║
║  渲染（-300px 的额外行）          ║                   ║                                   ║
╚═══════════════════════════════════╬═══════════════════╬══════════════════════════════════╝
                                    ╚═══════════════════╝
                                    ←------ totalSize ------→
```

#### 位置计算逻辑

```
用户滚动到 scrollTop = 2500 时，useVirtualizer 内部：

1. 计算可见范围：
   visibleStart = scrollTop - overscan           = 2500 - 300 = 2200
   visibleEnd   = scrollTop + clientHeight + overscan = 2500 + 500 + 300 = 3300

2. 遍历 "索引 → start" 映射表，找到满足条件的行：
   行 #5: start=2000, end=2050  → 不在 [2200, 3300] ✗
   行 #6: start=2050, end=2100  → 不在 [2200, 3300] ✗
   行 #7: start=2100, end=2150  → 不在 [2200, 3300] ✗
   行 #8: start=2150, end=2200  → 不在 [2200, 3300] ✗
   行 #9: start=2200, end=2250  → 在 [2200, 3300] ✓  ← 可见区起点
   行 #10: start=2250, end=2300 → 在 [2200, 3300] ✓
   ...
   行 #15: start=2500, end=2550 → 在 [2200, 3300] ✓
   ...
   行 #20: start=2750, end=2800 → 在 [2200, 3300] ✓
   行 #21: start=2800, end=2850 → 不在 [2200, 3300] ✗  ← 可见区终点

3. 返回 VirtualItem[] 数组：
   [
     { index: 9,  start: 2200, size: 50, key: '9' },
     { index: 10, start: 2250, size: 50, key: '10' },
     ...
     { index: 20, start: 2750, size: 50, key: '20' },
   ]
```

### 3.4 estimateSize 的真相

`estimateSize: () => 50` 是"预估"行高，**不等于**实际行高。它是一个函数，可以在需要时基于行索引返回动态值：

```typescript
// 可变行高版本
estimateSize: (index) => {
  if (rows[index].name.length > 50) return 80  // 长文本行更高
  return 50                                    // 默认行高
}
```

**当实际行高 != estimateSize 时会怎样？**
- 滚动条长度不准确（偏长或偏短）
- 行位置计算有误差，出现"攒动"感
- 解决方案：使用 `measureElement` 回调 + `ResizeObserver` 实时测量

## 四、DOM 渲染层的三个关键设计

### 4.1 Sticky Header 的工作原理

```tsx
<thead style={{
  position: 'sticky',
  top: 0,
  zIndex: 2,
  background: '#fafafa',
}}>
```

`position: sticky` 的**定位父级**是最近的具有 `overflow`（非 visible）的可滚动容器。在这个案例中，定位父级是外层的 `div[ref=parentRef]`（`overflow: auto`）。

`top: 0` 表示：当容器滚动时，`<thead>` 保持在容器顶部 0px 处不动。

**为什么用 sticky 而不是 fixed？**

| 特性 | sticky | fixed |
|------|--------|-------|
| 定位参考 | 滚动容器 | 视口（viewport） |
| 水平滚动 | 跟随表格水平移动 | 固定在视口位置 |
| 多表格共存 | 每个表格自己的 header 独立 | 所有表格共享一个固定位置 |
| 适用场景 | 表格内头部 | 全局导航栏 |

### 4.2 Spacer + Absolute 定位

```
┌──────────────────────────────────┐
│  thead (sticky)                  │  ← 固定在顶部
├──────────────────────────────────┤
│  tbody                           │
│  ┌────────────────────────────┐  │
│  │  tr (height: totalSize)    │  │  ← 很长的占位行，撑开滚动条
│  │  ┌──────────────────────┐  │  │
│  │  │ td (pos: relative)   │  │  │
│  │  │  ┌─────────────────┐ │  │  │
│  │  │  │ div (absolute)   │ │  │  │  ← virtualRow #n
│  │  │  │ transform:      │ │  │  │
│  │  │  │ translateY(start)│ │  │  │
│  │  │  └─────────────────┘ │  │  │
│  │  │  ┌─────────────────┐ │  │  │
│  │  │  │ div (absolute)   │ │  │  │  ← virtualRow #n+1
│  │  │  │ transform:      │ │  │  │
│  │  │  │ translateY(start)│ │  │  │
│  │  │  └─────────────────┘ │  │  │
│  │  └──────────────────────┘  │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

**为什么需要一个占位 `<tr>`？**

因为没有真实渲染 10000 行，但滚动条的滚动范围需要等于 10000 行的高度。`<tr style={{ height: totalSize }}>` 提供了这个"视觉欺骗"——让浏览器的滚动条以为内容有这么长。

### 4.3 transform: translateY 为何比 scrollTop 更优

```typescript
// ❌ 不推荐：修改 marginTop/top
row.style.marginTop = `${scrollTop}px`  // 触发 Layout → Paint → Composite

// ✅ 推荐：使用 transform
row.style.transform = `translateY(${scrollTop}px)`  // 仅触发 Composite
```

**为什么 transform 更快？**

```
scrollTop / marginTop / top 的样式变更：
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Layout  │ →  │  Paint   │ →  │ Composite│
│ (重排)   │    │ (重绘)   │    │ (合成)   │
└──────────┘    └──────────┘    └──────────┘
  ↑ 耗时最长      ↑ 次之          ↑ 最快（GPU）

transform 的样式变更：
┌──────────┐
│ Composite│  ← 跳过 Layout 和 Paint，直接在 GPU 合成
│ (合成)   │
└──────────┘
```

`transform` 将元素提升为**合成层（Compositing Layer）**，后续的 translateY 变更直接在 GPU 上进行，不涉及 CPU 的布局计算和像素绘制。

## 五、Bug 分析：Sticky Header 为何遮不住滚动内容

### 5.1 现象

上滑滚动时，部分内容行会"穿透"sticky header，在表头后面隐约可见。

### 5.2 根本原因：Stacking Context 冲突

```
正常预期：
┌───────────────────────┐
│ thead (z-index: 2)    │  ← 遮住下方所有内容
├───────────────────────┤
│                        │
│ 虚拟内容行             │  ← 在 thead 下方
│                        │
└───────────────────────┘

实际发生：
┌───────────────────────┐
│ thead (z-index: 2)    │  ← 背景半透明？不透明？
├───────────────────────┤
│  ╔═══════════════╗    │  ← virtualRow #n 穿过了 header
│  ║ 内容穿透!      ║    │     因为 transform 创建了新的
│  ╚═══════════════╝    │     独立 stacking context
└───────────────────────┘
```

**详细的 Stacking Context 层级分析：**

```
Root Stacking Context (滚动容器 parentRef)
├── Stacking Context 1: table
│   ├── Level 1: thead (sticky)  z-index: 2
│   └── Level 2: tbody
│       └── Level 3: tr (height: totalSize)
│           └── Level 4: td (position: relative, z-index: auto)
│               ├── Level 5: div (transform)  ← 每个虚拟行创建独立 context
│               │   z-index: auto (在自己的 context 中 = 0)
│               ├── Level 5: div (transform)
│               │   z-index: auto
│               └── Level 5: div (transform)
│                   z-index: auto
```

**关键发现：**

1. `<td>` 使用 `position: relative` **不创建**新的 stacking context（因为没有设置 `z-index` 的数值）
2. 每个虚拟行的 `<div>` 使用 `transform: translateY()` **创建**了新的 stacking context
3. `<thead>` 的 `z-index: 2` 在 `table` 的 stacking context 内生效
4. 虚拟行 div 的 stacking context 是 `td` 的子 context，与 `thead` 在同一个祖先（`table`）下

**理论上**，`thead` 的 `z-index: 2` 应该高于虚拟行的 `z-index: auto`（即 0），所以 header 应该覆盖内容。

**但实际中**，两个原因可能导致穿帮：

#### 原因 A：Chrome 的 table sticky 实现缺陷

Chrome 在处理 `thead` 的 `sticky` 定位时，有一个已知问题：sticky 元素在 table 内的 painting order 不完全遵循 stacking context 规范。当虚拟行的 `translateY` 值将 div 推到 `thead` 区域时，在某些 Chrome 版本中，这些 div 会被绘制在 `thead` 之上。

这是 Chrome 的渲染 bug，和 CSS 规范不完全一致。

#### 原因 B（更常见）：background 不连续性

`thead` 的 `background: #fafafa` 只在 `<th>` 元素上生效。如果有 padding 或 border 区域没有被 `<th>` 完全覆盖，或虚拟行 div 的 width 超过 `<th>` 范围，内容就会从间隙中渗透出来。

### 5.3 修复方案

#### 方案一（推荐）：在 thead 上增加 background 覆盖

```tsx
<thead style={{
  position: 'sticky',
  top: 0,
  zIndex: 2,
  background: '#fafafa',
  // 增加以下样式确保覆盖完整
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',  // 阴影遮盖+视觉增强
}}>
  <tr style={{ background: '#fafafa' }}>
    ...
  </tr>
</thead>
```

#### 方案二：提升 thead 的 stacking context 层级

```tsx
<thead style={{
  position: 'sticky',
  top: 0,
  zIndex: 2,
  background: '#fafafa',
  // 通过 isolation 创建独立的 stacking context
  isolation: 'isolate',
}}>
```

#### 方案三：使用 CSS 强行提升

```css
thead {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #fafafa;
  /* 通过在 thead 上也使用 transform 来提升层级 */
  transform: translateZ(0);
  /* 或使用 will-change */
  will-change: transform;
}
```

> `transform: translateZ(0)` 会创建一个新的合成层，将 `thead` 提升到 GPU 层，确保它始终在内容之上。

## 六、列宽自适应方案（剩余宽度均分）

### 6.1 当前代码的问题

当前实现中，每个列固定了 `size`：

```typescript
{ accessorKey: 'id', header: 'ID', size: 100 },
{ accessorKey: 'name', header: '名称', size: 200 },
// ...
// table 宽度 = table.getTotalSize() = 100 + 200 + 120 + 250 + 150 = 820
```

假设容器宽度为 1000px，则表格宽度只有 820px，右侧留下 180px 空白。

### 6.2 方案一：比例缩放（推荐）

计算所有列宽之和与容器宽度的比例，按比例放大每列宽度。

```tsx
const LiveDemo: React.FC = () => {
  // ... 已有的代码 ...

  // 新增：测量容器宽度
  const containerWidth = parentRef.current?.clientWidth ?? 800;

  // 计算列宽缩放
  const totalColumnWidth = columns.reduce((sum, col) => sum + (col.size ?? 150), 0);
  const scaleFactor = containerWidth > totalColumnWidth
    ? containerWidth / totalColumnWidth
    : 1;

  // 在设置 table 的 columns 时，将 size 乘以 scaleFactor
  const scaledColumns = React.useMemo(() =>
    columns.map(col => ({
      ...col,
      size: Math.floor((col.size ?? 150) * scaleFactor),
    })),
    [columns, scaleFactor]
  );
```

但是这种方法的问题：TanStack Table 的 `size` 在列定义时固定，不能动态修改 `ColumnDef`。

#### 更好的方法：使用列式 flex 布局

放弃 `table` 元素，改用 `div` + flex 布局：

```tsx
// 表头部分
<thead>
  <tr style={{ display: 'flex' }}>
    {headerGroup.headers.map(header => (
      <th key={header.id}
        style={{
          flex: header.getSize(),  // flex-grow 比例
          minWidth: 80,
          maxWidth: 300,
          overflow: 'hidden',
        }}
      >
        {flexRender(...)}
      </th>
    ))}
  </tr>
</thead>

// 行数据部分
<tbody>
  {virtualRows.map(virtualRow => {
    const row = rows[virtualRow.index];
    return (
      <div key={virtualRow.key}
        style={{
          position: 'absolute',
          transform: `translateY(${virtualRow.start}px)`,
          display: 'flex',
          height: virtualRow.size,
        }}
      >
        {row.getVisibleCells().map(cell => (
          <div key={cell.id}
            style={{
              flex: cell.column.getSize(),
              minWidth: 80,
              maxWidth: 300,
            }}
          >
            {flexRender(...)}
          </div>
        ))}
      </div>
    );
  })}
</tbody>
```

### 6.3 方案二：固定列 + 弹性列组合

指定某些列弹性伸缩，某些列固定宽度：

```typescript
const columns = React.useMemo<ColumnDef<TableData>[]>(
  () => [
    { id: 'select', size: 50 },         // 固定 50px
    { accessorKey: 'id', header: 'ID', size: 100 },  // 固定 100px
    { accessorKey: 'name', header: '名称', size: 0 }, // size=0 表示弹性，flex: 1
    { accessorKey: 'amount', header: '金额', size: 150 }, // 固定 150px
  ],
  []
);
```

然后在渲染时：

```tsx
{
  row.getVisibleCells().map((cell) => {
    const isFlexColumn = cell.column.getSize() === 0;
    return (
      <div
        key={cell.id}
        style={{
          flex: isFlexColumn ? 1 : `0 0 ${cell.column.getSize()}px`,
          minWidth: isFlexColumn ? 120 : undefined,
          overflow: 'hidden',
        }}
      >
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </div>
    );
  })
}
```

### 6.4 方案三：ResizeObserver 动态计算

```tsx
const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

useEffect(() => {
  const container = parentRef.current;
  if (!container) return;

  const observer = new ResizeObserver((entries) => {
    const width = entries[0].contentRect.width;
    // 总列宽
    const totalWidth = columns.reduce((sum, col) => sum + (col.size ?? 150), 0);
    // 剩余宽度
    const remaining = Math.max(0, width - totalWidth);
    // 平均分给每一列
    const extraPerColumn = remaining / columns.length;

    const newWidths: Record<string, number> = {};
    columns.forEach((col) => {
      newWidths[col.id!] = (col.size ?? 150) + extraPerColumn;
    });
    setColumnWidths(newWidths);
  });

  observer.observe(container);
  return () => observer.disconnect();
}, [columns]);

// 渲染时使用 columnWidths 代替 column.getSize()
```

### 6.5 推荐方案

**对于本题，推荐方案二（固定列 + 弹性列）**，原因：

1. 语义清晰：明确哪些列应自适应
2. 无需 ResizeObserver，避免不必要的 re-render
3. 易于理解，面试时也容易讲清楚
4. 与 `table-layout: fixed` 和 flex 布局天然兼容

## 七、完整的数据流时序图

```
用户滚动容器
    │
    ▼
container.onScroll
    │
    ▼
useVirtualizer 内部计算
  ├── 读取 scrollTop + clientHeight
  ├── 根据 estimateSize 推算每行 start 位置
  ├── 计算 visibleStart = scrollTop - overscan
  ├── 计算 visibleEnd = scrollTop + clientHeight + overscan
  └── 返回 [visibleStart, visibleEnd] 范围内的 VirtualItem[]
    │
    ▼
React 收到新的 virtualRows
    │
    ▼
React 对 virtualRows 做 reconciliation
  ├── 卸载移出视口的行 DOM
  └── 挂载进入视口的行 DOM
    │
    ▼
spacer <tr> 高度不变 (totalSize)
    │
    ▼
每个虚拟行通过 transform: translateY(start) 定位
    │
    ▼
GPU 合成层将行绘制到正确位置
    │
    ▼
用户看到流畅的滚动效果
```

## 八、面试 Q&A

### Q1: 虚拟表格 vs 非虚拟表格的性能差异？

| 维度 | 全量渲染 | 虚拟化 |
|------|---------|--------|
| DOM 节点数 | 10000+ | ~20 |
| 初始渲染时间 | ~500ms (Long Task) | ~30ms |
| 内存 | 高 | 低 |
| 滚动帧率 | < 30fps | 60fps |
| 勾选操作 | 遍历所有 DOM | 仅更新 JS 状态 |

### Q2: 为什么需要两个库，一个不够吗？

两个库各司其职，解耦了"数据逻辑"和"展示逻辑"：
- 如果只用 TanStack Table，大数据量下每行都渲染 DOM，会卡死
- 如果只用 TanStack Virtual，需要自己处理勾选、排序、列定义等逻辑
- 两者结合：TanStack Table 维护数据状态，TanStack Virtual 决定哪些行可见

### Q3: overscan 设多少合适？

`overscan` 是"缓冲区"，单位是**像素**而非"行数"：
- 设置较大会消耗更多 CPU/内存，但减少快速滚动时的白屏
- 设置较小则反之
- 经验值：
  - 行高固定且轻量（纯文本）：50-100px
  - 行高不确定（含图片/图表）：200-500px
  - 本例设 300px 比较保守（≈ 6 行的缓冲量）

### Q4: 如果行高不固定怎么办？

使用 `measureElement` + `ResizeObserver` 实时测量：

```typescript
const rowVirtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
  // 响应式测量每行实际高度
  measureElement: (el) => el.getBoundingClientRect().height,
  overscan: 300,
});
```

并且在每行 DOM 上设置 `data-index` 属性：

```tsx
<div
  data-index={virtualRow.index}
  ref={rowVirtualizer.measureElement}
  // ...
>
```

## 九、参考资料

- [TanStack Table 官方文档](https://tanstack.com/table/v8)
- [TanStack Virtual 官方文档](https://tanstack.com/virtual/v3)
- [MDN: CSS stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context)
- [MDN: transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
- [MDN: position: sticky](https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky)
