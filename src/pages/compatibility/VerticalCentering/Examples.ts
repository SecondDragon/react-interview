/**
 * 垂直居中案例元数据
 */
export const FontCenteringExamples = {
  title: '字体渲染的 1px 垂直居中偏差',
  reason: '不同渲染引擎对基线 Baseline 的计算规则不一。',
  bad: '.button { line-height: 30px; }',
  good: '.button { display: flex; align-items: center; }',
};
