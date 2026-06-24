// 最佳实践：使用 React Context + 拆分 Context 优化重渲染

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

// 定义类型
interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

interface UserContextType {
  user: { name: string };
  setUser: (user: { name: string }) => void;
}

// 创建 Context
const ThemeContext = createContext<ThemeContextType | null>(null);
const UserContext = createContext<UserContextType | null>(null);

// 自定义 Hook：提供类型安全和错误处理
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

// Provider 组件
function AppProviders({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState({ name: '张三' });

  // 使用 useMemo 避免每次渲染创建新对象
  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);
  const userValue = useMemo(() => ({ user, setUser }), [user]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <UserContext.Provider value={userValue}>
        {children}
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}

// 顶层组件
function App() {
  return (
    <AppProviders>
      <Layout />
    </AppProviders>
  );
}

// 中间层组件：不再需要传递 props
function Layout() {
  return (
    <div>
      <Header />
      <Sidebar />
      <MainContent />
    </div>
  );
}

function Header() {
  const { theme } = useTheme();
  return <header style={{ background: theme }}>Header</header>;
}

function Sidebar() {
  const { user } = useUser();
  return <aside>{user.name}</aside>;
}

function MainContent() {
  return (
    <main>
      <Toolbar />
      <UserCard />
    </main>
  );
}

function Toolbar() {
  const { theme, setTheme } = useTheme();
  const handleToggle = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  return <button onClick={handleToggle}>切换主题</button>;
}

function UserCard() {
  const { user } = useUser();
  return <div>用户名: {user.name}</div>;
}

// 优势：
// 1. 消除 props drilling，中间层组件不再需要传递数据
// 2. 拆分 Context：Theme 和 User 独立更新，互不影响
// 3. useMemo 优化：Provider value 引用稳定，避免不必要的重渲染
// 4. 类型安全：自定义 Hook 提供完整的 TypeScript 类型支持
// 5. 错误处理：在 Hook 中检查 Context 是否存在，提前发现错误
