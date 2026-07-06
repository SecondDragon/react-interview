export const sandboxComparisonTable = {
  columns: [
    { title: '特性', dataIndex: 'feature', key: 'feature' },
    { title: 'SnapshotSandbox', dataIndex: 'snapshot', key: 'snapshot' },
    { title: 'LegacySandbox', dataIndex: 'legacy', key: 'legacy' },
    { title: 'ProxySandbox', dataIndex: 'proxy', key: 'proxy' },
  ],
  dataSource: [
    { key: '1', feature: '技术', snapshot: '遍历 window 属性', legacy: 'Proxy 拦截 set', proxy: 'Proxy 拦截 get/set/has' },
    { key: '2', feature: '性能', snapshot: '差（遍历所有属性）', legacy: '好（只记录变动的）', proxy: '好' },
    { key: '3', feature: '安全性', snapshot: '低（运行期直接改 window）', legacy: '中（set 拦截但 get 穿透）', proxy: '高（get/set 均拦截）' },
    { key: '4', feature: '浏览器', snapshot: '全部兼容', legacy: 'Proxy（Chrome 49+）', proxy: 'Proxy（Chrome 49+）' },
    { key: '5', feature: 'qiankun 默认', snapshot: 'IE11 降级', legacy: '—', proxy: '现代浏览器默认' },
  ],
};

export const escapeTable = {
  columns: [
    { title: '逃逸方式', dataIndex: 'method', key: 'method' },
    { title: '代码示例', dataIndex: 'code', key: 'code' },
    { title: '防御策略', dataIndex: 'defense', key: 'defense' },
  ],
  dataSource: [
    { key: '1', method: '原型链污染', code: "Object.prototype.xxx = 'escape'", defense: 'fakeWindow = Object.create(null) 无原型链，可部分防御' },
    { key: '2', method: 'document.defaultView', code: 'const realWin = document.defaultView', defense: '拦截 getter 中 document 属性的访问' },
    { key: '3', method: '创建 iframe', code: 'const iframe = document.createElement("iframe"); iframe.contentWindow', defense: '较难防御，需劫持 createElement' },
    { key: '4', method: '闭包缓存 window', code: '子应用 mount 前就缓存了 window 引用', defense: '无法防御，需子应用配合' },
  ],
};
