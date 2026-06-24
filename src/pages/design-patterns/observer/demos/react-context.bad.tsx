// 反面教材：props drilling 多层传递，不必要的重渲染

// 顶层组件
function App() {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState({ name: '张三' });

  return (
    <Layout theme={theme} user={user} setTheme={setTheme} />
  );
}

// 中间层组件：只负责传递 props，自身不需要这些数据
function Layout({ theme, user, setTheme }: any) {
  return (
    <div>
      <Header theme={theme} />
      <Sidebar user={user} />
      <MainContent theme={theme} user={user} setTheme={setTheme} />
    </div>
  );
}

function Header({ theme }: any) {
  return <header style={{ background: theme }}>Header</header>;
}

function Sidebar({ user }: any) {
  return <aside>{user.name}</aside>;
}

function MainContent({ theme, user, setTheme }: any) {
  return (
    <main>
      <Toolbar theme={theme} setTheme={setTheme} />
      <UserCard user={user} />
    </main>
  );
}

function Toolbar({ theme, setTheme }: any) {
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      切换主题
    </button>
  );
}

function UserCard({ user }: any) {
  return <div>用户名: {user.name}</div>;
}

// 问题：
// 1. props drilling：theme 和 user 经过多层组件传递
// 2. 中间层组件（Layout、MainContent）被迫接收和传递不需要的 props
// 3. 代码耦合度高，修改数据流需要改动多个组件
// 4. 难以维护，组件复用性差
// 5. 如果某个中间层忘记传递 props，下游组件无法获取数据
