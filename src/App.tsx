import React, { lazy } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import MainLayout from './layout/MainLayout.tsx';
import { dashboardRoutes } from './router/config';
import type { RouteConfig } from './router/config';
import { AuthGuard } from './components/AuthGuard';

const Forbidden = lazy(() => import('./pages/error/Forbidden'));

/**
 * 递归渲染普通 React 业务路由
 */
const renderFlattenRoutes = (routes: RouteConfig[]): React.ReactNode[] => {
  const result: React.ReactNode[] = [];
  routes.forEach((route) => {
    // 只有带有 element 且不是微前端前缀的普通路由才在这里生成 React Route
    if (route.element && !route.path.includes('micro-')) {
      const relativePath = route.path.startsWith('/dashboard/')
        ? route.path.substring('/dashboard/'.length)
        : route.path;

      result.push(
        <Route
          key={route.path}
          path={relativePath}
          element={<AuthGuard>{route.element}</AuthGuard>}
        />
      );
    }
    if (route.children) result.push(...renderFlattenRoutes(route.children));
  });
  return result;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<MainLayout />}>
          {/* 渲染主应用的普通业务路由 */}
          {renderFlattenRoutes(dashboardRoutes)}
          <Route path="forbidden" element={<Forbidden />} />
          <Route index element={<Navigate to="/dashboard/overview" replace />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
