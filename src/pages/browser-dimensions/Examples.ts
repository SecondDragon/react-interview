/**
 * 浏览器的各种尺寸 - 示例代码和元数据
 */

export const BrowserDimensionsMeta = {
  title: '浏览器的各种尺寸',

  description:
    '浏览器提供了超过 20 种尺寸相关的 API，它们分别基于不同的坐标系（CSS 像素、DIP、物理像素），在不同的场景下返回值差异巨大。理解这些 API 的精确含义，是高级前端开发的必备技能。',

  phenomenon:
    '开发者在实际工作中经常遇到以下困惑：\n\n1. clientWidth 和 offsetWidth 到底有什么区别？为什么有时候值一样，有时候又不一样？\n2. window.innerWidth 和 document.documentElement.clientWidth 为什么在某些浏览器中返回值不同？\n3. 页面缩放后，为什么 innerWidth 变了，但 screen.width 没变？\n4. 计算滚动条宽度时，到底该用 scrollWidth - clientWidth 还是其他公式？\n5. 移动端键盘弹出时，window.innerHeight 和 visualViewport.height 哪个更可靠？\n6. 懒加载判断元素是否进入视口，用 getBoundingClientRect() 还是 IntersectionObserver？',

  reason:
    '浏览器为了兼容历史包袱和不同使用场景，设计了多套尺寸体系：\n\n1. CSS 像素体系：innerWidth、clientWidth、offsetWidth 等，基于 CSS 像素（逻辑像素）\n2. 设备独立像素体系：screen.width，基于 DIP，不受缩放影响\n3. 物理像素体系：devicePixelRatio，基于硬件实际发光点\n4. 视觉视口体系：visualViewport，基于用户实际看到的区域，缩放时动态变化\n\n不同 API 基于不同的体系，导致在缩放、滚动、键盘弹出等场景下表现各异。',

  bad: `/* ❌ 错误：混淆 clientWidth 和 offsetWidth */
function getScrollbarWidth() {
  // 错误：offsetWidth 包含边框，scrollWidth 不包含边框
  // 在有边框的元素上，这个计算是错误的
  return element.offsetWidth - element.clientWidth;
}

/* ❌ 错误：用 innerHeight 判断键盘弹出 */
window.addEventListener('resize', () => {
  // 错误：innerHeight 在桌面端也会变化（窗口缩放）
  if (window.innerHeight < 500) {
    console.log('键盘弹出了'); // 误判！
  }
});

/* ❌ 错误：用 scrollTop 判断滚动到底部 */
element.addEventListener('scroll', () => {
  // 错误：没有考虑舍入误差，可能永远到不了底部
  if (element.scrollTop + element.clientHeight === element.scrollHeight) {
    console.log('到底了'); // 可能永远触达不到！
  }
});`,

  good: `/* ✅ 正确：scrollWidth - clientWidth 计算滚动条宽度 */
function getScrollbarWidth() {
  // 正确：scrollWidth 和 clientWidth 都不包含边框，差值就是滚动条宽度
  return element.scrollWidth - element.clientWidth;
}

/* ✅ 正确：用 visualViewport 检测键盘弹出 */
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    // 正确：visualViewport 专门用于检测视觉区域变化
    const keyboardHeight = window.innerHeight - window.visualViewport.height;
    if (keyboardHeight > 150) {
      console.log('键盘弹出了，高度：', keyboardHeight);
    }
  });
}

/* ✅ 正确：考虑舍入误差的滚动到底判断 */
element.addEventListener('scroll', () => {
  // 正确：使用阈值判断，避免浮点数精度问题
  const isBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
  if (isBottom) {
    console.log('到底了');
  }
});`,

  whySolveThisWay: `为什么要系统学习这些尺寸 API？

1. 它们是高级前端开发的基石
   - 虚拟滚动、懒加载、视差效果、自定义滚动条……
   - 所有这些高级功能都依赖对尺寸 API 的精确理解

2. 避免隐蔽的 bug
   - 混淆 clientWidth 和 offsetWidth 可能导致布局计算错误
   - 忽略舍入误差可能导致滚动判断永远失效
   - 错误使用 innerHeight 可能导致键盘检测误判

3. 性能优化
   - getBoundingClientRect() 会触发强制重排（forced reflow）
   - IntersectionObserver 是更高效的视口检测方案
   - 理解这些差异可以写出更高性能的代码`,

  principle: `核心原理：浏览器的三套坐标系

1. CSS 像素坐标系（逻辑像素）
   - 前端开发最常用的坐标系
   - innerWidth、clientWidth、offsetWidth 等都基于这个坐标系
   - viewport 缩放会改变 CSS 像素的"尺寸"，导致这些值变化

2. 设备独立像素坐标系（DIP）
   - 操作系统抽象的逻辑单位
   - screen.width 基于这个坐标系
   - 不受浏览器缩放影响，只与设备硬件有关

3. 物理像素坐标系
   - 屏幕实际的发光点数量
   - devicePixelRatio = 物理像素 / CSS 像素
   - 高清屏上 1 个 CSS 像素对应多个物理像素

4. 视觉视口坐标系（Visual Viewport）
   - 用户实际看到的区域
   - 缩放时动态变化
   - visualViewport API 专门用于获取这个坐标系的值`,
};

/**
 * 尺寸 API 详细数据（用于表格展示）
 */
export const dimensionApiData = [
  // Window 级别
  {
    key: 'w1',
    category: 'Window',
    api: 'window.innerWidth',
    meaning: '浏览器窗口可视区域宽度（含滚动条）',
    includes: '内容区 + 滚动条',
    coordinate: 'CSS 像素',
    affectedByZoom: true,
    affectedByScroll: false,
    commonUse: '响应式断点判断、视口宽度计算',
  },
  {
    key: 'w2',
    category: 'Window',
    api: 'window.innerHeight',
    meaning: '浏览器窗口可视区域高度（含滚动条）',
    includes: '内容区 + 滚动条',
    coordinate: 'CSS 像素',
    affectedByZoom: true,
    affectedByScroll: false,
    commonUse: '一屏高度计算、键盘弹出检测',
  },
  {
    key: 'w3',
    category: 'Window',
    api: 'window.outerWidth',
    meaning: '浏览器窗口外部总宽度',
    includes: '整个浏览器窗口（含工具栏、边框）',
    coordinate: 'CSS 像素',
    affectedByZoom: false,
    affectedByScroll: false,
    commonUse: '极少使用',
  },
  {
    key: 'w4',
    category: 'Window',
    api: 'window.screen.width',
    meaning: '屏幕设备独立像素宽度',
    includes: '整个屏幕',
    coordinate: 'DIP',
    affectedByZoom: false,
    affectedByScroll: false,
    commonUse: '设备类型判断、多屏适配',
  },
  {
    key: 'w5',
    category: 'Window',
    api: 'window.screen.availWidth',
    meaning: '屏幕可用宽度（扣除任务栏等）',
    includes: '可用区域',
    coordinate: 'DIP',
    affectedByZoom: false,
    affectedByScroll: false,
    commonUse: '全屏应用、桌面端布局',
  },
  {
    key: 'w6',
    category: 'Window',
    api: 'window.devicePixelRatio',
    meaning: '物理像素 / CSS 像素比值',
    includes: 'DPR 比值',
    coordinate: '比值',
    affectedByZoom: false,
    affectedByScroll: false,
    commonUse: '高清图片加载、Canvas 绘制',
  },
  {
    key: 'w7',
    category: 'Window',
    api: 'window.visualViewport.width',
    meaning: '视觉视口宽度（用户实际看到的区域）',
    includes: '可见内容区',
    coordinate: 'CSS 像素',
    affectedByZoom: true,
    affectedByScroll: true,
    commonUse: '键盘弹出检测、视差滚动、pinch 缩放',
  },

  // Document 级别
  {
    key: 'd1',
    category: 'Document',
    api: 'document.documentElement.clientWidth',
    meaning: '<html> 元素内容区宽度（不含滚动条）',
    includes: '内容区（不含边框、滚动条）',
    coordinate: 'CSS 像素',
    affectedByZoom: true,
    affectedByScroll: false,
    commonUse: '布局视口宽度、滚动条宽度计算',
  },
  {
    key: 'd2',
    category: 'Document',
    api: 'document.documentElement.scrollWidth',
    meaning: '<html> 元素内容总宽度（含溢出部分）',
    includes: '所有内容（含溢出）',
    coordinate: 'CSS 像素',
    affectedByZoom: true,
    affectedByScroll: false,
    commonUse: '页面总宽度、滚动条宽度计算',
  },
  {
    key: 'd3',
    category: 'Document',
    api: 'document.documentElement.offsetWidth',
    meaning: '<html> 元素总宽度（含边框、滚动条）',
    includes: '内容区 + 内边距 + 边框 + 滚动条',
    coordinate: 'CSS 像素',
    affectedByZoom: true,
    affectedByScroll: false,
    commonUse: '元素总占位宽度',
  },

  // Element 级别
  {
    key: 'e1',
    category: 'Element',
    api: 'element.clientWidth',
    meaning: '元素内容区宽度（不含边框、滚动条）',
    includes: '内容区 + 内边距',
    coordinate: 'CSS 像素',
    affectedByZoom: true,
    affectedByScroll: false,
    commonUse: '元素可用内容宽度',
  },
  {
    key: 'e2',
    category: 'Element',
    api: 'element.offsetWidth',
    meaning: '元素总宽度（含边框、滚动条）',
    includes: '内容区 + 内边距 + 边框 + 滚动条',
    coordinate: 'CSS 像素',
    affectedByZoom: true,
    affectedByScroll: false,
    commonUse: '元素总占位宽度',
  },
  {
    key: 'e3',
    category: 'Element',
    api: 'element.scrollWidth',
    meaning: '元素内容总宽度（含溢出部分）',
    includes: '所有内容（含溢出）',
    coordinate: 'CSS 像素',
    affectedByZoom: true,
    affectedByScroll: false,
    commonUse: '滚动条宽度计算、内容溢出判断',
  },
  {
    key: 'e4',
    category: 'Element',
    api: 'element.scrollTop',
    meaning: '元素垂直滚动距离',
    includes: '已滚动的像素数',
    coordinate: 'CSS 像素',
    affectedByZoom: true,
    affectedByScroll: true,
    commonUse: '滚动位置判断、无限滚动',
  },
  {
    key: 'e5',
    category: 'Element',
    api: 'element.getBoundingClientRect()',
    meaning: '元素相对于视口的位置和尺寸',
    includes: 'top/right/bottom/left/width/height',
    coordinate: 'CSS 像素',
    affectedByZoom: true,
    affectedByScroll: true,
    commonUse: '元素位置判断、懒加载、动画',
  },
];

/**
 * 应用场景数据
 */
export const useCaseData = [
  {
    key: '1',
    title: '自定义滚动条宽度计算',
    scenario: '需要隐藏原生滚动条，用自定义滚动条替代',
    formula: 'scrollbarWidth = element.offsetWidth - element.clientWidth',
    explanation: 'offsetWidth 包含边框和滚动条，clientWidth 只包含内容区，差值就是滚动条宽度',
    code: `function getScrollbarWidth(el) {
  return el.offsetWidth - el.clientWidth;
}`,
  },
  {
    key: '2',
    title: '滚动到底部判断',
    scenario: '无限滚动加载，需要判断用户是否滚动到底部',
    formula: 'scrollTop + clientHeight >= scrollHeight - threshold',
    explanation: '使用阈值（如 1px）避免浮点数精度问题，确保能稳定触发',
    code: `function isScrollToBottom(el, threshold = 1) {
  return el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
}`,
  },
  {
    key: '3',
    title: '移动端键盘弹出检测',
    scenario: '移动端输入框聚焦时，键盘弹出导致页面布局变化',
    formula: 'keyboardHeight = window.innerHeight - visualViewport.height',
    explanation: 'visualViewport 反映用户实际看到的区域，键盘弹出时会缩小',
    code: `if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    const keyboardHeight = window.innerHeight - window.visualViewport.height;
    if (keyboardHeight > 150) {
      // 键盘弹出了
    }
  });
}`,
  },
  {
    key: '4',
    title: '元素是否进入视口',
    scenario: '图片懒加载，需要判断元素是否进入可视区域',
    formula: 'rect.top < window.innerHeight && rect.bottom > 0',
    explanation:
      'getBoundingClientRect() 返回相对于视口的位置，top < innerHeight 表示元素顶部已进入视口',
    code: `function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}`,
  },
  {
    key: '5',
    title: '虚拟滚动可视区域计算',
    scenario: '大数据列表渲染，只渲染可视区域内的元素',
    formula: 'startIndex = Math.floor(scrollTop / itemHeight)',
    explanation: '根据 scrollTop 和每个元素的高度，计算当前应该渲染哪些元素',
    code: `function getVisibleRange(el, itemHeight, totalCount) {
  const startIndex = Math.floor(el.scrollTop / itemHeight);
  const visibleCount = Math.ceil(el.clientHeight / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount, totalCount);
  return { startIndex, endIndex };
}`,
  },
  {
    key: '6',
    title: '视差滚动效果',
    scenario: '滚动时背景以不同速度移动，产生深度感',
    formula: 'translateY = scrollTop * speedFactor',
    explanation: '根据 scrollTop 计算背景层的偏移量，speedFactor < 1 时产生视差效果',
    code: `window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  bgLayer.style.transform = \`translateY(\${scrollTop * 0.5}px)\`;
});`,
  },
];
