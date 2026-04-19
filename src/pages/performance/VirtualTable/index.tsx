import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Checkbox,
  Tag,
  Spin,
  Alert,
  Row,
  Col,
  Tabs,
  Empty,
} from 'antd';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type RowSelectionState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import CodeBlock from '../../../components/CodeBlock';
import { VirtualTableExamples } from './Examples';

const { Title, Paragraph, Text } = Typography;

// --- 类型定义 ---
interface TableData {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  amount: number;
  date: string;
}

// --- 模拟 API 数据获取 ---
const fetchItems = async (cursor: number, limit: number = 5000): Promise<TableData[]> => {
  // 模拟延迟
  await new Promise((resolve) => setTimeout(resolve, 300));

  return Array.from({ length: limit }, (_, i) => ({
    id: `ID-${cursor + i}`,
    name: `数据条目 ${cursor + i}`,
    status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)] as TableData['status'],
    amount: Math.floor(Math.random() * 1000000),
    date: new Date().toISOString().split('T')[0],
  }));
};

const VirtualTablePage: React.FC = () => {
  // 1. 数据状态：存放所有的表格行
  const [data, setData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({}); // 存放勾选状态 { id: boolean }

  // 2. 表格容器引用：用于 TanStack Virtual 监听滚动
  const parentRef = useRef<HTMLDivElement>(null);

  // 3. 加载逻辑
  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    const newData = await fetchItems(data.length);
    setData((prev) => [...prev, ...newData]);
    setLoading(false);
  }, [data.length, loading]);

  // 初始化加载
  useEffect(() => {
    loadMore();
  }, []);

  // 4. TanStack Table 列定义
  const columns = React.useMemo<ColumnDef<TableData>[]>(
    () => [
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
        size: 50, // 列宽
      },
      {
        accessorKey: 'id',
        header: 'ID',
        size: 100,
      },
      {
        accessorKey: 'name',
        header: '名称',
        size: 200,
      },
      {
        accessorKey: 'status',
        header: '状态',
        cell: (info) => {
          const statusMap = {
            active: <Tag color="success">活跃</Tag>,
            inactive: <Tag color="error">停用</Tag>,
            pending: <Tag color="warning">待定</Tag>,
          };
          return statusMap[info.getValue() as keyof typeof statusMap];
        },
        size: 120,
      },
      {
        accessorKey: 'amount',
        header: '金额',
        cell: (info) => <Text code>¥{info.getValue() as number}</Text>,
        size: 250,
      },
      {
        accessorKey: 'date',
        header: '日期',
        size: 150,
      },
    ],
    []
  );

  // 5. TanStack Table 实例
  // 负责：管理数据模型、处理勾选逻辑、生成单元格内容
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id, // 指定使用 ID 作为勾选的 Key
  });

  const { rows } = table.getRowModel();

  // 6. TanStack Virtual 虚拟化实例
  // 负责：计算当前滚动位置应该渲染哪些 DOM
  const rowVirtualizer = useVirtualizer({
    count: rows.length, // 总共有多少行
    getScrollElement: () => parentRef.current, // 滚动容器
    estimateSize: () => 50, // 每行预估高度 (必须提供，用于初始化计算)
    overscan: 300, // 视口外预渲染多少行，防止快速滚动时出现空白
  });

  // 获取虚拟行数据
  const virtualRows = rowVirtualizer.getVirtualItems();
  // 计算总高度（模拟滚动条长度的关键）
  const totalSize = rowVirtualizer.getTotalSize();

  // 7. 滚动触底逻辑 (无限加载)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    // 距离底部 150px 时触发加载
    if (scrollHeight - scrollTop - clientHeight < 150 && !loading) {
      loadMore();
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>性能优化：超大数据量虚拟表格</Title>

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card bordered={false}>
            <Paragraph>
              当表格数据达到数千甚至上万行时，一次性渲染所有 DOM 会导致页面卡死。 本方案结合{' '}
              <Text strong>TanStack Table (逻辑管控)</Text> 与{' '}
              <Text strong>TanStack Virtual (视觉分窗)</Text>。
            </Paragraph>
            <Alert
              type="success"
              showIcon
              message="优化效果"
              description={
                <span>
                  当前加载数据：<Text strong>{data.length}</Text> 条 | 已勾选：
                  <Text strong>{Object.keys(rowSelection).length}</Text> 条 | 真实 DOM 渲染：
                  <Text strong>{virtualRows.length + 10}</Text> 条 (仅视口内)
                </span>
              }
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card
            title="虚拟滚动 + 无限加载演示"
            styles={{ body: { padding: 0 } }} // 移除 Card 默认内边距
          >
            {/* 1. 滚动容器 (必须固定高度并设置 overflow: auto) */}
            <div
              ref={parentRef}
              onScroll={handleScroll}
              style={{
                height: '500px',
                overflow: 'auto',
                position: 'relative',
                background: '#fff',
              }}
            >
              {/* 2. 表格主体 */}
              <table
                style={{
                  width: table.getTotalSize(),
                  borderCollapse: 'collapse',
                  tableLayout: 'fixed',
                  border: '1px solid #f0f0f0',
                  boxSizing: 'border-box', // 确保边框不占用额外宽度
                }}
              >
                {/* 表头部分 (不参与虚拟化，保持固定) */}
                <thead
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    background: '#fafafa',
                    borderBottom: '1px solid #f0f0f0', // 添加整体边框
                    borderLeft: 'none', // 如果容器已有边框可以微调
                  }}
                >
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            width: header.getSize(),
                            fontWeight: 600,
                            borderRight: '1px solid #f0f0f0', // 给表头单元格加右侧竖线
                            borderBottom: '1px solid #f0f0f0', // 表头下划线
                            boxSizing: 'border-box', // 关键,让border不占用多余的空间
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                {/* 表体部分 (虚拟化核心) */}
                <tbody>
                  {/* 3. 占位容器：高度必须等于所有行的总高度，以撑起滚动条 */}
                  <tr style={{ height: `${totalSize}px`, border: 0 }}>
                    <td
                      colSpan={columns.length}
                      style={{ padding: 0, border: 0, position: 'relative' }}
                    >
                      {/* 4. 真实渲染的虚拟行 */}
                      {virtualRows.map((virtualRow) => {
                        const row = rows[virtualRow.index];
                        return (
                          <div
                            key={virtualRow.key}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: `${virtualRow.size}px`,
                              transform: `translateY(${virtualRow.start}px)`, // 通过位移将行放到正确位置
                              display: 'flex',
                              alignItems: 'center',
                              borderBottom: '1px solid #f0f0f0',
                              background: row.getIsSelected() ? '#e6f4ff' : '#fff',
                            }}
                          >
                            {row.getVisibleCells().map((cell, index) => (
                              <div
                                key={cell.id}
                                style={{
                                  padding: '0 16px',
                                  width: cell.column.getSize(),
                                  height: '100%', // 确保高度充满行高
                                  display: 'flex', // 方便内容垂直居中
                                  alignItems: 'center',
                                  borderRight: '1px solid #f0f0f0', // 给每个虚拟单元格加右侧竖线
                                  // borderRight:
                                  //   index === row.getVisibleCells().length - 1
                                  //     ? 'none'
                                  //     : '1px solid #f0f0f0',
                                  overflow: 'hidden',
                                  boxSizing: 'border-box', // 关键：必须是 border-box，宽度才包含边框
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* 加载状态指示器 */}
              {loading && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '10px',
                    background: 'rgba(255,255,255,0.8)',
                    position: 'sticky',
                    bottom: 0,
                  }}
                >
                  <Spin tip="正在加载更多大数据..." size="small" />
                </div>
              )}

              {data.length === 0 && !loading && (
                <div style={{ padding: '40px' }}>
                  <Empty />
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="原理详解与实现代码">
            <Tabs
              items={[
                {
                  key: '1',
                  label: '1. 核心结合逻辑',
                  children: (
                    <div>
                      <Paragraph>
                        <Text code>useVirtualizer</Text> 返回的 <Text code>virtualRows</Text>{' '}
                        只包含当前视口能看到的行索引。 我们通过{' '}
                        <Text code>transform: translateY</Text> 将这些行“钉”在滚动容器的正确位置。
                      </Paragraph>
                      <CodeBlock code={VirtualTableExamples.coreLogic} language="tsx" />
                    </div>
                  ),
                },
                {
                  key: '2',
                  label: '2. 勾选逻辑 (TanStack Table)',
                  children: (
                    <div>
                      <Paragraph>
                        勾选逻辑完全由 <Text code>useReactTable</Text> 接管，它内部维护一个{' '}
                        <Text code>rowSelection</Text> 对象（ID-Boolean 映射）。
                      </Paragraph>
                      <CodeBlock code={VirtualTableExamples.selectionLogic} language="tsx" />
                    </div>
                  ),
                },
                {
                  key: '3',
                  label: '3. 无限滚动实现',
                  children: (
                    <div>
                      <Paragraph>
                        监听容器的 <Text code>onScroll</Text> 事件，判断{' '}
                        <Text code>scrollHeight - scrollTop</Text> 是否接近{' '}
                        <Text code>clientHeight</Text>。
                      </Paragraph>
                      <CodeBlock code={VirtualTableExamples.infiniteScroll} language="tsx" />
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default VirtualTablePage;
