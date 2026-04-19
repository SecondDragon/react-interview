/**
 * 字体渲染案例元数据
 */
export const FontRenderingExamples = {
  title: "跨平台字体栈 (Font Family) 渲染差异",
  phenomenon: "同样的网页，在 Mac 上看起来精致圆润，但在 Windows 上显得生硬锐利；而在信创（国产 Linux）系统上，由于缺少‘微软雅黑’，字体往往会回退到极难看的‘宋体’或‘中易宋体’，甚至导致文字溢出、排版错位。此外，某些系统由于未配置抗锯齿，文字边缘会有严重的‘毛刺感’。",
  reason: "1. 系统预装差异：各平台‘一等公民’字体不同。Windows 核心是微软雅黑 (Microsoft YaHei)，Apple 系是平方 (PingFang SC)，Linux 社区则推崇思源黑体 (Source Han Sans)。\n2. 渲染引擎算法：macOS 使用 Core Graphics，追求字体形状的完美还原（即使模糊一点）；Windows 使用 ClearType，追求像素级的清晰度（有时会显得‘干瘦’）。\n3. 回退链（Fallback）失效：如果 CSS 只写了 '微软雅黑'，在没有该字体的 Mac/Linux 上，浏览器会随机选择一种系统字体，破坏了视觉一致性。",
  mechanism: "1. 【从左到右优先级】：浏览器会按照你写的顺序，从第一个字体开始匹配。\n2. 【字符级回退 (Character-level Fallback)】：这是最关键的一点！如果当前字体文件里没有某个‘字符’（比如英文物理字体里通常没有中文字符），浏览器不会放弃，而是会保留已匹配的英文字符，然后拿着中文字符去列表里的下一个字体里‘碰运气’。这就是为什么我们要把‘英文字体’排在‘中文字体’前面——为了让英文用 Helvetica，中文用微软雅黑。\n3. 【系统变量 (Magic Keywords)】：像 -apple-system 这种不是真正的字体名，而是‘暗号’。它告诉浏览器：‘直接去调你亲爹（操作系统）最引以为傲的那个默认字体’，这比写死‘PingFang’性能更好、兼容性更强。",
  whySolveThisWay: "1. 原生优先：优先使用系统内置的特定变量（如 -apple-system），能直接调用经过系统级优化的字体（如苹果的 San Francisco），性能和显示效果均为最优。\n2. 覆盖信创：明确加入 'Source Han Sans CN' (思源黑体)，这是信创/Linux 平台的标准，能有效规避宋体回退灾难。\n3. 无衬线兜底：最后必须以 'sans-serif' 结尾，确保在任何极端环境下都能以现代黑体风格渲染，而非回到报纸风格的宋体（serif）。",
  bad: `
/* ❌ 错误做法：只指定单一中文字体或顺序错误 */
body {
  /* 在 Mac 上会强制渲染并不完美的微软雅黑，而非原生平方 */
  font-family: "Microsoft YaHei", sans-serif; 
}
  `,
  good: `
/* ✅ 工业级标准字体栈 */
body {
  font-family: 
    -apple-system,                /* 1. iOS/macOS Safari 专专有 */
    BlinkMacSystemFont,           /* 2. macOS Chrome/Edge */
    "Segoe UI",                   /* 3. Windows 现代字体 */
    Roboto,                       /* 4. Android/Linux 现代字体 */
    "Helvetica Neue", Arial,      /* 5. 经典英文 fallback */
    "PingFang SC",                /* 6. Apple 中文优先 */
    "Microsoft YaHei",            /* 7. Windows 中文 */
    "Source Han Sans CN",         /* 8. 信创/Linux 中文 */
    "Noto Sans CJK SC",           /* 9. Google 免费中文字体 */
    sans-serif,                   /* 10. 最终兜底 */
    "Apple Color Emoji", "Segoe UI Emoji"; /* 表情符号处理 */
  
  /* macOS 字体抗锯齿优化 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
  `
};
