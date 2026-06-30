// 反面教材：循环依赖中在顶层立即访问对方命名导出，触发 TDZ

// a.mjs
import { b } from './b.mjs';
export const a = 'a';
console.log('in a, b =', b); // 可能触发 ReferenceError: Cannot access 'b' before initialization

// b.mjs
import { a } from './a.mjs';
export const b = 'b';
console.log('in b, a =', a); // 可能触发 TDZ
