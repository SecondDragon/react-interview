export interface CacheLayer {
  key: string;
  name: string;
  priority: number;
  speed: string;
  capacity: string;
  lifecycle: string;
  examples: string;
}

export const cacheLayers: CacheLayer[] = [
  {
    key: 'service-worker',
    name: 'Service Worker Cache',
    priority: 1,
    speed: '极快（JS 直接控制）',
    capacity: '取决于磁盘配额',
    lifecycle: '由 Service Worker 控制，可离线持久化',
    examples: 'PWA 离线包、预缓存的 JS/CSS',
  },
  {
    key: 'memory',
    name: 'Memory Cache',
    priority: 2,
    speed: '最快',
    capacity: '小（受 tab 内存限制）',
    lifecycle: '页面关闭即释放',
    examples: 'base64 小图、当前页高频脚本',
  },
  {
    key: 'disk',
    name: 'Disk Cache',
    priority: 3,
    speed: '较慢（需要磁盘 IO）',
    capacity: '大（几百 MB 级别）',
    lifecycle: '跨会话持久，可被浏览器清理',
    examples: '大图、字体、视频、低频 JS',
  },
  {
    key: 'push',
    name: 'Push Cache',
    priority: 4,
    speed: '快',
    capacity: '小',
    lifecycle: 'HTTP/2 会话期内有效',
    examples: 'HTTP/2 Server Push 推送的资源',
  },
];

export const layersColumns = [
  { title: '缓存层', dataIndex: 'name', key: 'name' },
  { title: '优先级', dataIndex: 'priority', key: 'priority' },
  { title: '速度', dataIndex: 'speed', key: 'speed' },
  { title: '容量', dataIndex: 'capacity', key: 'capacity' },
  { title: '生命周期', dataIndex: 'lifecycle', key: 'lifecycle' },
  { title: '典型资源', dataIndex: 'examples', key: 'examples' },
];

export const whyCacheList = [
  '减少网络请求，降低服务器带宽与负载',
  '加速页面渲染，提升首屏与二次访问体验',
  '在弱网或离线场景下保持核心功能可用',
  '减少用户流量消耗（尤其在移动端）',
];
