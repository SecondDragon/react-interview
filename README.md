# React 19 + Ant Design 6 项目

这是一个基于最新技术栈搭建的现代化前端项目。

## 技术栈

- **框架**: [React 19](https://react.dev/) (使用最新的并发特性和改进)
- **UI 组件库**: [Ant Design 6](https://ant.design/) (提供高质量的组件和全新的设计规范)
- **构建工具**: [Vite 8](https://vitejs.dev/) (极速的开发体验)
- **路由**: [React Router 7](https://reactrouter.com/) (功能强大的声明式路由)
- **语言**: [TypeScript](https://www.typescriptlang.org/) (强类型支持)

## 路由结构

项目目前配置了以下基础路由：

- `/`: **首页 (Home)** - 项目入口，展示欢迎信息和基础引导。
- `/login`: **登录页 (Login)** - 用户身份验证页面，包含表单校验和登录逻辑。
- `/dashboard`: **控制台 (Dashboard)** - 内部管理界面，采用经典侧边栏布局，包含面包屑、导航菜单和内容区。

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

## 项目目录

```text
src/
├── pages/          # 页面组件 (Home, Login, Dashboard)
├── layout/         # 通用布局组件
├── App.tsx         # 路由配置入口
└── main.tsx        # 项目挂载点
```
