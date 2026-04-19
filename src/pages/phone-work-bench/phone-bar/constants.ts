// 坐席状态
export type AgentStatus = 'offline' | 'idle' | 'busy' | 'rest';

// 通话状态
export type CallStatus = 'none' | 'dialing' | 'ringing' | 'connected' | 'incoming';

// 坐席类型
export const agentTypes = [
  { value: 'normal', label: '普通坐席' },
  { value: 'skill', label: '技能坐席' },
  { value: 'supervisor', label: '班长坐席' },
];

// 外显号码
export const callerIds = [
  { value: '010-12345678', label: '010-12345678' },
  { value: '021-87654321', label: '021-87654321' },
  { value: '400-888-8888', label: '400-888-8888' },
];

// 技能组
export const skillGroups = [
  { value: 'sales', label: '销售组' },
  { value: 'service', label: '客服组' },
  { value: 'tech', label: '技术支持组' },
];

// 坐席列表
export const agents = [
  { value: '1001', label: '张三 (1001)' },
  { value: '1002', label: '李四 (1002)' },
  { value: '1003', label: '王五 (1003)' },
];

// 状态配置
export const statusConfig: Record<AgentStatus, { label: string; color: string; dotColor: string }> = {
  offline: { label: '离线', color: '#8c8c8c', dotColor: '#8c8c8c' },
  idle: { label: '空闲', color: '#52c41a', dotColor: '#52c41a' },
  busy: { label: '忙碌', color: '#ff4d4f', dotColor: '#ff4d4f' },
  rest: { label: '小休', color: '#faad14', dotColor: '#faad14' },
};
