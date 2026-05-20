import React, { useState, useCallback, useRef } from 'react';
import { Card, Typography, Avatar, Tag, Spin, Space, Button } from 'antd';
import { UserOutlined, MessageOutlined, LikeOutlined } from '@ant-design/icons';
import { VirtualList } from './VirtualList';

const { Text, Title, Paragraph } = Typography;

// --- 模拟数据接口 ---
export interface FeedItem {
  id: string;
  author: string;
  avatar: string;
  content: string;
  image?: string;
  tags: string[];
  timestamp: string;
}

// --- 随机内容池 ---
const LOREM = [
  "这是一段比较短的文字内容。",
  "这是一段中等长度的内容，包含了更多的描述信息，用来测试虚拟列表在不同文本长度下的排版表现是否依然稳定。",
  "这是一段超级长的文本内容！" + "此处省略一万字...".repeat(10) + "由于文本非常长，它会撑开容器的高度，导致后续元素的 Top 坐标发生偏移。我们的 ResizeObserver 必须能够捕捉到这种变化并实时修正 Spacer 的高度。",
  "有些动态可能还带有一张图片，图片的高度也是不确定的，这进一步增加了测量的难度。",
];

const IMAGES = [
  "https://picsum.photos/seed/1/400/300",
  "https://picsum.photos/seed/2/400/600",
  "https://picsum.photos/seed/3/400/400",
  "https://picsum.photos/seed/4/400/200",
];

// --- 模拟数据生成器 ---
let idCounter = 0;
export const generateMockData = (count: number): FeedItem[] => {
  return Array.from({ length: count }).map(() => ({
    id: `item-${++idCounter}`,
    author: `用户 ${Math.floor(Math.random() * 1000)}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${idCounter}`,
    content: LOREM[Math.floor(Math.random() * LOREM.length)],
    image: Math.random() > 0.5 ? IMAGES[Math.floor(Math.random() * IMAGES.length)] : undefined,
    tags: ["前端", "性能优化", "React"].slice(0, Math.floor(Math.random() * 3) + 1),
    timestamp: new Date().toLocaleString(),
  }));
};

// --- 列表项渲染组件 ---
export const FeedCard: React.FC<{ item: FeedItem }> = ({ item }) => {
  return (
    <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fff' }}>
      <Space align="start" style={{ width: '100%' }}>
        <Avatar src={item.avatar} icon={<UserOutlined />} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text strong>{item.author}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{item.timestamp}</Text>
          </div>
          <Paragraph>{item.content}</Paragraph>
          {item.image && (
            <div style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
              <img
                src={item.image}
                alt="Feed"
                style={{ width: '100%', display: 'block', maxHeight: '400px', objectFit: 'cover' }}
                // 关键：图片加载完成后，内容撑开，ListItem 的 ResizeObserver 会捕捉到并上报
              />
            </div>
          )}
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space size="middle">
              {item.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
            </Space>
            {/*<Space size="large" style={{ color: '#8c8c8c' }}>*/}
            {/*  <span><LikeOutlined /> {Math.floor(Math.random() * 100)}</span>*/}
            {/*  <span><MessageOutlined /> {Math.floor(Math.random() * 20)}</span>*/}
            {/*</Space>*/}
          </div>
        </div>
      </Space>
    </div>
  );
};

const NoStableHeightVirtualListPage: React.FC = () => {
  const [data, setData] = useState<FeedItem[]>(() => generateMockData(50));
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);

    // 模拟网络请求
    setTimeout(() => {
      const newData = generateMockData(20);
      setData(prev => [...prev, ...newData]);
      setLoading(false);

      // 模拟加载到 200 条就停止
      if (data.length + newData.length >= 200) {
        setHasMore(false);
      }
    }, 800);
  }, [loading, hasMore, data.length]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography style={{ marginBottom: 24 }}>
        <Title level={2}>不定高虚拟列表 (Dynamic Height Virtual List)</Title>
        <Paragraph>
          这是最高难度的虚拟列表实现。难点在于：<Text code>Item</Text> 的高度在渲染前是未知的，甚至在渲染后会因为图片加载、
          文字展开而动态变化。本示例通过 <Text strong>ResizeObserver + 坐标平移纠偏</Text> 算法，实现了 0 闪烁、高性能的动态高度列表。
        </Paragraph>
      </Typography>

      <Card
        bodyStyle={{ padding: 0, height: 'calc(100vh - 300px)' }}
        style={{ flex: 1, overflow: 'hidden' }}
      >
        <VirtualList
          data={data}
          renderItem={(item) => <FeedCard item={item} />}
          onEndReached={loadMore}
          isLoading={loading}
          hasMore={hasMore}
          style={{ height: '100%' }}
          defaultItemHeight={150} // 初始预估高度
        />

        {loading && (
          <div style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: '8px 16px',
            borderRadius: 20,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <Spin size="small" tip="加载更多动态..." />
          </div>
        )}
      </Card>
    </div>
  );
};

export default NoStableHeightVirtualListPage;
