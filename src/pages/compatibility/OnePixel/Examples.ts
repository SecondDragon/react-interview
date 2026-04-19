/**
 * 移动端 1px 案例元数据
 */
export const OnePixelExamples = {
  description: "在 DPR 为 2 或 3 的高清屏上，CSS 中的 1px 会被渲染为多个物理像素。",
  bad: `.border-1px { border-bottom: 1px solid #ddd; }`,
  good: `.border-1px-fixed { 
  position: relative; 
  border: none; 
} 
.border-1px-fixed::after { 
  content: ""; 
  position: absolute; 
  bottom: 0; left: 0; right: 0; 
  height: 1px; 
  background-color: #ddd; 
  transform: scaleY(0.5); 
  transform-origin: 0 100%; 
}`
};
