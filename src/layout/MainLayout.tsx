import React, {useEffect, Suspense, useMemo, useState, useRef} from 'react';
import './MainLayout.css';
import {Layout, Menu, Tabs, Button, Spin} from 'antd';
import {MenuUnfoldOutlined, MenuFoldOutlined} from '@ant-design/icons';
import {useUserStore} from '../store/useUserStore';
import {useAppStore} from '../store/useAppStore';
import {useTabStore} from '../store/useTabStore';
import {useNavigate, Outlet, useLocation} from 'react-router-dom';
import {dashboardRoutes} from '../router/config';
import type {RouteConfig} from '../router/config';
import type {MenuItem, FlattenedRouteMap} from './MainLayout.types';
import {registerMicroApps, start} from 'qiankun';
import {useOpenKeysByPath} from '../hooks/hooks.ts';
// import DraggablePhoneBar from '../pages/phone-work-bench/phone-bar/DraggablePhoneBar';
import styled from "styled-components";

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

const {Header, Content, Sider} = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {username} = useUserStore();
  const {collapsed, toggleCollapsed} = useAppStore();
  const {tabs, activeKey, addTab, removeTab, setActiveKey} = useTabStore();

  // 1. 最好在文件外部或全局声明一个标志位，防止热更新时重复 start 报错
  if (!window.qiankunStarted) {
    window.qiankunStarted = false;
  }
  // 2. 修改您的 useEffect
  useEffect(() => {
    // 只要组件挂载，且之前没启动过，才启动 Qiankun
    if (!window.qiankunStarted) {
      window.qiankunStarted = true;
      start({
        prefetch: true,
      });
    }
  }, []);

  const isSubAppRoute = location.pathname.startsWith('/dashboard/micro-vue');

  const menuItems = useMemo(() => {
    const getFiltered = (routes: RouteConfig[]): MenuItem[] => {
      return routes
        .filter((route: RouteConfig) => {
          if (route.hideInMenu) return false;
          return true; // 移除权限过滤，默认全部显示
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
  }, []);

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
      (current.element || current.path.includes('micro-'))
    ) {
      addTab({
        key: current.path,
        label: current.label as string,
        closable: current.closable !== false,
      });
    }
  }, [location.pathname, addTab]);

  // const [openKeys,set ]
  const contentRef = useRef<HTMLDivElement>(null);

  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const keys = useOpenKeysByPath(dashboardRoutes, location.pathname);
  useEffect(() => {
    setOpenKeys(keys);
  }, [keys]);

  // 切换路由时，将 Content 滚动区域重置到顶部
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  console.log('openKeys', openKeys);

  return (
    <Layout style={{height: '100vh', minWidth: '1480px', overflow: 'hidden'}}>
      <Sider
        width={256}
        collapsed={collapsed}
        style={{background: '#fff', borderRight: '1px solid #f0f0f0'}}
      >
        <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
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
          <div style={{flex: 1, overflowY: 'auto'}}>
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
              onClick={({key}) => navigate(key)}
              style={{height: '100%', borderRight: 0, paddingTop: '8px'}}
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
            icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
            onClick={toggleCollapsed}
            style={{width: 40, height: 40}}
          />
          <div style={{flex: 1}}/>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <span style={{color: '#595959'}}>
              欢迎您，<b style={{color: '#1890ff'}}>{username || '测试环境'}</b>
            </span>
          </div>
        </Header>

        <TabsContainer>
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
        </TabsContainer>

        <Content
          ref={contentRef}
          style={{
            padding: '16px 12px 18px 16px',
            margin: 0,
            flex: 1,
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          <Suspense fallback={<Spin size="large"/>}>
            <Outlet/>
          </Suspense>
          <div
            id="micro-viewport"
            style={{width: '100%', height: '100%', display: isSubAppRoute ? 'block' : 'none'}}
          />
        </Content>
      </Layout>
      {/*<DraggablePhoneBar />*/}
    </Layout>
  );
};

export default MainLayout;
const TabsContainer = styled.div`
  && {
    background: #fff;
    padding: 10px 16px 0;
    border-bottom: 1px solid #f0f0f0;

    .ant-tabs-nav {
      margin-bottom: 0 !important;

      &::before {
        display: none !important;
      }
    }

    .ant-tabs-tab {
      background: #ffffff !important;
      /* 仅保留左、上、右三面边框 */
      border: 1px solid #e8e8e8 !important;
      border-bottom: none !important;
      margin-right: 4px !important;
      padding: 6px 16px !important;
      transition: all 0.2s;
      border-radius: 4px 4px 0 0 !important;
      position: relative;
      bottom: -1px; /* 压在容器底线上 */

      &:hover {
        border-color: #d9d9d9 !important;

        .ant-tabs-tab-btn {
          color: #1890ff !important;
        }
      }

      .ant-tabs-tab-btn {
        color: #595959 !important;
        font-size: 13px;
      }
    }

    .ant-tabs-tab-active {
      /* 选中时边框变蓝 */
      border-color: #1890ff !important;
      /* 浅色渐变背景 */
      background: linear-gradient(180deg, #ffffff 0%, #f5f9ff 100%) !important;
      z-index: 2;

      .ant-tabs-tab-btn {
        color: #1890ff !important;
        font-weight: 400 !important; /* 保持与未选中状态一致的字重，防止闪烁 */
      }

      /* 确保没有额外的顶部装饰条 */

      &::before, &::after {
        display: none !important;
      }
    }

    /* 移除 antd 默认的所有装饰线 */

    .ant-tabs-ink-bar, .ant-tabs-ink-bar-animated {
      display: none !important;
    }
  }
`;
