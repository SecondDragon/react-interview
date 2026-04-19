/**
 * 软键盘遮挡案例元数据
 */
export const KeyboardOverlapExamples = {
  description: "iOS Safari 软键盘弹起不触发 resize，导致输入框被盖住。",
  phenomenon: "输入框在键盘弹出后被遮挡，用户无法看见输入内容。",
  reason: "iOS 的设计理念是尽量不改变 DOM 布局高度。它引入了‘视觉视口’概念，键盘弹起仅改变可见区域，而不改变 HTML 根节点的高度。",
  bad: "position: fixed; bottom: 0;",
  good: `window.visualViewport.addEventListener('resize', () => {
  const offset = window.innerHeight - window.visualViewport.height;
  document.body.style.paddingBottom = \`\${offset}px\`;
});`
};
