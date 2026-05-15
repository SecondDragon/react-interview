import React from 'react';
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
 * - 对比模式：当传 oldValue + newValue 时，使用双列 SyntaxHighlighter 展示
 * - 黑色底色 (vscDarkPlus)，支持代码语法高亮
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
    error: { border: '#ff4d4f', bg: '#2b1d1d', label: '反面教材', tagColor: 'red' as const },
    success: { border: '#52c41a', bg: '#1d2b1d', label: '最佳实践', tagColor: 'green' as const },
    warning: { border: '#faad14', bg: '#2b261d', label: '替代方案', tagColor: 'orange' as const },
    info: { border: '#434343', bg: '#1a1a1a', label: '参考代码', tagColor: 'blue' as const },
  };

  const currentTheme = colorMap[type];

  // 代码高亮容器的统一样式
  const highlighterCustomStyle: React.CSSProperties = {
    margin: 0,
    padding: '16px',
    fontSize: '13px',
    lineHeight: '1.6',
    borderRadius: 0,
    background: '#1e1e1e',
  };

  // ========== 单代码展示模式 ==========
  if (code !== undefined && oldValue === undefined && newValue === undefined) {
    return (
      <div
        style={{
          margin: '16px 0',
          border: `1px solid ${currentTheme.border}`,
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        {title && (
          <div
            style={{
              padding: '10px 16px',
              // background: currentTheme.bg,
              borderBottom: `1px solid ${currentTheme.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontWeight: 'bold',
              // color: '#e0e0e0',
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
          customStyle={highlighterCustomStyle}
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
        // border: `1px solid ${currentTheme.border}`,
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      {/* 顶部标题栏 */}
      <div
        style={{
          padding: '10px 16px',
          // background: currentTheme.bg,
          borderBottom: `1px solid #e0e0e0`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold',
          // color: '#e0e0e0',
        }}
      >
        <span>{title || '代码对比'}</span>
        <Tag color={currentTheme.tagColor}>{currentTheme.label}</Tag>
      </div>

      {/* 双列代码对比 */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}>
        {/* 左侧：旧代码 */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            borderRight: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {leftTitle && (
            <div
              style={{
                padding: '8px 16px',
                background: hideDiffMarkers ? '#1e1e1e' : '#2b1d1d',
                borderBottom: '1px solid #333',
                fontSize: '12px',
                fontWeight: 'bold',
                color: hideDiffMarkers ? '#999' : '#ff7875',
                textAlign: 'center',
              }}
            >
              {leftTitle}
            </div>
          )}
          <div style={{ flex: 1, background: hideDiffMarkers ? '#1e1e1e' : '#2b1d1d' }}>
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              showLineNumbers={showLineNumbers}
              customStyle={{
                ...highlighterCustomStyle,
                background: 'transparent',
              }}
            >
              {oldValue?.trim()}
            </SyntaxHighlighter>
          </div>
        </div>

        {/* 右侧：新代码 */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {rightTitle && (
            <div
              style={{
                padding: '8px 16px',
                background: hideDiffMarkers ? '#1e1e1e' : '#1d2b1d',
                borderBottom: '1px solid #333',
                fontSize: '12px',
                fontWeight: 'bold',
                color: hideDiffMarkers ? '#999' : '#73d13d',
                textAlign: 'center',
              }}
            >
              {rightTitle}
            </div>
          )}
          <div style={{ flex: 1, background: hideDiffMarkers ? '#1e1e1e' : '#1d2b1d' }}>
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              showLineNumbers={showLineNumbers}
              customStyle={{
                ...highlighterCustomStyle,
                background: 'transparent',
              }}
            >
              {newValue?.trim()}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeDiff;
