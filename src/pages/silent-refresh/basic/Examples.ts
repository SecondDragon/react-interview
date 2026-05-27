/**
 * Promise 链替换 - 基础篇案例元数据
 */
export const BasicExamples = {
  title: "Promise 链替换：Axios 拦截器中的\"偷天换日\"",

  problem: `// ❌ 错误示范：每个调用方自己处理 401
async function loadUsers() {
    try {
        const res = await request.get('/api/users')
        return res.data
    } catch (err) {
        if (err.response?.status === 401) {
            await refreshToken()   // 每个接口都要写！
            // 重试逻辑呢？写在哪里？
        }
    }
}`,

  solution: `// ✅ 正确：通过响应拦截器统一处理 401
const request = axios.create({ baseURL: '/api' })

// 响应拦截器 —— 错误处理函数
request.interceptors.response.use(
    (response) => response,  // 成功直接返回
    async (error) => {       // 失败尝试修复
        if (error.response?.status !== 401) {
            return Promise.reject(error)
        }
        // 🔑 关键：返回一个新 Promise，替换掉失败的旧 Promise
        return refreshAndRetry(error.config)
    }
)

async function refreshAndRetry(config) {
    const newToken = await refreshToken()
    config.headers.Authorization = \`Bearer \${newToken}\`
    // 用新 Token 重新发起原请求
    return request(config)  // ← 这个 Promise 会替代失败的 Promise
}`,

  naiveApproach: `// ❌ 没有拦截器，每个接口都要处理 401
// 问题1: 代码重复，N个接口写N遍
// 问题2: 并发请求同时401会刷新N次
// 问题3: 用户体验差（请求失败 → 刷新 → 手动重试）

async function getUsers() {
  try {
    const res = await fetch('/api/users', {
      headers: { Authorization: 'Bearer ' + getToken() }
    })
    if (res.status === 401) {
      await refreshToken()
      // 还得再发一次...但怎么优雅地重试？
      const retry = await fetch('/api/users', {
        headers: { Authorization: 'Bearer ' + getToken() }
      })
      return retry.json()
    }
    return res.json()
  } catch (err) {
    // 又要处理网络错误...
  }
}`,

  interceptorApproach: `// ✅ 拦截器统一处理，上层完全无感知
// 原理：错误拦截器返回一个新的 Promise，
// Axios 会用新 Promise 替换掉失败的那个

const api = axios.create({ baseURL: '/api' })

api.interceptors.response.use(
  res => res,
  async (error) => {
    // 只拦截 401，其他错误继续抛
    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }
    // 刷新 Token 并用新 Token 重试原请求
    const newToken = await refreshToken()
    error.config.headers.Authorization = \`Bearer \${newToken}\`
    return api(error.config)  // ← 替换 Promise 链
  }
)

// 上层调用方 —— 完全无感知！
async function getUsers() {
  const res = await api.get('/users')  // 即使 Token 过期也正常返回
  return res.data
}`,

  whyTitle: "为什么上层能无感知？",
  why: `Axios 拦截器的错误处理函数如果 return 一个新的 Promise，这个新 Promise 会替代原来失败的 Promise 继续向后传递。上层调用方 await 的是这一整条 Promise 链的最终结果，根本不知道中间经历了 401 → 刷新 → 重试的过程。就像快递中转站发现地址写错了，悄俏帮你修正后再发一次，你只收到"签收成功"的通知。`,

  bad_interceptor: `// ❌ 常见错误：忘记 return！
api.interceptors.response.use(
    null,
    (error) => {
        if (error.response?.status === 401) {
            refreshAndRetry(error.config)  // 没有 return！
            // 上层会收到 undefined，而不是正常响应
        }
    }
)`,

  good_interceptor: `// ✅ 正确：必须 return 新 Promise
api.interceptors.response.use(
    null,
    (error) => {
        if (error.response?.status === 401) {
            return refreshAndRetry(error.config)  // 替换 Promise 链
        }
        return Promise.reject(error)
    }
)`,
};
