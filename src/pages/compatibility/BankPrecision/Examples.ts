/**
 * 金融精度案例元数据
 */
export const BankPrecisionExamples = {
  title: "金融计算中的“消失的分钱”",
  reason: "IEEE 754 浮点标准导致的二进制存储精度丢失。",
  phenomenon: "0.1 + 0.2 != 0.3，导致对账失败。",
  bad: "const total = amount1 + amount2; // 0.30000000000000004",
  good: "import Big from 'big.js'; \nconst total = new Big(0.1).plus(0.2).toNumber();"
};
