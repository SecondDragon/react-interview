// 最佳实践：循环依赖中导出函数，避免在顶层立即读取

// a.mjs
import { getB } from './b.mjs';
export const a = 'a';
export function getA() {
  return a;
}
export function fetchB() {
  return getB(); // 调用时 b 已完成求值
}

// b.mjs
import { getA } from './a.mjs';
export const b = 'b';
export function getB() {
  return b;
}
export function fetchA() {
  return getA(); // 调用时 a 已完成求值
}

// main.mjs
import { fetchB } from './a.mjs';
console.log(fetchB()); // 'b'
