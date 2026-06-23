/* ❌ 错误：用 == 判断空值 */
function fetchUser(id) {
  if (id == null) {
    // 虽然能同时覆盖 null 和 undefined，但意图不明确
    return Promise.reject('id 不能为空');
  }
}

/* ❌ 错误：默认值处理逻辑混乱 */
function greet(name) {
  // 如果用户显式传入 null，仍然会使用默认值，可能不是预期行为
  const finalName = name || '匿名用户';
  return `你好，${finalName}`;
}

/* ❌ 错误：把 undefined 和 null 混为一谈 */
function updateConfig(config) {
  // 错误：undefined 表示"未设置"，null 可能表示"显式清空"
  // 这里统一覆盖，会丢失"显式清空"的语义
  return { ...defaultConfig, ...config };
}

/* ❌ 错误：JSON 序列化时不区分 undefined 和 null */
const payload = {
  id: 1,
  nickname: undefined, // 会被丢弃，导致后端接收不到该字段
  avatar: null,        // 会保留为 null
};
fetch('/api/user', {
  method: 'POST',
  body: JSON.stringify(payload),
});