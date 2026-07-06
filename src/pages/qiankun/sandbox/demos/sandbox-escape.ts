// ❌ 沙箱逃逸演示
// 展示子应用如何绕过 Proxy 拦截而直接操作真实 window

import { ProxySandbox } from './proxy-sandbox';

const sandbox = new ProxySandbox();
const proxyWindow = sandbox.getProxy() as any;

sandbox.active();

// ===== 方式 1：原型链污染 =====
// Proxy 的 fakeWindow 是 Object.create(null)，没有原型链
// 但子应用仍然可以通过 Object.prototype 污染全局
(Object.prototype as any).__polluted = 'yes';
console.log('Object.prototype 被污染:', ({} as any).__polluted);  // 'yes'

// ===== 方式 2：document.defaultView =====
// document.defaultView 返回的是真实 window
const realWindow = (proxyWindow.document as any).defaultView;
realWindow.__escaped = true;
console.log('通过 document.defaultView 逃逸:', (window as any).__escaped);  // true

// ===== 方式 3：创建新的 iframe =====
// 新 iframe 的 contentWindow 不受沙箱控制
// const iframe = document.createElement('iframe');
// document.body.appendChild(iframe);
// const iframeWindow = iframe.contentWindow;
// iframeWindow.__escaped = true;

// ===== 方式 4：闭包缓存 window 引用 =====
// 子应用在 mount 前就缓存了 window
// const cachedWindow = window;
// cachedWindow.__escaped = true;

sandbox.inactive();

// 总结：
// ProxySandbox 能拦截 window.xxx 的读写，
// 但不能拦截 Object.prototype、document.defaultView、
// iframe.contentWindow 等已知逃逸路径。
// qiankun 对已知路径做了针对性防御，
// 但理论上不可能 100% 拦截所有逃逸。
