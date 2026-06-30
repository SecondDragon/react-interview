// 最佳实践：统一使用 module.exports 导出

// utils.js
module.exports = {
  foo: 'foo',
  bar: 'bar',
};

// main.js
const utils = require('./utils');
console.log(utils.foo); // 'foo'
