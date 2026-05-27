# Promise 链替换：Axios 拦截器中的"偷天换日"

> 一种在请求失败时静默修复、让上层调用方完全无感知的技术模式。
>
> 本文档以 **Token 无感刷新** 为场景，完整讲解其原理、实现与最佳实践。

---

## 一、问题场景

前端应用使用 JWT 认证，AccessToken 有效期 30 分钟。用户在第 31 分钟点击按钮时：

```
用户点击 → 发请求（携带已过期 Token）→ 后端返回 401
```

** naive 的处理方式：**

```javascript
// ❌ 错误示范：每个调用方自己处理 401
async function loadUsers() {
    try {
        const res = await request.get('/api/users')
        return res.data
    } catch (err) {
        if (err.response?.status === 401) {
            // 刷新 Token
            await refreshToken()
            // 重试... 但重试逻辑写在哪？每个接口都要写？
        }
    }
}
```

**问题：**
- 每个调用方都要处理 401，代码重复
- 并发请求同时 401 时，会发起多次刷新
- 用户体验差（请求失败 → 刷新 → 手动重试）

---

## 二、核心思想：Promise 链替换

### 2.1 什么是 Promise 链替换？

在 Promise 链的某个中间节点，**拦截失败的 Promise，返回一个新的 Promise 替代它**。上层调用方永远只等待最终 resolved 的结果，对中间的"偷梁换柱"完全无感知。

```
原始调用链：
  await request() ──→ 发送请求 ──→ 收到 401 ──→ ❌ 失败

替换后：
  await request() ──→ 发送请求 ──→ 收到 401 ──→ 拦截器捕获
                                                            │
                                                            ▼
                                                    刷新 Token
                                                            │
                                                            ▼
                                                    重试原请求 ──→ ✅ 成功
                                                            │
                                                            ▼
                                                  返回正常响应（上层无感知）
```

### 2.2 形象比喻：快递中转站

想象你寄了一个快递（发起请求），但收件地址写错了（Token 过期），快递被退回（401）。

**没有拦截器：** 快递员直接把退回的包裹扔给你，你自己重新填写地址再寄一次。

**有拦截器：** 快递中转站自动识别"地址错误"，悄悄帮你修正地址，重新发一次。你最终只收到"签收成功"的通知，根本不知道中间被退回过。

---

## 三、Axios 拦截器的魔法

### 3.1 拦截器的返回值决定 Promise 链的走向

Axios 的响应拦截器（`response.use`）接收两个函数：

```javascript
axios.interceptors.response.use(
    (response) => { /* 成功时调用 */ },
    (error) => { /* 失败时调用 */ }
)
```

**关键规则：**

| 拦截器类型 | 返回值 | 效果 |
|-----------|--------|------|
| 成功拦截器 | `return response` | 继续传递 response |
| 成功拦截器 | `return Promise.reject(err)` | 转为错误 |
| **错误拦截器** | `return Promise.resolve(value)` | **转为成功！** |
| **错误拦截器** | `return newPromise` | **替换整个 Promise 链！** |
| 错误拦截器 | `throw err` / `return Promise.reject(err)` | 继续传递错误 |

**Promise 链替换的核心就是利用"错误拦截器返回一个新的 Promise"这一特性。**

### 3.2 代码演示

```javascript
import axios from 'axios'

const request = axios.create({ baseURL: '/api' })

// ========== 响应拦截器 ==========
request.interceptors.response.use(
    // 成功：直接返回
    (response) => response,

    // 失败：尝试修复
    async (error) => {
        const { config, response } = error

        // 只处理 401，其他错误继续抛
        if (response?.status !== 401) {
            return Promise.reject(error)
        }

        console.log('🔄 拦截到 401，开始静默修复...')

        // 🔑 关键：返回一个新的 Promise，替换掉失败的旧 Promise
        return refreshAndRetry(config)
    }
)

// ========== 刷新并重试 ==========
async function refreshAndRetry(config) {
    // 1. 刷新 Token
    const newToken = await refreshToken()

    // 2. 用新 Token 重新发一次原请求
    config.headers.Authorization = `Bearer ${newToken}`

    // 3. 返回新的请求 Promise
    // 这个 Promise 会替代拦截器捕获到的失败 Promise
    return request(config)
}

// ========== 上层调用方（完全无感知）==========
async function loadUsers() {
    // 即使 Token 过期，这里也永远拿到正常响应
    const res = await request.get('/users')
    console.log('✅ 用户列表：', res.data)
    return res.data
}
```

### 3.3 执行流程图解

```
loadUsers() 调用 request.get('/users')
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│  第 1 层：原始请求                                              │
│  request.get('/users') 携带旧 Token                            │
│       │                                                      │
│       ▼                                                      │
│  后端返回 401                                                  │
│       │                                                      │
│       ▼                                                      │
│  ❌ 原始 Promise 被拒绝（rejected）                             │
│       │                                                      │
│       ▼                                                      │
│  进入错误拦截器                                                 │
│       │                                                      │
│       ├── 判断：status === 401？是                             │
│       │                                                      │
│       ▼                                                      │
│  return refreshAndRetry(config)  ← 🔑 关键！返回新 Promise      │
│       │                                                      │
│       ▼                                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  第 2 层：修复流程（对上层完全透明）                      │   │
│  │       │                                              │   │
│  │       ▼                                              │   │
│  │  refreshToken() → 拿到新 Token                        │   │
│  │       │                                              │   │
│  │       ▼                                              │   │
│  │  request(config) → 用新 Token 重试原请求               │   │
│  │       │                                              │   │
│  │       ▼                                              │   │
│  │  后端返回 200 + 正常数据                               │   │
│  │       │                                              │   │
│  │       ▼                                              │   │
│  │  ✅ 新 Promise 被 resolve                             │   │
│  └──────────────────────────────────────────────────────┘   │
│       │                                                      │
│       ▼                                                      │
│  新 Promise 的结果被传回 loadUsers()                            │
│  （上层完全不知道中间经历了 401）                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 四、完整实战：Token 无感刷新（生产级）

### 4.1 完整代码

```typescript
/**
 * request.ts
 * 生产级 Axios 封装，支持 Token 无感刷新、并发去重、自动续签响应头
 */

import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

// ==================== 类型定义 ====================

interface ApiResult<T> {
    success: boolean
    code: string
    message: string
    data: T
}

interface LoginResult {
    accessToken: string
    refreshToken: string
    expiresIn: number
}

// ==================== 存储工具（简化版）====================

const storage = {
    get<T>(key: string): T | null {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : null
    },
    set(key: string, value: unknown): void {
        localStorage.setItem(key, JSON.stringify(value))
    },
    remove(key: string): void {
        localStorage.removeItem(key)
    },
}

const TOKEN_KEY = 'app_token'
const REFRESH_TOKEN_KEY = 'app_refresh_token'

// ==================== Token 刷新机制 ====================

let isRefreshing = false
let refreshSubscribers: Array<(token: string | null) => void> = []

/**
 * 订阅 Token 刷新结果
 * 用于并发请求：多个请求同时触发刷新时，只执行一次刷新，所有请求共享结果
 */
export function subscribeTokenRefresh(callback: (token: string | null) => void) {
    refreshSubscribers.push(callback)
}

/** 通知所有订阅者：刷新成功 */
function onTokenRefreshed(newToken: string) {
    refreshSubscribers.forEach((cb) => cb(newToken))
    refreshSubscribers = []
}

/** 通知所有订阅者：刷新失败 */
function onRefreshFailed() {
    refreshSubscribers.forEach((cb) => cb(null))
    refreshSubscribers = []
}

/** 判断 Token 是否即将过期（剩余时间 < 5 分钟） */
function isTokenExpiringSoon(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const exp = payload.exp * 1000
        return Date.now() > exp - 5 * 60 * 1000
    } catch {
        return false
    }
}

/**
 * 执行刷新 Token
 * 核心逻辑：
 * 1. 如果正在刷新中，加入订阅队列等待结果
 * 2. 否则发起刷新请求
 * 3. 成功/失败都通知所有订阅者
 */
export async function performRefresh(): Promise<string | null> {
    // 🔑 并发去重：如果正在刷新，不重复发起，而是等待结果
    if (isRefreshing) {
        return new Promise((resolve) => {
            subscribeTokenRefresh((token) => resolve(token))
        })
    }

    isRefreshing = true
    const refreshToken = storage.get<string>(REFRESH_TOKEN_KEY)

    if (!refreshToken) {
        isRefreshing = false
        onRefreshFailed()
        return null
    }

    try {
        const res = await axios.post<ApiResult<LoginResult>>(
            '/api/auth/refresh',
            { refreshToken },
            { timeout: 10000 } // 防止无限挂起
        )

        if (res.data.success && res.data.data) {
            const { accessToken, refreshToken: newRefreshToken } = res.data.data

            // 更新存储
            storage.set(TOKEN_KEY, accessToken)
            storage.set(REFRESH_TOKEN_KEY, newRefreshToken)

            // 通知所有等待中的请求
            onTokenRefreshed(accessToken)
            return accessToken
        }
    } catch (err) {
        console.error('[Token] 刷新失败', err)
    } finally {
        isRefreshing = false
        // 确保所有订阅者都被通知（无论成功或失败）
        if (refreshSubscribers.length > 0) {
            onRefreshFailed()
        }
    }

    return null
}

/** 处理认证失败：清理状态并跳转登录 */
function handleAuthFailure() {
    storage.remove(TOKEN_KEY)
    storage.remove(REFRESH_TOKEN_KEY)
    window.location.href = '/login'
}

/**
 * 处理后端自动续签响应头
 * 后端 Gateway 在 Token 临近过期时自动续签，通过响应头下发新 Token
 */
function handleAutoRenewHeaders(headers: any) {
    const renewed = headers['x-token-renewed']
    if (renewed !== 'true') return

    const newAccessToken = headers['x-access-token']
    if (!newAccessToken) return

    storage.set(TOKEN_KEY, newAccessToken)

    const newRefreshToken = headers['x-refresh-token']
    if (newRefreshToken) {
        storage.set(REFRESH_TOKEN_KEY, newRefreshToken)
    }
}

/**
 * 尝试刷新并重试原请求
 * 🔑 核心：返回一个新的 Promise，替换掉失败的旧 Promise
 */
async function tryRefreshAndRetry(config?: AxiosRequestConfig): Promise<AxiosResponse> {
    const newToken = await performRefresh()

    if (newToken && config) {
        // 克隆配置，避免修改原配置
        const newConfig = { ...config, headers: { ...config.headers } }
        newConfig.headers!.Authorization = `Bearer ${newToken}`
        ;(newConfig as any)._isRetry = true // 标记为重试请求

        // 🔑 返回新的请求 Promise，替换拦截器捕获到的失败 Promise
        return request(newConfig)
    }

    // 刷新失败，跳转登录
    handleAuthFailure()
    throw new Error('登录已过期')
}

// ==================== Axios 实例 ====================

const request: AxiosInstance = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// ==================== 请求拦截器 ====================

request.interceptors.request.use(
    async (config) => {
        // 跳过刷新接口本身，避免递归
        if (config.url?.includes('/auth/refresh')) {
            return config
        }

        let token = storage.get<string>(TOKEN_KEY)

        // 主动预判：Token 即将过期时提前静默刷新
        if (token && isTokenExpiringSoon(token)) {
            const newToken = await performRefresh()
            if (newToken) {
                token = newToken
            } else {
                handleAuthFailure()
                return Promise.reject(new Error('登录已过期'))
            }
        }

        // 注入 Token
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error)
)

// ==================== 响应拦截器 ====================

request.interceptors.response.use(
    // 成功响应
    (response: AxiosResponse<ApiResult<unknown>>) => {
        // 处理后端自动续签响应头
        handleAutoRenewHeaders(response.headers)
        return response
    },

    // 错误响应
    async (error: AxiosError<ApiResult<unknown>>) => {
        // 检查自动续签响应头（即使请求失败，Gateway 可能已完成续签）
        if (error.response?.headers) {
            handleAutoRenewHeaders(error.response.headers)
        }

        const status = error.response?.status
        const errorCode = error.response?.data?.code

        // 401: Token 过期，尝试刷新并重试
        if (status === 401 || errorCode === '401' || errorCode === 'UNAUTHORIZED') {
            console.log('[Token] 捕获 401，URL:', error.config?.url)
            // 🔑 关键：返回新的 Promise 替换失败的旧 Promise
            return tryRefreshAndRetry(error.config)
        }

        // 其他错误继续抛出
        return Promise.reject(error)
    }
)

export default request
```

### 4.2 使用示例

```typescript
// 任意组件/服务中调用，完全无感知

async function fetchUserList() {
    // 即使 Token 已过期，这里也永远拿到正常响应
    const res = await request.get('/users')
    return res.data
}

async function createUser(data: UserForm) {
    const res = await request.post('/users', data)
    return res.data
}

// 并发请求测试：同时发 3 个请求，只触发一次刷新
async function batchLoad() {
    const [users, orders, stats] = await Promise.all([
        request.get('/users'),
        request.get('/orders'),
        request.get('/stats'),
    ])
    return { users: users.data, orders: orders.data, stats: stats.data }
}
```

### 4.3 并发请求测试

```typescript
// 模拟场景：Token 已过期，同时触发 3 个请求

console.log('=== 并发请求测试 ===')

Promise.all([
    request.get('/api/a'),
    request.get('/api/b'),
    request.get('/api/c'),
]).then(([a, b, c]) => {
    console.log('✅ 全部成功', a.data, b.data, c.data)
}).catch(err => {
    console.log('❌ 失败', err.message)
})

// 预期输出：
// [Token] 捕获 401，URL: /api/a
// [Token] 刷新成功
// [Token] 捕获 401，URL: /api/b  ← 但 isRefreshing === true，进入订阅等待
// [Token] 捕获 401，URL: /api/c  ← 同上
// ✅ 全部成功 ...
//
// 网络层面：只发了 1 次 /auth/refresh + 3 次重试原请求
```

---

## 五、关键要点总结

### 5.1 为什么上层能无感知？

```
┌─────────────────────────────────────────────────────────────┐
│                     Promise 链替换的本质                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   上层：await request()                                     │
│        │                                                    │
│        │  等待的 Promise 被"替换"了                         │
│        │  但调用方不知道，也不关心                          │
│        │                                                    │
│        ▼                                                    │
│   拦截器：return newPromise  ← 关键！                       │
│        │                                                    │
│        │  新 Promise 最终 resolved                          │
│        │  上层收到正常结果                                  │
│        │                                                    │
│        ▼                                                    │
│   上层：const res = ...  ← 正常响应！                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 三个核心设计

| 设计 | 作用 | 代码位置 |
|------|------|---------|
| **Promise 链替换** | 让上层无感知 | `return tryRefreshAndRetry(config)` |
| **并发去重** | 多个请求同时 401 只刷新一次 | `isRefreshing` + `refreshSubscribers` |
| **订阅通知** | 等待中的请求共享刷新结果 | `subscribeTokenRefresh` + `onTokenRefreshed` |

### 5.3 常见误区

```javascript
// ❌ 错误：没有 return，上层收到 undefined
axios.interceptors.response.use(
    null,
    (error) => {
        if (error.response?.status === 401) {
            tryRefreshAndRetry(error.config)  // 没有 return！
        }
    }
)

// ✅ 正确：return 新的 Promise
axios.interceptors.response.use(
    null,
    (error) => {
        if (error.response?.status === 401) {
            return tryRefreshAndRetry(error.config)  // 替换 Promise 链
        }
        return Promise.reject(error)
    }
)
```

---

## 六、扩展应用

Promise 链替换不仅用于 Token 刷新，还可以用于：

| 场景 | 替换逻辑 |
|------|---------|
| **请求重试** | 网络错误时自动重试 N 次 |
| **接口降级** | 主接口失败时自动切换到备用接口 |
| **缓存回源** | 缓存 miss 时自动请求源站 |
| **限流等待** | 429 时自动等待后重试 |

核心模式始终是：**拦截器捕获失败 → 执行修复逻辑 → return 新的 Promise**。
