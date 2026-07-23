import React from 'react';
import { Tag, Typography } from 'antd';

/**
 * 前端安全专题分类数据
 */

// 安全风险等级
export type RiskLevel = '严重' | '高危' | '中危' | '低危';
export type AttackType =
  | '注入类'
  | '请求伪造类'
  | '配置缺陷类'
  | '供应链类'
  | '信息泄露类'
  | '逻辑绕过类';

export interface SecurityTopic {
  key: string;
  name: string;
  nameEn: string;
  category: AttackType;
  riskLevel: RiskLevel;
  description: string;
  owaspMapping?: string;
  deepDive: boolean;
  deepDivePage?: string;
}

export const securityTopics: SecurityTopic[] = [
  {
    key: 'xss',
    name: 'XSS 跨站脚本攻击',
    nameEn: 'Cross-Site Scripting',
    category: '注入类',
    riskLevel: '严重',
    description:
      '攻击者将恶意脚本注入页面，当用户访问时脚本在浏览器中执行，窃取 Cookie、Token、用户隐私信息，或冒充用户执行任意操作。',
    owaspMapping: 'A03:2021 – Injection',
    deepDive: true,
    deepDivePage: '/dashboard/security/xss',
  },
  {
    key: 'sql-injection',
    name: 'SQL 注入（前端视角）',
    nameEn: 'SQL Injection',
    category: '注入类',
    riskLevel: '严重',
    description:
      '虽然后端漏洞，但前端不当的输入处理会极大增加注入风险。前端应作为第一道防线进行输入校验和过滤。',
    owaspMapping: 'A03:2021 – Injection',
    deepDive: false,
  },
  {
    key: 'css-injection',
    name: 'CSS 注入',
    nameEn: 'CSS Injection',
    category: '注入类',
    riskLevel: '中危',
    description:
      '注入恶意 CSS，利用属性选择器和 background-image URL 逐字符探测 input 的 value 属性、或篡改页面布局为钓鱼样式。',
    deepDive: false,
  },
  {
    key: 'ssti',
    name: '模板注入（SSTI）',
    nameEn: 'Server-Side Template Injection',
    category: '注入类',
    riskLevel: '高危',
    description:
      '在 Angular/React/Vue 中使用 dangerouslySetInnerHTML / v-html 直接将用户输入嵌入模板时，可能注入恶意内容。',
    deepDive: false,
  },

  // ── 请求伪造类 ──
  {
    key: 'csrf',
    name: 'CSRF 跨站请求伪造',
    nameEn: 'Cross-Site Request Forgery',
    category: '请求伪造类',
    riskLevel: '高危',
    description:
      '攻击者诱导用户访问恶意页面，自动向目标站点发送伪造请求（转账、改密），利用浏览器自动携带 Cookie 的特性完成攻击。',
    owaspMapping: 'A01:2021 – Broken Access Control',
    deepDive: true,
    deepDivePage: '/dashboard/security/csrf',
  },
  {
    key: 'ssrf',
    name: 'SSRF 服务端请求伪造',
    nameEn: 'Server-Side Request Forgery',
    category: '请求伪造类',
    riskLevel: '高危',
    description:
      '利用前端传入的 URL/文件路径作为参数，诱导服务端向内网发起请求。常见于图片 URL 预览、Webhook 配置、文件远程导入等功能。',
    owaspMapping: 'A10:2021 – SSRF',
    deepDive: false,
  },
  {
    key: 'jsonp-hijack',
    name: 'JSONP 劫持',
    nameEn: 'JSONP Hijacking',
    category: '请求伪造类',
    riskLevel: '中危',
    description:
      'JSONP 无同源保护。攻击者在恶意页面定义同名回调函数，跨域获取目标 JSONP 接口返回的敏感数据，是 CSRF 的特殊变体。',
    deepDive: false,
  },

  // ── 配置缺陷类 ──
  {
    key: 'csp',
    name: 'CSP 内容安全策略',
    nameEn: 'Content Security Policy',
    category: '配置缺陷类',
    riskLevel: '高危',
    description:
      'CSP 是抵御 XSS 的最后防线。通过响应头或 meta 标签限制可加载/执行的资源来源。配置不当（unsafe-inline、unsafe-eval、*）会大幅削弱防护。',
    owaspMapping: 'A05:2021 – Security Misconfiguration',
    deepDive: false,
  },
  {
    key: 'cors',
    name: 'CORS 跨域配置错误',
    nameEn: 'CORS Misconfiguration',
    category: '配置缺陷类',
    riskLevel: '高危',
    description:
      'CORS 过于宽松（ACAO: * + credentials: true、动态反射 Origin）会解除同源策略防御，允许恶意站点跨域读取敏感接口响应。',
    owaspMapping: 'A05:2021 – Security Misconfiguration',
    deepDive: false,
  },
  {
    key: 'cookie-security',
    name: 'Cookie 安全属性',
    nameEn: 'Cookie Security Attributes',
    category: '配置缺陷类',
    riskLevel: '高危',
    description:
      'HttpOnly、Secure、SameSite、__Host- 前缀等属性决定 Cookie 安全性。缺少这些属性会使 Cookie 容易被 XSS 窃取、中间人截获、CSRF 利用。',
    owaspMapping: 'A05:2021 – Security Misconfiguration',
    deepDive: false,
  },
  {
    key: 'postmessage',
    name: 'postMessage 通信安全',
    nameEn: 'postMessage Security',
    category: '配置缺陷类',
    riskLevel: '高危',
    description:
      'window.postMessage 不校验 origin 时，任何恶意页面都可向接收端发送伪造消息，导致数据泄露或逻辑绕过。',
    deepDive: false,
  },
  {
    key: 'https-config',
    name: 'HTTPS / HSTS 配置',
    nameEn: 'HTTPS & HSTS',
    category: '配置缺陷类',
    riskLevel: '高危',
    description:
      '缺少 HTTPS 或 HSTS 会导致中间人攻击（MITM）、SSL 剥离。Mixed Content 问题——HTTPS 页面加载 HTTP 资源——会被浏览器拦截。',
    owaspMapping: 'A02:2021 – Cryptographic Failures',
    deepDive: false,
  },
  {
    key: 'iframe-security',
    name: 'iframe 安全与点击劫持',
    nameEn: 'Iframe & Clickjacking',
    category: '配置缺陷类',
    riskLevel: '高危',
    description:
      '点击劫持用透明 iframe 覆盖诱导点击、沙箱逃逸、同源 iframe DOM 操控。防御靠 X-Frame-Options 和 CSP frame-ancestors。',
    deepDive: false,
  },

  // ── 供应链类 ──
  {
    key: 'supply-chain',
    name: 'npm 供应链安全',
    nameEn: 'npm Supply Chain Security',
    category: '供应链类',
    riskLevel: '高危',
    description:
      '依赖混淆、恶意包投毒、依赖劫持、lockfile 篡改。攻击者发布名称相近的恶意包或入侵维护者账号传播恶意代码。',
    owaspMapping: 'A06:2021 – Vulnerable and Outdated Components',
    deepDive: false,
  },
  {
    key: 'sri',
    name: 'SRI 子资源完整性',
    nameEn: 'Subresource Integrity',
    category: '供应链类',
    riskLevel: '中危',
    description:
      'CDN 被入侵或脚本被篡改时，所有引用该 CDN 的站点都会执行恶意代码。SRI 通过校验 integrity 哈希确保资源未被篡改。',
    deepDive: false,
  },
  {
    key: 'prototype-pollution',
    name: '原型污染',
    nameEn: 'Prototype Pollution',
    category: '供应链类',
    riskLevel: '高危',
    description:
      'JS 特有攻击。通过 __proto__ / constructor.prototype 污染 Object.prototype，影响全局对象属性。常见于深度合并、URL 解析等递归操作，可能导致 XSS、权限绕过甚至 RCE。',
    deepDive: false,
  },

  // ── 信息泄露类 ──
  {
    key: 'storage-security',
    name: '浏览器存储安全',
    nameEn: 'Browser Storage Security',
    category: '信息泄露类',
    riskLevel: '高危',
    description:
      'localStorage/sessionStorage/IndexedDB 无 HttpOnly 机制，任何同源脚本可读。将 JWT Token、敏感信息存此处，一旦发生 XSS 直接泄露。',
    deepDive: false,
  },
  {
    key: 'sensitive-data',
    name: '前端敏感数据泄露',
    nameEn: 'Sensitive Data Exposure',
    category: '信息泄露类',
    riskLevel: '高危',
    description:
      'JS Bundle、Source Map 中可能含 API Key、内网地址、测试密码等硬编码信息。生产环境部署 Source Map 直接暴露源码。',
    owaspMapping: 'A04:2021 – Cryptographic Failures',
    deepDive: false,
  },
  {
    key: 'browser-history',
    name: '浏览器历史嗅探',
    nameEn: 'Browser History Sniffing',
    category: '信息泄露类',
    riskLevel: '低危',
    description:
      '通过 CSS :visited、Timing Attack 或 history.length 探测用户在其他网站的登录状态或访问历史。现代浏览器已做了大量限制。',
    deepDive: false,
  },

  // ── 逻辑绕过类 ──
  {
    key: 'open-redirect',
    name: '开放重定向',
    nameEn: 'Open Redirect',
    category: '逻辑绕过类',
    riskLevel: '中危',
    description:
      '跳转/回调 URL 参数无白名单校验，攻击者构造恶意链接。用户看到可信域名但实际跳转至钓鱼页面。常见于 OAuth 回调、支付返回、分享链接。',
    deepDive: false,
  },
  {
    key: 'web-worker',
    name: 'Web Worker 安全',
    nameEn: 'Web Worker Security',
    category: '逻辑绕过类',
    riskLevel: '中危',
    description:
      'Worker 无法访问 DOM 但可发起网络请求。不受信任的 Worker 脚本可用于 DDoS、挖矿、数据外传。CSP worker-src 指令可控制来源。',
    deepDive: false,
  },
  {
    key: 'drag-drop',
    name: '拖放劫持',
    nameEn: 'Drag & Drop Hijacking',
    category: '逻辑绕过类',
    riskLevel: '低危',
    description: '利用 HTML5 Drag & Drop API，诱使用户拖动不可见元素到目标页面，实现跨域数据窃取。',
    deepDive: false,
  },
];

// ── 攻击防护体系 ──

export interface DefenseCategory {
  key: string;
  name: string;
  description: string;
  relatedTopics: string[];
}

export const defenseCategories: DefenseCategory[] = [
  {
    key: 'input-output',
    name: '输入输出防护',
    description: '对所有用户输入进行验证和消毒，对所有输出进行上下文感知的编码转义。',
    relatedTopics: ['xss', 'sql-injection', 'ssti', 'css-injection'],
  },
  {
    key: 'request-integrity',
    name: '请求完整性',
    description: '确保每个请求都是用户真实意图的表达，而非被第三方伪造。',
    relatedTopics: ['csrf', 'jsonp-hijack', 'ssrf', 'open-redirect'],
  },
  {
    key: 'resource-isolation',
    name: '资源隔离策略',
    description: '通过策略头限制页面可以加载和执行的资源来源，防止恶意代码注入。',
    relatedTopics: ['csp', 'sri', 'cors', 'iframe-security'],
  },
  {
    key: 'data-protection',
    name: '数据保护',
    description: '保护敏感数据的存储、传输和访问安全。',
    relatedTopics: ['cookie-security', 'storage-security', 'sensitive-data', 'https-config'],
  },
  {
    key: 'supply-defense',
    name: '供应链防御',
    description: '确保从第三方引入的代码和依赖不包含恶意或已知漏洞。',
    relatedTopics: ['supply-chain', 'sri', 'prototype-pollution'],
  },
  {
    key: 'ui-defense',
    name: 'UI 交互防护',
    description: '防止用户界面被篡改或诱导，确保用户的操作确实体现了他们的真实意图。',
    relatedTopics: ['iframe-security', 'drag-drop', 'postmessage'],
  },
];

// ── OWASP Top 10 2021 ──

export interface OwaspItem {
  key: string;
  rank: number;
  name: string;
  description: string;
  frontendRelevance: string;
}

export const owaspData: OwaspItem[] = [
  {
    key: 'a01',
    rank: 1,
    name: 'Broken Access Control',
    description: '访问控制失效',
    frontendRelevance: '前端路由守卫不严格、按钮级权限判断缺失、CSRF Token 校验缺陷',
  },
  {
    key: 'a02',
    rank: 2,
    name: 'Cryptographic Failures',
    description: '加密机制失效',
    frontendRelevance: '前端加密算法误用、敏感数据传输未加密、HTTPS 降级攻击',
  },
  {
    key: 'a03',
    rank: 3,
    name: 'Injection',
    description: '注入攻击',
    frontendRelevance: 'XSS、CSS 注入、模板注入、前端不当拼接 SQL 参数',
  },
  {
    key: 'a04',
    rank: 4,
    name: 'Insecure Design',
    description: '不安全的设计',
    frontendRelevance: '敏感操作缺二次确认、无密码尝试限制、过度信任客户端校验',
  },
  {
    key: 'a05',
    rank: 5,
    name: 'Security Misconfiguration',
    description: '安全配置错误',
    frontendRelevance: 'CSP/CORS 配置过宽、Cookie 缺安全属性、Source Map/.env 泄露',
  },
  {
    key: 'a06',
    rank: 6,
    name: 'Vulnerable & Outdated Components',
    description: '脆弱和过时的组件',
    frontendRelevance: 'npm 依赖含已知 CVE、未及时升级、CDN 加载无 SRI 校验',
  },
  {
    key: 'a07',
    rank: 7,
    name: 'Identification & Auth Failures',
    description: '认证和授权失败',
    frontendRelevance: 'Token 存储不当、Session 固定攻击、OAuth 回调未校验',
  },
  {
    key: 'a08',
    rank: 8,
    name: 'Software & Data Integrity Failures',
    description: '软件和数据完整性失效',
    frontendRelevance: 'npm 依赖篡改、CDN 劫持、JSON.parse 恶意大对象导致 DoS',
  },
  {
    key: 'a09',
    rank: 9,
    name: 'Security Logging & Monitoring Failures',
    description: '安全日志和监控失效',
    frontendRelevance: '前端错误未上报、异常操作无埋点、攻击尝试无感知',
  },
  {
    key: 'a10',
    rank: 10,
    name: 'Server-Side Request Forgery (SSRF)',
    description: '服务端请求伪造',
    frontendRelevance: '前端传入的 URL/Webhook 被服务端直接请求、文件远程拉取功能',
  },
];

// ── 表格列定义 ──

export const topicColumns = [
  {
    title: '安全专题',
    dataIndex: 'name',
    key: 'name',
    width: 170,
    render: (text: string, record: SecurityTopic) => (
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
    title: '分类',
    dataIndex: 'category',
    key: 'category',
    width: 100,
    render: (cat: AttackType) => {
      const colorMap: Record<AttackType, string> = {
        注入类: 'magenta',
        请求伪造类: 'orange',
        配置缺陷类: 'blue',
        供应链类: 'purple',
        信息泄露类: 'cyan',
        逻辑绕过类: 'green',
      };
      return <Tag color={colorMap[cat]}>{cat}</Tag>;
    },
  },
  {
    title: '风险',
    dataIndex: 'riskLevel',
    key: 'riskLevel',
    width: 80,
    render: (level: RiskLevel) => {
      const colorMap: Record<RiskLevel, string> = {
        严重: 'red',
        高危: 'volcano',
        中危: 'gold',
        低危: 'blue',
      };
      return <Tag color={colorMap[level]}>{level}</Tag>;
    },
  },
  {
    title: '说明',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
  {
    title: '深度讲解',
    dataIndex: 'deepDive',
    key: 'deepDive',
    width: 90,
    render: (deep: boolean) => (deep ? <Tag color="green">✓ 已收录</Tag> : <Tag>待补充</Tag>),
  },
];

export const defenseColumns = [
  {
    title: '防护层次',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    render: (text: string, record: DefenseCategory) => (
      <>
        <Typography.Text strong>{text}</Typography.Text>
        <br />
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {record.key}
        </Typography.Text>
      </>
    ),
  },
  {
    title: '核心思路',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: '关联专题',
    dataIndex: 'relatedTopics',
    key: 'relatedTopics',
    render: (topics: string[]) => (
      <>
        {topics.map((t) => {
          const topic = securityTopics.find((s) => s.key === t);
          return topic ? (
            <Tag key={t} color="blue">
              {topic.name}
            </Tag>
          ) : null;
        })}
      </>
    ),
  },
];

export const owaspColumns = [
  {
    title: '排名',
    dataIndex: 'rank',
    key: 'rank',
    width: 60,
    render: (rank: number) => (
      <Tag color={rank <= 3 ? 'red' : rank <= 6 ? 'volcano' : 'default'}>{rank}</Tag>
    ),
  },
  {
    title: 'OWASP 分类',
    dataIndex: 'name',
    key: 'name',
    width: 280,
    render: (name: string, record: OwaspItem) => (
      <>
        <Typography.Text strong>{name}</Typography.Text>
        <br />
        <Typography.Text type="secondary">{record.description}</Typography.Text>
      </>
    ),
  },
  {
    title: '前端相关性',
    dataIndex: 'frontendRelevance',
    key: 'frontendRelevance',
  },
];
