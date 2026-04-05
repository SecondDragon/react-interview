import { create } from 'zustand';

/**
 * 权限状态定义
 * 管理用户在系统内的访问权限数据，用于路由守卫和菜单动态渲染。
 */
interface PermissionState {
  allowedPaths: string[]; // 后端返回的允许访问的路径列表
  isLoaded: boolean;      // 权限数据是否已成功加载，用于控制全局 Loading 状态
  // 获取后端权限数据的模拟方法
  fetchPermissions: () => Promise<void>;
  // 清空权限 (登出时调用)
  clearPermissions: () => void;
}

/**
 * 权限管理 Store
 * 使用 Zustand 管理。
 * 作用：
 * 1. 在 MainLayout 初始化加载权限。
 * 2. AuthGuard 读取 allowedPaths 进行路由跳转拦截。
 * 3. MainLayout 读取 allowedPaths 动态过滤并展示左侧菜单。
 */
export const usePermissionStore = create<PermissionState>((set) => ({
  allowedPaths: [],
  isLoaded: false,

  /**
   * 异步获取权限列表逻辑
   * 实际项目中应替换为 axios/fetch 请求后端接口。
   */
  fetchPermissions: async () => {
    // 模拟 API 接口延迟
    await new Promise(resolve => setTimeout(resolve, 1200));

    // 模拟从后端获取到的权限列表 (这些路径是该用户角色有权访问的页面)
    const mockAllowed = [
      '/dashboard/overview',
      '/dashboard/tasks-container',
      '/dashboard/tasks-container/list',
      '/dashboard/multi-level',
      '/dashboard/multi-level/sub1',
      '/dashboard/multi-level/sub1/page1',
    ];

    set({ allowedPaths: mockAllowed, isLoaded: true });
  },

  clearPermissions: () => set({ allowedPaths: [], isLoaded: false }),
}));
