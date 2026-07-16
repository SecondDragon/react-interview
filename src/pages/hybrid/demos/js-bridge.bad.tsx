// ❌ 反面教材：使用 URL Scheme 手写桥接——简陋、不安全、难维护

// ===== Web 端 =====
// 每次调用都要手动拼接 URL，参数需手动 encode
function callNative(method: string, params: Record<string, string>) {
  const query = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  // URL 长度限制 2KB，大参数直接截断！
  const url = `jsbridge://call?method=${method}&${query}`;
  // 使用 iframe 或 location.href 触发
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  // 无法获取返回值！只能单向通知
  setTimeout(() => document.body.removeChild(iframe), 100);
}

// 获取设备信息 —— 根本拿不到返回值！
callNative('getDeviceInfo', {});
// 震动 —— 传了就丢了，不知道成功没有
callNative('vibrate', { duration: '200' });

// ===== 原生端（伪代码）=====
// 拦截 URL Scheme
// shouldOverrideUrlLoading(WebView view, String url) {
//   if (url.startsWith("jsbridge://")) {
//     // 手动解析 URL 参数——极易出错
//     String method = extractParam(url, "method");
//     // 无法返回结果给 JS！
//     return true;
//   }
//   return false;
// }
