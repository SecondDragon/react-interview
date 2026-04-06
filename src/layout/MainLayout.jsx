import React, { useEffect, Suspense, useMemo } from "react";
import "./MainLayout.css";
import { Layout, Menu, Tabs, Button, Spin } from "antd";
import {
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { useUserStore } from "../store/useUserStore";
import { useAppStore } from "../store/useAppStore";
import { useTabStore } from "../store/useTabStore";
import { usePermissionStore } from "../store/usePermissionStore";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { dashboardRoutes } from "../router/config";
import { observer } from "mobx-react-lite";

const { Header, Content, Sider } = Layout;

const MainLayout = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const { username, logout } = useUserStore();
  const { collapsed, toggleCollapsed } = useAppStore();
  const { tabs, activeKey, addTab, removeTab, setActiveKey } = useTabStore();
  const { allowedPaths, fetchPermissions, isLoaded, clearPermissions } = usePermissionStore();

  const siderWidth = collapsed ? 80 : 256;
  const minTotalWidth = 1920;

  /**
   * 系统初始化逻辑：获取后端权限
   * 必须在布局组件首屏加载时触发，保证子页面能根据权限渲染。
   */
  useEffect(() => {
    if (!isLoaded) {
      fetchPermissions();
    }
  }, [isLoaded, fetchPermissions]);

  /**
   * 核心逻辑：菜单权限过滤 (Memoized)
   * 1. 递归遍历 dashboardRoutes 全量路由表。
   * 2. 检查每一项是否为白名单 (isWhiteList) 或在 allowedPaths 权限列表中。
   * 3. 若为父级菜单，则检查其子菜单中是否至少有一个可访问。
   * 4. 过滤结果传给 Ant Design Menu 组件进行动态渲染。
   */
  const menuItems = useMemo(() => {
    const getFiltered = (routes) => {
      return routes
        .filter((route) => {
          if (route.hideInMenu) return false;
          // 白名单页面始终显示
          if (route.isWhiteList) return true;
          // 如果路径在后端授权列表中，显示
          // Note: MobX observable arrays are converted to native arrays implicitly in some cases, but slice() is safer if needed.
          if (allowedPaths.includes(route.path)) return true;
          // 如果是含有子路由的父级，子路由有权限，父级也显示
          if (route.children) {
            return route.children.some(
              (child) => child.isWhiteList || allowedPaths.includes(child.path)
            );
          }
          return false;
        })
        .map((route) => {
          const item = {
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
  }, [allowedPaths, isLoaded]);

  /**
   * 核心逻辑：路由与标签页(Tabs)同步
   * 1. 监听 location.pathname 的变化。
   * 2. 从路由总表中找到当前路径对应的配置对象。
   * 3. 调用 addTab 将该页面自动加入顶部标签栏，并实现高亮。
   * 4. 确保只有有权限访问的页面才被加入 Tabs。
   */
  useEffect(() => {
    const flatten = (items) => {
      const map = {};
      items.forEach((item) => {
        map[item.path] = item;
        if (item.children) Object.assign(map, flatten(item.children));
      });
      return map;
    };
    const map = flatten(dashboardRoutes);
    const current = map[location.pathname];

    // 如果当前路径存在，且具有对应页面组件，且有访问权限，则将其添加到 Tabs 状态管理中
    if (
      current &&
      current.element &&
      (current.isWhiteList || allowedPaths.includes(location.pathname))
    ) {
      addTab({
        key: current.path,
        label: current.label,
        closable: current.closable !== false,
      });
    }
  }, [location.pathname, allowedPaths, addTab]);

  if (!isLoaded) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" tip="权限验证中..." />
      </div>
    );
  }

  return (
    <Layout
      style={{
        height: "100vh",
        minWidth: `${minTotalWidth}px`,
        overflow: "hidden",
      }}
    >
      <Sider
        width={256}
        collapsed={collapsed}
        onCollapse={toggleCollapsed}
        style={{
          background: "#fff",
          borderRight: "1px solid #f0f0f0",
          height: "100vh",
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div
          style={{
            height: "64px",
            fontSize: "20px",
            lineHeight: "64px",
            textAlign: "center",
            fontWeight: "bold",
            color: "#1890ff",
            borderBottom: "1px solid #f0f0f0",
            flexShrink: 0,
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {collapsed ? "CMS" : "Hybrid Admin"}
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ height: "100%", borderRight: 0, paddingTop: "8px" }}
          />
        </div>
        </div>
      </Sider>

      <Layout
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#f5f7fa",
        }}
      >
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
            height: "64px",
            flexShrink: 0,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            style={{ width: 40, height: 40 }}
          />
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span style={{ color: "#595959" }}>
              欢迎您，<b style={{ color: "#1890ff" }}>{username || "游客"}</b>
            </span>
            <Button
              icon={<LogoutOutlined />}
              onClick={() => {
                logout();
                clearPermissions();
                navigate("/login");
              }}
            >
              退出
            </Button>
          </div>
        </Header>

        <div
          style={{
            background: "#fff",
            padding: "12px 16px 0",
            borderBottom: "1px solid #f0f0f0",
            flexShrink: 0,
          }}
        >
          <Tabs
            activeKey={activeKey}
            style={{ fontWeight: "400" }}
            onChange={(key) => {
              setActiveKey(key);
              navigate(key);
            }}
            onEdit={(targetKey, action) =>
              action === "remove" &&
              navigate(removeTab(targetKey) || "/dashboard/overview")
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
            overflowY: "auto",
            position: "relative",
          }}
        >
          <Suspense fallback={<Spin size="large" />}>
            <Outlet />
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
});

export default MainLayout;
