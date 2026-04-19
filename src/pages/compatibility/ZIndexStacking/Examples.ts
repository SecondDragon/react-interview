/**
 * z-index 层叠案例元数据
 */
export const ZIndexExamples = {
  title: "z-index 层叠上下文陷阱",
  reason: "transform/opacity 触发新层叠上下文，导致 z-index 失效。",
  bad: ".parent { transform: translateZ(0); z-index: 1; }\n.child { z-index: 999; }",
  good: "return createPortal(<Modal />, document.body);"
};
