// 反面教材：错误理解 exports 与 module.exports 的关系

// utils.js
exports = {
  foo: 'foo',
};

// main.js
const utils = require('./utils');
console.log(utils.foo); // undefined
