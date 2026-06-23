import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// 选用常用的 vs-dark 主题，符合程序员审美
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Tag } from 'antd';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  type?: 'error' | 'success' | 'info' | 'warning';
  showLineNumbers?: boolean;
}

/**
 * 专业的代码展示组件 - 基于 react-syntax-highlighter
 * 适用于：教程、技术博客、案例对比
 */
const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'typescript',
  title,
  type = 'info',
  showLineNumbers = true,
}) => {
  // 定义颜色映射
  const colorMap = {
    error: { border: '#ffa39e', bg: '#fff1f0', label: 'Bad Practice', tagColor: 'red' },
    success: { border: '#b7eb8f', bg: '#f6ffed', label: 'Best Practice', tagColor: 'green' },
    warning: { border: '#ffe58f', bg: '#fffbe6', label: 'Alternative', tagColor: 'orange' },
    info: { border: '#d9d9d9', bg: '#fafafa', label: 'Reference', tagColor: 'blue' },
  };

  const currentTheme = colorMap[type];

  return (
    <div
      style={{
        margin: '16px 0',
        border: `1px solid ${currentTheme.border}`,
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      {/* 顶部标题栏 */}
      {title && (
        <div
          style={{
            padding: '10px 16px',
            background: currentTheme.bg,
            borderBottom: `1px solid ${currentTheme.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 'bold',
          }}
        >
          <span>{title}</span>
          <Tag color={currentTheme.tagColor}>{currentTheme.label}</Tag>
        </div>
      )}

      {/* 代码渲染区 */}
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          padding: '16px',
          fontSize: '13px',
          lineHeight: '1.6',
          borderRadius: 0, // 覆盖默认圆角，使用外层 Card 的圆角
        }}
      >
        {code?.trim()}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
