/* ✅ 正确：明确区分 undefined 和 null 的语义 */
function fetchUser(id: string | undefined) {
  if (id === undefined) {
    return Promise.reject('id 未提供');
  }
  // null 在这里表示"无此用户"，与 undefined 区分
}

/* ✅ 正确：使用空值合并运算符 ?? */
function greet(name: string | null | undefined) {
  // 只有 null / undefined 才会触发默认值，空字符串不会
  const finalName = name ?? '匿名用户';
  return `你好，${finalName}`;
}

/* ✅ 正确：尊重显式清空语义 */
function updateConfig(userConfig?: Partial<Config>) {
  // undefined：未设置，保持默认
  // null：显式清空，覆盖默认
  return {
    theme: userConfig?.theme === undefined ? defaultConfig.theme : userConfig.theme,
    lang: userConfig?.lang === undefined ? defaultConfig.lang : userConfig.lang,
  };
}

/* ✅ 正确：显式删除 undefined 字段或保留为 null */
const payload = {
  id: 1,
  nickname: undefined,
  avatar: null,
};
// 方案一：丢弃未设置字段
const cleanedPayload = Object.fromEntries(
  Object.entries(payload).filter(([, v]) => v !== undefined)
);
// 方案二：统一转为 null 发送给后端
const normalizedPayload = Object.fromEntries(
  Object.entries(payload).map(([k, v]) => [k, v === undefined ? null : v])
);