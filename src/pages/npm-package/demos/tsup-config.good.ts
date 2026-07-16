// 正确的 package.json —— 字段完整、入口精准
{
  "name": "my-button",
  "version": "1.0.0",
  "main": "./dist/index.js",          // CJS 入口
  "module": "./dist/index.mjs",       // ESM 入口（打包工具优先使用）
  "types": "./dist/index.d.ts",       // 类型声明入口
  "exports": {
    ".": {
      "import": "./dist/index.mjs",   // import 时使用
      "require": "./dist/index.js",   // require 时使用
      "types": "./dist/index.d.ts"    // 类型声明
    }
  },
  "files": ["dist"],                  // 仅发布 dist 目录
  "sideEffects": false,               // 标记无副作用，支持 tree-shaking
  "peerDependencies": {               // React 作为对等依赖
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts --clean",
    "prepublishOnly": "npm run build" // 发布前自动构建
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
