/**
 * Cookie SameSite 案例元数据
 */
export const BankCookieExamples = {
  title: 'Cookie SameSite 策略导致的登录态丢失',
  reason: 'Chrome 80+ 默认 SameSite=Lax 导致跨域无法携带 Cookie。',
  phenomenon: '微前端或 iframe 场景下无法保持登录。',
  bad: "document.cookie = 'token=xyz';",
  good: 'Set-Cookie: token=xyz; Secure; HttpOnly; SameSite=None;',
};
