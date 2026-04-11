import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Spin } from 'antd';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { useProWaterfall } from './useProWaterfall';
import type { WaterfallItem } from './useProWaterfall';

/**
 * 瀑布流专业版 - 空间索引虚拟列表实现 (小红书/Pinterest 架构)
 *
 * 本组件展示了如何处理海量数据（如 5000+ 条卡片）而保持 60FPS。
 * 核心优化点：
 * 1. 空间检索：不再遍历 5000 条数据，而是根据 scrollTop 直接从 Hash Map 取出可见索引。
 * 2. 增量计算：只计算新加载的数据，老数据的坐标直接从缓存读取。
 * 3. GPU 加速：使用 translate3d 开启合成层，避开主线程布局挤压。
 */

// 1. 模拟资源
const IMAGES = [
  '/images/pic1_w400_h600.svg',
  '/images/pic2_w800_h1000.svg',
  '/images/pic3_w600_h400.svg',
  '/images/pic4_w500_h900.svg',
  '/images/pic5_w700_h700.svg',
];

// 2. 数据获取（带延迟模拟）
const fetchMockData = async (page: number, pageSize: number): Promise<WaterfallItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data: WaterfallItem[] = [];
      for (let i = 0; i < pageSize; i++) {
        const randomImg = IMAGES[Math.floor(Math.random() * IMAGES.length)];
        const match = randomImg.match(/_w(\d+)_h(\d+)\./);
        const imgWidth = match ? parseInt(match[1], 10) : 200;
        const imgHeight = match ? parseInt(match[2], 10) : 200;

        data.push({
          id: `pro-item-${page}-${i}-${Date.now()}`,
          title: `顶级瀑布流 - 页码${page} - 序号${(page - 1) * pageSize + i + 1}`,
          imgUrl: randomImg,
          imgWidth: imgWidth,
          imgHeight: imgHeight,
          color: `hsl(${Math.random() * 360}, 70%, 85%)`,
        });
      }
      resolve(data);
    }, 600);
  });
};

const WaterfallProfessional: React.FC = () => {
  // 状态流：这些状态的变化会驱动 UI 更新
  const [dataList, setDataList] = useState<WaterfallItem[]>([]);
  const [isUILoading, setIsUILoading] = useState(false);
  const [isUIHasMore, setIsUIHasMore] = useState(true);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // 控制流：这些引用不会触发更新，专门用于逻辑拦截和记录
  const pageRef = useRef(0);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 【核心 Hook】：应用空间索引算法
  const { positions, containerHeight, itemWidth, getVisibleIndices } = useProWaterfall(
    dataList,
    containerWidth,
    4,
    16
  );

  /**
   * 【神操作】：计算当前“可见索引”
   * 这里的 visibleIndices 数组长度通常只有 30~50。
   * React 以后只会在这个几十个元素的范围内进行循环渲染，而不是 dataList。
   */
  const visibleIndices = useMemo(() => {
    return getVisibleIndices(scrollTop, window.innerHeight, 1500); // 1500 是预加载缓冲区
  }, [getVisibleIndices, scrollTop]);

  // 加载逻辑
  const loadMoreData = useCallback(async () => {
    if (isLoadingRef.current || !hasMoreRef.current) return;
    isLoadingRef.current = true;
    setIsUILoading(true);

    const nextPage = pageRef.current + 1;
    const newData = await fetchMockData(nextPage, 50);

    pageRef.current = nextPage;
    if (nextPage >= 100) { // 模拟 5000 条上限
        hasMoreRef.current = false;
        setIsUIHasMore(false);
    }

    setDataList((prev) => [...prev, ...newData]);

    // 等待 DOM 物理更新后解锁，确保滑动顺畅
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isLoadingRef.current = false;
        setIsUILoading(false);
      });
    });
  }, []);

  // 滚动监听：SimpleBar 的滚动事件
  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const st = e.currentTarget.scrollTop;
    // 使用 rAF 节流，避免 JS 线程过于频繁地更新坐标导致掉帧
    requestAnimationFrame(() => setScrollTop(st));
  }, []);

  // 监听容器宽度（侧边栏切换、窗口缩放）
  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      if (entries[0]) setContainerWidth(entries[0].contentRect.width);
    });
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  // 触底监听
  useEffect(() => {
    const ob = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMoreData();
    }, { rootMargin: '400px' });
    if (sentinelRef.current) ob.observe(sentinelRef.current);
    return () => ob.disconnect();
  }, [loadMoreData]);

  // 初始化首次请求
  useEffect(() => { loadMoreData(); }, [loadMoreData]);

  return (
    <SimpleBar scrollableNodeProps={{ onScroll: handleScroll }} style={{ height: '100%', backgroundColor: '#f5f5f5' }}>
      <div ref={wrapperRef} style={{ padding: '24px', boxSizing: 'border-box', overflowX: 'hidden' }}>
        <h2 style={{ marginBottom: 16 }}>专业版瀑布流 (空间索引 + 增量计算)</h2>

        {/* 教学看板 */}
        <div style={{ marginBottom: 16, padding: '16px 24px', backgroundColor: '#fff', borderLeft: '4px solid #1890ff', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h4 style={{ color: '#1890ff', marginBottom: 12 }}>🎓 算法学习手册：</h4>
            <ul style={{ paddingLeft: 20, color: '#666', lineHeight: '1.8' }}>
                <li><b>空间分桶 (Binning)</b>：页面被切成了 800px 一个的房间。卡片算出坐标后，会“登记”在它经过的房号下。</li>
                <li><b>O(1) 级查找</b>：滚动时，JS 直接按“房号”抓人。哪怕数组里有 1 万人，我也只抓这 2 间房里的 30 个人。</li>
                <li><b>数据状态</b>：当前列表总数 <b>{dataList.length}</b>，React 实际处理节点数 <b>{visibleIndices.length}</b>。</li>
                <li><b>硬件加速</b>：卡片位置由 <code>translate3d</code> 托管给 GPU，消灭了主线程的重排压力。</li>
            </ul>
        </div>

        <div style={{ position: 'relative', height: containerHeight }}>
          {/*
             【核心逻辑转变】
             普通写法：dataList.map(...) -> 复杂度 O(N)
             专业写法：visibleIndices.map(...) -> 复杂度 O(可见数)
          */}
          {visibleIndices.map((idx) => {
            const item = dataList[idx];
            const pos = positions[idx];
            if (!item || !pos) return null;

            return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: itemWidth,
                  height: pos.itemHeight,
                  // 使用 3D 位移开启合成层，利用显卡进行渲染
                  transform: `translate3d(${pos.left}px, ${pos.top}px, 0)`,
                  willChange: 'transform',
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  padding: 12,
                  boxSizing: 'border-box',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  // 顺滑的弹性动画
                  transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* 骨架屏占位图 */}
                <div style={{ width: '100%', height: pos.scaledImgHeight, backgroundColor: item.color, borderRadius: 8, marginBottom: 10, overflow: 'hidden' }}>
                  <img src={item.imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ fontWeight: 'bold', fontSize: 14, color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                    <span>索引: #{idx}</span>
                    <span>{item.imgWidth}x{item.imgHeight}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 哨兵节点 */}
        <div ref={sentinelRef} style={{ textAlign: 'center', padding: '60px 0' }}>
          {isUILoading && <Spin tip="正在应用空间索引检索数据..." />}
          {!isUIHasMore && <span style={{ color: '#ccc' }}>—— 5000 条顶级索引数据已加载完毕 ——</span>}
        </div>
      </div>
    </SimpleBar>
  );
};

export default WaterfallProfessional;
