import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Spin } from 'antd';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { useProWaterfall } from './useProWaterfall2';
import type { WaterfallItem } from './useProWaterfall2';
import ItemCard from './item-card/ItemCard.tsx';

/**
 * WaterfallUltimate - 终极版：DOM 节点池复用 (Recycler View 模式)
 *
 * 核心原理：
 * 1. 建立一个固定大小的渲染池 (Pool)，例如 60 个槽位。
 * 2. 槽位的 key 是固定的 (slot-0, slot-1...)，确保 React 永远不销毁这些 DOM。
 * 3. 滚动时，通过算法将“可见数据”映射到这些“闲置槽位”上。
 * 4. 这种方式彻底消除了滚动时的 Mount/Unmount 开销和 GC 压力。
 */

// 1. 模拟资源
const IMAGES = [
  '/images/pic1_w400_h600.svg',
  '/images/pic2_w800_h1000.svg',
  '/images/pic3_w600_h400.svg',
  '/images/pic4_w500_h900.svg',
  '/images/pic5_w700_h700.svg',
];

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
          id: `ultimate-item-${page}-${i}-${Date.now()}`,
          title: `终极复用流 - 页码${page} - 序号${(page - 1) * pageSize + i + 1}`,
          imgUrl: randomImg,
          imgWidth: imgWidth,
          imgHeight: imgHeight,
          color: `hsl(${Math.random() * 360}, 75%, 80%)`,
        });
      }
      console.log(`第${page}页`, data);
      resolve(data);
    }, 500);
  });
};

// 池子大小：根据屏幕大小和 6 列排版，通常 60 个插槽足够覆盖 3-4 屏
const POOL_SIZE = 80;

const WaterfallUltimate: React.FC = () => {
  const [dataList, setDataList] = useState<WaterfallItem[]>([]);
  const [isUILoading, setIsUILoading] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const pageRef = useRef(0);
  const isLoadingRef = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // const loadMoreDataRef = useRef<() => void>(() => {});
  const simpleBarRef = useRef(null);
  // 使用我们之前的 Pro 级空间索引 Hook
  const { positions, containerHeight, itemWidth, getVisibleIndices } = useProWaterfall(
    dataList,
    containerWidth,
    6,
    16
  );

  /**
   * 【核心黑科技：槽位指派逻辑】
   * 我们维护一个“池子”，每个池子槽位展示哪条数据。
   */
  const displayPool = useMemo(() => {
    // 1. 获取当前理论上应该看见的 30-40 个数据索引
    const visibleIndices = getVisibleIndices(
      scrollTop,
      simpleBarRef.current?.el?.clientHeight ?? window.innerHeight,
      1500
    );
    console.log('visibleIndices', visibleIndices);
    // 2. 将这些索引映射到固定的 POOL 中
    // 为了简化演示，我们使用取模运算来指派槽位。
    // 在真实的小红书架构中，会有更复杂的“闲置队列”指派算法。
    const pool = new Array(POOL_SIZE).fill(null);

    visibleIndices.forEach((dataIdx) => {
      const slotIdx = dataIdx % POOL_SIZE; // 关键：数据索引对池大小取模，决定它进哪个坑
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

  // useEffect(() => {
  //   loadMoreDataRef.current = loadMoreData;
  // }, [loadMoreData]);

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
  }, []);

  useEffect(() => {
    loadMoreData();
  }, []);

  return (
    <SimpleBar
      ref={simpleBarRef}
      scrollableNodeProps={{ onScroll: (e) => setScrollTop(e.currentTarget.scrollTop) }}
      style={{ height: '100%', backgroundColor: '#fafafa' }}
    >
      <div
        ref={wrapperRef}
        style={{ padding: '24px', boxSizing: 'border-box', overflowX: 'hidden' }}
      >
        <h2 style={{ marginBottom: 16 }}>Ultimate级瀑布流 (DOM 节点池复用)</h2>

        {/* 技术解析看板 */}
        {/*<div style={{ marginBottom: 24, padding: '20px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8 }}>*/}
        {/*    <h4 style={{ color: '#52c41a', marginBottom: 12 }}>🚀 节点复用黑科技 (Node Recycling):</h4>*/}
        {/*    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>*/}
        {/*        <ul style={{ paddingLeft: 20, color: '#444', fontSize: 13 }}>*/}
        {/*            <li><b>固定 DOM 数量</b>：页面上永远只有 <b>{POOL_SIZE}</b> 个卡片容器。</li>*/}
        {/*            <li><b>零销毁挂载</b>：滚动时，React 仅仅是在更新插槽里的内容，<b>不执行 Unmount/Mount</b>。</li>*/}
        {/*            <li><b>稳定 Key 值</b>：组件 Key 是 <code>slot-X</code> 而不是 <code>item.id</code>。</li>*/}
        {/*        </ul>*/}
        {/*        <div style={{ padding: 12, backgroundColor: '#fff', borderRadius: 4, textAlign: 'center' }}>*/}
        {/*            <div style={{ fontSize: 12, color: '#999' }}>当前数据总量</div>*/}
        {/*            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>{dataList.length}</div>*/}
        {/*            <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>当前活跃 DOM 数</div>*/}
        {/*            <Badge count={POOL_SIZE} showZero color="#52c41a" />*/}
        {/*        </div>*/}
        {/*    </div>*/}
        {/*</div>*/}

        <div style={{ position: 'relative', height: containerHeight }}>
          {/*
             【终极渲染逻辑】
             我们不再 map dataList，也不再 map visibleIndices。
             我们直接 map 这固定大小的池子！
          */}
          {displayPool.map((slot, slotIdx) => {
            // 如果该槽位目前没有被分配数据，将其隐藏到视口外
            if (!slot) {
              return <div key={`slot-${slotIdx}`} style={{ display: 'none' }} />;
            }

            const { item, pos, dataIdx } = slot;

            return (
              <ItemCard
                item={item}
                itemWidth={itemWidth}
                pos={pos}
                dataIdx={dataIdx}
                slotIdx={slotIdx}
                key={`slot-${slotIdx}`}
              ></ItemCard>
            );
          })}
        </div>

        <div ref={sentinelRef} style={{ textAlign: 'center', padding: '60px 0' }}>
          {isUILoading && <Spin tip="正在回收旧节点并指派新数据..." />}
        </div>
      </div>
    </SimpleBar>
  );
};

export default WaterfallUltimate;
