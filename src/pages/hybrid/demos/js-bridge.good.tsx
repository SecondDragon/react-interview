// ✅ 最佳实践：基于注入式 JSBridge 的封装——安全、可靠、支持回调

// ===== Web 端 JSBridge 封装 =====
interface BridgeRequest {
  method: string;
  params: any;
  callbackId: number;
}

interface BridgeResponse {
  callbackId: number;
  data: any;
  error?: string;
}

class JSBridge {
  private callbackId = 0;
  // 回调注册表：通过 callbackId 映射 Promise resolve
  private callbacks = new Map<number, (data: any) => void>();

  // JS 调用 Native
  call<T = any>(method: string, params?: any): Promise<T> {
    return new Promise((resolve) => {
      const id = ++this.callbackId;
      this.callbacks.set(id, resolve);
      // 通过注入的全局对象传递（如 window.__bridge__）
      const request: BridgeRequest = { method, params, callbackId: id };
      window.__bridge__.postMessage(JSON.stringify(request));
      // 超时保护
      setTimeout(() => {
        if (this.callbacks.has(id)) {
          this.callbacks.delete(id);
          resolve({ error: 'Bridge call timeout' } as any);
        }
      }, 10000);
    });
  }

  // Native 回调 JS 的入口
  receiveResponse(response: BridgeResponse) {
    const callback = this.callbacks.get(response.callbackId);
    if (callback) {
      callback(response.data);
      this.callbacks.delete(response.callbackId);
    }
  }

  // 注册 Native 主动推送的事件处理
  on(event: string, handler: (data: any) => void) {
    window.__bridge_events__ = window.__bridge_events__ || {};
    window.__bridge_events__[event] = handler;
  }
}

// 全局单例
const bridge = new JSBridge();

// 使用示例 —— 漂亮、安全的 Promise 风格调用
async function getDeviceInfo() {
  try {
    const info = await bridge.call('getDeviceInfo');
    console.log('设备信息:', info);
    return info;
  } catch (err) {
    console.error('获取设备信息失败:', err);
  }
}

// 监听 Native 推送
bridge.on('networkChange', (data) => {
  console.log('网络状态变化:', data);
});

// ===== 原生端注入（概念示意）=====
// // Android: webView.addJavascriptInterface(bridge, "__bridge__")
// // iOS: wkUserContentController.addScriptMessageHandler(handler, "__bridge__")
//
// // Native 调用 JS 推送事件：
// // evaluateJavascript("window.__bridge_events__['networkChange']({status: 'offline'})")
