// ✅ qiankun 样式共享：主子应用共用 Ant Design 主题

// ---------- 主应用 ----------
// 在 App.tsx 中配置 Ant Design 主题
import { ConfigProvider } from 'antd';

const theme = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6,
    // 所有子应用都能继承这个主题
  },
};

const Sidebar = () => <aside>Sidebar</aside>;

function MainApp() {
  return (
    <ConfigProvider theme={theme}>
      <div className="main-layout">
        <Sidebar />
        {/* qiankun 子应用挂载点 */}
        <div id="micro-viewport" />
      </div>
    </ConfigProvider>
  );
}

// ---------- 子应用 ----------
// 子应用不需要单独引入 ConfigProvider,
// Ant Design 的样式 token 通过 CSS 变量继承自主应用
import { Button, Table } from 'antd';

function QueryPage() {
  return (
    <div>
      {/* 这里的 Button 颜色和主应用一致 */}
      {/* 不需要单独配置 theme */}
      <Button type="primary">执行查询</Button>
      <Table dataSource={[]} columns={[]} />
    </div>
  );
}
// 但要注意：Ant Design 的 JS 运行时仍然需要在子应用中单独安装
// 可以通过 externals + CDN 实现全量共享（需额外配置）
