import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Spin } from 'antd';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { useWaterfall } from './useWaterfall';
import type { WaterfallItem } from './useWaterfall';

/**
 * 瀑布流页面主组件
 */

// 我们刚才生成的 5 张带尺寸的 SVG 占位图
const IMAGES = [
  '/images/pic1_w400_h600.svg',
  '/images/pic2_w800_h1000.svg',
  '/images/pic3_w600_h400.svg',
  '/images/pic4_w500_h900.svg',
  '/images/pic5_w700_h700.svg',
];

// 模拟向后端请求数据的接口
const fetchMockData = async (page: number, pageSize: number): Promise<WaterfallItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data: WaterfallItem[] = [];
      for (let i = 0; i < pageSize; i++) {
        // 随机抽一张图
        const randomImg = IMAGES[Math.floor(Math.random() * IMAGES.length)];
        // 从文件名中解析宽高: pic1_w400_h600.svg
        const match = randomImg.match(/_w(\d+)_h(\d+)\./);
        const imgWidth = match ? parseInt(match[1], 10) : 200;
        const imgHeight = match ? parseInt(match[2], 10) : 200;

        data.push({
          id: `item-${page}-${i}-${Date.now()}`,
          title: `瀑布流内容 - 页码${page} - 序号${(page - 1) * pageSize + i + 1}`,
          imgUrl: randomImg,
          imgWidth: imgWidth,
          imgHeight: imgHeight,
          // 随机生成一个柔和的背景颜色
          color: `hsl(${Math.random() * 360}, 70%, 85%)`,
        });
      }
      resolve(data);
    }, 800); // 模拟 0.8 秒的网络延迟
  });
};

const WaterfallPage: React.FC = () => {
  // =====================================================================
  // 【终极方案：将核心状态藏在 useRef 中，夺回控制权】
  //
  // 为什么这样写？
  // 1. 如果把 isLoadingMore、hasMore 和 page 放在 useState 中，它们每一次改变都会触发整个组件的重新渲染。
  // 2. 重新渲染会导致依赖这些状态的 useEffect（比如 Observer 或者兜底补丁）被反复执行，甚至因为动画时间差产生死锁。
  // 3. 将它们放在 useRef 中，读写 .current 是完全静默的，绝对不会触发 React 重新渲染。
  // 4. 这样我们把“核心加载控制流”和“UI 渲染流”彻底分离：
  //    - 控制流：只认 Ref，没有闭包陷阱，函数永远不用重建。
  //    - 渲染流：只在数据回来（dataList）或者需要显示 Loading 圈（isUILoading）时，才去触发 useState 更新视图。
  // =====================================================================

  // 【UI 渲染状态】只控制界面的显示
  const [dataList, setDataList] = useState<WaterfallItem[]>([]);
  const [isUILoading, setIsUILoading] = useState(false);
  const [isUIHasMore, setIsUIHasMore] = useState(true);

  // 【核心控制流状态】真正的来源，永远不触发渲染
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(0); // 初始为 0，请求第一页时变成 1

  // 瀑布流参数
  const columns = 6;
  const gap = 16;

  // 监听容器宽度的变化 (改为使用 SimpleBar 提供的内容包裹器或者直接监听外层 div)
  // 注意：SimpleBar 会在内部生成多个 dom 节点，为了测量物理宽度，我们需要给外层容器加个 ref
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    // 同步提取需要的值，避免异步闭包中 event 对象被重置导致 currentTarget 为 null
    const currentScrollTop = e.currentTarget.scrollTop;

    // 使用 requestAnimationFrame 节流，避免高频触发 setState 导致卡顿
    requestAnimationFrame(() => {
      setScrollTop(currentScrollTop);
    });
  }, []);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0] && entries[0].contentRect.width > 0) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });

    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 把计算逻辑抽离在外部的 hook 中
  const { positions, containerHeight, itemWidth } = useWaterfall(
    dataList,
    containerWidth,
    columns,
    gap
  );
  // 1. 无限加载的核心函数（由于要递归调用自己，我们可以用 useRef 来绕过 useCallback 的依赖检查）
  const loadMoreRef = useRef<() => void>(() => {});

  const loadMoreData = useCallback(async () => {
    // 【完美拦截】因为是直接读 current，就算被疯狂调用也不会因为拿到旧状态而漏拦
    if (isLoadingRef.current || !hasMoreRef.current) return;

    // 立即上锁
    isLoadingRef.current = true;
    setIsUILoading(true); // 通知 React 渲染 Loading 圈

    const nextPage = pageRef.current + 1;
    const newData = await fetchMockData(nextPage, 30); // 一次请求 10 条

    // 更新当前页码
    pageRef.current = nextPage;

    // 如果数据全部拉完了，修改状态
    if (nextPage >= 20 || newData.length === 0) {
      hasMoreRef.current = false;
      setIsUIHasMore(false); // 通知 React 渲染 "到底啦"
    }

    // 将新数据放入 state，这会触发唯一的、必要的 React 重渲染！
    setDataList((prev) => [...prev, ...newData]);

    // 【命令式之魂：利用 requestAnimationFrame 等待 DOM 更新】
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isLoadingRef.current = false; // 解锁，允许下一次请求
        setIsUILoading(false); // 关掉 Loading 圈

        // 【主动出击：完美解决“初始不够”和“滚轮太快”的问题】
        if (hasMoreRef.current && sentinelRef.current) {
          const rect = sentinelRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight || document.documentElement.clientHeight;

          if (rect.top <= windowHeight + 100) {
            // 通过 ref 递归调用自己，完美绕过 eslint 对直接递归的限制
            loadMoreRef.current();
          }
        }
      });
    });
  }, []);

  // 绑定 ref 供递归使用 (必须在 effect 或 event handler 中赋值以遵守 React 规范)
  useEffect(() => {
    loadMoreRef.current = loadMoreData;
  }, [loadMoreData]);

  // 初始化加载
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMoreData();
  }, [loadMoreData]);

  // 2. 永远不会销毁的 IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 只要发生跨越视口边界的动作，就尝试去加载。
        // 因为 loadMoreData 被彻底锁在 useRef 保护下，哪怕发生一百次误触，也会被完美拦截。
        if (entries[0].isIntersecting) {
          loadMoreData();
        }
      },
      {
        rootMargin: '100px',
      }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [loadMoreData]);
  // ↑由于 loadMoreData 不可变，这个 Effect 只会在组件 mount 和 unmount 时执行。
  // Observer 变成了忠诚的守门员，再也不会出现失忆和死锁了。

  return (
    <SimpleBar
      scrollableNodeProps={{ onScroll: handleScroll }}
      style={{
        height: '100%',
        backgroundColor: '#fff',
      }}
    >
      {/*
        包装一个 div 用于计算真实的物理容器宽度。
        因为 SimpleBar 会把原生滚动条隐藏掉，并用相对定位包裹内容，
        所以这个 padding 必须加在这里，而不是 SimpleBar 自己身上，
        否则会影响自定义滚动条的贴边显示。

        【修复】添加 overflowX: 'hidden'
        为什么？因为当我们收起/展开左侧菜单导致容器变窄时，卡片的 left 和 width 有 0.3s 的过渡动画。
        在动画期间，卡片依然占据着原本较宽的位置，这会短暂地撑破容器宽度，导致 SimpleBar 出现极其影响体验的横向滚动条。
        加上横向隐藏后，即使动画还在进行中，溢出的部分也会被无情裁掉，完美解决横向滚动条闪烁的问题！
      */}
      <div ref={wrapperRef} style={{ boxSizing: 'border-box', overflowX: 'hidden' }}>
        {/*<h2 style={{ marginBottom: 24 }}>瀑布流布局示例页面 (固定 {columns} 列)</h2>*/}
        {/*<div style={{ marginBottom: 16, color: '#666' }}>*/}
        {/*  <p>*/}
        {/*    操作提示：一直向下滑动到页面底部会自动<b>触发下一页的数据加载</b>。*/}
        {/*  </p>*/}
        {/*  <p>当前实现为固定 {columns} 列，并且宽度会根据容器自适应缩放（也就是 1/6）。</p>*/}
        {/*  <p>*/}
        {/*    <b>【极客优化】</b>：右侧的滚动条使用了*/}
        {/*    `simplebar-react`，它是一个悬浮（Overlay）滚动条。它不会挤占容器的任何物理宽度，所以滑动到底部或改变窗口大小时，绝对不会发生恶心的“卡片集体向左挤压”现象！*/}
        {/*  </p>*/}
        {/*</div>*/}

        {/* 瀑布流的总容器，必须设置 relative 定位，因为里面的卡片全都是 absolute 绝对定位 */}
        <div
          style={{
            position: 'relative',
            // 容器本身的高度由 JS 计算得出并赋值，否则脱离文档流的绝对定位子元素撑不开父元素
            height: containerHeight,
          }}
        >
          {dataList.map((item, index) => {
            // 从计算结果中拿到每个卡片对应的位置，如果没有计算出来（比如刚加载），就先隐藏在左上角
            const pos = positions[index] || { left: 0, top: 0 };
            const isReady = positions.length > 0 && itemWidth > 0;

            // 【虚拟列表优化】
            // 定义上下缓冲区域（例如上下各预留 1500px，防止滚动过快出现白屏）
            const buffer = 3000;
            const windowHeight = window.innerHeight;
            // 判断当前卡片是否在可视区域 + 缓冲区域内
            const isVisible =
              pos.top + (pos.itemHeight || 0) > scrollTop - buffer &&
              pos.top < scrollTop + windowHeight + buffer;

            // 如果不在可视区域，直接返回 null，不渲染实际的 DOM 节点！
            if (!isVisible) {
              return null;
            }

            return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  // 【GPU 加速布局：小红书同款 translate3d 方案】
                  // 相比直接修改 top/left，translate 会启用浏览器合成层加速，不触发布局重排。
                  left: 0,
                  top: 0,
                  transform: `translate3d(${pos.left}px, ${pos.top}px, 0)`,
                  willChange: 'transform',

                  width: itemWidth,
                  height: pos.itemHeight, // 使用我们在 Hook 里算好的动态总高度
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  padding: 16,
                  boxSizing: 'border-box',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',

                  // 使用一个更具“高级感”的贝塞尔曲线，模拟这种自然回弹和重排的质感
                  // 不要使用，很蠢，会使得页面跳动
                  // transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease, width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',

                  opacity: isReady ? 1 : 0,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* 【核心防抖动占位：图片容器】 */}
                <div
                  style={{
                    width: '100%',
                    // 严格使用 Hook 算出来的图片缩放高度，提前占位，即使图片没加载完也不会导致 Layout Shift
                    height: pos.scaledImgHeight,
                    backgroundColor: item.color, // 用柔和的随机色做骨架屏底色
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '8px',
                  }}
                >
                  <img
                    src={item.imgUrl}
                    alt={item.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>

                <div style={{ fontWeight: 'bold', fontSize: 14, color: '#333' }}>{item.title}</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: '4px' }}>
                  尺寸: {item.imgWidth}x{item.imgHeight}
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部加载状态提示 & 触底哨兵元素 (Sentinel) */}
        <div ref={sentinelRef} style={{ textAlign: 'center', padding: '24px 0' }}>
          {isUILoading && <Spin tip="正在努力拉取下一页数据..." />}
          {!isUIHasMore && (
            <span style={{ color: '#999' }}>-- 哎呀，已经到底啦，所有数据都已加载完毕 --</span>
          )}
        </div>
      </div>
    </SimpleBar>
  );
};

export default WaterfallPage;
