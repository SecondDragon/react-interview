/**
 * 日期解析案例元数据
 */
export const DateParsingExamples = {
  title: "Safari 日期解析陷阱 (The Date.parse Trap)",
  phenomenon: "在 Chrome/Android 上正常的倒计时或日期时间显示，一旦在 iPhone/Mac 的 Safari 浏览器打开，就会显示为 'NaN' 或 'Invalid Date'，导致页面逻辑崩溃（例如倒计时组件白屏）。",
  reason: "ECMAScript 规范对 Date.parse() 的字符串格式有着严格的定义，推荐使用 ISO 8601 格式（如 '2023-10-10T12:00:00Z'）。而对于非标准格式（如 '2023-10-10 12:00:00'，带空格和连字符），Chrome 的 V8 引擎为了开发者体验，私下做了兼容处理，能正确解析。但是，Safari 的 JavaScriptCore 引擎严格遵循标准，遇到这种非标格式会直接返回 NaN。",
  whySolveThisWay: "通过正则将所有的连字符 '-' 替换为斜杠 '/'（变成 '2023/10/10 12:00:00'），这是因为 '/' 格式是所有浏览器（包括非常老旧的 IE 和严格的 Safari）都一致支持的历史遗留格式。这种替换成本极低，且能 100% 保证跨平台兼容。或者直接使用成熟的第三方库（如 dayjs），它们内部已经抹平了这些底层差异。",
  bad: `
/* ❌ 错误做法：直接解析带连字符和空格的字符串 */
const dateStr = '2023-10-10 12:00:00';
const timestamp = new Date(dateStr).getTime();

// Chrome 运行结果：1696910400000 (正常)
// Safari 运行结果：NaN (导致后续所有基于时间的计算崩溃)
  `,
  good: `
/* ✅ 解决方案 1：原生正则替换（轻量级，适合无第三方库的项目） */
const dateStr = '2023-10-10 12:00:00';
// 将所有 '-' 替换为 '/'
const safeDateStr = dateStr.replace(/-/g, '/'); 
const timestamp = new Date(safeDateStr).getTime();

// Chrome 运行结果：1696910400000
// Safari 运行结果：1696910400000 (完美兼容)

/* ✅ 解决方案 2：使用第三方时间库（工业级推荐） */
import dayjs from 'dayjs';

// dayjs 内部已经处理了兼容性问题
const timestamp2 = dayjs('2023-10-10 12:00:00').valueOf();
  `
};
