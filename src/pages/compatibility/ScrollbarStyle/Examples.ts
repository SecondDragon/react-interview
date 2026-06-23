/**
 * 滚动条样式案例元数据
 */
export const ScrollbarExamples = {
  title: '跨平台滚动条样式与“布局抖动”兼容 (Scrollbar Layout Shift)',
  phenomenon:
    '在 Windows/Linux 系统下，传统浏览器（如 Chrome, Edge, Firefox）的滚动条是“独占式”的（通常占据 17px 宽度）。当页面内容从“不可滚动”变为“可滚动”，或者弹出 Modal 弹窗导致 body 设置 overflow: hidden 时，滚动条的瞬间消失或出现会导致页面内容区域（Container）的可用宽度发生突变。这会引起视觉上的“猛烈抖动”（Layout Shift），甚至导致固定定位（fixed）的导航栏发生错位，严重影响用户体验。',
  reason:
    '1. Windows 传统 UI 机制：Windows 系统的滚动条默认作为窗口的一部分存在，会“挤压”内容区。而 macOS 默认使用“悬浮式”滚动条，不占据空间。\n2. 动态溢出冲突：当内容动态增加触发滚动条时，浏览器需要重新计算所有元素的宽度，引发全量重排（Reflow）。\n3. 弹窗补丁副作用：许多 UI 库在开启 Modal 时会强行给 body 加 overflow: hidden，试图通过 JS 补回那 17px 的 padding，但在复杂布局或多层嵌套下，这种计算往往会失效或产生滞后感。',
  whySolveThisWay:
    '1. scrollbar-gutter: stable (核心稳定)：这是 W3C 专门为解决此问题设计的现代属性。它通过强制预留坑位，从根本上消除了 Layout Shift。\n2. 美化伪元素 (视觉统一)：Windows 默认滚动条极不美观，通过 webkit 伪元素可以将其改造成现代 UI 风格，并减小其宽度以降低视觉冲击。\n3. Overlay Scrollbars (终极方案)：对于要求绝对一致的场景，通过 JS 模拟一个完全脱离文档流的滚动条（如 OverlayScrollbars 库），可以抹平所有系统差异。',
  solutionA: `
/* ✅ 方案 A：现代 CSS 属性 (最推荐，解决抖动) */
html {
  /* stable: 始终预留滚动条坑位，即便内容没有溢出 */
  /* both-edges: 如果你想让左右对称（避免视觉重心偏移） */
  scrollbar-gutter: stable;
}`,
  solutionB: `
/* ✅ 方案 B：全局美化滚动条 (Webkit 内核，解决美观) */
::-webkit-scrollbar {
  width: 8px;  /* 宽度变细 */
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  /* 边框可以制造“外边距”效果，让滚动条不紧贴边缘 */
  border: 2px solid transparent;
  background-clip: content-box;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
  background-clip: content-box;
}

::-webkit-scrollbar-track {
  background: transparent;
}`,
  solutionC: `
/**
 * ✅ 方案 C：进阶 Overlay 方案 (JS 模拟)
 * 适用场景：大屏可视化、Dashboard、对 UI 要求极致统一的 Web App
 */
import 'overlayscrollbars/overlayscrollbars.css';
import { OverlayScrollbars } from 'overlayscrollbars';

// 初始化
const osInstance = OverlayScrollbars(document.body, {
  scrollbars: {
    visibility: 'auto',
    autoHide: 'leave',
    autoHideDelay: 500,
    dragScrolling: true,
    clickScrolling: true,
  },
  // 核心特性：它会动态创建一个特殊的 DOM 结构来承载内容
  // 从而让滚动条完全“悬浮”在内容之上，不占据任何物理空间
});`,
  bad: `
/* ❌ 错误做法：不做任何处理 */
body {
  overflow-y: auto; 
}

/* 此时点击弹窗，body 变为 overflow: hidden */
/* 滚动条瞬间消失，页面内容向右“跳动”约 17px */
`,
};
