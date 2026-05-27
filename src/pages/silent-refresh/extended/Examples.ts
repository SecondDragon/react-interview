/**
 * Promise 链替换：扩展模式
 */
export const ExtendedExamples = {
  title: "Promise 链替换扩展：重试 / 降级 / 缓存 / 限流",

  retry: `/**
 * 模式 1：指数退避自动重试
 * 场景：网络抖动、临时故障
 */
async function retryRequest(config, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await axios(config)
        } catch (err) {
            const isRetryable = !err.response || err.response.status >= 500
            if (!isRetryable || i === retries - 1) throw err
            // 指数退避：1s → 2s → 4s
            await new Promise(r => setTimeout(r, delay * Math.pow(2, i)))
        }
    }
}

// 响应拦截器
axios.interceptors.response.use(null, async (error) => {
    if (!error.response || error.response.status >= 500) {
        return retryRequest(error.config)  // ← 替换 Promise 链
    }
    return Promise.reject(error)
})`,

  fallback: `/**
 * 模式 2：接口降级 / 故障转移
 * 场景：主接口挂了，切到备用接口
 */
const primaryApi = axios.create({ baseURL: 'https://api-primary.example.com' })
const fallbackApi = axios.create({ baseURL: 'https://api-fallback.example.com' })

primaryApi.interceptors.response.use(null, async (error) => {
    // 主接口超时或 5xx → 降级到备用接口
    if (error.code === 'ECONNABORTED' || error.response?.status >= 500) {
        error.config.baseURL = fallbackApi.defaults.baseURL
        return fallbackApi(error.config)  // ← 替换 Promise 链
    }
    return Promise.reject(error)
})`,

  cache: `/**
 * 模式 3：缓存回源
 * 场景：网络故障时从 localStorage 读取缓存
 */
const cache = new Map()

axios.interceptors.response.use(null, async (error) => {
    // 网络断了 → 从缓存取
    if (!error.response && error.code === 'ERR_NETWORK') {
        const cached = cache.get(error.config.url)
        if (cached) {
            console.log('📦 从缓存返回:', error.config.url)
            return Promise.resolve({  // ← 构造正常响应替换
                data: cached,
                status: 200,
                statusText: 'OK (from cache)',
                headers: {},
                config: error.config,
            })
        }
    }
    return Promise.reject(error)
})`,

  rateLimit: `/**
 * 模式 4：限流等待
 * 场景：429 Too Many Requests → 读取 Retry-After 等待后重试
 */
axios.interceptors.response.use(null, async (error) => {
    if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 5
        console.log(\`⏳ 限流等待 \${retryAfter}s 后重试...\`)

        await new Promise(r => setTimeout(r, retryAfter * 1000))
        return axios(error.config)  // ← 替换 Promise 链
    }
    return Promise.reject(error)
})`,

  unifiedInterceptor: `/**
 * 🚀 统一拦截器：组合所有扩展模式
 * 按优先级依次尝试：缓存 → 重试 → 降级 → 限流 → 失败
 */
axios.interceptors.response.use(null, async (error) => {
    const { config, response } = error

    // 1. 429 限流 → 等待后重试
    if (response?.status === 429) {
        const retryAfter = response.headers['retry-after'] || 5
        await new Promise(r => setTimeout(r, retryAfter * 1000))
        return axios(config)
    }

    // 2. 401 认证 → 刷新 Token 重试
    if (response?.status === 401) {
        return tryRefreshAndRetry(config)
    }

    // 3. 5xx 服务器错误 → 指数退避重试
    if (response && response.status >= 500) {
        return retryWithBackoff(config, 3)
    }

    // 4. 网络掉线 → 缓存回源
    if (!response && cache.has(config.url)) {
        return Promise.resolve(makeCacheResponse(cache.get(config.url), config))
    }

    // 5. 超时/连接失败 → 降级到备用接口
    if (!response || error.code === 'ECONNABORTED') {
        return tryFallbackEndpoint(config)
    }

    return Promise.reject(error)
})`,

  patternTable: [
    { key: '1', pattern: 'Token 刷新', trigger: '401', action: '刷新 Token + 重试', code: 'return refreshAndRetry(config)' },
    { key: '2', pattern: '请求重试', trigger: '5xx / 网络错误', action: '指数退避重试 N 次', code: 'return retryWithBackoff(config, 3)' },
    { key: '3', pattern: '接口降级', trigger: '超时 / 5xx', action: '切换到备用 API', code: 'return fallbackApi(config)' },
    { key: '4', pattern: '缓存回源', trigger: '网络断开', action: '返回缓存数据', code: 'return Promise.resolve(cached)' },
    { key: '5', pattern: '限流等待', trigger: '429', action: '读 Retry-After 等待后重试', code: 'return delayThenRetry(config)' },
  ],
};
