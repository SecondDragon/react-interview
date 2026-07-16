// 不良的 package.json —— 字段缺失、入口配置混乱
{
  "name": "my-button",
  "version": "1.0.0",
  "main": "src/index.ts",        // ❌ 入口指向源码，使用者无 TS 编译器会报错
  "types": "src/index.ts",       // ❌ types 也应指向 dist 目录
  "files": ["src", "dist"],      // ❌ src 不需要发布，增大包体积
  "dependencies": {              // ❌ React 应放在 peerDependencies
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "scripts": {
    "build": "tsc"               // ❌ 仅 tsc 编译，无 bundle，无 dts 生成配置
  }
}
