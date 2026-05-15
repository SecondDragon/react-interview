import React from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Tag } from 'antd';

interface CodeDiffProps {
  /** 左侧/旧代码（对比模式下必填） */
  oldValue?: string;
  /** 右侧/新代码（对比模式下必填） */
  newValue?: string;
  /** 单代码展示模式下的代码内容 */
  code?: string;
  language?: string;
  /** 左侧标题 */
  leftTitle?: string;
  /** 右侧标题 */
  rightTitle?: string;
  /** 单代码展示时的标题 */
  title?: string;
  /** 展示类型：error=反面教材, success=最佳实践, info=参考 */
  type?: 'error' | 'success' | 'info' | 'warning';
  showLineNumbers?: boolean;
  /** 是否隐藏 diff 标记（只展示左右代码，不标红绿差异） */
  hideDiffMarkers?: boolean;
}

/**
 * 统一代码展示组件
 * - 单代码模式：当只传 code 时，使用 react-syntax-highlighter 展示
 * - 对比模式：当传 oldValue + newValue 时，使用 react-diff-viewer 展示
 * - 支持隐藏 diff 标记，只做左右并列展示
 */
const CodeDiff: React.FC<CodeDiffProps> = ({
  oldValue,
  newValue,
  code,
  language = 'typescript',
  leftTitle,
  rightTitle,
  title,
  type = 'info',
  showLineNumbers = true,
  hideDiffMarkers = false,
}) => {
  const colorMap = {
    error: { border: '#ffa39e', bg: '#fff1f0', label: 'Bad Practice', tagColor: 'red' as const },
    success: { border: '#b7eb8f', bg: '#f6ffed', label: 'Best Practice', tagColor: 'green' as const },
    warning: { border: '#ffe58f', bg: '#fffbe6', label: 'Alternative', tagColor: 'orange' as const },
    info: { border: '#d9d9d9', bg: '#fafafa', label: 'Reference', tagColor: 'blue' as const },
  };

  const currentTheme = colorMap[type];

  // ========== 单代码展示模式 ==========
  if (code !== undefined && oldValue === undefined && newValue === undefined) {
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
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: '16px',
            fontSize: '13px',
            lineHeight: '1.6',
            borderRadius: 0,
          }}
        >
          {code?.trim()}
        </SyntaxHighlighter>
      </div>
    );
  }

  // ========== 对比展示模式 ==========
  const isDiffMode = oldValue !== undefined && newValue !== undefined;

  if (!isDiffMode) {
    return (
      <div style={{ padding: 16, color: '#999' }}>
        请传入 code（单代码展示）或 oldValue + newValue（对比展示）
      </div>
    );
  }

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
        <span>{title || '代码对比'}</span>
        <Tag color={currentTheme.tagColor}>{currentTheme.label}</Tag>
      </div>

      <ReactDiffViewer
        oldValue={oldValue?.trim()}
        newValue={newValue?.trim()}
        splitView={true}
        hideLineNumbers={!showLineNumbers}
        showDiffOnly={false}
        disableWordDiff={hideDiffMarkers}
        leftTitle={leftTitle}
        rightTitle={rightTitle}
        styles={{
          variables: {
            light: {
              diffViewerBackground: '#fafafa',
              gutterBackground: '#f0f0f0',
              gutterBackgroundDark: '#e8e8e8',
              addedBackground: hideDiffMarkers ? '#fafafa' : '#f6ffed',
              addedColor: hideDiffMarkers ? '#262626' : '#237804',
              removedBackground: hideDiffMarkers ? '#fafafa' : '#fff1f0',
              removedColor: hideDiffMarkers ? '#262626' : '#cf1322',
              wordAddedBackground: hideDiffMarkers ? 'transparent' : '#b7eb8f',
              wordRemovedBackground: hideDiffMarkers ? 'transparent' : '#ffa39e',
              emptyLineBackground: '#fafafa',
            },
          },
          diffContainer: {
            fontSize: '13px',
            lineHeight: '1.6',
          },
          line: {
            fontFamily: 'monospace',
          },
        }}
      />
    </div>
  );
};

export default CodeDiff;
