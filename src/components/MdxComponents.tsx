import React from 'react';

/**
 * 创建带 mdx- 前缀类名的 Markdown 元素包装器
 *
 * 背景说明：
 * 本项目同时使用了 Ant Design 和 MDX。Ant Design 的全局 CSS（尤其是 .ant-layout 内部）
 * 会对 h1-h6、p、ul、li 等原生 HTML 标签做重置（例如设置 font-size: inherit），
 * 导致 MDX 渲染出的 Markdown 标题和段落失去默认大小，看起来像普通正文。
 *
 * 解决思路：
 * 不通过 styled-components 的嵌套选择器去覆盖 Ant Design 样式，也不去修改全局 Ant Design 主题。
 * 而是利用 MDX 的 components 映射机制，给所有由 Markdown 原生渲染出来的 HTML 元素
 * 添加一个特殊的 "mdx-*" 类名，然后在全局 CSS 中只针对这些类名恢复 Markdown 默认样式。
 *
 * 这样有两个好处：
 * 1. 只影响 Markdown 原生元素，不影响 Ant Design 组件（Card、Button、Table 等）的样式。
 * 2. 全局统一配置，后续新增 .mdx 页面无需重复处理。
 *
 * 使用方式：
 * 1. 在 vite.config.ts 中配置 mdx({ providerImportSource: '@mdx-js/react' })
 * 2. 在 App.tsx 中使用 <MDXProvider components={mdxComponents}> 包裹应用
 * 3. 在全局 CSS（src/styles/mdx.css）中定义 .mdx-* 的样式
 */
const createMdxElement = (
  tag: keyof JSX.IntrinsicElements,
  className: string,
): React.FC<React.HTMLAttributes<HTMLElement>> => {
  const MdxElement: React.FC<React.HTMLAttributes<HTMLElement>> = (props) => {
    const Tag = tag as React.ElementType;
    const combinedClassName = props.className
      ? `${className} ${props.className}`
      : className;
    return <Tag {...props} className={combinedClassName} />;
  };
  return MdxElement;
};

/**
 * 全局 MDX 组件映射
 *
 * 作用：让 MDX 在渲染 Markdown 原生元素时，自动为它们添加 mdx-* 类名。
 *
 * 例如：
 * - Markdown 的 # 标题 会渲染成 <h1 class="mdx-heading mdx-h1">
 * - Markdown 的段落 会渲染成 <p class="mdx-paragraph">
 * - Markdown 的列表 会渲染成 <ul class="mdx-list mdx-unordered-list">
 *
 * 注意：这里只映射 Markdown 原生元素，不映射 React 组件（如 Card、Button 等）。
 * Ant Design 组件仍然保持其原有类名（如 ant-card、ant-btn），不会被 mdx-* 影响。
 */
export const mdxComponents = {
  h1: createMdxElement('h1', 'mdx-heading mdx-h1'),
  h2: createMdxElement('h2', 'mdx-heading mdx-h2'),
  h3: createMdxElement('h3', 'mdx-heading mdx-h3'),
  h4: createMdxElement('h4', 'mdx-heading mdx-h4'),
  h5: createMdxElement('h5', 'mdx-heading mdx-h5'),
  h6: createMdxElement('h6', 'mdx-heading mdx-h6'),
  p: createMdxElement('p', 'mdx-paragraph'),
  ul: createMdxElement('ul', 'mdx-list mdx-unordered-list'),
  ol: createMdxElement('ol', 'mdx-list mdx-ordered-list'),
  li: createMdxElement('li', 'mdx-list-item'),
  a: createMdxElement('a', 'mdx-link'),
  strong: createMdxElement('strong', 'mdx-strong'),
  em: createMdxElement('em', 'mdx-em'),
  code: createMdxElement('code', 'mdx-code'),
  pre: createMdxElement('pre', 'mdx-pre'),
  blockquote: createMdxElement('blockquote', 'mdx-blockquote'),
  hr: createMdxElement('hr', 'mdx-hr'),
  table: createMdxElement('table', 'mdx-table'),
  thead: createMdxElement('thead', 'mdx-thead'),
  tbody: createMdxElement('tbody', 'mdx-tbody'),
  tr: createMdxElement('tr', 'mdx-tr'),
  th: createMdxElement('th', 'mdx-th'),
  td: createMdxElement('td', 'mdx-td'),
};

export default mdxComponents;
