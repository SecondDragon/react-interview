/**
 * 移动端适配方案 - 各方案独立数据
 * 每种方案都遵循 Five Dimensions 结构
 */

// ============================================================
// 方案一：rem 适配方案
// ============================================================
export const RemAdaptationExamples = {
  title: '方案一：rem 适配方案',

  phenomenon:
    '设计师交付 750px 宽度的设计稿，前端需要让页面在 iPhone SE（375px）、iPhone 14（390px）、Android（360px）等设备上保持一致的视觉比例。如果直接用 px 写死，小屏会溢出，大屏会留白。rem 方案通过动态设置根字体大小，让所有尺寸按比例缩放。',

  reason:
    'CSS 中 rem 单位是相对于根元素（html）的 font-size 的。如果根字体固定（如 16px），那么 2rem 永远是 32px，无法适配不同屏幕。rem 方案的核心洞察是：将根字体设为与设备宽度成比例的值（如 设备宽度/10），这样整个页面的尺寸就会自动随屏幕缩放。',

  bad: `/* ❌ 错误：根字体固定，rem 失去适配意义 */
html {
  font-size: 16px;  /* 固定值，所有 rem 都是死的 */
}

.container {
  width: 23.4375rem;  /* 375px，大屏上留白 */
}

/* ❌ 错误：手动计算 rem，容易出错 */
.btn {
  width: 2.133rem;   /* 应该是 2rem（150/75），算错了 */
  height: 0.853rem;  /* 应该是 0.8rem（60/75），精度丢失 */
}`,

  good: `/* ✅ 推荐：动态设置根字体 + 构建工具自动转换 */

// 1. JavaScript 动态设置根字体
function setRem() {
  const docEl = document.documentElement;
  const clientWidth = docEl.clientWidth;
  // 以 750px 设计稿为基准，分成 10 份
  const rem = clientWidth / 10;
  docEl.style.fontSize = rem + 'px';
}
setRem();
window.addEventListener('resize', setRem);

// 2. CSS 中使用 rem（设计稿 px ÷ 75 = rem）
.container {
  width: 10rem;        /* 750px → 全宽 */
  padding: 0.267rem;   /* 20px → 20/75 */
}

.btn {
  width: 2rem;         /* 150px → 150/75 */
  height: 0.8rem;      /* 60px → 60/75 */
  font-size: 0.32rem;  /* 24px → 24/75 */
}

// 3. postcss-pxtorem 自动转换
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-pxtorem')({
      rootValue: 75,
      propList: ['*'],
      selectorBlackList: ['.norem'],
      minPixelValue: 2,
    }),
  ],
};`,

  whySolveThisWay: `为什么 rem 方案选择"设备宽度/10"作为根字体？

1. 计算简便
   设计稿 750px ÷ 10 = 75px = 1rem
   设计稿上的任意 px 值 ÷ 75 = rem 值
   例如：150px → 2rem，口算即可完成

2. 避免根字体过小
   如果除以 100，根字体 = 3.75px~4.3px
   浏览器有最小字体限制（通常 12px），会导致计算失真
   除以 10，根字体 = 37.5px~43px，安全范围

3. 与 flexible.js 一致
   手淘的 lib-flexible 采用同样的分母（10）
   社区工具链（postcss-pxtorem）默认 rootValue=75
   遵循社区约定，降低协作成本

4. 小数精度可控
   20px → 20/75 = 0.267rem（3位小数）
   精度足够，不会出现明显的像素偏差

为什么不建议字体用 rem？

字体大小应该由内容可读性决定，不应随屏幕尺寸线性缩放。
- 小屏手机（375px）：0.32rem = 12px，文字可能过小
- 大屏手机（430px）：0.32rem = 13.76px，差异不明显
- 标题文字：应该始终保持品牌一致性

推荐：布局用 rem/vw，字体用 px + clamp()`,

  principle: `rem 方案核心原理：

1. 比例映射公式
   实际渲染尺寸 = rem 值 × 根字体大小
   根字体大小 = 设备宽度 / 10
   所以：实际尺寸 = (设计稿 px / 75) × (设备宽度 / 10)
   简化：实际尺寸 = 设计稿 px × 设备宽度 / 750
   结论：实际尺寸与设计稿的比例 = 设备宽度 / 750（完美比例映射！）

2. 与 vw 的数学等价性
   rem 方案：width = 2rem = 2 × (设备宽度/10) = 设备宽度/5
   vw 方案：width = 20vw = 20 × 设备宽度/100 = 设备宽度/5
   两种方案在数学上完全等价，只是实现方式不同。

3. 为什么需要 JavaScript？
   rem 依赖根字体，而根字体需要通过 JS 动态计算。
   这是 rem 方案最大的缺点——增加了运行时依赖。
   在 SSR 场景中，需要在服务端注入同样的根字体计算逻辑。

4. 1px 边框问题
   rem 方案无法解决 1px 边框问题。
   因为 rem 转换后，1px 仍然是 1px（或接近 1px），
   在 DPR=2/3 的设备上仍然会变粗。
   需要额外使用伪元素 + transform: scale() 处理。`,

  pros: [
    '兼容性好，支持 IE9+',
    '社区成熟，工具链完善（postcss-pxtorem、lib-flexible）',
    '可以精确控制哪些属性转换（selectorBlackList）',
    '数学精度高，无 vw 的小数偏差问题',
  ],

  cons: [
    '需要 JavaScript 动态设置根字体，增加运行时依赖',
    'SSR 场景需要额外处理根字体注入',
    '字体使用 rem 会导致随屏幕缩放，不符合设计意图',
    '1px 边框需要额外处理',
    '嵌套组件中 rem 值不直观（需要心算转换）',
  ],
};

// ============================================================
// 方案二：vw 适配方案
// ============================================================
export const VwAdaptationExamples = {
  title: '方案二：vw 适配方案',

  phenomenon:
    '与 rem 方案面临同样的问题：设计稿 750px 需要适配到各种设备。vw 方案利用 CSS3 的视口单位 vw（1vw = 视口宽度的 1%），直接建立设计稿 px 与视口百分比的关系，无需 JavaScript 介入。',

  reason:
    'vw 是 CSS 原生支持的视口单位，1vw 始终等于视口宽度的 1%。设计稿 750px 为基准时，1vw = 7.5px（设计稿上）。因此设计稿上的任意 px 值 ÷ 7.5 = vw 值。vw 直接表达"占视口宽度的百分之几"，语义比 rem 更直观。',

  bad: `/* ❌ 错误：vw 值计算错误 */
.btn {
  width: 20.1vw;   /* 150/7.5 = 20vw，不是 20.1vw */
}

/* ❌ 错误：混用 vw 和 px，造成不可预测的行为 */
.container {
  width: 100vw;
  padding: 16px;   /* 固定 px，不随屏幕缩放 */
}

/* ❌ 错误：忽略精度问题 */
.border {
  border: 0.133vw solid #ccc;  /* 1px ≈ 0.133vw，但可能有 1px 偏差 */
}`,

  good: `/* ✅ 推荐：vw 方案 + 构建工具自动转换 */

// 1. CSS 中直接使用 vw
.container {
  width: 100vw;
  padding: 2.667vw;    /* 20px / 7.5 = 2.667vw */
}

.btn {
  width: 20vw;         /* 150px / 7.5 = 20vw */
  height: 8vw;         /* 60px / 7.5 = 8vw */
  font-size: 3.2vw;    /* 24px / 7.5 = 3.2vw */
  border-radius: 1.333vw;
}

// 2. postcss-px-to-viewport 自动转换
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-px-to-viewport')({
      viewportWidth: 750,
      viewportUnit: 'vw',
      unitPrecision: 5,
      selectorBlackList: ['.ignore', '.hairlines'],
      minPixelValue: 1,
      mediaQuery: false,
      exclude: [/node_modules/],
    }),
  ],
};

// 3. 前端直接按设计稿写 px，构建时自动转 vw
// .container { width: 750px; padding: 20px; }
// 编译后 → .container { width: 100vw; padding: 2.66667vw; }`,

  whySolveThisWay: `为什么 vw 方案是现代项目的首选？

1. 纯 CSS 方案，零 JavaScript 依赖
   不需要像 rem 那样在页面加载时执行脚本
   SSR 场景天然支持，无需额外处理
   减少首屏渲染的阻塞时间

2. 语义直观
   vw = viewport width 的百分比
   20vw = 视口宽度的 20%，一目了然
   rem 需要理解"根字体基准"的间接映射

3. 与现代 CSS 生态无缝配合
   vw 可以与 clamp()、min()、max() 等函数组合
   例如：width: min(90vw, 400px)
   这是 rem 方案难以做到的

4. 工程效率最高
   设计师出 750px 设计稿
   前端直接按设计稿写 px
   构建工具自动转换为 vw
   零心智负担，不需要记住换算比例

vw 方案的精度问题如何处理？

vw 值通常带有 5 位小数（如 2.66667vw），
在极端情况下可能出现 1px 的渲染偏差。

1. 设置 unitPrecision: 5 或更高
   提高 postcss-px-to-viewport 的精度配置，
   让转换后的小数位数更多，减少舍入误差。

2. 使用 selectorBlackList 让构建工具忽略特定选择器
   在 postcss.config.js 中配置：
   selectorBlackList: ['.px-fixed', '.hairlines']
   这样 .px-fixed 开头的类名不会被转换，保持原始 px。

   示例：
   /* 构建工具会转换：width: 150px → 20vw */
   .btn { width: 150px; }

   /* 构建工具会忽略，保持 1px */
   .px-fixed-border { border: 1px solid #ccc; }

   /* 关键尺寸不被转换，避免精度问题 */
   .px-fixed-icon { width: 24px; height: 24px; }

3. 使用 CSS 变量 + calc 手动控制
   :root {
     --px-base: 0.13333vw;  /* 1px = 0.13333vw（750基准） */
   }
   .precise {
     /* 手动计算，绕过构建工具的自动转换 */
     width: calc(150 * var(--px-base));  /* 精确控制 */
   }

4. 视觉上 ±1px 的差异通常不可感知
   在 375px~430px 的设备范围内，
   vw 转换后的偏差通常在 0.5px 以内，
   用户肉眼几乎无法分辨。`,

  principle: `vw 方案核心原理：

1. 比例映射公式
   1vw = 视口宽度 / 100
   设计稿 750px 为基准：1vw = 750px / 100 = 7.5px（设计稿上）
   转换公式：vw 值 = 设计稿 px / 7.5
   实际渲染：实际 px = vw 值 × 设备宽度 / 100
   代入：实际 px = (设计稿 px / 7.5) × 设备宽度 / 100
   简化：实际 px = 设计稿 px × 设备宽度 / 750
   结论：与 rem 方案完全相同的比例映射！

2. vw 与 rem 的等价证明
   rem：width = 2rem = 2 × (设备宽度/10) = 设备宽度/5
   vw：width = 20vw = 20 × 设备宽度/100 = 设备宽度/5
   数学上完全等价，只是 rem 通过 JS 实现，vw 通过 CSS 原生实现。

3. 为什么 vw 不需要 JavaScript？
   vw 是 CSS 引擎原生支持的单位，浏览器在布局阶段自动计算。
   不需要像 rem 那样先执行 JS 设置根字体，再触发重排。
   这是 vw 方案性能更好的根本原因。

4. 兼容性策略
   IE 全系列不支持 vw，但移动端项目通常不需要兼容 IE。
   旧 Android（4.4 以下）需要 polyfill 或降级方案。
   现代项目（2020 年后）可以安全使用 vw。`,

  pros: [
    '纯 CSS 方案，不需要 JavaScript',
    'SSR 友好，服务端渲染无问题',
    '语义直观，vw 直接表示视口百分比',
    '与现代 CSS 特性（clamp、min、max）配合良好',
    '工具链成熟，postcss-px-to-viewport 广泛使用',
  ],

  cons: [
    'IE 不支持（移动端通常无影响）',
    'vw 值精度问题（可能出现 1px 偏差）',
    '转换后代码可读性较差（大量小数 vw）',
    '旧 Android（4.4 以下）需要 polyfill',
    '1px 边框仍需特殊处理',
  ],
};

// ============================================================
// 方案三：viewport 缩放方案
// ============================================================
export const ViewportScaleExamples = {
  title: '方案四（历史方案）：viewport 缩放方案',

  phenomenon:
    '在 iPhone 14 Pro（DPR=3）上，1px 的 CSS 边框实际上占用了 3×3=9 个物理像素，视觉上明显变粗。传统的 rem/vw 方案只能解决"尺寸比例"问题，无法解决"像素精度"问题。viewport 缩放方案通过调整 initial-scale，让 1 CSS 像素精确对应 1 物理像素。',

  reason:
    'DPR（Device Pixel Ratio）决定了 1 个 CSS 像素对应多少个物理像素。当 DPR=2 时，1px 边框占用 2×2=4 个物理像素；DPR=3 时占用 9 个物理像素。这是 1px 边框变粗的根本原因。viewport 缩放方案通过设置 initial-scale = 1/DPR，将整个页面按 DPR 缩放，从而恢复 1 CSS 像素 = 1 物理像素的映射关系。',

  bad: `/* ❌ 错误：缩放后没有反算字体 */
function setViewport() {
  const dpr = window.devicePixelRatio || 1;
  const scale = 1 / dpr;
  // 设置了 viewport 缩放，但没有调整根字体
  document.documentElement.style.fontSize = '37.5px';  /* 固定值！ */
}

/* ❌ 错误：缩放后图片没有按 DPR 加载 */
.icon {
  background-image: url('icon.png');  /* 只提供 1x 图 */
  /* DPR=3 设备上会被拉伸，模糊 */
}`,

  good: `/* ✅ 推荐：viewport 缩放 + 根字体反算 + DPR 图片 */

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

// 2. 根据 data-dpr 加载不同精度图片
.icon {
  background-image: url('icon@1x.png');
}
[data-dpr="2"] .icon {
  background-image: url('icon@2x.png');
}
[data-dpr="3"] .icon {
  background-image: url('icon@3x.png');
}

// 3. 1px 边框直接写 1px，天然解决
.border {
  border: 1px solid #ccc;  /* 1 CSS 像素 = 1 物理像素 */
}`,

  whySolveThisWay: `为什么 viewport 缩放方案曾在 2015-2018 年广泛使用？

1. 时代背景：高清屏刚刚普及
   2014 年 iPhone 6 Plus 首次引入 DPR=3 的屏幕，1px 边框变粗问题突然爆发。
   当时社区还没有成熟的 1px 解决方案，viewport 缩放是唯一能"根治"这个问题的方法。

2. 手淘 lib-flexible 的带动效应
   阿里巴巴手淘团队开源的 lib-flexible 采用了 viewport 缩放方案。
   作为国内移动端 H5 的标杆项目，大量公司直接照搬其方案，形成行业惯性。
   当时流行的口号是"1rem = 1px = 1 物理像素"，听起来非常优雅。

3. 当时没有更好的替代方案
   - postcss-px-to-viewport 等工具尚未成熟
   - transform: scale() 的 1px hack 还未普及
   - vw 单位在部分国产浏览器（尤其是 Android 4.x）上兼容性差
   - 设计师习惯按物理像素标注，缩放方案让设计稿"直接可用"

4. 为什么现在被淘汰了？
   viewport 缩放虽然解决了 1px 问题，但带来了更大的问题：
   - 全局缩放影响所有元素，第三方组件库、地图、视频等都需要单独适配
   - 部分浏览器对 fractional scale（如 0.333）渲染有偏差，导致模糊
   - SSR 场景下服务端和客户端需要保持一致的缩放逻辑，复杂度爆炸
   - 禁止用户缩放（user-scalable=no）影响无障碍体验
   - 随着 vw 兼容性提升和 1px hack 普及，缩放方案的优势不再明显

5. 现代替代方案
   1px 边框问题现在通常用伪元素 + transform: scale() 解决：
   .hairline::after {
     height: 1px;
     transform: scaleY(1/DPR);
     transform-origin: 0 100%;
   }
   这种方式只影响边框，不影响全局布局，副作用最小。`,

  principle: `viewport 缩放方案核心原理：

1. 缩放公式推导
   Layout Viewport = 设备宽度 / scale
   当 scale = 1/DPR 时：
   Layout Viewport = 设备宽度 × DPR = 物理像素宽度
   此时 1 CSS 像素 = 1 物理像素

2. 为什么根字体需要反算？
   缩放后，1rem = 设备宽度 × DPR / 10
   如果不反算，在 DPR=3 设备上：
   1rem = 390 × 3 / 10 = 117px（太大了！）
   实际上应该保持：1rem = 设备宽度 / 10 = 39px
   所以根字体公式：rem = 设备宽度 / 10（不是 clientWidth/10！）

3. 与 rem/vw 的本质区别
   rem/vw 解决的是"尺寸比例"问题（不同设备上保持相同比例）
   viewport 缩放解决的是"像素精度"问题（1px = 1 物理像素）
   两者解决的问题域不同，可以组合使用。

4. 历史背景
   手淘的 lib-flexible 是此方案的代表实现。
   在 2015-2018 年间广泛使用。
   随着 postcss-px-to-viewport 和 1px 边框 hack 的普及，
   此方案逐渐被淘汰，但理解其原理对面试很重要。`,

  pros: [
    '完美解决 1px 边框问题（1 CSS 像素 = 1 物理像素）',
    '图片可以按 DPR 精确加载（@1x/@2x/@3x）',
    '设计稿可以直接按物理像素标注',
    '高清屏上渲染精度最高',
  ],

  cons: [
    '需要 JavaScript 动态修改 viewport',
    'SSR 场景复杂，需要服务端注入相同逻辑',
    '缩放后全局字体变小，需要按 DPR 反算',
    '第三方组件库可能需要适配',
    '部分浏览器对 fractional scale 支持不佳',
    '已被社区淘汰，新项目不推荐',
  ],
};

// ============================================================
// 方案四：现代 CSS 方案
// ============================================================
export const ModernCssExamples = {
  title: '方案三：现代 CSS 方案',

  phenomenon:
    '随着 CSS 标准的演进，浏览器原生支持了越来越多强大的布局能力。能否不依赖构建工具转换（如 postcss-px-to-viewport），仅使用 CSS 原生能力实现移动端适配？现代 CSS 方案利用 clamp、min、max、容器查询等特性，实现声明式的流体布局。',

  reason:
    '传统的 rem/vw 方案都依赖构建工具将 px 转换为相对单位。这增加了构建配置的复杂度，且转换后的代码可读性差。CSS 正在从"固定像素"向"相对单位"演进，clamp、min、max 等函数提供了声明式的响应式控制，容器查询实现了组件级别的响应式。未来可能不再需要 postcss 转换。',

  bad: `/* ❌ 错误：clamp 参数设置不合理 */
.title {
  font-size: clamp(10px, 2vw, 50px);
  /* 最小 10px 太小不可读，最大 50px 太大 */
}

/* ❌ 错误：忽略浏览器兼容性 */
.card {
  width: min(90%, 400px);
  /* 旧浏览器不支持 min()，会忽略整条声明 */
}

/* ❌ 错误：容器查询使用不当 */
@container (min-width: 400px) {
  /* 忘记在父元素上设置 container-type */
}`,

  good: `/* ✅ 推荐：现代 CSS 组合方案 */

// 1. clamp()：限制字体大小范围
.title {
  font-size: clamp(16px, 5vw, 24px);
  /* 最小 16px，首选 5vw，最大 24px */
}

.text {
  font-size: clamp(14px, 4vw, 18px);
  /* 正文：保证可读性的同时适度响应 */
}

// 2. min() / max()：响应式尺寸
.card {
  width: min(90%, 400px);   /* 不超过 400px */
  padding: max(16px, 4vw);  /* 不小于 16px */
}

// 3. 容器查询（组件级响应式）
.product-list {
  container-type: inline-size;
  container-name: product;
}

@container product (min-width: 400px) {
  .product-card {
    flex-direction: row;
  }
}

@container product (max-width: 399px) {
  .product-card {
    flex-direction: column;
  }
}

// 4. CSS 自定义属性 + calc（设计稿比例）
:root {
  --design-width: 750;
  --px: calc(100vw / var(--design-width));
}

.adaptive {
  width: calc(150 * var(--px));   /* 设计稿 150px */
  padding: calc(20 * var(--px));  /* 设计稿 20px */
}

// 5. 结合 @media 处理极端设备
@media (max-width: 320px) {
  .text { font-size: 14px; }
}
@media (min-width: 430px) {
  .page { max-width: 430px; margin: 0 auto; }
}`,

  whySolveThisWay: `为什么现代 CSS 是未来的趋势？

1. 零构建工具依赖
   不需要 postcss-px-to-viewport 或 postcss-pxtorem
   不需要在构建阶段做单位转换
   减少构建配置的复杂度和维护成本

2. 语义清晰，维护简单
   clamp(16px, 5vw, 24px) 一眼就能看懂意图
   不需要理解 rem 基准或 vw 换算比例
   设计师和前端使用同一套语言

3. 声明式而非命令式
   传统方案："将 150px 转换为 20vw"
   现代 CSS："宽度不超过 400px，首选 90%"
   声明式代码更贴近人类思维

4. 组件级响应式
   媒体查询是"页面级"的（基于视口宽度）
   容器查询是"组件级"的（基于容器宽度）
   组件可以在不同上下文中自适应，无需知道页面布局

5. 渐进增强策略
   现代 CSS 特性可以优雅降级：
   .title {
     font-size: 18px;                    /* 兜底 */
     font-size: clamp(16px, 5vw, 24px);  /* 现代浏览器 */
   }
   旧浏览器使用兜底值，新浏览器使用增强值。`,

  principle: `现代 CSS 方案核心原理：

1. clamp() 的数学本质
   clamp(MIN, VAL, MAX) = max(MIN, min(VAL, MAX))
   例如：clamp(16px, 5vw, 24px)
   - 当 5vw < 16px 时（屏幕 < 320px），取 16px
   - 当 5vw > 24px 时（屏幕 > 480px），取 24px
   - 中间按 5vw 线性变化
   这实现了"有边界的流体布局"。

2. min() / max() 的组合威力
   width: min(90%, 400px)
   - 在窄屏幕上：90% < 400px，取 90%（自适应）
   - 在宽屏幕上：400px < 90%，取 400px（限制最大宽度）
   一行代码实现了两种行为！

3. 容器查询 vs 媒体查询
   媒体查询：@media (min-width: 400px) —— 基于视口
   容器查询：@container (min-width: 400px) —— 基于容器
   容器查询的优势：
   - 组件自包含，不依赖页面布局
   - 同一个组件在不同位置可以有不同的表现
   - 更符合"组件化"的开发理念

4. CSS 自定义属性作为"转换层"
   --px: calc(100vw / 750)
   这相当于在 CSS 中定义了一个"单位转换函数"
   设计稿 150px → calc(150 * var(--px))
   不需要构建工具，纯 CSS 实现比例映射

5. 浏览器支持现状（2024）
   clamp/min/max：Chrome 79+、Safari 13.1+、Firefox 75+
   容器查询：Chrome 105+、Safari 16+、Firefox 110+
   移动端浏览器支持良好，可以安全使用。`,

  pros: [
    '纯 CSS，零 JavaScript 依赖',
    '语义清晰，维护简单',
    '浏览器原生支持，性能最好',
    '与响应式设计理念一致',
    '支持渐进增强，优雅降级',
    '容器查询实现组件级响应式',
  ],

  cons: [
    '需要较新浏览器（IE 完全不支持）',
    '容器查询支持度仍在提升中',
    '设计稿到代码需要手动计算',
    '不适合需要精确像素还原的场景',
    '团队需要学习新的 CSS 函数',
    '工具链不如 rem/vw 成熟',
  ],
};

// ============================================================
// 综合对比与工程建议
// ============================================================
export const MobileAdaptationMeta = {
  title: '移动端适配方案',

  description:
    '移动端适配是前端工程化的核心课题。从早期的 rem 方案到现代的 vw 方案，再到 viewport 缩放方案和现代 CSS 方案，每种技术都有其适用场景和取舍。理解各方案的底层原理和工程实践，是移动端开发的关键能力。',

  phenomenon:
    '设计师交付了一份 750px 宽度的设计稿，前端工程师需要让页面在各种设备上都能完美还原：iPhone SE（375px）、iPhone 14（390px）、iPhone 14 Pro Max（430px）、Android（360px~414px）……同样的设计稿，在不同设备上如何保持一致的视觉比例？',

  reason:
    '移动设备屏幕尺寸和 DPR 千差万别。核心矛盾是：设计稿是固定的（如 750px），但设备宽度是变化的（320px~430px）。需要一个"转换层"将设计稿的固定尺寸映射到不同设备的动态尺寸上。',

  bad: `/* ❌ 错误：固定 px，不做任何适配 */
.container {
  width: 375px;  /* 大屏留白，小屏溢出 */
}

/* ❌ 错误：混合使用多种方案 */
.container {
  width: 10rem;
  padding: 2vw;
  font-size: 16px;
  /* 三种单位混用，维护困难 */
}`,

  good: `/* ✅ 推荐：vw 方案（现代项目首选） */

// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-px-to-viewport')({
      viewportWidth: 750,
      viewportUnit: 'vw',
      unitPrecision: 5,
      selectorBlackList: ['.ignore'],
      minPixelValue: 1,
      exclude: [/node_modules/],
    }),
  ],
};

// 前端直接按设计稿写 px
.container {
  width: 750px;   /* → 100vw */
  padding: 20px;  /* → 2.66667vw */
}

/* ✅ 字体使用 px + clamp */
.title {
  font-size: clamp(16px, 4.267vw, 24px);
}

/* ✅ 1px 边框处理 */
.hairline::after {
  height: 1px;
  transform: scaleY(0.5);
  transform-origin: 0 100%;
}

/* ✅ 大屏限制 */
.page {
  max-width: 540px;
  margin: 0 auto;
}`,

  comparisonTable: `/* === 四种方案综合对比 === */

┌─────────────┬──────────┬──────────┬────────────┬──────────┐
│   对比维度   │   rem    │    vw    │  viewport  │ 现代 CSS │
├─────────────┼──────────┼──────────┼────────────┼──────────┤
│ 是否需要 JS  │    ✅    │    ❌    │     ✅     │    ❌    │
│ 兼容性       │   IE9+   │  IE 不支持│   IE9+     │  现代浏览器│
│ 1px 边框     │ 需特殊处理│ 需特殊处理│   天然解决  │ 需特殊处理│
│ SSR 支持     │  需处理   │   天然   │   需处理    │   天然   │
│ 代码可读性   │   一般   │   较差   │    一般    │   最好   │
│ 工具链成熟度 │   最成熟  │   成熟   │    一般    │   新兴   │
│ 精度控制     │   精确   │   一般   │    精确    │   一般   │
│ 学习成本     │   低    │    低    │     高     │   中     │
└─────────────┴──────────┴──────────┴────────────┴──────────┘`,

  recommendation: `/* === 工程选型建议 === */

// 场景 1：传统项目，需要兼容旧浏览器 → rem + flexible
// 场景 2：现代项目，追求简洁 → vw（2024 年首选）
// 场景 3：对 1px 边框要求极高 → viewport 缩放（已淘汰，了解即可）
// 场景 4：未来项目，拥抱标准 → 现代 CSS（渐进增强）

// 推荐组合方案（2024 年最佳实践）：
// 1. 布局尺寸：vw（postcss-px-to-viewport 自动转换）
// 2. 字体大小：px + clamp() 限制范围
// 3. 1px 边框：伪元素 + transform: scale()
// 4. 图片：srcset + WebP 格式
// 5. 大屏限制：max-width + margin auto
// 6. 极端设备：@media 断点兜底`,

  interviewQA: `面试高频问题汇总：

Q1: rem 和 vw 方案在数学上是等价的吗？
A: 是的。rem 值 × (设备宽度/10) = vw 值 × 设备宽度/100。
   两者都是比例映射，只是实现方式不同。

Q2: 为什么现在更推荐 vw 而不是 rem？
A: 1. 纯 CSS，无 JS 运行时依赖；2. SSR 友好；
   3. 语义直观；4. 与现代 CSS 特性配合更好。

Q3: 1px 边框问题为什么 vw/rem 无法解决？
A: vw/rem 解决"尺寸比例"，不解决"像素精度"。
   在 DPR=2 设备上，1px CSS = 4 物理像素，视觉上变粗。
   需要伪元素 + transform: scale() 或 viewport 缩放。

Q4: 设计稿 750px，代码为什么直接写 750px？
A: postcss-px-to-viewport 配置 viewportWidth=750，
   构建时自动将 px 转换为 vw。
   前端按设计稿写 px，零心智负担。

Q5: 字体大小应该用 px、rem 还是 vw？
A: 推荐 px + clamp()。
   字体应由内容决定，不应随屏幕尺寸大幅变化。
   clamp(14px, 4vw, 18px) 保证可读性同时适度响应。

Q6: 如何处理 iPhone 14 Pro Max（430px）等大屏？
A: 1. max-width 限制内容区域；2. clamp() 限制最大值；
   3. 大屏居中留白，提升阅读体验。`,
};
