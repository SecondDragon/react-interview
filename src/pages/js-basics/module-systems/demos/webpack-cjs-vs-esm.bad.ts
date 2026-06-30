// 反面教材：混用 CommonJS 导致 Webpack 无法静态分析，tree-shaking 失效

// utils.ts
export const used = 'used';
export const unused = 'unused';

// main.ts
const utils = require('./utils');
console.log(utils.used);
