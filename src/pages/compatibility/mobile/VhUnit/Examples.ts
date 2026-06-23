/**
 * vh 单位案例元数据
 */
export const VhUnitExamples = {
  title: 'Mobile Safari vh 单位计算不准确 (The 100vh Bug)',
  phenomenon:
    '在移动端浏览器（尤其是 iOS Safari）中，当你给一个满屏的容器（如包含底部按钮的弹窗或全屏页面）设置 height: 100vh 时，你会发现页面最底部的元素被浏览器的地址栏 or 底部工具栏无情地遮挡了。用户必须手动往下滚动一下，底部的按钮才能‘浮’出来。',
  reason:
    '这个坑的根源在于：浏览器厂商（以苹果为代表）故意将 100vh 定义为‘浏览器最大化时的视口高度’（即隐藏了顶部地址栏和底部工具栏后的理想全屏高度）。Safari 团队认为，如果 100vh 的实际物理像素值随着工具栏的显示/隐藏而动态变化，会导致页面中依赖 vh 的元素极其频繁地触发 Layout 回流和重绘，导致滚动过程极其卡顿跳跃。因此，他们选择牺牲了牺牲了静态 100vh 的准确性，换取了页面滚动的平滑度。',
  whySolveThisWay:
    '1. 使用 dvh (Dynamic Viewport Height)：这是最新的 CSS 标准单位。dvh 是动态的，它会实时扣除当前屏幕上工具栏所占据的物理空间。现代移动端浏览器基本都已经支持。\n2. 使用 CSS 变量结合 JS (--vh)：对于不支持 dvh 的老旧设备（如 iOS 14 及以下），我们在 JS 中通过 window.innerHeight 拿到真实的物理像素高度，再将其均分为 100 份作为基准值赋值给 CSS 变量。这是业界最稳健、兼容性最好的防线。',
  bad: `
/* ❌ 错误做法：在移动端直接使用 100vh 铺满全屏 */
.mobile-full-screen {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 在 iOS 上，下面这个固定在底部的按钮会被浏览器导航栏盖住，用户无法点击 */
.bottom-submit-btn {
  margin-top: auto; 
  height: 50px;
}
  `,
  good: `
/* ✅ 解决方案 1：使用现代 CSS 单位 dvh (首选方案) */
.mobile-full-screen-modern {
  /* 当工具栏显示时，它是真实剩余高度；当工具栏隐藏时，它会自动变大 */
  height: 100dvh; 
}

/* ✅ 解决方案 2：JS 动态计算 CSS 变量（兼容老旧设备的终极防线） */
/* 1. 在项目的入口文件 (App.tsx 或 main.ts) 中注入自定义变量 */
const setVh = () => {
  // 获取除去工具栏后的真实内部高度，并除以 100 得到单位高度
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', \`\${vh}px\`);
};
setVh();
window.addEventListener('resize', setVh); // 监听旋转

/* 2. 在 CSS 中调用自定义变量 */
.mobile-full-screen-fixed {
  /* 实际高度 = 计算出的单位变量 --vh 乘以 100 */
  /* 提供 fallback 值 1vh 保证安全 */
  height: calc(var(--vh, 1vh) * 100); 
}
  `,
};
