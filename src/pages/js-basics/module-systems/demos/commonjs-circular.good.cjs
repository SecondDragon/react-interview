// 最佳实践：导出函数，延迟访问

// a.js
const b = require('./b');
module.exports = {
  getValue: () => 'a',
  getBValue: () => b.getValue(),
};

// b.js
const a = require('./a');
module.exports = {
  getValue: () => 'b',
  getAValue: () => a.getValue(), // 调用时 a 已求值完成
};

// main.js
const a = require('./a');
console.log(a.getBValue()); // 'b'
