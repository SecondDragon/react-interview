import React, { useEffect, Suspense, useMemo, useState } from 'react';
import './MainLayout.css';
import { Layout, Menu, Tabs, Button, Spin } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { useUserStore } from '../store/useUserStore';
import { useAppStore } from '../store/useAppStore';
import { useTabStore } from '../store/useTabStore';
import { usePermissionStore } from '../store/usePermissionStore';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { dashboardRoutes } from '../router/config';
import type { RouteConfig } from '../router/config';
import { observer } from 'mobx-react-lite';
import type { MenuItem, FlattenedRouteMap } from './MainLayout.types';
import { registerMicroApps, start } from 'qiankun';
import { useOpenKeysByPath } from '../hooks/hooks.ts';

registerMicroApps([
  {
    name: 'vue-app',
    entry: '//localhost:8082',
    container: '#micro-viewport', // 统一挂载点
    activeRule: '/dashboard/micro-vue', // 只要路径以这个开头，就激活
  },
  {
    name: 'react-app',
    entry: '//localhost:8083',
    container: '#micro-viewport',
    activeRule: '/dashboard/micro-react',
  },
]);

const { Header, Content, Sider } = Layout;

const MainLayout: React.FC = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const { username } = useUserStore();
  const { collapsed, toggleCollapsed } = useAppStore();
  const { tabs, activeKey, addTab, removeTab, setActiveKey } = useTabStore();
  const { allowedPaths, fetchPermissions, isLoaded } = usePermissionStore();

  /**
   * 系统初始化：权限获取
   */
  useEffect(() => {
    if (!isLoaded) {
      void fetchPermissions();
    }
  }, [isLoaded, fetchPermissions]);
  // 1. 最好在文件外部或全局声明一个标志位，防止热更新时重复 start 报错
  if (!window.qiankunStarted) {
    window.qiankunStarted = false;
  }
  // 2. 修改您的 useEffect
  useEffect(() => {
    // 只有当权限加载完毕 (isLoaded 为 true)，且之前没启动过，才启动 Qiankun
    if (isLoaded && !window.qiankunStarted) {
      window.qiankunStarted = true;
      start({
        prefetch: true,
      });
    }
  }, [isLoaded]); // 依赖项加上 isLoaded

  const isSubAppRoute = location.pathname.startsWith('/dashboard/micro-vue');

  const menuItems = useMemo(() => {
    const getFiltered = (routes: RouteConfig[]): MenuItem[] => {
      return routes
        .filter((route: RouteConfig) => {
          if (route.hideInMenu) return false;
          if (route.isWhiteList) return true;
          if (allowedPaths.includes(route.path)) return true;
          if (route.children) {
            return route.children.some(
              (child: RouteConfig) => child.isWhiteList || allowedPaths.includes(child.path)
            );
          }
          return false;
        })
        .map((route: RouteConfig) => {
          const item: MenuItem & { children?: MenuItem[] } = {
            key: route.path,
            icon: route.icon,
            label: route.label,
          };
          if (route.children) {
            item.children = getFiltered(route.children);
          }
          return item;
        });
    };
    return getFiltered(dashboardRoutes);
  }, [allowedPaths]);

  /**
   * 标签页同步逻辑
   */
  useEffect(() => {
    const flatten = (items: RouteConfig[]): FlattenedRouteMap => {
      const map: FlattenedRouteMap = {};
      items.forEach((item: RouteConfig) => {
        map[item.path] = item;
        if (item.children) Object.assign(map, flatten(item.children));
      });
      return map;
    };
    const map = flatten(dashboardRoutes);
    const current = map[location.pathname];

    if (
      current &&
      (current.element || current.path.includes('micro-')) &&
      (current.isWhiteList || allowedPaths.includes(location.pathname))
    ) {
      addTab({
        key: current.path,
        label: current.label as string,
        closable: current.closable !== false,
      });
    }
  }, [location.pathname, allowedPaths, addTab]);

  // const [openKeys,set ]
  const [openKeys, setOpenKeys] = useState([]);

  const [keys] = useOpenKeysByPath(dashboardRoutes, location.pathname);
  useEffect(() => {
    // @ts-ignore
    return setOpenKeys(keys);
  }, []);

  console.log('openKeys', openKeys);

  if (!isLoaded) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spin size="large" tip="系统加载中..." />
      </div>
    );
  }

  return (
    <Layout style={{ height: '100vh', minWidth: '1680px', overflow: 'hidden' }}>
      <Sider
        width={256}
        collapsed={collapsed}
        style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div
            style={{
              height: '64px',
              fontSize: '20px',
              lineHeight: '64px',
              textAlign: 'center',
              fontWeight: 'bold',
              color: '#1890ff',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            {collapsed ? 'CMS' : 'Hybrid Admin'}
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <Menu
              forceSubMenuRender
              mode="inline"
              openKeys={openKeys}
              onOpenChange={(keys1) => {
                console.log('keys1', keys1);
                // @ts-ignore
                setOpenKeys(keys1);
              }}
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={({ key }) => navigate(key)}
              style={{ height: '100%', borderRight: 0, paddingTop: '8px' }}
            />
          </div>
        </div>
      </Sider>

      <Layout
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#f5f7fa',
        }}
      >
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            height: '64px',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            style={{ width: 40, height: 40 }}
          />
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#595959' }}>
              欢迎您，<b style={{ color: '#1890ff' }}>{username || '测试环境'}</b>
            </span>
          </div>
        </Header>

        <div
          style={{
            background: '#fff',
            padding: '12px 16px 0',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Tabs
            activeKey={activeKey}
            onChange={(key) => {
              setActiveKey(key);
              navigate(key);
            }}
            onEdit={(targetKey, action) =>
              action === 'remove' &&
              navigate(removeTab(targetKey as string) || '/dashboard/overview')
            }
            type="editable-card"
            hideAdd
            size="small"
            items={tabs.map((tab) => ({
              key: tab.key,
              label: tab.label,
              closable: tab.closable,
            }))}
          />
        </div>

        <Content
          style={{
            padding: 24,
            margin: 0,
            flex: 1,
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          <Suspense fallback={<Spin size="large" />}>
            <Outlet />
          </Suspense>
          <div
            id="micro-viewport"
            style={{ width: '100%', height: '100%', display: isSubAppRoute ? 'block' : 'none' }}
          />
        </Content>
      </Layout>
    </Layout>
  );
});

export default MainLayout;
