import React from 'react';
import { Alert, Card, Divider, Typography } from 'antd';
import AppLiveDemo from './LiveDemo';

const { Title, Paragraph, Text } = Typography;

const SimpleVirtualTablePage: React.FC = () => {
  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>自研虚拟滚动表格（无第三方框架）</Title>
      <Paragraph type="secondary">
        本页面实现了一个完全不依赖 TanStack Table / TanStack Virtual 的虚拟滚动表格，
        所有逻辑手写，模块化拆分，适合教学和学习。
      </Paragraph>

      <Alert
        message="设计理念"
        description="虚拟表格拆分为三个独立 Hook + 一个组合组件。每个模块都职责单一，可独立测试。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Divider />

      <Title level={3}>模块架构</Title>

      <Card style={{ marginBottom: 16 }}>
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
{`useSizeMeasurer (尺寸测量引擎)
├── ResizeObserver 监听每行真实高度
├── positions: ItemPosition[] (top / height / bottom)
├── updateItemHeight() 多米诺平移后续行
└── 输出: positions, totalHeight, measureItem

useChunkMap (空间分桶索引)
├── 按 chunkSize 切分 positions 到多个桶
├── chunksMap: Map<chunkNum, Set<itemIndex>>
├── getVisibleIndices() O(k) 可见性查询
└── 仅扫描命中的桶，不遍历全量

useVirtualizer (虚拟化编排引擎)
├── 组合 useSizeMeasurer + useChunkMap
├── 管理 scrollTop + viewportHeight
├── 输出: virtualItems[]
├── 提供 scrollToIndex()
└── 上层组件唯一需要接触的 Hook

useTableModel (表格数据模型)
├── 列定义管理 (ColumnDef)
├── 行数据映射 (accessor)
├── 勾选状态 (Set<string>)
├── 全选 / 半选 / 取消全选
├── 列宽策略 (固定 / flex 弹性)
└── 输出: rows, headerGroups, toggleAll, toggleRow

VirtualTable (UI 组件)
├── 使用 useVirtualizer + useTableModel
├── Sticky Header (translateZ(0))
├── Virtual Row (absolute + translateY)
├── IntersectionObserver 触发 onEndReached
└── 外部控制 isLoading / hasMore`}</pre>
      </Card>

      <Divider />

      <Title level={3}>互动演示</Title>
      <Paragraph>
        <Text>下面的表格完全手写实现：</Text>
      </Paragraph>
      <ul>
        <li>空间分桶（Chunk Map）O(k) 级可见性查询</li>
        <li>ResizeObserver 实时测量行高 + 多米诺平移</li>
        <li>Set&lt;string&gt; 管理勾选状态，不依赖 DOM</li>
        <li>IntersectionObserver 触发无限加载</li>
        <li>使用 waterfall 的"双轨制"预防 loading 竞态</li>
        <li>列宽支持 flex 弹性布局自适应</li>
      </ul>

      <Card style={{ marginTop: 16 }}>
        <AppLiveDemo />
      </Card>

      <Divider />

      <Title level={3}>核心原理图解</Title>

      <Card style={{ marginBottom: 16 }}>
        <Title level={5}>空间分桶（Chunk Map）</Title>
        <Paragraph>
          将 positions 数组按 chunkSize（默认 800px）切分为多个桶。当用户滚动时，
          只扫描 scrollTop 附近的几个桶，而不是遍历全部行。
        </Paragraph>
        <pre
          style={{
            background: '#f6f8fa',
            padding: 16,
            borderRadius: 8,
            fontSize: 13,
            lineHeight: 1.8,
          }}
        >
{`总内容高度 = 10000 行 × 48px = 480000px
chunkSize = 800px → 600 个桶

Chunk 0: [0px ~ 800px]    → 行 0 ~ 16
Chunk 1: [800px ~ 1600px] → 行 17 ~ 33
Chunk 2: [1600px ~ 2400px] → 行 34 ~ 50
...

滚动到 scrollTop = 2500 时：
  可见范围 = [2500-300, 2500+500+300] = [2200, 3300]
  命中的桶: Chunk 2, Chunk 3, Chunk 4
  只需扫描 3 个桶 (O(k))，而不是 10000 行 (O(n))`}</pre>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Title level={5}>ResizeObserver + 多米诺平移</Title>
        <Paragraph>
          每行渲染时绑定 ResizeObserver，当行高变化时更新 position，
          并将后续所有行"多米诺"平移高度差。
        </Paragraph>
        <pre
          style={{
            background: '#f6f8fa',
            padding: 16,
            borderRadius: 8,
            fontSize: 13,
            lineHeight: 1.8,
          }}
        >
{`行 #5 高度从 48px 变为 64px（+16px）

多米诺平移：
  行 #5: height: 48 → 64, bottom: +16
  行 #6: top: +16,  bottom: +16
  行 #7: top: +16,  bottom: +16
  ...
  行 #9999: top: +16, bottom: +16
  总高度: +16

时间复杂度: O(n)，但由于只发生在行高变化时（非滚动帧），可接受`}</pre>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Title level={5}>双轨制 Loading 守卫（来自瀑布流经验）</Title>
        <Paragraph>
          使用 <Text code>useRef</Text> 做"同步守卫"，<Text code>useState</Text> 做"UI 渲染"，
          彻底避免闭包陷阱导致的竞态问题。
        </Paragraph>
        <pre
          style={{
            background: '#f6f8fa',
            padding: 16,
            borderRadius: 8,
            fontSize: 13,
            lineHeight: 1.8,
          }}
        >
{`// 同步守卫（Ref，永不触发渲染）
const isLoadingRef = useRef(false);
const hasMoreRef = useRef(true);

// UI 渲染（State，驱动视图）
const [isUILoading, setIsUILoading] = useState(false);
const [isUIHasMore, setIsUIHasMore] = useState(true);

const loadMore = useCallback(async () => {
  // 读 Ref 做守卫 → 永远最新值
  if (isLoadingRef.current || !hasMoreRef.current) return;

  // 立即上锁（同步！）
  isLoadingRef.current = true;
  setIsUILoading(true); // 触发 UI

  const newData = await fetch(...);

  // ... 解锁
  isLoadingRef.current = false;
  setIsUILoading(false);
}, []); // 依赖数组为空 → 永不重建 IntersectionObserver`}</pre>
      </Card>

      <Divider />

      <Title level={3}>各模块 API 文档</Title>

      <Card style={{ marginBottom: 16 }}>
        <Title level={5}>useSizeMeasurer</Title>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              <th style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>API</th>
              <th style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>类型</th>
              <th style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}><Text code>positions</Text></td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>ItemPosition[]</td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>所有行位置信息 (top/height/bottom)</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}><Text code>totalHeight</Text></td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>number</td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>总高度（撑 Spacer）</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}><Text code>initPositions(count)</Text></td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>(count) =&gt; void</td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>新增/减少行时初始化位置</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}><Text code>measureItem(index, el)</Text></td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>(index, element) =&gt; void</td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>ResizeObserver 回调，实时校正高度</td>
            </tr>
          </tbody>
        </table>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Title level={5}>useChunkMap</Title>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              <th style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>API</th>
              <th style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}><Text code>getVisibleIndices(scrollTop, viewportHeight)</Text></td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>根据滚动位置返回可见行索引数组，O(k)</td>
            </tr>
          </tbody>
        </table>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Title level={5}>useTableModel</Title>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              <th style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>API</th>
              <th style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}><Text code>rows</Text></td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>RowData[]</td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>每行包含 id + cells + originalIndex</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}><Text code>headerGroups</Text></td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>HeaderCell[]</td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>列头信息</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}><Text code>selectedIds</Text></td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>Set&lt;string&gt;</td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>勾选的 ID 集合</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}><Text code>toggleRow(id)</Text></td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>(id) =&gt; void</td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>切换某行勾选状态</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}><Text code>toggleAll()</Text></td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>() =&gt; void</td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>全选 / 取消全选</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}><Text code>isAllSelected</Text></td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>boolean</td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>全选状态</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}><Text code>isSomeSelected</Text></td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>boolean</td>
              <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>半选状态（部分勾选）</td>
            </tr>
          </tbody>
        </table>
      </Card>

      <Alert
        message="scrollToIndex 实现原理"
        description={
          <Text>
            通过 positions[index] 获取目标行的 top 位置，然后调用 container.scrollTo({'{{ top: targetTop }}'})。
            align 参数控制目标行出现在视口的什么位置：
            'start'（行顶部对齐视口顶部）、'center'（行居中）、'end'（行底部对齐视口底部）。
            在本实现中 scrollToIndex 已实现但未暴露为 UI 操作。
          </Text>
        }
        type="info"
        showIcon
        style={{ marginTop: 16 }}
      />
    </div>
  );
};

export default SimpleVirtualTablePage;
