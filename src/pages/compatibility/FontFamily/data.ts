import { ColumnsType } from 'antd/es/table';

/**
 * 字体栈选项
 */
export interface FontOption {
  label: string;
  value: string;
  stack: string;
}

export const fontOptions: FontOption[] = [
  {
    label: '🚫 错误示范',
    value: 'bad',
    stack: '"Microsoft YaHei", sans-serif',
  },
  {
    label: '🍎 系统默认',
    value: 'apple',
    stack: '-apple-system, BlinkMacSystemFont, sans-serif',
  },
  {
    label: '🚀 最佳实践',
    value: 'best-practice',
    stack:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", "Source Han Sans CN", sans-serif',
  },
];

/**
 * 平台字体对照表数据
 */
export interface PlatformFontRecord {
  key: string;
  platform: string;
  fonts: string;
}

export const platformFontDataSource: PlatformFontRecord[] = [
  { key: '1', platform: 'iOS/macOS', fonts: 'PingFang SC (平方)' },
  { key: '2', platform: 'Windows', fonts: 'Microsoft YaHei (微软雅黑)' },
  { key: '3', platform: '信创/国产 Linux', fonts: 'Source Han Sans CN (思源黑体)' },
];

export const platformFontColumns: ColumnsType<PlatformFontRecord> = [
  { title: '平台', dataIndex: 'platform', key: 'platform' },
  { title: '推荐首选字体', dataIndex: 'fonts', key: 'fonts' },
];

/**
 * Live Demo 默认文本
 */
export const defaultDemoText =
  '测试文字：微软雅黑 vs 平方 vs 思源黑体。你可以修改这段文字，观察不同字体栈下的渲染细节。';
