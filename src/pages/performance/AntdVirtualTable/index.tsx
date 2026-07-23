import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Table, Card, Typography, Tag, Alert, Space, Spin, Tabs } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import { CodeOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface TableItem {
  id: string;
  name: string;
  amount: number;
  date: string;
  status: 'active' | 'inactive' | 'pending';
}

const TOTAL_PAGES = 30;
const PAGE_SIZE = 500;

const mockFetch = async (page: number, limit: number): Promise<TableItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return Array.from({ length: limit }, (_, i) => {
    const index = page * limit + i;
    return {
      id: `ID-${index}`,
      name: `数据条目 ${index}`,
      amount: Math.floor(Math.random() * 1000000),
      date: new Date(
        Date.now() - Math.floor(Math.random() * 30 * 86400000)
      ).toLocaleDateString('zh-CN'),
      status: ['active', 'inactive', 'pending'][
        Math.floor(Math.random() * 3)
      ] as TableItem['status'],
    };
  });
};

const statusMap = {
  active: { color: 'success' as const, text: '活跃' },
  inactive: { color: 'error' as const, text: '停用' },
  pending: { color: 'warning' as const, text: '待定' },
};

const columns: TableColumnsType<TableItem> = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
  { title: '名称', dataIndex: 'name', key: 'name', width: 200 },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    render: (status: TableItem['status']) => (
      <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>
    ),
  },
  {
    title: '金额',
    dataIndex: 'amount',
    key: 'amount',
    width: 150,
    render: (amount: number) => <Text code>¥{amount.toLocaleString()}</Text>,
  },
  { title: '日期', dataIndex: 'date', key: 'date', width: 150 },
];

/**
 * 无限加载公共逻辑 Hook
 */
function useInfiniteData() {
  const [data, setData] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    const nextPage = pageRef.current + 1;
    const newData = await mockFetch(nextPage, PAGE_SIZE);
    pageRef.current = nextPage;

    if (nextPage >= TOTAL_PAGES || newData.length === 0) {
      hasMoreRef.current = false;
      setHasMore(false);
    }

    setData((prev) => [...prev, ...newData]);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        loadingRef.current = false;
        setLoading(false);
      });
    });
  }, []);

  const reset = useCallback(() => {
    pageRef.current = 0;
    loadingRef.current = false;
    hasMoreRef.current = true;
    setLoading(false);
    setHasMore(true);
    setData([]);
  }, []);

  return { data, loading, hasMore, loadMore, reset };
}

// ==================== 方案一：外层容器监听 onScroll ====================

/**
 * 原理：
 * antd Table 开启 virtual 后，内部会生成一个带滚动条的容器。但 Table 没有直接暴露
 * 这个内部容器的 onScroll。所以我们在 Table 外部再包一个 div，把 Table 的 scroll.y 设
 * 为 '100%' 让它撑满外层 div，然后监听外层 div 的 onScroll。
 *
 * 优点：代码简单，不需要了解 Table 内部结构。
 * 缺点：存在两个滚动容器概念（Table 内部、外层 div），如果高度计算不一致，可能出
 * 现 Table 内部已经滚动到底但外层还没触发加载，或者反过来。需要保证外层 div 和 Table
 * 内部滚动高度同步。
 */
function OuterScrollDemo() {
  const { data, loading, hasMore, loadMore } = useInfiniteData();
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
      if (scrollHeight - scrollTop - clientHeight < 200 && !loadingRef.current) {
        loadMore();
      }
    },
    [loadMore]
  );

  // 这里单独声明一个 loadingRef，因为外层 handleScroll 需要读取 Ref 做同步守卫
  const loadingRef = useRef(false);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  return (
    <div>
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
        message="方案一原理"
        description="给 Table 外层包一个 div 作为滚动容器，监听外层 div 的 onScroll。Table 的 scroll.y 设为 100% 撑满外层容器。这是最简单的方式，但要注意两个滚动容器的高度同步问题。"
      />

      <div
        ref={tableWrapperRef}
        onScroll={handleScroll}
        style={{ height: 500, overflow: 'auto', border: '1px solid #f0f0f0', borderRadius: 6 }}
      >
        <Table<TableItem>
          virtual
          dataSource={data}
          columns={columns}
          rowKey="id"
          pagination={false}
          scroll={{ x: 720, y: '100%' }}
          loading={loading && data.length === 0}
        />
        {loading && data.length > 0 && (
          <div style={{ textAlign: 'center', padding: '12px' }}>
            <Spin size="small" tip="加载更多数据中..." />
          </div>
        )}
        {!hasMore && data.length > 0 && (
          <div style={{ textAlign: 'center', padding: '12px', color: '#bfbfbf', fontSize: 13 }}>
            已加载全部 {data.length} 条数据
          </div>
        )}
      </div>

      <Card style={{ marginTop: 16 }}>
        <Title level={5}>完整源码</Title>
        <pre
          style={{
            background: '#f6f8fa',
            padding: 16,
            borderRadius: 8,
            fontSize: 13,
            lineHeight: 1.8,
            overflow: 'auto',
          }}
        >
{`<div
  onScroll={handleScroll}
  style={{ height: 500, overflow: 'auto' }}
>
  <Table
    virtual
    dataSource={data}
    columns={columns}
    scroll={{ x: 720, y: '100%' }}  // y: '100%' 撑满外层 div
    pagination={false}
  />
</div>

const handleScroll = (e) => {
  const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
  if (scrollHeight - scrollTop - clientHeight < 200) {
    loadMore();
  }
};`}
        </pre>
      </Card>
    </div>
  );
}

// ==================== 方案二：components.body 注入 onScroll ====================

/**
 * 原理：
 * antd Table 的 components 属性允许自定义表格内部的各个子组件。其中 components.body
 * 可以自定义 tbody 的渲染 wrapper。但 wrapper 本身并不是 Table 的滚动容器，真正滚动
 * 的是 wrapper 的父级（Table 内部生成的那个 overflow: auto 的 div）。
 *
 * 所以正确做法是：在 wrapper 挂载后，通过 ref 向上找到真正带滚动条的父元素（通常是
 * overflow: auto 或 overflow: scroll 的 div），然后直接给它绑定 scroll 事件。
 * 这样 handleScroll 拿到的 e.currentTarget 才是真实滚动容器，scrollHeight / scrollTop
 * / clientHeight 才准确。
 */
interface BodyWrapperProps {
  children: React.ReactNode;
  onScroll: (e: Event) => void;
}

const BodyWrapper = React.forwardRef<HTMLDivElement, BodyWrapperProps>(
  ({ children, onScroll }, ref) => {
    const innerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;

      // antd Table 内部滚动容器一定有 .ant-table-body 这个 class
      // 优先用 closest 查找，找不到再向上遍历 overflowY 兜底
      let scrollContainer: HTMLElement | null = el.closest('.ant-table-body');

      if (!scrollContainer) {
        scrollContainer = el.parentElement;
        while (
          scrollContainer &&
          scrollContainer !== document.body &&
          !/^(auto|scroll)$/i.test(window.getComputedStyle(scrollContainer).overflowY)
        ) {
          scrollContainer = scrollContainer.parentElement;
        }
      }

      if (!scrollContainer) return;

      scrollContainer.addEventListener('scroll', onScroll);
      return () => scrollContainer?.removeEventListener('scroll', onScroll);
    }, [onScroll]);

    return (
      <div ref={(node) => {
        innerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}>
        {children}
      </div>
    );
  }
);

function ComponentsBodyDemo() {
  const { data, loading, hasMore, loadMore } = useInfiniteData();
  const loadingRef = useRef(false);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const handleScroll = useCallback(
    (e: Event) => {
      const target = e.target as HTMLDivElement;
      const { scrollHeight, scrollTop, clientHeight } = target;
      if (scrollHeight - scrollTop - clientHeight < 200 && !loadingRef.current) {
        loadMore();
      }
    },
    [loadMore]
  );

  const components = useMemo<TableProps<TableItem>['components']>(
    () => ({
      body: (bodyProps: { children: React.ReactNode }) => (
        <BodyWrapper onScroll={handleScroll}>{bodyProps.children}</BodyWrapper>
      ),
    }),
    [handleScroll]
  );

  return (
    <div>
      <Alert
        type="success"
        showIcon
        style={{ marginBottom: 16 }}
        message="方案二原理"
        description="通过 Table 的 components.body 注入自定义 wrapper，wrapper 挂载后向上查找 Table 内部真实的滚动容器（overflow: auto 的父元素），并直接给它绑定 scroll 事件。这样 handleScroll 拿到的 e.target 就是真实滚动容器，计算到底部更准确。"
      />

      <Table<TableItem>
        virtual
        dataSource={data}
        columns={columns}
        rowKey="id"
        pagination={false}
        scroll={{ x: 720, y: 500 }}
        components={components}
        loading={loading && data.length === 0}
      />

      {loading && data.length > 0 && (
        <div style={{ textAlign: 'center', padding: '12px' }}>
          <Spin size="small" tip="加载更多数据中..." />
        </div>
      )}
      {!hasMore && data.length > 0 && (
        <div style={{ textAlign: 'center', padding: '12px', color: '#bfbfbf', fontSize: 13 }}>
          已加载全部 {data.length} 条数据
        </div>
      )}

      <Card style={{ marginTop: 16 }}>
        <Title level={5}>完整源码</Title>
        <pre
          style={{
            background: '#f6f8fa',
            padding: 16,
            borderRadius: 8,
            fontSize: 13,
            lineHeight: 1.8,
            overflow: 'auto',
          }}
        >
{`const BodyWrapper = ({ children, onScroll }) => {
  const innerRef = useRef(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    // 向上找到真正的滚动容器
    let scrollContainer = el.parentElement;
    while (
      scrollContainer &&
      scrollContainer !== document.body &&
      !/^(auto|scroll)$/i.test(window.getComputedStyle(scrollContainer).overflowY)
    ) {
      scrollContainer = scrollContainer.parentElement;
    }

    if (!scrollContainer) return;
    scrollContainer.addEventListener('scroll', onScroll);
    return () => scrollContainer?.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  return <div ref={innerRef}>{children}</div>;
};

// ...

<Table
  virtual
  dataSource={data}
  columns={columns}
  scroll={{ x: 720, y: 500 }}
  components={{
    body: (bodyProps) => (
      <BodyWrapper onScroll={handleScroll}>
        {bodyProps.children}
      </BodyWrapper>
    ),
  }}
/>

const handleScroll = (e) => {
  const target = e.target;
  const { scrollHeight, scrollTop, clientHeight } = target;
  if (scrollHeight - scrollTop - clientHeight < 200) {
    loadMore();
  }
};`}
        </pre>
      </Card>
    </div>
  );
}

// ==================== 主页面 ====================

const AntdVirtualTablePage: React.FC = () => {
  return (
    <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography style={{ marginBottom: 24 }}>
        <Title level={2}>antd5 内置虚拟表格</Title>
        <Paragraph>
          antd 5.14+ 的 <Text code>Table</Text> 组件支持 <Text code>virtual</Text>{' '}
          属性，开启后内部会自动使用虚拟滚动，适合大数据量场景。
        </Paragraph>
        <Paragraph>
          <Text strong>关键问题：</Text> antd5 的 Table 没有专门的无限加载 API。
          下面提供两种方案监听滚动到底部事件，方案二（components.body）更贴近 Table 内部真实滚动容器。
        </Paragraph>
      </Typography>

      <Card
        style={{ flex: 1, overflow: 'auto' }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <Tabs
          defaultActiveKey="components-body"
          items={[
            {
              key: 'outer-scroll',
              label: (
                <Space>
                  <CodeOutlined />
                  方案一：外层容器 onScroll
                </Space>
              ),
              children: <OuterScrollDemo />,
            },
            {
              key: 'components-body',
              label: (
                <Space>
                  <CodeOutlined />
                  方案二：components.body 注入
                </Space>
              ),
              children: <ComponentsBodyDemo />,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default AntdVirtualTablePage;
