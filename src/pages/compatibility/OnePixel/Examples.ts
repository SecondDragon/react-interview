/**
 * 移动端 1px 边框 - 各方案独立数据
 * 每种方案都遵循 Five Dimensions 结构
 */

// ============================================================
// 方案一：伪元素 + transform 缩放
// ============================================================
export const PseudoElementScaleExamples = {
  title: '方案一：伪元素 + transform 缩放',

  phenomenon:
    '在 iPhone、Android 等高清屏（DPR=2/3）上，CSS 直接写 border: 1px solid #ddd 的边框看起来比设计稿上的 1px 明显更粗。设计师要求"细如发丝"的边框，但在手机上看起来像是 2px 甚至 3px。',

  reason:
    'DPR（Device Pixel Ratio）决定了 1 个 CSS 像素对应多少个物理像素。当 DPR=2 时，1px CSS 边框占用 2×1=2 个物理像素（水平方向）；DPR=3 时占用 3 个物理像素。浏览器没有亚像素渲染能力，无法绘制 0.5px 的 CSS 边框，所以视觉上边框变粗。',

  bad: `/* ❌ 错误：直接写 1px */
.card {
  border-bottom: 1px solid #ddd;
  /* DPR=2 时渲染为 2 物理像素，视觉上变粗 */
}

/* ❌ 错误：尝试用 0.5px */
.card {
  border-bottom: 0.5px solid #ddd;
  /* 部分浏览器不支持，会被忽略或四舍五入为 1px */
}`,

  good: `/* ✅ 推荐：伪元素 + transform: scaleY(0.5) */

/* 下边框 */
.hairline-bottom {
  position: relative;
}
.hairline-bottom::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #ddd;
  transform: scaleY(0.5);
  transform-origin: 0 100%;
}

/* 四边框 */
.hairline-all {
  position: relative;
}
.hairline-all::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 200%;
  border: 1px solid #ddd;
  transform: scale(0.5);
  transform-origin: 0 0;
  pointer-events: none;
  box-sizing: border-box;
}

/* 结合媒体查询适配不同 DPR */
@media (-webkit-min-device-pixel-ratio: 2) {
  .hairline-bottom::after {
    transform: scaleY(0.5);
  }
}
@media (-webkit-min-device-pixel-ratio: 3) {
  .hairline-bottom::after {
    transform: scaleY(0.333);
  }
}`,

  whySolveThisWay: `为什么选择伪元素 + transform 缩放？

1. 兼容性最好
   支持所有现代浏览器和大部分旧浏览器。
   包括 iOS Safari 8+、Android 4.4+、微信内置浏览器。
   是目前业界使用最广泛的方案。

2. 不影响布局流
   伪元素脱离文档流（position: absolute），
   不会影响父元素的高度计算和子元素的布局。
   transform 不会触发 Reflow，只触发 Repaint，性能开销小。

3. 可以精确控制单边
   通过 ::after / ::before 分别控制上、下、左、右边框。
   通过调整伪元素的位置和尺寸，实现任意方向的细线。

4. transform-origin 确保位置正确
   设置 transform-origin: 0 100%（左下角），
   确保 scaleY(0.5) 后边框依然紧贴容器底部，
   不会因为从中心缩放而产生缝隙。

为什么不直接用 border: 0.5px？

- iOS 8+ 支持 0.5px，但 Android 大部分不支持
- 部分浏览器会将 0.5px 四舍五入为 1px
- 无法适配 DPR=3 的设备（需要 0.333px）
- 兼容性差，不适合生产环境`,

  principle: `伪元素 + transform 缩放核心原理：

1. 坐标系缩放
   当设置 transform: scaleY(0.5) 时，
   浏览器将该伪元素的渲染坐标系整体缩小一半。
   原本 1px 的高度在缩放后变为 0.5px 的逻辑像素。

2. 亚像素渲染映射
   在 DPR=2 的设备上：
   0.5px 逻辑像素 × DPR(2) = 1 物理像素
   完美实现 1 物理像素的细线！

   在 DPR=3 的设备上：
   0.333px 逻辑像素 × DPR(3) ≈ 1 物理像素
   需要设置 scaleY(0.333)。

3. 为什么用伪元素而不是直接缩放父元素？
   直接缩放父元素会影响所有子元素的显示。
   伪元素只影响边框本身，不影响内容。
   伪元素可以用 pointer-events: none 避免阻挡点击。

4. 200% 尺寸 + scale(0.5) 的原理
   对于四边框，先将伪元素宽高设为 200%，
   再整体缩放 0.5 倍，这样边框粗细减半，
  但元素尺寸保持不变（200% × 0.5 = 100%）。`,

  pros: [
    '兼容性最好，支持所有主流浏览器',
    '不影响布局流，不触发 Reflow',
    '可以精确控制单边或四边',
    '可以结合媒体查询适配不同 DPR',
    '业界最广泛使用的方案',
  ],

  cons: [
    '需要额外的伪元素，增加 DOM 复杂度',
    '圆角边框处理较麻烦（需要配合 border-radius）',
    '表格等密集场景下伪元素过多可能影响性能',
    '需要为每个方向写单独的 CSS',
    'DPR=3 时 scale(0.333) 可能有轻微渲染瑕疵',
  ],
};

// ============================================================
// 方案二：viewport 缩放方案
// ============================================================
export const ViewportScaleOnePixelExamples = {
  title: '方案二：viewport 缩放方案',

  phenomenon:
    '与方案一相同：在 DPR=2/3 的高清屏上，1px CSS 边框视觉上变粗。但此方案从根因入手，通过改变 viewport 的缩放比例，让 1 CSS 像素直接等于 1 物理像素，从根本上消除 1px 边框问题。',

  reason:
    '1px 边框变粗的根本原因是 CSS 像素与物理像素的映射关系：1 CSS px = DPR 物理像素。如果能让 1 CSS px = 1 物理像素，那么 border: 1px 就会精确渲染为 1 物理像素。通过设置 viewport 的 initial-scale = 1/DPR，可以将整个页面的坐标系放大 DPR 倍，从而恢复 1:1 映射。',

  bad: `/* ❌ 错误：缩放后没有调整根字体 */
function setViewport() {
  const dpr = window.devicePixelRatio || 1;
  const scale = 1 / dpr;
  // 设置了 viewport 缩放，但根字体固定
  document.documentElement.style.fontSize = '37.5px';
  /* 全局字体过小，页面显示异常 */
}`,

  good: `/* ✅ 推荐：动态 viewport + 根字体反算 */

// 1. 动态设置 viewport 和根字体
function setViewport() {
  const dpr = window.devicePixelRatio || 1;
  const scale = 1 / dpr;

  const meta = document.querySelector('meta[name="viewport"]');
  const content = \`
    width=device-width,
    initial-scale=\${scale},
    maximum-scale=\${scale},
    minimum-scale=\${scale},
    user-scalable=no
  \`;

  if (meta) {
    meta.setAttribute('content', content);
  }

  // 根字体需要按 DPR 反算！
  const docEl = document.documentElement;
  const rem = docEl.clientWidth * dpr / 10;
  docEl.style.fontSize = rem + 'px';
  docEl.setAttribute('data-dpr', dpr.toString());
}
setViewport();

// 2. 1px 边框直接写，天然解决
.border {
  border: 1px solid #ddd;  /* 1 CSS 像素 = 1 物理像素 ✅ */
}

// 3. 根据 data-dpr 加载不同精度图片
.icon {
  background-image: url('icon@1x.png');
}
[data-dpr="2"] .icon {
  background-image: url('icon@2x.png');
}
[data-dpr="3"] .icon {
  background-image: url('icon@3x.png');
}`,

  whySolveThisWay: `为什么 viewport 缩放能从根本上解决 1px 问题？

1. 改变像素映射关系
   不缩放：1 CSS px = DPR × DPR 物理像素
   缩放后：1 CSS px = 1 物理像素
   这是从根因上解决问题，不是 workaround。

2. 代码最简单
   设置好 viewport 后，直接写 border: 1px 即可。
   不需要伪元素、不需要 transform、不需要媒体查询。
   开发体验最好。

3. 图片适配更精确
   可以按 DPR 精确加载 @1x/@2x/@3x 图片。
   通过 data-dpr 属性切换图片源。

4. 为什么现在不常用了？
   手淘的 lib-flexible 曾广泛使用此方案。
   但 viewport 缩放会带来副作用：
   - 第三方组件库可能需要适配
   - 部分浏览器对 fractional scale 支持不佳
   - 全局缩放影响所有元素
   - SSR 场景复杂
   现代项目更倾向于伪元素方案。`,

  principle: `viewport 缩放方案核心原理：

1. 缩放公式
   Layout Viewport = 设备宽度 / scale
   当 scale = 1/DPR 时：
   Layout Viewport = 设备宽度 × DPR = 物理像素宽度
   此时 1 CSS 像素 = 1 物理像素

2. 根字体反算
   缩放后，如果不调整根字体，全局文字会变小。
   正确公式：rem = 设备宽度 × DPR / 10
   这样文字大小保持正常。

3. 与 rem 方案的关系
   viewport 缩放通常与 rem 方案配合使用。
   缩放解决 1px 问题，rem 解决适配问题。
   两者结合是手淘早期的标准做法。

4. 历史背景
   手淘的 lib-flexible 是此方案的代表。
   在 2015-2018 年间广泛使用。
   随着 postcss-px-to-viewport 和伪元素方案的普及，
   此方案逐渐被淘汰，但理解其原理对面试很重要。`,

  pros: [
    '从根本上解决 1px 问题（1 CSS px = 1 物理像素）',
    '代码最简单，直接写 border: 1px 即可',
    '图片可以按 DPR 精确加载',
    '高清屏上渲染精度最高',
  ],

  cons: [
    '需要 JavaScript 动态修改 viewport',
    'SSR 场景复杂',
    '缩放后全局字体变小，需要反算',
    '第三方组件库可能需要适配',
    '部分浏览器对 fractional scale 支持不佳',
    '已被社区淘汰，新项目不推荐',
  ],
};

// ============================================================
// 方案三：box-shadow 模拟
// ============================================================
export const BoxShadowExamples = {
  title: '方案三：box-shadow 模拟',

  phenomenon:
    '在某些场景下（如按钮边框、卡片描边），使用伪元素方案会增加 DOM 复杂度。box-shadow 方案利用 CSS 阴影特性模拟细线边框，不需要额外的伪元素，代码更简洁。',

  reason:
    'box-shadow 支持小数像素值，且阴影的渲染不占用布局空间。通过设置 box-shadow: 0 0 0 0.5px #ddd，可以在 DPR=2 的设备上渲染出约 1 物理像素的细线。阴影的渲染机制与 border 不同，不受 DPR 整数倍映射的限制。',

  bad: `/* ❌ 错误：box-shadow 值过大 */
.card {
  box-shadow: 0 0 0 1px #ddd;
  /* 1px 的 shadow 在 DPR=2 时仍然变粗 */
}

/* ❌ 错误：阴影方向不对 */
.card {
  box-shadow: 0 1px 0 #ddd;
  /* 这是偏移阴影，不是边框 */
}`,

  good: `/* ✅ 推荐：box-shadow 模拟细线边框 */

/* 单边细线 */
.hairline-top {
  box-shadow: 0 -0.5px 0 0 #ddd inset;
  /* inset 内阴影模拟上边框 */
}

/* 四边细线 */
.hairline-all {
  box-shadow: 0 0 0 0.5px #ddd inset;
  /* 四边等宽内阴影 */
}

/* 结合媒体查询适配不同 DPR */
@media (-webkit-min-device-pixel-ratio: 2) {
  .hairline-all {
    box-shadow: 0 0 0 0.5px #ddd inset;
  }
}
@media (-webkit-min-device-pixel-ratio: 3) {
  .hairline-all {
    box-shadow: 0 0 0 0.333px #ddd inset;
  }
}

/* 圆角细线边框（box-shadow 天然支持圆角） */
.card-rounded {
  border-radius: 8px;
  box-shadow: 0 0 0 0.5px #ddd inset;
  /* 不需要额外处理圆角！ */
}`,

  whySolveThisWay: `为什么选择 box-shadow 模拟？

1. 不需要伪元素
   直接在目标元素上设置 box-shadow。
   不会增加 DOM 节点数量。
   适合表格、列表等密集场景。

2. 天然支持圆角
   box-shadow 会自动跟随元素的 border-radius。
   伪元素方案需要额外计算和设置圆角。
   这是 box-shadow 方案最大的优势。

3. 代码简洁
   一行 CSS 即可实现细线边框。
   不需要 ::after / ::before。
   维护成本低。

4. 局限性
   box-shadow 不是真正的边框，
   不会占用布局空间（不影响盒模型）。
   某些场景下可能需要额外调整 padding。
   部分旧浏览器对小数 box-shadow 支持不佳。`,

  principle: `box-shadow 模拟方案核心原理：

1. box-shadow 的渲染机制
   box-shadow 是在元素的边界框外（或内，使用 inset）
   渲染的阴影效果，不占用实际布局空间。
   支持小数像素值，如 0.5px。

2. 为什么小数 box-shadow 有效？
   浏览器对 box-shadow 使用不同的渲染管线，
   支持亚像素级别的模糊和扩展。
   0.5px 的 shadow 在 DPR=2 设备上
   可以映射为 1 物理像素。

3. inset 关键字的作用
   inset 将阴影从外阴影变为内阴影，
   模拟边框在元素内部的效果。
   0 0 0 0.5px 表示：无偏移、无模糊、扩展 0.5px。

4. 与 border 的区别
   border 是盒模型的一部分，占用布局空间。
   box-shadow 不占用布局空间，不影响尺寸计算。
   使用 box-shadow 时需要注意 padding 的调整。`,

  pros: [
    '不需要伪元素，不增加 DOM 复杂度',
    '天然支持圆角边框',
    '代码简洁，一行 CSS 即可',
    '适合表格、列表等密集场景',
  ],

  cons: [
    '不是真正的边框，不占用布局空间',
    '可能需要额外调整 padding',
    '部分旧浏览器对小数 shadow 支持不佳',
    '无法单独控制某一边的样式（如只改颜色）',
    '与 border 的交互效果不同（如 hover 状态）',
  ],
};

// ============================================================
// 方案四：SVG 背景图
// ============================================================
export const SvgBackgroundExamples = {
  title: '方案四：SVG 背景图方案',

  phenomenon:
    '在需要精确控制 1px 边框样式的复杂场景（如渐变边框、虚线边框、多色边框），纯 CSS 方案难以实现。SVG 作为矢量图形，可以精确绘制 1px 线条，且不受 DPR 影响。',

  reason:
    'SVG 是矢量图形格式，其坐标系是逻辑坐标系，与设备的物理像素无关。当 SVG 作为背景图使用时，浏览器会按元素的物理像素尺寸渲染 SVG，确保 1px 的 SVG 线条精确对应 1 物理像素。这是利用矢量图形的"无限缩放"特性来解决位图渲染的精度问题。',

  bad: `/* ❌ 错误：SVG 线条过粗 */
<svg xmlns="http://www.w3.org/2000/svg">
  <line x1="0" y1="0" x2="100" y2="0" stroke="#ddd" stroke-width="2"/>
  /* stroke-width="2" 会渲染为 2px，不是 1px */
</svg>

/* ❌ 错误：SVG 尺寸不匹配 */
.border-svg {
  background-image: url('border.svg');
  background-size: 100% 100%;  /* 可能导致拉伸模糊 */
}`,

  good: `/* ✅ 推荐：SVG 背景图精确绘制 1px 边框 */

// 1. 创建 1px 边框 SVG（border.svg）
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect x="0" y="0" width="100%" height="100%"
        fill="none" stroke="#ddd" stroke-width="1"
        vector-effect="non-scaling-stroke"/>
  <!-- vector-effect="non-scaling-stroke" 确保线条宽度不随缩放变化 -->
</svg>

// 2. CSS 中使用 SVG 背景
.svg-border {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='none' stroke='%23ddd' stroke-width='1' vector-effect='non-scaling-stroke'/%3E%3C/svg%3E");
  background-size: 100% 100%;
}

// 3. 单边 SVG 边框（上边框）
.svg-border-top {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'%3E%3Cline x1='0' y1='0' x2='100%25' y2='0' stroke='%23ddd' stroke-width='1' vector-effect='non-scaling-stroke'/%3E%3C/svg%3E");
  background-size: 100% 1px;
  background-repeat: no-repeat;
  background-position: top;
}

// 4. 渐变边框 SVG
.svg-border-gradient {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='0%25'%3E%3Cstop offset='0%25' stop-color='%231890ff'/%3E%3Cstop offset='100%25' stop-color='%2352c41a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='none' stroke='url(%23g)' stroke-width='1' vector-effect='non-scaling-stroke'/%3E%3C/svg%3E");
  background-size: 100% 100%;
}`,

  whySolveThisWay: `为什么选择 SVG 背景图？

1. 矢量精度
   SVG 是矢量图形，线条宽度是逻辑值。
   vector-effect="non-scaling-stroke" 确保线条宽度
   不随元素缩放而变化，始终保持 1px 逻辑宽度。

2. 支持复杂样式
   渐变边框、虚线边框、多色边框等复杂效果，
   纯 CSS 难以实现或代码冗长。
   SVG 可以轻松实现这些效果。

3. 不受 DPR 影响
   SVG 渲染时自动适配设备物理像素。
   不需要像 CSS 那样考虑 DPR 和缩放。

4. 工程化使用
   可以将 SVG 转为 Data URI 内联到 CSS 中，
   减少 HTTP 请求。
   也可以使用 SVG Sprites 管理多个边框样式。

5. 局限性
   代码相对复杂，需要了解 SVG 语法。
   动态修改边框颜色较麻烦（需要修改 SVG 内容）。
   适合特殊场景，不适合大规模使用。`,

  principle: `SVG 背景图方案核心原理：

1. 矢量渲染 vs 位图渲染
   CSS border 是位图渲染，受物理像素网格限制。
   SVG 是矢量渲染，线条在任意分辨率下都清晰。
   浏览器将 SVG 渲染为位图时，
   会按目标区域的物理像素尺寸进行光栅化。

2. vector-effect="non-scaling-stroke"
   这是 SVG 的关键属性。
   默认情况下，SVG 缩放时线条宽度会按比例变化。
   设置此属性后，线条宽度保持恒定（1px），
   不受缩放变换影响。

3. Data URI 内联
   将 SVG 转为 base64 或 URL-encoded 字符串，
   直接嵌入 CSS 的 background-image 中。
   优点：无额外 HTTP 请求。
   缺点：CSS 文件体积增大。

4. preserveAspectRatio="none"
   允许 SVG 非等比缩放，
   确保边框可以拉伸到任意尺寸的元素上。
   配合 background-size: 100% 100% 使用。`,

  pros: [
    '矢量精度，不受 DPR 影响',
    '支持渐变、虚线等复杂边框样式',
    '天然支持圆角（SVG rect 的 rx/ry）',
    'vector-effect 确保线条宽度恒定',
  ],

  cons: [
    '代码复杂，需要了解 SVG 语法',
    '动态修改边框颜色较麻烦',
    'CSS 文件体积增大（Data URI）',
    '不适合大规模使用',
    '旧浏览器对 vector-effect 支持有限',
  ],
};

// ============================================================
// 方案五：PostCSS 插件工程化
// ============================================================
export const PostcssPluginExamples = {
  title: '方案五：PostCSS 插件工程化',

  phenomenon:
    '在大型项目中，手动为每个需要 1px 边框的元素写伪元素 CSS 非常繁琐且容易遗漏。开发者希望像平时一样写 border: 1px solid #ddd，由构建工具自动将其转换为高清屏适配的细线边框。',

  reason:
    '手动维护 1px 边框的 CSS 代码在大型项目中不可持续：1) 代码重复，每个组件都要写类似的伪元素代码；2) 容易遗漏，开发者可能忘记处理 1px 边框；3) 维护困难，设计规范变更时需要全局修改。通过 PostCSS 插件在构建阶段自动转换，可以从工程化层面解决这个问题。',

  bad: `/* ❌ 错误：项目中到处写重复的 1px 处理代码 */
/* Button.css */
.btn::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 1px;
  background: #ddd;
  transform: scaleY(0.5);
}

/* Card.css */
.card::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 1px;
  background: #ddd;
  transform: scaleY(0.5);
}
/* 代码重复！维护困难！ */`,

  good: `/* ✅ 推荐：PostCSS 插件自动转换 */

// 1. 安装插件
// npm install postcss-write-svg postcss-preset-env -D

// 2. postcss.config.js
module.exports = {
  plugins: [
    require('postcss-write-svg')({
      utf8: false,
    }),
    require('postcss-preset-env')({
      stage: 0,
    }),
  ],
};

// 3. 使用 @svg 指令绘制 1px 边框（CSS 中写 SVG）
@svg 1px-border {
  height: 2px;
  @rect {
    fill: none;
    stroke: #ddd;
    stroke-width: 0.5px;
    width: 100%;
    height: 100%;
    vector-effect: non-scaling-stroke;
  }
}

.border-auto {
  border: 1px solid transparent;  /* 兜底 */
  border-image: svg(1px-border) 2 2 stretch;
  /* 构建时自动转换为高清屏适配的边框 */
}

// 4. 更简单的方案：使用现成的 PostCSS 插件
// npm install postcss-border-1px -D

// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-border-1px')({
      // 自动将所有 1px border 转换为伪元素方案
      dpr: [2, 3],
      selector: '.hairlines',  // 只转换带有此类的元素
    }),
  ],
};

// 写普通 CSS，构建时自动处理
.card {
  border: 1px solid #ddd;  /* 构建后自动转换为伪元素方案 */
}`,

  whySolveThisWay: `为什么使用 PostCSS 插件工程化？

1. 零心智负担
   开发者像平时一样写 border: 1px solid #ddd。
   构建工具自动处理高清屏适配。
   不需要记住伪元素的各种写法。

2. 全局一致性
   所有 1px 边框使用统一的转换策略。
   设计规范变更时，只需修改插件配置。
   避免不同开发者写出不同的实现。

3. 可配置性
   可以配置转换策略（伪元素 / SVG / shadow）。
   可以配置生效范围（全局 / 特定类名）。
   可以配置适配的 DPR 范围。

4. 与现有工具链集成
   PostCSS 是 CSS 构建的标准工具。
   与 Vite、Webpack、Rspack 都能无缝集成。
   不引入额外的构建步骤。

5. 现有插件推荐
   postcss-write-svg：在 CSS 中写 SVG
   postcss-border-1px：自动转换 1px 边框
   postcss-px-to-viewport：同时解决适配和 1px 问题

6. 注意事项
   插件转换后的代码可能不够优化。
   需要检查生成的 CSS 是否符合预期。
   某些复杂场景可能需要手动覆盖。`,

  principle: `PostCSS 插件工程化核心原理：

1. AST 转换
   PostCSS 将 CSS 解析为抽象语法树（AST）。
   插件遍历 AST，找到 border-width: 1px 的声明。
   将其替换为伪元素 + transform 的等效代码。

2. 转换示例
   输入：.card { border-bottom: 1px solid #ddd; }
   输出：
   .card { position: relative; border-bottom: none; }
   .card::after {
     content: '';
     position: absolute;
     bottom: 0; left: 0; right: 0;
     height: 1px;
     background-color: #ddd;
     transform: scaleY(0.5);
     transform-origin: 0 100%;
   }

3. @svg 指令原理
   postcss-write-svg 插件解析 CSS 中的 @svg 规则，
   将其转换为 SVG Data URI。
   然后替换 border-image 的值为该 Data URI。
   实现"在 CSS 中写 SVG"的效果。

4. 工程化最佳实践
   在团队内统一配置 PostCSS 插件。
   将配置纳入项目模板或脚手架。
   配合 ESLint/Stylelint 规则，确保开发者不写裸 1px。`,

  pros: [
    '零心智负担，像平时一样写 CSS',
    '全局一致的转换策略',
    '可配置转换方式和生效范围',
    '与 Vite/Webpack 等工具链无缝集成',
    '设计规范变更时只需改配置',
  ],

  cons: [
    '增加构建复杂度',
    '生成的代码可能不够优化',
    '某些复杂场景需要手动覆盖',
    '团队成员需要了解插件行为',
    '调试时需要查看编译后的代码',
  ],
};

// ============================================================
// 综合对比与工程建议
// ============================================================
export const OnePixelMeta = {
  title: '移动端 1px 边框问题',

  description:
    '在 DPR 为 2 或 3 的高清屏上，CSS 中的 1px 会被渲染为多个物理像素，导致边框视觉上变粗。本文讨论五种解决方案，从手动 CSS 技巧到工程化自动转换。',

  phenomenon:
    '设计师交付的设计稿中，分割线、卡片边框都是 1px 的细线。但在 iPhone、Android 高清屏上预览时，这些边框看起来明显比设计稿粗，像是 2px 甚至 3px。设计师反馈：「为什么我画的 1 像素边框在手机上看起来像 2 像素那么宽？」',

  reason:
    '核心原因是逻辑像素（CSS Pixel）与物理像素（Physical Pixel）的映射差异。浏览器渲染时，1 个 CSS 像素映射到 window.devicePixelRatio 个物理像素。DPR=2 时，1px CSS 边框占据 2 个物理像素；DPR=3 时占据 3 个物理像素。由于人类视网膜对线条精细度敏感，这多出的物理像素让边框明显增厚。',

  comparisonTable: `/* === 五种方案综合对比 === */

┌─────────────┬────────────┬────────────┬────────────┬────────────┬────────────┐
│   对比维度   │ 伪元素缩放  │ viewport缩放│ box-shadow │  SVG 背景  │ PostCSS插件│
├─────────────┼────────────┼────────────┼────────────┼────────────┼────────────┤
│ 兼容性       │    最好     │     好     │    较好    │    一般    │   依赖方案  │
│ 代码复杂度   │    中       │     低     │    低      │    高      │   最低      │
│ 圆角支持     │   需处理    │    天然    │    天然    │    天然    │   依赖方案  │
│ 工程化程度   │   手动      │    手动    │    手动    │    手动    │   自动      │
│ 性能影响     │    小       │     中     │    小      │    中      │   构建时    │
│ 推荐场景     │   通用首选  │   了解即可  │  圆角场景  │  复杂样式   │  大型项目   │
└─────────────┴────────────┴────────────┴────────────┴────────────┴────────────┘`,

  recommendation: `/* === 工程选型建议 === */

// 场景 1：普通项目，快速开发 → 伪元素 + transform（方案一）
// 场景 2：需要圆角边框 → box-shadow（方案三）
// 场景 3：渐变/虚线等复杂边框 → SVG 背景（方案四）
// 场景 4：大型团队项目 → PostCSS 插件（方案五）
// 场景 5：viewport 缩放（方案二）已淘汰，了解原理即可

// 推荐组合方案（2024 年最佳实践）：
// 1. 普通边框：伪元素 + transform: scale()
// 2. 圆角边框：box-shadow: 0 0 0 0.5px inset
// 3. 复杂边框：SVG 背景图
// 4. 大型项目：PostCSS 插件自动转换
// 5. 统一使用 .hairline 类名前缀，便于识别和维护`,

  interviewQA: `面试高频问题汇总：

Q1: 为什么 1px 边框在高清屏上会变粗？
A: DPR=2 时，1 CSS 像素 = 2 物理像素。浏览器将 1px 边框渲染为 2 个物理像素，视觉上变粗。

Q2: 伪元素方案中 transform: scaleY(0.5) 的原理？
A: 将伪元素坐标系缩小一半，1px 变为 0.5px 逻辑像素。在 DPR=2 设备上映射为 1 物理像素。

Q3: 为什么不直接用 border: 0.5px？
A: Android 大部分浏览器不支持 0.5px，会被忽略或四舍五入。兼容性差。

Q4: viewport 缩放方案为什么被淘汰？
A: 副作用大（全局缩放、字体反算、SSR 复杂），现代项目更倾向于伪元素方案。

Q5: 大型项目如何工程化处理 1px 边框？
A: 使用 PostCSS 插件（如 postcss-border-1px）在构建时自动转换，开发者零心智负担。`,
};
