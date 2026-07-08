import { Tag } from 'antd';
import React from 'react';

export const kernelColumns = [
  { title: '内核', dataIndex: 'kernel', key: 'kernel' },
  { title: '时序', dataIndex: 'sequence', key: 'sequence' },
  { title: '特征', dataIndex: 'behavior', key: 'behavior' },
];

export const kernelDataSource = [
  {
    key: '1',
    kernel: 'Chromium / Blink / WebKit (Chrome, Edge, Safari)',
    sequence: 'input → compositionend（现代内核的主流实现）',
    behavior:
      'input 代表 DOM 内容已变化，compositionend 代表输入法会话关闭，二者职责不同',
  },
  {
    key: '2',
    kernel: 'Gecko (Firefox)',
    sequence: 'compositionend → input（典型情况）',
    behavior:
      '规范未强制顺序，不同平台/输入法组合可能出现差异',
  },
];

export const envColumns = [
  { title: '运行环境', dataIndex: 'env', key: 'env', width: '18%' },
  { title: '输入法 / 上屏方式', dataIndex: 'ime', key: 'ime', width: '15%' },
  { title: '实际事件时序', dataIndex: 'sequence', key: 'sequence', width: '20%' },
  {
    title: '只解锁不补偿',
    dataIndex: 'naiveResult',
    key: 'naiveResult',
    width: '22%',
    render: (_: any, record: any) => React.createElement(Tag, { color: record.naiveTag }, record.naiveResult),
  },
  {
    title: '工业级完整实现',
    dataIndex: 'proResult',
    key: 'proResult',
    width: '25%',
    render: (_: any, record: any) => React.createElement(Tag, { color: record.proTag }, record.proResult),
  },
];

export const envDataSource = [
  {
    key: '1',
    env: 'Blink v120+ (Windows TSF)',
    ime: '微软拼音 / 空格上屏',
    sequence: 'input → compositionend（不补发 input）',
    naiveResult: '最后一个 input 被锁拦截，end 后无后续事件 → 汉字丢失',
    naiveTag: 'error',
    proResult: 'end 中主动补偿触发 doSearch，正常上屏',
    proTag: 'success',
  },
  {
    key: '2',
    env: 'Blink v120+ (Windows TSF)',
    ime: '微软拼音 / 数字选字',
    sequence: 'compositionend → input',
    naiveResult: '解锁后 input 正常触发 → 表面正常（侥幸）',
    naiveTag: 'warning',
    proResult: 'end + input 双触发，AbortController 去重',
    proTag: 'success',
  },
  {
    key: '3',
    env: 'Blink v100 (统信 UOS)',
    ime: '自带输入法 / 任意上屏',
    sequence: 'input(碎片) → compositionend（value 仍为拼音）',
    naiveResult: '锁拦截碎片，end 后无 input；若执行则拿到拼音 → 数据污染',
    naiveTag: 'error',
    proResult: 'end 中补偿触发，value 正确则正常（信创内核缺陷无法完全规避）',
    proTag: 'warning',
  },
  {
    key: '4',
    env: 'Blink v90 (麒麟 OS)',
    ime: 'Fcitx / 空格上屏',
    sequence: 'compositionend 不触发',
    naiveResult: 'isComposing 永远为 true，所有 input 被拦截 → 完全卡死',
    naiveTag: 'error',
    proResult: '同样无法解锁；需配合 beforeinput 或定时检测兜底',
    proTag: 'warning',
  },
  {
    key: '5',
    env: 'WebKit (macOS InputMethodKit)',
    ime: '原生拼音 / 选字上屏',
    sequence: 'input → compositionend',
    naiveResult: '最后一个 input 被拦截，end 后不补发 → 汉字丢失',
    naiveTag: 'error',
    proResult: 'end 中补偿触发，正常上屏',
    proTag: 'success',
  },
  {
    key: '6',
    env: 'Gecko (Linux IBus)',
    ime: 'Rime / 任意上屏',
    sequence: 'compositionend → input',
    naiveResult: '解锁后 input 触发 → 正常（侥幸）',
    naiveTag: 'warning',
    proResult: '双触发，通过请求 ID + AbortController 去重',
    proTag: 'success',
  },
  {
    key: '7',
    env: '微信内置浏览器 XWeb',
    ime: '微信键盘 / 选字',
    sequence: 'compositionend 触发多次',
    naiveResult: '解锁后无 input，end 多次触发 → 重复搜索',
    naiveTag: 'error',
    proResult: '多次补偿触发，AbortController 物理取消前序请求',
    proTag: 'success',
  },
  {
    key: '8',
    env: 'Blink v120+ (macOS)',
    ime: '搜狗输入法 / 数字选字',
    sequence: 'input → compositionend → 补发 input',
    naiveResult: '解锁后补发 input 触发 → 正常（运气）',
    naiveTag: 'warning',
    proResult: 'end 补偿 + 补发 input，双触发去重',
    proTag: 'success',
  },
];
