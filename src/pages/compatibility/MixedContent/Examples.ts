/**
 * HTTPS 混合内容案例元数据
 */
export const MixedContentExamples = {
  title: 'HTTPS 环境下的混合内容拦截',
  reason: 'HTTPS 页面禁止发起 HTTP 请求。',
  phenomenon: '部分内网旧图片 or 接口无法加载。',
  bad: `<img src="http://bank.com/logo.png" />`,
  good: `<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">`,
};
