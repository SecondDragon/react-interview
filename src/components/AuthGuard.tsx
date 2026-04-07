import React, {useMemo} from 'react';
import {useLocation, Navigate} from 'react-router-dom';
import {usePermissionStore} from '../store/usePermissionStore';
import {dashboardRoutes, type RouteConfig} from '../router/config';
import {observer} from 'mobx-react-lite';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * 路由守卫组件
 *
 * 功能职责：
 * 1. 拦截未授权的访问：检查用户是否有权访问当前 location.pathname。
 * 2. 状态前置检查：确保权限数据 (isLoaded) 加载完成后再进行校验。
 * 3. 自动重定向：对于无权访问的路径，统一跳转至 403 Forbidden 页面。
 *
 * 使用位置：
 * 在 main.tsx 或 App.tsx 中包裹在所有需要权限控制的路由外层。
 */
export const AuthGuard: React.FC<AuthGuardProps> = observer(({children}) => {
  const location = useLocation();
  const {allowedPaths, isLoaded} = usePermissionStore();

  /**
   * 展平路由配置 (Memoized)
   * 目的：将嵌套的 dashboardRoutes 转换为扁平化的 Record 对象，
   * 使得根据当前路径 (pathname) 查找对应的 RouteConfig 属性 (如 isWhiteList) 的时间复杂度为 O(1)。
   */
  const flattenedRoutes = useMemo(() => {
    const map: Record<string, RouteConfig> = {};
    const flatten = (items: RouteConfig[]) => {
      items.forEach(item => {
        map[item.path] = item;
        if (item.children) flatten(item.children);
      });
    };
    flatten(dashboardRoutes);
    return map;
  }, []);

  // 如果后端权限接口尚未返回数据，则暂不渲染任何内容（或显示全局 Loading）
  if (!isLoaded) return null;

  const currentRoute = flattenedRoutes[location.pathname];

  /**
   * 核心权限判断逻辑
   */

  // 1. 白名单检查：如果该路径在 dashboardRoutes 中被标记为 isWhiteList，直接允许进入
  if (currentRoute?.isWhiteList) {
    return <>{children}</>;
  }

  // 2. 动态权限检查：如果该路径存在于后端返回的 allowedPaths 列表中，允许进入
  if (allowedPaths.includes(location.pathname)) {
    return <>{children}</>;
  }

  /**
   * 3. 拦截：对于既非白名单也不在允许列表中的路径，强制跳转到 403 页面
   * 注意：此重定向会触发浏览器 URL 变更，直到命中白名单中的 403 页面。
   */
  return <Navigate to="/dashboard/forbidden" replace/>;
});
