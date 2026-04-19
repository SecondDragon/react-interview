/**
 * iOS 聚焦跳转案例元数据
 */
export const IosFocusExamples = {
  title: "iOS 聚焦跳转与滚动穿透",
  reason: "聚焦时浏览器强制滚动，弹窗背景失效。",
  bad: ".modal-open { overflow: hidden; }",
  good: `// 动态固定 body 位置
const lockScroll = () => {
  const scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = \`-\${scrollY}px\`;
  document.body.style.width = '100%';
};

const unlockScroll = () => {
  const scrollY = parseInt(document.body.style.top || '0') * -1;
  document.body.style.position = '';
  document.body.style.top = '';
  window.scrollTo(0, scrollY);
};`
};
