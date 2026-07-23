import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Spin, Card, Typography, Alert, Switch, Space } from 'antd';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { useAdaptiveWaterfall } from './useAdaptiveWaterfall';
import type { WaterfallItem } from './useAdaptiveWaterfall';
import AdaptiveItemCard from './AdaptiveItemCard';

const { Text } = Typography;

const LOREM = [
  '这是一段比较短的文字。',
  '这是一段中等长度的内容，包含了更多的描述信息，用来测试不同文本长度下的排版表现。',
  '这是一段超级长的文本内容！' +
    '此处省略一万字...'.repeat(10) +
    '由于文本非常长，它会撑开容器的高度。',
  '有些动态可能还带有一张图片，图片的高度也是不确定的。',
];

const IMAGES = [
  'https://picsum.photos/seed/1/400/300',
  'https://picsum.photos/seed/2/400/600',
  'https://picsum.photos/seed/3/400/400',
  'https://picsum.photos/seed/4/400/200',
];

let idCounter = 0;

export interface FeedItem extends WaterfallItem {
  id: string;
  author: string;
  avatar: string;
  content: string;
  image?: string;
  tags: string[];
  timestamp: string;
}

const generateMockData = (count: number): FeedItem[] => {
  return Array.from({ length: count }).map(() => {
    idCounter += 1;
    return {
      id: `adaptive-feed-${idCounter}`,
      author: `用户 ${Math.floor(Math.random() * 1000)}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${idCounter}`,
      title: `动态 #${idCounter}`,
      content: LOREM[Math.floor(Math.random() * LOREM.length)],
      image: Math.random() > 0.3 ? IMAGES[Math.floor(Math.random() * IMAGES.length)] : undefined,
      tags: ['前端', '性能优化', 'React'].slice(0, Math.floor(Math.random() * 3) + 1),
      timestamp: new Date().toLocaleString(),
      color: `hsl(${Math.random() * 360}, 75%, 80%)`,
    };
  });
};

const fetchMockData = async (page: number, pageSize: number): Promise<FeedItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockData(pageSize));
    }, 500);
  });
};

const POOL_SIZE = 80;

const WaterfallAdaptiveDemo: React.FC = () => {
  const [dataList, setDataList] = useState<FeedItem[]>([]);
  const [isUILoading, setIsUILoading] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [useRealHeight, setUseRealHeight] = useState(true);
  const [correctionCount, setCorrectionCount] = useState(0);

  const pageRef = useRef(0);
  const isLoadingRef = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const simpleBarRef = useRef<any>(null);

  const { positions, containerHeight, itemWidth, getVisibleIndices, reportImageHeight } =
    useAdaptiveWaterfall(dataList, containerWidth, 4, 16, {
      defaultImgRatio: 4 / 3,
      fixedBodyHeight: 100,
    });

  const displayPool = useMemo(() => {
    const visibleIndices = getVisibleIndices(
      scrollTop,
      simpleBarRef.current?.el?.clientHeight ?? window.innerHeight,
      1500
    );
    const pool = new Array(POOL_SIZE).fill(null);

    visibleIndices.forEach((dataIdx) => {
      const slotIdx = dataIdx % POOL_SIZE;
      pool[slotIdx] = {
        dataIdx,
        item: dataList[dataIdx],
        pos: positions[dataIdx],
      };
    });

    return pool;
  }, [getVisibleIndices, scrollTop, dataList, positions]);

  const loadMoreData = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsUILoading(true);

    const nextPage = pageRef.current + 1;
    const newData = await fetchMockData(nextPage, 20);
    pageRef.current = nextPage;
    setDataList((prev) => [...prev, ...newData]);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isLoadingRef.current = false;
        setIsUILoading(false);
      });
    });
  }, []);

  useEffect(() => {
    const ro = new ResizeObserver((entries) => {
      if (entries[0]) setContainerWidth(entries[0].contentRect.width);
    });
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const ob = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreData();
      },
      { rootMargin: '200px' }
    );
    if (sentinelRef.current) ob.observe(sentinelRef.current);
    return () => ob.disconnect();
  }, [loadMoreData]);

  useEffect(() => {
    loadMoreData();
  }, []);

  const handleImageHeightReport = useCallback(
    (dataIdx: number, height: number) => {
      if (!useRealHeight) return;
      reportImageHeight(dataIdx, height);
      setCorrectionCount((c) => c + 1);
    },
    [reportImageHeight, useRealHeight]
  );

  return (
    <Card
      title={
        <Space>
          <span>不定高图片自适应瀑布流</span>
          <Switch
            checked={useRealHeight}
            onChange={setUseRealHeight}
            checkedChildren="开启高度校正"
            unCheckedChildren="关闭高度校正"
          />
        </Space>
      }
      extra={
        <Text type="secondary">
          已校正 <Text strong>{correctionCount}</Text> 次
        </Text>
      }
    >
      <Alert
        message="高度校正说明"
        description="图片加载前使用默认 4:3 比例占位。加载完成后按真实比例重新布局。关闭校正时，所有图片固定 4:3 显示，真实比例不同的图片会被裁剪或留白。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <SimpleBar
        ref={simpleBarRef}
        scrollableNodeProps={{
          onScroll: (e: any) => setScrollTop(e.currentTarget.scrollTop),
        }}
        style={{ height: 'calc(100vh - 420px)', backgroundColor: '#fafafa' }}
      >
        <div ref={wrapperRef} style={{ boxSizing: 'border-box', overflowX: 'hidden' }}>
          <div style={{ position: 'relative', height: containerHeight }}>
            {displayPool.map((slot, slotIdx) => {
              if (!slot) {
                return <div key={`slot-${slotIdx}`} style={{ display: 'none' }} />;
              }
              const { item, pos, dataIdx } = slot;
              return (
                <AdaptiveItemCard
                  key={`slot-${slotIdx}`}
                  item={item}
                  itemWidth={itemWidth}
                  pos={pos}
                  dataIdx={dataIdx}
                  slotIdx={slotIdx}
                  onImageHeightReport={handleImageHeightReport}
                />
              );
            })}
          </div>
          <div ref={sentinelRef} style={{ textAlign: 'center', padding: '60px 0' }}>
            {isUILoading && <Spin tip="加载更多..." />}
          </div>
        </div>
      </SimpleBar>
    </Card>
  );
};

export default WaterfallAdaptiveDemo;
