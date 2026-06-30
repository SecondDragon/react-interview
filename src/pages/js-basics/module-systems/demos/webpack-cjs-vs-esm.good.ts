// 最佳实践：使用静态 import，让 Webpack 可以安全 tree-shaking

// utils.ts
export const used = 'used';
export const unused = 'unused';

// main.ts
import { used } from './utils';
console.log(used);
