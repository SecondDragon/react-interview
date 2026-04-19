import React from 'react';
import { Card, Tag, Typography, Spin } from 'antd';
import Editor from '@monaco-editor/react';

const { Paragraph } = Typography;

/**
 * 示例代码位置说明：
 * 该组件定义在 @src/samples/HeavyEditor.tsx
 * 这是一个真正的重型组件：Monaco Editor (VS Code 同款内核)
 * 核心痛点：Monaco Editor 包含几 MB 的 JS 资源和 Worker 线程。
 * 如果直接打入主包，会让首屏 FCP 延迟数秒。
 */
const HeavyEditor: React.FC = () => {
  const initialValue = `// 真正的 Monaco Editor (VS Code 内核)
// 这是一个非常重的第三方库
function optimize(code) {
  console.log("正在使用 Hover 预加载技术...");
  return "秒开体验！";
}

optimize("Heavy Code");`;

  return (
    <Card 
      title="🖋️ 核心业务编辑器 (Monaco Editor)" 
      extra={<Tag color="red">Bundle Size: ~4MB+</Tag>}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ padding: '12px' }}>
        <Paragraph type="secondary" style={{ fontSize: '12px', marginBottom: '8px' }}>
          注意：当你在控制台看到资源开始下载时，意味着 Hover 预判策略已生效。
        </Paragraph>
      </div>
      <div style={{ height: '350px', borderTop: '1px solid #f0f0f0' }}>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue={initialValue}
          theme="vs-light"
          loading={<div style={{ padding: '20px', textAlign: 'center' }}><Spin tip="Monaco 内核正在初始化..." /></div>}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </Card>
  );
};

export default HeavyEditor;
