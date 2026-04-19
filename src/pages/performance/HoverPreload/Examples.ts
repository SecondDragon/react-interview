/**
 * 示例代码位置说明：
 * 该文件存放于 @src/pages/performance/HoverPreload/Examples.ts
 * 用于展示 性能优化 - 意图预判：Hover 预加载 的两个不同实战场景对比
 */

export const HoverPreloadExamples = {
  /* -------------------------------------------------------------------------- */
  /* 场景一：页面主内容中的重型图表 (HeavyChart)                                   */
  /* 实现方案：Hover 按钮预加载，点击展示                                          */
  /* 痛点：这种组件如果打入路由包，用户即便不看图表，也要承担几兆的下载成本。         */
  /* -------------------------------------------------------------------------- */
  chartOptimized: `
/**
 * 组件引用位置：@src/samples/HeavyChart.tsx
 * 优化实现：Hover 按钮时触发动态 import()
 */
const chartLoader = () => import('../../../samples/HeavyChart');
const HeavyChart = lazy(chartLoader);

function Page() {
  const [showChart, setShowChart] = useState(false);

  // 鼠标一滑过，浏览器就开始静默下载那几兆的图表 JS
  const onHover = () => chartLoader(); 

  return (
    <>
      <Button onMouseEnter={onHover} onClick={() => setShowChart(true)}>
        查看详细业务报表 (Large Bundle)
      </Button>
      {showChart && (
        <Suspense fallback={<Spin tip="如果 JS 下载够快，你就看不到我" />}>
          <HeavyChart />
        </Suspense>
      )}
    </>
  );
}
  `,

  // 场景二：弹窗 (Modal) 中的重型编辑器 (HeavyEditor)
  // 实现方案：Hover 触发深度加载 (Deep Preload)，包含壳组件与核心三方库逻辑
  modalOptimized: `
/**
 * 技巧点：深度预加载 (Deep Preloading)
 * 某些重型库 (如 Monaco, Maps) 即使 import() 了壳组件，其核心库仍会在 Mount 时异步下载。
 * 我们需要手动调用这些库的 init() 方法，在 Hover 阶段就拉取核心静态资源。
 */
import { loader } from '@monaco-editor/react';

const editorLoader = () => import('../../../samples/HeavyEditor');
const HeavyEditor = lazy(editorLoader);

function ModalDemo() {
  const [visible, setVisible] = useState(false);
  
  const handleHover = () => {
    // 1. 加载壳组件
    editorLoader(); 
    // 2. 深度加载：手动触发 Monaco 核心库 (JS/Workers/CSS) 的下载
    loader.init(); 
  };

  return (
    <>
      <Button onMouseEnter={handleHover} onClick={() => setVisible(true)}>
        高级业务配置 (深度预加载)
      </Button>
      <Modal open={visible} onCancel={() => setVisible(false)}>
        <Suspense fallback={<Spin tip="秒开体验" />}>
          <HeavyEditor />
        </Suspense>
      </Modal>
    </>
  );
}
  `
};
