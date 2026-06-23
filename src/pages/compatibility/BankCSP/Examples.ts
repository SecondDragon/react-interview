/**
 * 银行 CSP 案例元数据
 */
export const BankCSPExamples = {
  title: '银行内网 CSP 限制与资源失效',
  reason: '严格的 CSP 策略禁止内联资源与外部资源加载。',
  phenomenon: '图标加载失败，eval 报错。',
  bad: `<link rel="stylesheet" href="https://cdn.com/antd.css" />`,
  good: `/* 解决方案：1. 资源本地化 2. 非对称加密 Nonce 方案 */`,
};
