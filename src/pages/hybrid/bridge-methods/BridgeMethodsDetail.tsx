import React from 'react';
import { Collapse, Typography, Card, Tag, Space, Divider } from 'antd';
import CodeBlock from '@/components/CodeBlock';

const { Text, Title, Paragraph } = Typography;

const CodeSection: React.FC<{ language: string; title: string; code: string }> = ({
  language,
  title,
  code,
}) => (
  <>
    <Divider />
    <Title level={5}>{title}</Title>
    <CodeBlock code={code} language={language} showLineNumbers type="info" />
  </>
);

const bridgeMethodDetailPanels = [
  {
    key: 'urlScheme',
    label: (
      <Space>
        <Tag color="orange">1</Tag>
        <Text strong>URL Scheme 拦截</Text>
        <Tag>兼容性最优</Tag>
      </Space>
    ),
    extra: <Tag color="volcano">⭐ 最简单</Tag>,
    children: (
      <div>
        <Paragraph>
          <Text strong>核心原理：</Text>
          Web 端通过创建一个隐藏的 <Text code>iframe</Text> 或修改 <Text code>location.href</Text>，
          发起一个自定义 Scheme 的 URL（如 <Text code>jsbridge://getDeviceInfo?params=...</Text>）。
          原生端在 <Text code>WKNavigationDelegate</Text>（iOS）或 <Text code>WebViewClient</Text>（Android）中拦截该请求，解析 URL 参数并执行对应原生方法。
        </Paragraph>

        <CodeSection language="javascript" title="Web 端代码（JavaScript）" code={`// ===== Web 端：通过 iframe 发起 URL Scheme 请求 =====
const URLSchemeBridge = {
  _callbackId: 0,
  _callbacks: {},

  call(method, params = {}) {
    return new Promise((resolve, reject) => {
      const callbackId = ++this._callbackId;
      this._callbacks[callbackId] = { resolve, reject };

      const query = new URLSearchParams({
        method,
        params: JSON.stringify(params),
        callbackId: String(callbackId)
      }).toString();

      // 通过 iframe 发起自定义 URL 请求
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = \`jsbridge://call?$\{query}\`;
      document.body.appendChild(iframe);

      // 使用 requestAnimationFrame 确保 iframe 加载后被移除
      requestAnimationFrame(() => {
        document.body.removeChild(iframe);
      });

      // 10 秒超时保护
      setTimeout(() => {
        if (this._callbacks[callbackId]) {
          this._callbacks[callbackId].reject(new Error('Bridge call timeout'));
          delete this._callbacks[callbackId];
        }
      }, 10000);
    });
  },

  // 原生端通过 evaluateJavaScript 调用此方法回传结果
  _handleResponse(callbackId, error, data) {
    const cb = this._callbacks[callbackId];
    if (cb) {
      if (error) {
        cb.reject(new Error(error));
      } else {
        cb.resolve(data);
      }
      delete this._callbacks[callbackId];
    }
  }
};

// 使用示例
async function getDeviceInfo() {
  try {
    const info = await URLSchemeBridge.call('getDeviceInfo');
    console.log('设备信息:', info);
  } catch (err) {
    console.error('调用失败:', err);
  }
}
getDeviceInfo();`} />

        <CodeSection language="swift" title="iOS 端代码（Swift）" code={`// ===== iOS 端：WKWebView 拦截 URL Scheme =====
import UIKit
import WebKit

class URLSchemeViewController: UIViewController, WKNavigationDelegate {

    private var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()
        webView = WKWebView(frame: view.bounds)
        webView.navigationDelegate = self
        view.addSubview(webView)

        webView.load(URLRequest(url: URL(string: "https://your-app.com")!))
    }

    // MARK: - WKNavigationDelegate
    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.allow)
            return
        }

        // 拦截自定义 jsbridge:// scheme
        guard url.scheme == "jsbridge" else {
            decisionHandler(.allow)
            return
        }

        // 解析 URL
        let host = url.host ?? ""                          // 方法名: call
        let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        let params: [String: Any]
        let callbackId: String?

        if let queryItems = components?.queryItems {
            // 解析 method 参数
            let method = queryItems.first(where: { $0.name == "method" })?.value ?? ""

            // 解析 params 参数（JSON 字符串 -> 字典）
            if let paramsStr = queryItems.first(where: { $0.name == "params" })?.value,
               let data = paramsStr.data(using: .utf8),
               let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                params = json
            } else {
                params = [:]
            }

            callbackId = queryItems.first(where: { $0.name == "callbackId" })?.value

            // 执行原生方法
            let result = executeNativeMethod(method, params)

            // 通过 evaluateJavaScript 回调 JS
            if let cbId = callbackId,
               let resultData = try? JSONSerialization.data(withJSONObject: result),
               let resultStr = String(data: resultData, encoding: .utf8) {

                let escapedResult = resultStr
                    .replacingOccurrences(of: "\\\\", with: "\\\\\\\\")
                    .replacingOccurrences(of: "\\"", with: "\\\\\\"")
                    .replacingOccurrences(of: "\\n", with: "\\\\n")

                let js = "URLSchemeBridge._handleResponse(\(cbId), null, \(escapedResult));"
                webView.evaluateJavaScript(js, completionHandler: nil)
            }
        }

        // 取消导航（不加载该 URL）
        decisionHandler(.cancel)
    }

    // 原生方法执行器
    private func executeNativeMethod(_ method: String, _ params: [String: Any]) -> [String: Any] {
        switch method {
        case "getDeviceInfo":
            return [
                "platform": "iOS",
                "systemVersion": UIDevice.current.systemVersion,
                "deviceName": UIDevice.current.model,
                "batteryLevel": UIDevice.current.batteryLevel
            ]
        case "vibrate":
            if let duration = params["duration"] as? Int {
                AudioServicesPlaySystemSoundWithVibration(kSystemSoundID_Vibrate, nil, [
                    "Intensity": 1.0,
                    "Duration": duration
                ] as [String: Any])
                return ["success": true]
            }
            return ["success": false, "error": "Invalid duration"]
        default:
            return ["error": "Unknown method: \\(method)"]
        }
    }
}`} />

        <CodeSection language="kotlin" title="Android 端代码（Kotlin）" code={`// ===== Android 端：WebViewClient 拦截 URL Scheme =====
import android.annotation.SuppressLint
import android.os.Build
import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONObject

class URLSchemeActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?
                ): Boolean {
                    val url = request?.url ?: return false

                    // 拦截自定义 jsbridge:// scheme
                    if (url.scheme != "jsbridge") return false

                    val method = url.host ?: ""
                    val params = mutableMapOf<String, Any>()
                    var callbackId: String? = null

                    // 解析查询参数
                    url.getQueryParameter("method")?.let { method = it }
                    url.getQueryParameter("params")?.let { paramsStr ->
                        try {
                            val json = JSONObject(paramsStr)
                            json.keys().forEach { key ->
                                params[key] = json.get(key)
                            }
                        } catch (_: Exception) {}
                    }
                    callbackId = url.getQueryParameter("callbackId")

                    // 执行原生方法
                    val result = executeNativeMethod(method, params)

                    // 通过 evaluateJavascript 回调 JS
                    callbackId?.let { cbId ->
                        val resultJson = JSONObject(result as Map<*, *>).toString()
                            .replace("\\\\", "\\\\\\\\")
                            .replace("\\"", "\\\\\\"")
                        val js = "URLSchemeBridge._handleResponse($cbId, null, '$resultJson');"
                        view?.post {
                            view.evaluateJavascript(js, null)
                        }
                    }

                    return true // 拦截该 URL
                }
            }
            loadUrl("https://your-app.com")
        }
        setContentView(webView)
    }

    private fun executeNativeMethod(method: String, params: Map<String, Any>): Map<String, Any> {
        return when (method) {
            "getDeviceInfo" -> mapOf(
                "platform" to "Android",
                "apiLevel" to Build.VERSION.SDK_INT,
                "manufacturer" to Build.MANUFACTURER,
                "model" to Build.MODEL,
                "batteryLevel" to 0.85
            )
            "vibrate" -> {
                val duration = (params["duration"] as? Int) ?: 200
                (getSystemService(VIBRATOR_SERVICE) as? android.os.Vibrator)?.apply {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        vibrate(android.os.VibrationEffect.createOneShot(
                            duration.toLong(),
                            android.os.VibrationEffect.DEFAULT_AMPLITUDE
                        ))
                    } else {
                        @Suppress("DEPRECATION")
                        vibrate(duration.toLong())
                    }
                }
                mapOf("success" to true)
            }
            else -> mapOf("error" to "Unknown method: $method")
        }
    }
}`} />
      </div>
    ),
  },
  {
    key: 'jsi',
    label: (
      <Space>
        <Tag color="blue">2</Tag>
        <Text strong>JavaScript 上下文注入</Text>
        <Tag>性能最优</Tag>
      </Space>
    ),
    extra: <Tag color="geekblue">低延迟</Tag>,
    children: (
      <div>
        <Paragraph>
          <Text strong>核心原理：</Text>
          原生端通过 WebView 提供的 API 将原生对象或方法直接注入到 JavaScript 全局执行上下文中。
          iOS 使用 <Text code>WKUserScript</Text> 配合 <Text code>evaluateJavaScript</Text>；
          Android 使用 <Text code>addJavascriptInterface</Text> 注解注入 Java/Kotlin 对象。
          Web 端可以像调用普通 JS 函数一样直接调用原生方法，甚至支持同步返回值（Android）。
        </Paragraph>

        <CodeSection language="javascript" title="Web 端代码（JavaScript）" code={`// ===== Web 端：通过注入的全局对象直接调用原生 API =====
// Android 端通过 addJavascriptInterface 注入的 AndroidBridge 对象
// iOS 端通过 WKUserScript 注入的 webkit.messageHandlers 对象

// 统一封装，屏蔽平台差异
const JSIBridge = {
  isAndroid: typeof AndroidBridge !== 'undefined',
  isIOS: typeof webkit !== 'undefined' && webkit.messageHandlers,

  async call(method, params = {}) {
    if (this.isAndroid) {
      // Android：可以直接同步调用注入对象的方法
      // 但为了统一，我们封装为 Promise
      return new Promise((resolve, reject) => {
        try {
          // Android 注入的桥接对象，方法名映射到原生 @JavascriptInterface 方法
          const result = AndroidBridge.call(method, JSON.stringify(params));
          resolve(JSON.parse(result));
        } catch (err) {
          reject(err);
        }
      });
    }

    if (this.isIOS) {
      // iOS 通过 WKUserContentController 的 postMessage 机制
      return new Promise((resolve, reject) => {
        const callbackId = 'cb_' + Date.now() + '_' + Math.random().toString(36).slice(2);
        window[callbackId] = (result) => {
          resolve(result);
          delete window[callbackId];
        };
        try {
          webkit.messageHandlers.jsBridge.postMessage({
            method,
            params,
            callbackId
          });
        } catch (err) {
          reject(err);
          delete window[callbackId];
        }

        // 5 秒超时
        setTimeout(() => {
          if (window[callbackId]) {
            reject(new Error('Bridge call timeout'));
            delete window[callbackId];
          }
        }, 5000);
      });
    }

    throw new Error('Bridge not available');
  },

  // iOS 端主动推送事件给 Web
  onNativeEvent(event, data) {
    const handler = this._eventHandlers[event];
    if (handler) handler(data);
  },

  _eventHandlers: {},

  addEventListener(event, handler) {
    this._eventHandlers[event] = handler;
  }
};

// 使用示例
async function getBatteryStatus() {
  try {
    const battery = await JSIBridge.call('getBatteryInfo');
    document.getElementById('battery-level').textContent =
      \`电量: $\{battery.level}%\`;
  } catch (err) {
    console.error('获取电量失败:', err);
  }
}

// 监听原生推送事件
JSIBridge.addEventListener('networkChange', (data) => {
  console.log('网络状态变化:', data);
  updateNetworkIndicator(data.isConnected);
});`} />

        <CodeSection language="swift" title="iOS 端代码（Swift）" code={`// ===== iOS 端：通过 WKUserScript + WKUserContentController 注入 =====
import UIKit
import WebKit

class JSInjectViewController: UIViewController, WKScriptMessageHandler {

    private var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()
        setupWebView()
    }

    private func setupWebView() {
        let userContentController = WKUserContentController()

        // 注册消息处理器 - JS 可以通过 webkit.messageHandlers.jsBridge.postMessage() 调用
        userContentController.add(self, name: "jsBridge")

        // 注入初始化脚本到 JS 全局上下文
        let initScript = """
        window.JSIBridge = {
            isIOS: true,
            _eventHandlers: {}
        };
        """
        let userScript = WKUserScript(
            source: initScript,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: false
        )
        userContentController.addUserScript(userScript)

        let config = WKWebViewConfiguration()
        config.userContentController = userContentController

        webView = WKWebView(frame: view.bounds, configuration: config)
        view.addSubview(webView)

        webView.load(URLRequest(url: URL(string: "https://your-app.com")!))
    }

    // MARK: - WKScriptMessageHandler
    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        guard message.name == "jsBridge",
              let body = message.body as? [String: Any] else { return }

        let method = body["method"] as? String ?? ""
        let params = body["params"] as? [String: Any] ?? [:]
        let callbackId = body["callbackId"] as? String ?? ""

        // 执行原生方法
        let result = executeNativeMethod(method, params)

        // 通过 evaluateJavaScript 将结果传回 JS
        if let resultData = try? JSONSerialization.data(withJSONObject: result),
           let resultStr = String(data: resultData, encoding: .utf8) {

            let escaped = resultStr
                .replacingOccurrences(of: "\\\\", with: "\\\\\\\\")
                .replacingOccurrences(of: "\\"", with: "\\\\\\"")
            let js = "window['\\(callbackId)'](\\(escaped));"
            webView.evaluateJavaScript(js, completionHandler: nil)
        }
    }

    // 原生主动推送事件到 JS
    func pushEventToJS(event: String, data: [String: Any]) {
        guard let dataData = try? JSONSerialization.data(withJSONObject: data),
              let dataStr = String(data: dataData, encoding: .utf8) else { return }

        let js = "JSIBridge.onNativeEvent('\\(event)', \\(dataStr));"
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    private func executeNativeMethod(_ method: String, _ params: [String: Any]) -> [String: Any] {
        switch method {
        case "getBatteryInfo":
            UIDevice.current.isBatteryMonitoringEnabled = true
            return [
                "level": Int(UIDevice.current.batteryLevel * 100),
                "charging": UIDevice.current.batteryState == .charging
            ]
        case "getLocation":
            return ["lat": 39.9042, "lng": 116.4074] // 示例坐标
        case "openAlbum":
            // 打开系统相册（实际需处理 UIImagePickerController）
            return ["success": true, "message": "Album opened"]
        default:
            return ["error": "Unknown method: \\(method)"]
        }
    }

    // 示例：监听网络状态变化并推送给 JS
    @objc private func networkStatusChanged(_ notification: Notification) {
        let isConnected = true // 实际从 Reachability 获取
        pushEventToJS(event: "networkChange", data: [
            "isConnected": isConnected,
            "type": "WiFi"
        ])
    }
}`} />

        <CodeSection language="kotlin" title="Android 端代码（Kotlin）" code={`// ===== Android 端：通过 addJavascriptInterface 注入对象 =====
import android.annotation.SuppressLint
import android.os.Build
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONObject

class JSInjectActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    // 被注入到 JS 上下文的桥接类
    // 注意：方法必须加 @JavascriptInterface 注解（Android 4.2+ 安全要求）
    class NativeBridge(private val activity: JSInjectActivity) {

        @JavascriptInterface
        fun call(method: String, paramsJson: String): String {
            val params = try {
                val json = JSONObject(paramsJson)
                val map = mutableMapOf<String, Any>()
                json.keys().forEach { key -> map[key] = json.get(key) }
                map
            } catch (_: Exception) {
                emptyMap()
            }

            val result = executeNativeMethod(method, params)
            return JSONObject(result as Map<*, *>).toString()
        }

        @JavascriptInterface
        fun getDeviceInfo(): String {
            val info = mapOf(
                "platform" to "Android",
                "apiLevel" to Build.VERSION.SDK_INT,
                "manufacturer" to Build.MANUFACTURER,
                "model" to Build.MODEL,
                "appVersion" to "1.0.0"
            )
            return JSONObject(info).toString()
        }

        private fun executeNativeMethod(method: String, params: Map<String, Any>): Map<String, Any> {
            return when (method) {
                "getBatteryInfo" -> {
                    // 实际需注册 BatteryManager 广播接收器
                    mapOf("level" to 85, "charging" to true)
                }
                "getLocation" -> mapOf("lat" to 39.9042, "lng" to 116.4074)
                "vibrate" -> {
                    val duration = (params["duration"] as? Int) ?: 200
                    activity.vibrateDevice(duration)
                    mapOf("success" to true)
                }
                else -> mapOf("error" to "Unknown method: $method")
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this).apply {
            settings.javaScriptEnabled = true

            // 注入桥接对象到 JS 全局作用域
            // JS 端可以直接调用 AndroidBridge.call() / AndroidBridge.getDeviceInfo()
            addJavascriptInterface(NativeBridge(this@JSInjectActivity), "AndroidBridge")

            loadUrl("https://your-app.com")
        }
        setContentView(webView)
    }

    private fun vibrateDevice(duration: Int) {
        val vibrator = getSystemService(VIBRATOR_SERVICE) as? android.os.Vibrator
        vibrator?.let {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                it.vibrate(android.os.VibrationEffect.createOneShot(
                    duration.toLong(),
                    android.os.VibrationEffect.DEFAULT_AMPLITUDE
                ))
            } else {
                @Suppress("DEPRECATION")
                it.vibrate(duration.toLong())
            }
        }
    }
}`} />
      </div>
    ),
  },
  {
    key: 'postMessage',
    label: (
      <Space>
        <Tag color="green">3</Tag>
        <Text strong>postMessage 双向通信</Text>
        <Tag>标准 API</Tag>
      </Space>
    ),
    extra: <Tag color="green">安全推荐</Tag>,
    children: (
      <div>
        <Paragraph>
          <Text strong>核心原理：</Text>
          利用 WebView 内置的 <Text code>postMessage</Text> 标准化消息 API 实现双向通信。
          iOS 通过 <Text code>WKUserContentController</Text> 注册消息处理器，Web 端通过{' '}
          <Text code>window.webkit.messageHandlers</Text> 发送消息。
          Android 通过 <Text code>WebView</Text> 的 <Text code>@JavascriptInterface</Text> 配合{' '}
          <Text code>postMessage</Text> 约定的消息格式。
          这是目前 Apple 和 Google 官方推荐的桥接方式。
        </Paragraph>

        <CodeSection language="javascript" title="Web 端代码（JavaScript）" code={`// ===== Web 端：通过 postMessage 标准化 API 通信 =====
const PostMessageBridge = {
  _callbackId: 0,
  _callbacks: new Map(),
  _eventHandlers: new Map(),

  async call(method, params = {}) {
    return new Promise((resolve, reject) => {
      const callbackId = ++this._callbackId;
      this._callbacks.set(callbackId, { resolve, reject });

      const message = {
        type: 'bridge_call',
        callbackId,
        method,
        params
      };

      if (typeof Android !== 'undefined' && Android?.postMessage) {
        // Android：通过注入对象的 postMessage 发送
        Android.postMessage(JSON.stringify(message));
      } else if (window.webkit?.messageHandlers?.jsBridge) {
        // iOS：通过 WKUserContentController postMessage
        window.webkit.messageHandlers.jsBridge.postMessage(message);
      } else {
        // 降级方案：通过 window.postMessage（同源 iframe 通信场景）
        window.postMessage(message, '*');
      }

      // 10 秒超时保护
      setTimeout(() => {
        if (this._callbacks.has(callbackId)) {
          this._callbacks.get(callbackId).reject(new Error('Bridge timeout'));
          this._callbacks.delete(callbackId);
        }
      }, 10000);
    });
  },

  // 处理原生端返回的结果
  _handleNativeResponse(response) {
    const { callbackId, error, data } = response;
    const cb = this._callbacks.get(callbackId);
    if (cb) {
      if (error) {
        cb.reject(new Error(error));
      } else {
        cb.resolve(data);
      }
      this._callbacks.delete(callbackId);
    }
  },

  // 处理原生端推送的事件
  onNativeEvent(event, data) {
    const handler = this._eventHandlers.get(event);
    if (handler) handler(data);
  },

  addEventListener(event, handler) {
    this._eventHandlers.set(event, handler);
  },

  removeEventListener(event) {
    this._eventHandlers.delete(event);
  }
};

// 监听原生端通过 window.postMessage 推送的消息（降级方案）
window.addEventListener('message', (event) => {
  if (event.data?.type === 'native_push') {
    PostMessageBridge.onNativeEvent(
      event.data.event,
      event.data.data
    );
  }
});

// 使用示例：调用支付
async function requestPayment(order) {
  try {
    const result = await PostMessageBridge.call('startPayment', {
      orderId: order.id,
      amount: order.total,
      channel: 'wechat'
    });
    if (result.success) {
      showPaymentSuccess();
    }
  } catch (err) {
    showPaymentError(err.message);
  }
}

// 监听原生推送的网络变化
PostMessageBridge.addEventListener('networkChange', (data) => {
  updateConnectionStatus(data.isConnected);
});`} />

        <CodeSection language="swift" title="iOS 端代码（Swift）" code={`// ===== iOS 端：通过 WKUserContentController 注册消息处理器 =====
import UIKit
import WebKit

class PostMessageViewController: UIViewController, WKScriptMessageHandler {

    private var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()
        setupWebView()
    }

    private func setupWebView() {
        let userContentController = WKUserContentController()
        // 注册消息处理器 - 对应 JS 端 webkit.messageHandlers.jsBridge
        userContentController.add(self, name: "jsBridge")

        let config = WKWebViewConfiguration()
        config.userContentController = userContentController

        webView = WKWebView(frame: view.bounds, configuration: config)
        view.addSubview(webView)

        webView.load(URLRequest(url: URL(string: "https://your-app.com")!))
    }

    // MARK: - WKScriptMessageHandler
    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        guard message.name == "jsBridge",
              let body = message.body as? [String: Any],
              let type = body["type"] as? String,
              type == "bridge_call" else { return }

        let method = body["method"] as? String ?? ""
        let params = body["params"] as? [String: Any] ?? [:]
        let callbackId = body["callbackId"] as? Int ?? 0

        // 执行原生方法
        let result = executeNativeMethod(method, params)

        // 通过 evaluateJavaScript 返回结果
        if let resultData = try? JSONSerialization.data(withJSONObject: result, options: []),
           let resultStr = String(data: resultData, encoding: .utf8) {

            let response = """
            PostMessageBridge._handleNativeResponse({
                callbackId: \(callbackId),
                data: \(resultStr),
                error: null
            });
            """
            webView.evaluateJavaScript(response, completionHandler: nil)
        }
    }

    // 原生主动推送事件到 JS
    func pushEvent(event: String, data: [String: Any]) {
        guard let dataData = try? JSONSerialization.data(withJSONObject: data),
              let dataStr = String(data: dataData, encoding: .utf8) else { return }

        let js = """
        PostMessageBridge.onNativeEvent('\(event)', \(dataStr));
        """
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    private func executeNativeMethod(_ method: String, _ params: [String: Any]) -> [String: Any] {
        switch method {
        case "startPayment":
            // 调起原生支付 SDK
            let amount = params["amount"] as? Double ?? 0
            let channel = params["channel"] as? String ?? ""
            print("发起支付: ¥\\(amount) via \\(channel)")
            return ["success": true, "transactionId": "TXN\\(Int(Date().timeIntervalSince1970))"]

        case "openCamera":
            // 打开系统相机
            return ["success": true, "imagePath": "/tmp/captured_photo.jpg"]

        case "getContacts":
            // 读取通讯录（需用户授权）
            return ["contacts": [
                ["name": "张三", "phone": "13800138000"],
                ["name": "李四", "phone": "13900139000"]
            ]]

        default:
            return ["error": "Unknown method: \\(method)"]
        }
    }
}`} />

        <CodeSection language="kotlin" title="Android 端代码（Kotlin）" code={`// ===== Android 端：通过 @JavascriptInterface + postMessage 约定通信 =====
import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONObject
import org.json.JSONArray

class PostMessageActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    class BridgeInterface(private val activity: PostMessageActivity) {

        // JS 端通过 Android.postMessage(JSON.stringify(msg)) 调用
        @JavascriptInterface
        fun postMessage(messageJson: String) {
            try {
                val msg = JSONObject(messageJson)
                val type = msg.optString("type")
                if (type != "bridge_call") return

                val method = msg.optString("method")
                val callbackId = msg.optInt("callbackId")

                val paramsObj = msg.optJSONObject("params")
                val params = mutableMapOf<String, Any>()
                paramsObj?.keys()?.forEach { key ->
                    params[key] = paramsObj.get(key)
                }

                // 在主线程执行原生方法
                activity.runOnUiThread {
                    val result = activity.executeNativeMethod(method, params)
                    // 回调 JS
                    activity.callbackJS(callbackId, result)
                }
            } catch (_: Exception) {}
        }

        // JS 也可以直接调用同步方法
        @JavascriptInterface
        fun getSyncData(): String {
            return JSONObject(mapOf(
                "platform" to "Android",
                "version" to Build.VERSION.SDK_INT
            )).toString()
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            addJavascriptInterface(BridgeInterface(this@PostMessageActivity), "Android")
            loadUrl("https://your-app.com")
        }
        setContentView(webView)
    }

    private fun callbackJS(callbackId: Int, result: Map<String, Any>) {
        val resultJson = JSONObject(result).toString()
            .replace("\\\\", "\\\\\\\\")
            .replace("\\"", "\\\\\\"")
        val js = """
            PostMessageBridge._handleNativeResponse({
                callbackId: $callbackId,
                data: $resultJson,
                error: null
            });
        """.trimIndent()
        webView.evaluateJavascript(js, null)
    }

    // 原生主动推送事件
    fun pushEventToJS(event: String, data: Map<String, Any>) {
        val dataJson = JSONObject(data).toString()
            .replace("\\\\", "\\\\\\\\")
            .replace("\\"", "\\\\\\"")
        val js = "PostMessageBridge.onNativeEvent('$event', $dataJson);"
        webView.evaluateJavascript(js, null)
    }

    private fun executeNativeMethod(method: String, params: Map<String, Any>): Map<String, Any> {
        return when (method) {
            "startPayment" -> {
                val amount = (params["amount"] as? Double) ?: 0.0
                val channel = params["channel"] as? String ?: "unknown"
                // 调起微信/支付宝支付 SDK
                mapOf("success" to true, "transactionId" to "TXN_\${System.currentTimeMillis()}")
            }
            "openCamera" -> {
                // 启动相机 Intent
                mapOf("success" to true, "imagePath" to "/sdcard/DCIM/photo_2024.jpg")
            }
            "getLocation" -> {
                // 获取 GPS 定位
                mapOf("lat" to 39.9042, "lng" to 116.4074, "accuracy" to 10.0)
            }
            else -> mapOf("error" to "Unknown method: $method")
        }
    }
}`} />
      </div>
    ),
  },
  {
    key: 'websocket',
    label: (
      <Space>
        <Tag color="purple">4</Tag>
        <Text strong>WebSocket 桥接</Text>
        <Tag>全双工</Tag>
      </Space>
    ),
    extra: <Tag color="purple">实时通信</Tag>,
    children: (
      <div>
        <Paragraph>
          <Text strong>核心原理：</Text>
          原生端在 App 内部启动一个轻量级的本地 WebSocket Server（绑定 127.0.0.1 的随机端口），
          Web 端通过 <Text code>new WebSocket('ws://127.0.0.1:port')</Text> 建立连接。
          双方通过 WebSocket 帧进行全双工通信，支持文本（JSON）和二进制数据。
          这种方式可以跨 WebView 实例共享连接，且无 URL 长度限制。
        </Paragraph>

        <CodeSection language="javascript" title="Web 端代码（JavaScript）" code={`// ===== Web 端：通过 WebSocket 连接本地原生 Server =====
class WebSocketBridge {
  constructor(port = 0) {
    this.ws = null;
    this._callbackId = 0;
    this._callbacks = new Map();
    this._eventHandlers = new Map();
    this._connected = false;
    this._pendingCalls = [];
    this._reconnectAttempts = 0;
    this._maxReconnectAttempts = 5;
    this._port = port;
  }

  // 连接前先通过 JSI 获取端口号
  async connect(port) {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(\`ws://127.0.0.1:$\{port}\`);

        this.ws.onopen = () => {
          this._connected = true;
          this._reconnectAttempts = 0;
          // 发送挂起的调用
          while (this._pendingCalls.length > 0) {
            this.ws.send(this._pendingCalls.shift());
          }
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'bridge_response' && msg.callbackId) {
              // 处理调用响应
              const cb = this._callbacks.get(msg.callbackId);
              if (cb) {
                if (msg.error) {
                  cb.reject(new Error(msg.error));
                } else {
                  cb.resolve(msg.data);
                }
                this._callbacks.delete(msg.callbackId);
              }
            } else if (msg.type === 'native_push') {
              // 处理原生推送事件
              const handler = this._eventHandlers.get(msg.event);
              if (handler) handler(msg.data);
            }
          } catch (_) {}
        };

        this.ws.onclose = () => {
          this._connected = false;
          this.autoReconnect(port);
        };

        this.ws.onerror = (err) => {
          reject(err);
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  autoReconnect(port) {
    if (this._reconnectAttempts >= this._maxReconnectAttempts) return;
    this._reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this._reconnectAttempts), 30000);
    console.log(\`WebSocket 断开，$\{delay}ms 后重连 ($\{this._reconnectAttempts}/$\{this._maxReconnectAttempts})\`);
    setTimeout(() => this.connect(port), delay);
  }

  async call(method, params = {}) {
    const callbackId = ++this._callbackId;

    return new Promise((resolve, reject) => {
      this._callbacks.set(callbackId, { resolve, reject });

      const message = JSON.stringify({
        type: 'bridge_call',
        callbackId,
        method,
        params
      });

      if (this._connected && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(message);
      } else {
        this._pendingCalls.push(message);
      }

      // 30 秒超时（WebSocket 场景调用可能耗时较长）
      setTimeout(() => {
        if (this._callbacks.has(callbackId)) {
          this._callbacks.get(callbackId).reject(new Error('WebSocket bridge timeout'));
          this._callbacks.delete(callbackId);
        }
      }, 30000);
    });
  }

  addEventListener(event, handler) {
    this._eventHandlers.set(event, handler);
  }

  removeEventListener(event) {
    this._eventHandlers.delete(event);
  }

  disconnect() {
    this._reconnectAttempts = this._maxReconnectAttempts; // 阻止重连
    this.ws?.close();
    this._callbacks.clear();
  }
}

// 使用示例：IM 聊天
const wsBridge = new WebSocketBridge();

async function initBridge() {
  // 先通过 JSI 获取本地 WebSocket 端口号
  const config = await JSIBridge.call('getBridgeConfig');
  await wsBridge.connect(config.wsPort);

  // 监听消息推送
  wsBridge.addEventListener('newMessage', (msg) => {
    appendMessage(msg.sender, msg.content, msg.timestamp);
  });

  wsBridge.addEventListener('typing', (data) => {
    showTypingIndicator(data.sender, data.isTyping);
  });
}

// 发送聊天消息
async function sendChatMessage(conversationId, content) {
  const result = await wsBridge.call('sendMessage', {
    conversationId,
    content,
    type: 'text'
  });
  return result.messageId;
}`} />

        <CodeSection language="swift" title="iOS 端代码（Swift）- 本地 WebSocket Server" code={`// ===== iOS 端：使用 Network.framework 启动本地 WebSocket Server =====
import UIKit
import WebKit
import Network

class WebSocketBridgeViewController: UIViewController {

    private var webView: WKWebView!
    private var listener: NWListener!
    private var connections: [NWConnection] = []
    private let queue = DispatchQueue(label: "ws-bridge")

    override func viewDidLoad() {
        super.viewDidLoad()
        startLocalWebSocketServer()
        setupWebView()
    }

    // 启动本地 WebSocket Server
    private func startLocalWebSocketServer() {
        do {
            // 监听 127.0.0.1 的随机端口
            let params = NWParameters(tls: nil, tcp: .init())
            params.allowLocalEndpointReuse = true

            let wsOptions = NWProtocolWebSocket.Options()
            wsOptions.autoReplyPing = true
            params.defaultProtocolStack.applicationProtocols.insert(wsOptions, at: 0)

            listener = try NWListener(using: params, on: .loopback)
            listener.service = .init(type: "_ws._tcp", domain: "local")

            listener.newConnectionHandler = { [weak self] connection in
                self?.handleNewConnection(connection)
            }

            listener.stateUpdateHandler = { state in
                print("WebSocket Server state: \\(state)")
            }

            listener.start(queue: queue)

            // 获取分配的端口号
            if let port = listener.port {
                print("本地 WebSocket Server 启动在端口: \\(port)")
                // 通过 JS 上下文注入将端口号传给 Web
                let js = "window.__BRIDGE_WS_PORT__ = \\(port);"
                DispatchQueue.main.async {
                    self.webView.evaluateJavaScript(js, completionHandler: nil)
                }
            }
        } catch {
            print("启动 WebSocket Server 失败: \\(error)")
        }
    }

    private func handleNewConnection(_ connection: NWConnection) {
        connections.append(connection)

        connection.stateUpdateHandler = { [weak self] state in
            switch state {
            case .ready:
                self?.receiveMessage(on: connection)
            case .failed(let error):
                print("连接失败: \\(error)")
                self?.connections.removeAll { $0 === connection }
            case .cancelled:
                self?.connections.removeAll { $0 === connection }
            default:
                break
            }
        }
        connection.start(queue: queue)
    }

    private func receiveMessage(on connection: NWConnection) {
        connection.receiveMessage { [weak self] content, context, isComplete, error in
            guard let self = self else { return }

            if let data = content,
               let messageStr = String(data: data, encoding: .utf8),
               let messageData = messageStr.data(using: .utf8),
               let json = try? JSONSerialization.jsonObject(with: messageData) as? [String: Any],
               let type = json["type"] as? String {

                if type == "bridge_call" {
                    let method = json["method"] as? String ?? ""
                    let params = json["params"] as? [String: Any] ?? [:]
                    let callbackId = json["callbackId"] as? Int ?? 0

                    let result = self.executeNativeMethod(method, params)

                    // 发送响应
                    if let responseData = try? JSONSerialization.data(withJSONObject: [
                        "type": "bridge_response",
                        "callbackId": callbackId,
                        "data": result,
                        "error": NSNull()
                    ]) {
                        connection.send(content: responseData, completion: .contentProcessed { _ in })
                    }
                }
            }

            // 继续接收下一条消息
            if isComplete == false {
                self.receiveMessage(on: connection)
            }
        }
    }

    // 原生主动推送事件到所有已连接的 WebSocket 客户端
    func broadcastEvent(event: String, data: [String: Any]) {
        guard let payloadData = try? JSONSerialization.data(withJSONObject: [
            "type": "native_push",
            "event": event,
            "data": data
        ]) else { return }

        for connection in connections {
            connection.send(content: payloadData, completion: .contentProcessed { _ in })
        }
    }

    private func executeNativeMethod(_ method: String, _ params: [String: Any]) -> [String: Any] {
        switch method {
        case "sendMessage":
            let content = params["content"] as? String ?? ""
            let conversationId = params["conversationId"] as? String ?? ""
            // 调用 IM SDK 发送消息
            return [
                "messageId": "MSG_\\(Int(Date().timeIntervalSince1970))",
                "timestamp": Int(Date().timeIntervalSince1970 * 1000),
                "status": "sent"
            ]
        case "getBridgeConfig":
            return ["wsPort": listener.port?.rawValue ?? 0]
        case "uploadFile":
            let data = params["data"] as? String ?? ""
            // 处理二进制文件上传
            return ["url": "https://cdn.example.com/file.jpg", "size": data.count]
        default:
            return ["error": "Unknown method: \\(method)"]
        }
    }

    private func setupWebView() {
        let config = WKWebViewConfiguration()
        webView = WKWebView(frame: view.bounds, configuration: config)
        view.addSubview(webView)
        webView.load(URLRequest(url: URL(string: "https://your-app.com")!))
    }
}`} />

        <CodeSection language="kotlin" title="Android 端代码（Kotlin）- 本地 WebSocket Server" code={`// ===== Android 端：使用 OkHttp 启动本地 WebSocket Server =====
import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity
import okhttp3.*
import okio.ByteString
import org.json.JSONObject
import java.net.InetSocketAddress
import java.util.concurrent.ConcurrentHashMap

class WebSocketBridgeActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private val server = LocalWebSocketServer()
    private val clients = ConcurrentHashMap.newKeySet<WebSocket>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 启动本地 WebSocket Server
        server.start(0) { clientSocket ->
            clients.add(clientSocket)
            handleClientMessage(clientSocket)
        }

        // 将端口号注入到 JS 上下文
        @SuppressLint("SetJavaScriptEnabled")
        webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            addJavascriptInterface(object {
                @android.webkit.JavascriptInterface
                fun getBridgeConfig(): String {
                    return JSONObject(mapOf(
                        "wsPort" to server.port
                    )).toString()
                }
            }, "AndroidBridge")
            loadUrl("https://your-app.com")
        }
        setContentView(webView)
    }

    private fun handleClientMessage(clientSocket: WebSocket) {
        // 在 OkHttp WebSocket 回调中处理消息
        // 实际需通过 server 的回调机制处理
    }

    // 广播事件到所有连接的客户端
    private fun broadcastEvent(event: String, data: Map<String, Any>) {
        val message = JSONObject(mapOf(
            "type" to "native_push",
            "event" to event,
            "data" to JSONObject(data)
        )).toString()

        clients.forEach { client ->
            client.send(message)
        }
    }
}

// 轻量级本地 WebSocket Server 封装
class LocalWebSocketServer {

    var port: Int = 0
        private set

    private var serverSocket: java.net.ServerSocket? = null
    private var isRunning = false
    private val executor = java.util.concurrent.Executors.newCachedThreadPool()

    fun start(localPort: Int, onClientConnect: (WebSocket) -> Unit) {
        try {
            serverSocket = java.net.ServerSocket()
            serverSocket?.bind(InetSocketAddress("127.0.0.1", localPort))
            port = serverSocket?.localPort ?: 0
            println("本地 WebSocket Server 启动在端口: $port")
            isRunning = true

            executor.submit {
                while (isRunning) {
                    try {
                        val client = serverSocket?.accept() ?: continue
                        executor.submit {
                            handleWebSocketUpgrade(client, onClientConnect)
                        }
                    } catch (_: Exception) {}
                }
            }
        } catch (e: Exception) {
            println("启动 WebSocket Server 失败: \${e.message}")
        }
    }

    private fun handleWebSocketUpgrade(
        client: java.net.Socket,
        onClientConnect: (WebSocket) -> Unit
    ) {
        try {
            val reader = client.getInputStream().bufferedReader()
            val writer = client.getOutputStream()

            // 读取 HTTP 升级请求
            val requestLine = reader.readLine() ?: return
            val headers = mutableMapOf<String, String>()
            var line: String?
            while (reader.readLine().also { line = it } != null) {
                if (line.isNullOrEmpty()) break
                val colonIdx = line.indexOf(':')
                if (colonIdx > 0) {
                    headers[line.substring(0, colonIdx).trim()] =
                        line.substring(colonIdx + 1).trim()
                }
            }

            val webSocketKey = headers["Sec-WebSocket-Key"] ?: return
            val acceptKey = generateAcceptKey(webSocketKey)

            // 发送 HTTP 101 Switching Protocols 响应
            writer.write("HTTP/1.1 101 Switching Protocols\\r\\n")
            writer.write("Upgrade: websocket\\r\\n")
            writer.write("Connection: Upgrade\\r\\n")
            writer.write("Sec-WebSocket-Accept: $acceptKey\\r\\n")
            writer.write("\\r\\n")
            writer.flush()

            // 创建 WebSocket 包装对象
            val ws = WebSocket(client, reader, writer) { message ->
                // 处理收到的消息
                handleMessage(message)
            }
            onClientConnect(ws)

        } catch (_: Exception) {}
    }

    private fun generateAcceptKey(key: String): String {
        val magic = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
        import java.security.MessageDigest
        val digest = MessageDigest.getInstance("SHA-1")
            .digest((key + magic).toByteArray())
        return java.util.Base64.getEncoder().encodeToString(digest)
    }

    private fun handleMessage(message: String) {
        try {
            val json = JSONObject(message)
            val type = json.optString("type")
            if (type == "bridge_call") {
                val method = json.optString("method")
                val callbackId = json.optInt("callbackId")
                val paramsObj = json.optJSONObject("params")
                val params = mutableMapOf<String, Any>()
                paramsObj?.keys()?.forEach { k -> params[k] = paramsObj.get(k) }

                val result = executeNativeMethod(method, params)

                val response = JSONObject(mapOf(
                    "type" to "bridge_response",
                    "callbackId" to callbackId,
                    "data" to JSONObject(result as Map<*, *>),
                    "error" to JSONObject.NULL
                )).toString()
                // 发送响应...（通过 client WebSocket 对象）
            }
        } catch (_: Exception) {}
    }

    private fun executeNativeMethod(method: String, params: Map<String, Any>): Map<String, Any> {
        return when (method) {
            "sendMessage" -> mapOf(
                "messageId" to "MSG_\${System.currentTimeMillis()}",
                "timestamp" to System.currentTimeMillis(),
                "status" to "sent"
            )
            "uploadFile" -> mapOf(
                "url" to "https://cdn.example.com/file.jpg",
                "size" to 102400
            )
            "startLiveStreaming" -> mapOf(
                "streamUrl" to "rtmp://live.example.com/stream",
                "success" to true
            )
            else -> mapOf("error" to "Unknown method: $method")
        }
    }

    fun stop() {
        isRunning = false
        serverSocket?.close()
    }

    // 简化的 WebSocket 包装类
    class WebSocket(
        private val socket: java.net.Socket,
        private val reader: java.io.BufferedReader,
        private val writer: java.io.OutputStream,
        private val onMessage: (String) -> Unit
    ) {
        fun send(message: String) {
            try {
                val frame = encodeTextFrame(message)
                writer.write(frame)
                writer.flush()
            } catch (_: Exception) {}
        }

        private fun encodeTextFrame(text: String): ByteArray {
            val payload = text.toByteArray()
            val frame = java.io.ByteArrayOutputStream()
            frame.write(0x81) // FIN + text opcode
            if (payload.size < 126) {
                frame.write(payload.size)
            } else if (payload.size < 65536) {
                frame.write(126)
                frame.write((payload.size shr 8) and 0xFF)
                frame.write(payload.size and 0xFF)
            } else {
                frame.write(127)
                // 实际需处理 8 字节长度
            }
            frame.write(payload)
            return frame.toByteArray()
        }

        fun close() {
            socket.close()
        }
    }
}`} />
      </div>
    ),
  },
];

const BridgeMethodsDetail: React.FC = () => {
  return (
    <Card style={{ marginBottom: 24 }}>
      <Collapse
        accordion
        defaultActiveKey={['urlScheme']}
        items={bridgeMethodDetailPanels}
        style={{ background: 'transparent' }}
      />
    </Card>
  );
};

export default BridgeMethodsDetail;
