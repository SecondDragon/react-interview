/**
 * 生产级 Token 无感刷新 - 案例元数据
 */
export const ProductionExamples = {
  title: "生产级 Token 无感刷新：并发去重 + 提前刷新 + 自动续签",

  concurrencyProblem: `// ❌ 问题：3 个请求同时触发，会刷新 3 次 Token
// 场景：页面加载时同时请求用户、订单、统计

await Promise.all([
    api.get('/users'),   // → 401 → 刷新 Token #1
    api.get('/orders'),  // → 401 → 刷新 Token #2（浪费！）
    api.get('/stats'),   // → 401 → 刷新 Token #3（浪费！）
])

// 网络请求数：1(刷新) × 3 = 3 次 /auth/refresh
// 实际只需要 1 次！`,

  concurrencyFix: `// ✅ 并发去重：用"锁 + 订阅者队列"保证只刷新一次

let isRefreshing = false  // 刷新锁
let subscribers = []      // 等待队列

async function refreshToken() {
    // 🔑 如果正在刷新，不重复发起，加入等待队列
    if (isRefreshing) {
        return new Promise((resolve) => {
            subscribers.push((token) => resolve(token))
        })
    }

    isRefreshing = true
    try {
        const res = await axios.post('/api/auth/refresh', { refreshToken })
        const newToken = res.data.accessToken

        // 通知所有等待中的请求：Token 到了！
        subscribers.forEach(cb => cb(newToken))
        subscribers = []
        return newToken
    } catch (err) {
        // 通知所有等待者：刷新失败
        subscribers.forEach(cb => cb(null))
        subscribers = []
        throw err
    } finally {
        isRefreshing = false
    }
}`,

  preemptiveCode: `// ✅ 主动预判：Token 快过期时提前刷新（请求拦截器）
// 避免等 401 了再被动处理

function isTokenExpiringSoon(token: string): boolean {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return Date.now() > payload.exp * 1000 - 5 * 60 * 1000 // 提前 5 分钟
}

api.interceptors.request.use(async (config) => {
    if (config.url?.includes('/auth/refresh')) return config

    let token = getToken()
    if (token && isTokenExpiringSoon(token)) {
        // 主动刷新，不等 401
        const newToken = await refreshToken()
        if (newToken) token = newToken
    }

    config.headers.Authorization = \`Bearer \${token}\`
    return config
})`,

  autoRenewCode: `// ✅ 后端响应头自动续签（Gateway / BFF 层下发新 Token）
// 无感、零延迟、不中断当前请求

api.interceptors.response.use(
    (response) => {
        // 检查响应头中是否有续签标记
        if (response.headers['x-token-renewed'] === 'true') {
            const newToken = response.headers['x-access-token']
            if (newToken) {
                localStorage.setItem('token', newToken)
            }
        }
        return response
    },
    async (error) => {
        // 即使请求失败，也要检查续签头
        if (error.response?.headers) {
            const renewed = error.response.headers['x-token-renewed']
            if (renewed === 'true') {
                localStorage.setItem('token', error.response.headers['x-access-token'])
            }
        }
        // 401 走正常的刷新+重试流程
        if (error.response?.status === 401) {
            return refreshAndRetry(error.config)
        }
        return Promise.reject(error)
    }
)`,

  fullArchitecture: `┌─────────────────────────────────────────────────────────┐
│                    三层防护架构                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  第 1 层：请求拦截器（主动预判）                          │
│  ├─ isTokenExpiringSoon() 提前 5 分钟刷新                │
│  └─ 在 401 发生前就完成 Token 更新                       │
│                                                         │
│  第 2 层：响应拦截器（被动修复）                          │
│  ├─ 捕获 401 → refreshAndRetry()                        │
│  ├─ 并发去重：isRefreshing + subscribers                 │
│  └─ Promise 链替换：return newPromise                    │
│                                                         │
│  第 3 层：响应头续签（零延迟）                            │
│  ├─ handleAutoRenewHeaders()                            │
│  └─ x-token-renewed / x-access-token                    │
│                                                         │
└─────────────────────────────────────────────────────────┘`,

  compareTable: {
    naive: { refreshes: '3 次', userExperience: '3 个请求都失败，需要手动重试', networkWaste: '高' },
    basic: { refreshes: '3 次 (各管各)', userExperience: '修复后重试，但刷新了 3 次', networkWaste: '中' },
    production: { refreshes: '1 次', userExperience: '完全无感知，只刷新 1 次', networkWaste: '无' },
  },
};
