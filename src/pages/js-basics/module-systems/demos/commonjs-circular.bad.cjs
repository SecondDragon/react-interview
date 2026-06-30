// 反面教材：循环依赖中立即读取对方导出，导致 undefined

// a.js
const b = require('./b');
console.log('in a, b.value =', b.value); // undefined
module.exports = { value: 'a' };

// b.js
const a = require('./a');
module.exports = { value: 'b', aValue: a.value }; // a.value 为 undefined
