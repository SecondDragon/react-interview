# 学习记录 0001：虚拟滚动表格的两库协作架构

## 日期

2026-07-06

## 知识点

TanStack Table（react-table）与 TanStack Virtual（react-virtual）的分工协作模式。

## 关键洞察

1. **TanStack Table** 负责"逻辑层"：数据模型、列定义、勾选状态。它不关心 DOM 的渲染方式。它返回的 `table` 对象包含了所有需要的上下文。

2. **TanStack Virtual** 负责"展示层"：计算出当前视口应该渲染哪些行。它只处理行索引，不关心数据内容。

3. **两者的结合点只是一个索引**：`const row = rows[virtualRow.index]`。TanStack Table 提供 `rows` 数组，TanStack Virtual 告诉 React 只看数组中的哪几个元素。

4. 如果不使用 TanStack Table，需要手动维护列渲染、勾选状态、行数据映射等逻辑，复杂度不亚于虚拟滚动本身。

## 难点

- flexRender 的"双态"语义（函数 vs 静态节点）需要理解
- estimateSize 是"预估"而非"实际"高度，这个区分很重要
- overscan 的单位是像素，这一点容易误解为"行数"

## 后续方向

- 探索不使用第三方库，纯手写虚拟滚动表格
- 探索动态行高场景下的 measureElement 机制
- 探索列宽拖拽调整的交互
