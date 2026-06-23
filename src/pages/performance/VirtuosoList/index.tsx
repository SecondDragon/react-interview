import React, { useState, useCallback, useEffect } from 'react';
import { Card, Typography, Spin, Alert, Tag, Space } from 'antd';
import { Virtuoso } from 'react-virtuoso';
import { FeedItem, FeedCard, generateMockData } from '../NoStableHeightVirtualList/index';

const { Title, Paragraph, Text } = Typography;

const VirtuosoListPage: React.FC = () => {
  const [data, setData] = useState<FeedItem[]>(() => generateMockData(50));
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 模拟触底加载
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);

    setTimeout(() => {
      const newData = generateMockData(20);
      setData((prev) => [...prev, ...newData]);
      setLoading(false);

      if (data.length + newData.length >= 300) {
        setHasMore(false);
      }
    }, 800);
  }, [loading, hasMore, data.length]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography style={{ marginBottom: 24 }}>
        <Title level={2}>专业级方案：React Virtuoso 演示</Title>
        <Paragraph>
          <Text strong>React Virtuoso</Text> 是目前 React 生态中处理“动态高度”最成熟的虚拟列表库。
          它通过内部复杂的坐标校准算法，解决了手写方案中常见的“滚动跳动”和“白屏”问题。
        </Paragraph>
        <Alert
          type="success"
          showIcon
          message="对比重点"
          description={
            <ul>
              <li>
                <Text strong>稳定性：</Text> 观察快速滚动时是否有白屏（Virtuoso
                优化了首屏渲染与缓冲区策略）。
              </li>
              <li>
                <Text strong>纠偏：</Text> 图片异步加载出来后，观察滚动条是否会剧烈抖动（Virtuoso
                内部会自动补偿高度偏移）。
              </li>
              <li>
                <Text strong>代码复杂度：</Text> 无需手写 ResizeObserver 和位置计算映射表。
              </li>
            </ul>
          }
        />
      </Typography>

      <Card
        bodyStyle={{ padding: 0, height: 'calc(100vh - 350px)' }}
        style={{ flex: 1, overflow: 'hidden', position: 'relative' }}
      >
        <Virtuoso
          style={{ height: '100%' }}
          data={data}
          // 增加缓冲区，防止白屏
          increaseViewportBy={1000}
          // 渲染项
          itemContent={(index, item) => <FeedCard item={item} />}
          // 触底加载逻辑
          endReached={loadMore}
          // 页脚加载状态
          components={{
            Footer: () => (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                {loading ? (
                  <Spin tip="正在加载更多顶级优化数据..." />
                ) : hasMore ? null : (
                  <Text type="secondary">--- 已加载全部 300 条动态 ---</Text>
                )}
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default VirtuosoListPage;
