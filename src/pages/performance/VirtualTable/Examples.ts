/**
 * TanStack Table + TanStack Virtual 虚拟表格实现参考
 * 
 * 本示例演示了如何将表格逻辑库与虚拟滚动库结合。
 * 核心思路：
 * 1. TanStack Table (useReactTable) 负责数据的结构、列定义、行状态（如勾选）。
 * 2. TanStack Virtual (useVirtualizer) 负责计算哪些行应该在视口内渲染。
 * 3. 通过绝对定位将虚拟行放置在模拟的总高度容器中。
 */

export const VirtualTableExamples = {
  // 核心逻辑：结合 Table 和 Virtual
  coreLogic: `
// 1. 定义表格逻辑
const table = useReactTable({
  data,
  columns,
  state: { rowSelection },
  onRowSelectionChange: setRowSelection,
  getCoreRowModel: getCoreRowModel(),
});

// 2. 获取表格的所有行
const { rows } = table.getRowModel();

// 3. 定义虚拟化逻辑
const rowVirtualizer = useVirtualizer({
  count: rows.length, // 总行数
  getScrollElement: () => parentRef.current, // 滚动容器
  estimateSize: () => 50, // 预估行高 (px)
  overscan: 10, // 额外预渲染的行数，防止滚动过快白屏
});

// 4. 渲染时只遍历虚拟行
const virtualRows = rowVirtualizer.getVirtualItems();
const totalSize = rowVirtualizer.getTotalSize(); // 总模拟高度

return (
  <div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
    <div style={{ height: \`\${totalSize}px\`, position: 'relative' }}>
      {virtualRows.map(virtualRow => {
        const row = rows[virtualRow.index];
        return (
          <div 
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: \`translateY(\${virtualRow.start}px)\`,
              height: \`\${virtualRow.size}px\`
            }}
          >
            {/* 渲染行内容 */}
          </div>
        )
      })}
    </div>
  </div>
);
`,

  // 勾选逻辑实现
  selectionLogic: `
const columns = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  },
  // ... 其他列
];
`,

  // 无限滚动触底判断
  infiniteScroll: `
// 监听滚动事件或使用 Intersection Observer
const onScroll = (e: UIEvent<HTMLDivElement>) => {
  const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
  // 触底判断阈值 100px
  if (scrollHeight - scrollTop - clientHeight < 100 && !isFetching && hasNextPage) {
    fetchNextPage();
  }
};
`
};
