/**
 * Viewport 与基础概念案例元数据
 */
export const MobileViewportExamples = {
  title: '移动端 Viewport 与基础概念',

  description:
    '移动端开发中，Viewport 是连接 CSS 像素与设备物理像素的关键桥梁。理解 Layout Viewport、Visual Viewport 和 Ideal Viewport 的区别，以及 DPR、PPI 等核心概念，是移动端适配的基石。',

  phenomenon:
    '在移动端浏览器中，如果不设置 viewport meta 标签，页面会被默认缩放到很小（如 980px 宽度），导致文字无法阅读、按钮难以点击。即使设置了 viewport，不同设备上的显示效果仍然差异巨大——同样的 1px 边框在 iPhone 上看起来正常，在 Android 上可能变粗，在 iPad 上又显得过细。',

  reason:
    '移动端浏览器为了兼容桌面网页，默认使用一个较大的 Layout Viewport（iOS Safari 默认为 980px），然后将整个页面缩放显示在屏幕上。这导致 CSS 像素与物理像素之间存在复杂的映射关系：DPR（Device Pixel Ratio）决定了 1 个 CSS 像素对应多少个物理像素。当 DPR=2 时，1px 的 CSS 边框实际上占用了 2×2=4 个物理像素，视觉上就会变粗。',

  whyDip: `为什么要提出设备独立像素（DIP）？

核心问题：如果物理像素直接对应 CSS 像素，同一套 CSS 在不同设备上显示的大小会天差地别。

场景假设：没有 DIP，物理像素 = CSS 像素

设备 A：旧手机，4.7 英寸，750×1334 物理像素，326 PPI
设备 B：新手机，6.1 英寸，1170×2532 物理像素，460 PPI

问题 1：同样的 width: 375px，显示大小完全不同
- 设备 A（750px 宽）：375px 占屏幕宽度的一半
- 设备 B（1170px 宽）：375px 只占屏幕宽度的 32%
结果：同一套代码，按钮大小不一致

问题 2：文字无法阅读
- 设备 A（326 PPI）：16px 文字清晰可读
- 设备 B（460 PPI）：16px 文字因为像素更密集，实际显示更小
结果：高 PPI 设备上所有内容都变得极小

问题 3：开发噩梦
- 如果有 100 种设备，需要写 100 套样式
- 每个设备的分辨率不同，无法统一维护

解决方案：引入设备独立像素（DIP）

操作系统引入 DIP 作为中间抽象层：
CSS 像素 → 设备独立像素（DIP）→ 物理像素

关键设计：操作系统保证同样数量的 DIP，在物理屏幕上显示的实际尺寸大致相同。

实际效果：
- 设备 A：375 DIP，750 物理像素（DPR=2）
- 设备 B：390 DIP，1170 物理像素（DPR=3）

开发者写 width: 50%，两台手机都显示一半宽度
开发者写 font-size: 16px，两台手机文字大小差不多
→ 一套 CSS，适配所有设备！

类比理解：
- DIP = 厘米/英寸（无论屏幕多清晰，1 厘米就是 1 厘米）
- 物理像素 = 墨点（打印机分辨率越高，1 厘米内墨点越多，但字大小不变）
- DPR = 墨点密度（高清打印机用更多墨点打印同样内容，更清晰）`,

  why375: `为什么设计稿都用 375px，但不同设备 DIP 各不相同？

核心答案：375px 不是"标准"，而是"基准"。就像建筑图纸用 1:100 的比例尺，实际建筑大小不一，但按比例缩放即可。

1. 375px 的历史渊源

iPhone 6/7/8 时代（2014-2017）：
- 屏幕宽度：375 DIP
- 物理分辨率：750×1334（DPR=2）
- 设计稿：750px（按物理像素绘制）
- 前端代码写 375px，构建工具自动转换

这是移动端设计稿的"黄金标准"起源。

为什么不是 390px（iPhone 14）或 360px（Android）？
- 历史惯性：iPhone 6 是第一款大屏 iPhone，奠定了设计规范
- 工具链成熟：设计软件、切图工具、构建插件都围绕 375 优化
- 比例一致：375 → 750（DPR=2）是整数倍，计算简单
- 覆盖最广：375px 宽度在 iOS 和 Android 中占比最高

2. DIP 不同为什么没问题？

关键理解：设计稿是"相对比例"，不是"绝对尺寸"。

设计稿（750px）：
- 卡片 width: 375px → 占 50%
- 按钮 width: 690px → 占 92%
- 边距 30px → 占 4%

实际设备：
- iPhone 8（375 DIP）：卡片 187px（50%），按钮 345px（92%）
- iPhone 14（390 DIP）：卡片 195px（50%），按钮 359px（92%）

结论：实际像素不同，但相对比例相同，视觉体验一致。

3. 真正的问题：极端设备的适配

iPhone SE（375 DIP，4.7 英寸）：
- 16px 文字 → 实际显示偏小
- 44px 按钮 → 点击区域刚好

iPhone 14 Pro Max（430 DIP，6.7 英寸）：
- 同样的 16px 文字 → 实际显示偏大
- 同样的 44px 按钮 → 点击区域舒适

问题：同样的绝对尺寸，在不同大小屏幕上视觉效果不同！

解决方案：相对单位 + 响应式
- font-size: clamp(14px, 4.8vw, 20px)
- 使用 rem + 动态根字体
- 响应式断点处理极端设备

4. 为什么 375px 仍然是"最佳基准"？

- 设计效率：设计师只需出一套图，前端按比例转换
- 构建工具：postcss-px-to-viewport、postcss-pxtorem 都以 375 为默认基准
- 组件库：Vant、Ant Design Mobile 等内部以 375 为设计基准
- 团队协作：设计、前端、测试统一语言，减少沟通成本
- 覆盖度：iPhone 6/7/8/X/11/12/13/SE 都是 375 或接近 375

5. 实际工程中的处理方式

设计稿 750px（物理像素）
  ↓
前端写代码（以 375px 为逻辑基准）
  ↓
构建工具转换
  ├── rem 方案：px → rem（基于根字体）
  ├── vw 方案：px → vw（基于视口百分比）
  └── 混合方案：部分用 px，部分用 vw
  ↓
实际渲染
  ├── iPhone 8（375 DIP）：1:1 显示
  ├── iPhone 14（390 DIP）：轻微放大（约 4%）
  └── Android（360 DIP）：轻微缩小（约 4%）

4% 的差异在视觉上几乎不可感知！

真正需要特殊处理的是极端设备：
- iPad（768+ DIP）：需要平板适配
- 折叠屏（展开后超大宽度）：需要响应式断点
- 小屏 Android（320 DIP）：需要最小尺寸保护`,

  bad: `<!-- ❌ 错误：不设置 viewport，或设置不当 -->
<!-- 页面会被默认缩放到 980px，文字极小 -->
<!-- 或者设置了但缺少关键属性 -->
<meta name="viewport" content="width=320">

/* ❌ 错误：使用固定 px 宽度 */
.container {
  width: 320px;  /* 在大屏手机上两侧留白 */
}

/* ❌ 错误：忽略 DPR 导致图片模糊 */
<img src="logo.png" width="100" height="100">
<!-- 在 DPR=3 的设备上，100×100 的 CSS 像素需要 300×300 的物理像素 -->
<!-- 但图片只有 100×100 物理像素，被拉伸后模糊 -->

/* ❌ 错误：固定字体大小，不考虑屏幕尺寸 */
.title {
  font-size: 18px;  /* iPhone SE 上偏大，iPhone Pro Max 上偏小 */
}`,

  good: `<!-- ✅ 推荐：标准 viewport 设置 -->
<meta name="viewport"
  content="width=device-width,
           initial-scale=1.0,
           maximum-scale=1.0,
           minimum-scale=1.0,
           user-scalable=no,
           viewport-fit=cover">

/* ✅ 推荐：使用相对单位 */
.container {
  width: 100%;
  max-width: 750px;
  padding: 0 16px;
}

/* ✅ 推荐：根据 DPR 加载高清图片 */
<img srcset="logo@1x.png 1x, logo@2x.png 2x, logo@3x.png 3x"
     src="logo@1x.png"
     alt="Logo">

/* ✅ 推荐：使用 CSS 变量存储 DPR 相关信息 */
:root {
  --dpr: 1;
  --1px: 1px;
}

@media (-webkit-min-device-pixel-ratio: 2) {
  :root {
    --dpr: 2;
    --1px: 0.5px;
  }
}

@media (-webkit-min-device-pixel-ratio: 3) {
  :root {
    --dpr: 3;
    --1px: 0.333px;
  }
}

/* ✅ 推荐：使用 clamp 限制字体大小范围 */
.title {
  font-size: clamp(14px, 4.8vw, 20px);
  /* 最小 14px，最大 20px，中间按视口比例 */
}

/* ✅ 验证 DPR 和像素映射 */
/* iPhone 14 上执行 */
/* window.innerWidth = 390 (CSS 像素 = DIP) */
/* window.devicePixelRatio = 3 (DPR) */
/* 物理像素 = 390 × 3 = 1170 */`,

  whySolveThisWay: `选择标准 viewport 设置的原因：

1. width=device-width
   将 Layout Viewport 宽度设为设备宽度，使 CSS 像素与设备独立像素 1:1 对应。

2. initial-scale=1.0
   初始缩放比例为 1，确保页面以原始大小呈现，不被浏览器自动缩放。

3. viewport-fit=cover
   针对 iPhone X+ 刘海屏，允许内容延伸至安全区域之外，配合 env() 函数实现完美适配。

4. user-scalable=no（可选）
   禁止用户手动缩放，适用于 Web App 场景。但会影响无障碍访问，内容类网站不建议设置。

三种 Viewport 的协作流程：

1. 浏览器首先创建 Layout Viewport（默认 980px）
2. 通过 meta 标签将 Layout Viewport 设为 Ideal Viewport（设备宽度）
3. 网页内容在 Layout Viewport 上进行 CSS 布局
4. 用户看到的区域是 Visual Viewport，缩放时只有 Visual Viewport 变化，Layout Viewport 保持不变

类比理解：
- Layout Viewport = 一张 A4 纸的大小（画布固定）
- Visual Viewport = 放大镜下的视野范围（放大时看到的区域变小）
- Ideal Viewport = 量身定制的衣服尺寸（设备认为最合适的尺寸）`,

  principle: `核心原理解析：

1. 设备独立像素（DIP）的设计哲学
   操作系统引入 DIP 作为硬件抽象层，将开发者从纷繁复杂的硬件分辨率中解放出来。
   无论设备的物理像素是多少，同样数量的 DIP 在屏幕上显示的实际尺寸大致相同。
   这是移动端"一次开发，多端运行"的基础。

2. 375px 基准的工程意义
   375px 不是绝对标准，而是相对比例基准。设计稿按 375 的倍数（750px）绘制，
   前端代码以 375 为逻辑基准，构建工具自动转换为 vw/rem。
   实际渲染时，不同 DIP 的设备按比例缩放，视觉差异在可接受范围内（±4%）。

3. Layout Viewport（布局视口）
   浏览器用于计算 CSS 布局的虚拟画布。默认 980px，设置 width=device-width 后等于设备宽度。
   关键特性：缩放时保持不变，就像报纸本身不会因为放大镜而改变大小。

4. Visual Viewport（视觉视口）
   用户当前实际看到的区域。当用户缩放页面时，Visual Viewport 会变化。
   关键特性：放大时 Visual Viewport 变小，缩小时 Visual Viewport 变大。
   可以通过 window.visualViewport API 获取实时尺寸。

5. Ideal Viewport（理想视口）
   设备制造商认为最适合网页展示的视口大小，即 width=device-width。
   不同设备的 Ideal Viewport 不同：
   - iPhone SE: 375 × 667
   - iPhone 14: 390 × 844
   - iPad Pro: 1024 × 1366

6. DPR（Device Pixel Ratio）
   DPR = 物理像素 / 设备独立像素。iPhone 14 的 DPR=3，意味着 1 个 CSS 像素对应 9 个物理像素。

7. 坐标系映射流程
   CSS 像素 → 设备独立像素（DIP）→ 物理像素
   其中：DIP = CSS 像素（默认），物理像素 = DIP × DPR

8. 缩放时的行为差异
   - 用户放大 2 倍：Layout Viewport 不变（375px），Visual Viewport 缩小为 187.5px
   - 此时 1px 的 CSS 边框在屏幕上占用 2 个物理像素，看起来更粗
   - 这就是为什么需要在高 DPR 设备上处理 1px 边框问题`,
};
