import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, Button, Space, Typography, Alert, Tag } from 'antd';
import {
  ExperimentOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const LiveDemo: React.FC = () => {
  const [phase, setPhase] = useState<'normal' | 'detached' | 'remounted'>('normal');
  const [cssomStyleLost, setCssomStyleLost] = useState(false);
  const [textStyleLost, setTextStyleLost] = useState(false);

  const cssomStyleRef = useRef<HTMLStyleElement | null>(null);
  const textStyleRef = useRef<HTMLStyleElement | null>(null);
  // 追踪 textContent 模式的初始内容，用于重建
  const textContentBackupRef = useRef<string>('');

  // 初始化：创建两个 <style> 标签，分别模拟 CSSOM 和 textContent 模式
  const initStyles = useCallback(() => {
    // 清理旧的
    cssomStyleRef.current?.remove();
    textStyleRef.current?.remove();

    // CSSOM 模式的 style：使用 insertRule（textContent 为空）
    const cssomStyle = document.createElement('style');
    cssomStyle.setAttribute('data-mode', 'cssom');
    document.head.appendChild(cssomStyle);
    cssomStyle.sheet?.insertRule('.cssom-demo-box { background: #1677ff; color: white; padding: 16px 24px; border-radius: 8px; font-size: 16px; font-weight: bold; text-align: center; }', 0);
    cssomStyleRef.current = cssomStyle;

    // textContent 模式的 style：使用 textContent
    const textStyle = document.createElement('style');
    textStyle.setAttribute('data-mode', 'textcontent');
    const textCSS = '.text-demo-box { background: #52c41a; color: white; padding: 16px 24px; border-radius: 8px; font-size: 16px; font-weight: bold; text-align: center; }';
    textStyle.textContent = textCSS;
    document.head.appendChild(textStyle);
    textStyleRef.current = textStyle;
    textContentBackupRef.current = textCSS;
  }, []);

  useEffect(() => {
    initStyles();
    return () => {
      cssomStyleRef.current?.remove();
      textStyleRef.current?.remove();
    };
  }, [initStyles]);

  // 模拟 qiankun 卸载：从 DOM 中移除 <style> 标签
  const handleDetach = () => {
    cssomStyleRef.current?.remove();
    textStyleRef.current?.remove();
    setPhase('detached');
  };

  // 模拟 qiankun 重挂载
  const handleRemount = () => {
    if (!cssomStyleRef.current || !textStyleRef.current) return;

    // CSSOM 模式：模拟 qiankun 的 re-parent（remove 再 append）
    const oldCssom = cssomStyleRef.current;
    const oldText = textStyleRef.current;

    document.head.appendChild(oldCssom);
    document.head.appendChild(oldText);

    // 关键：CSSOM 模式的 sheet 在 remove + re-append 后 rules 会清空
    // 但 textContent 模式的文本内容完好
    if (oldCssom.sheet && oldCssom.sheet.cssRules.length === 0) {
      setCssomStyleLost(true);
    }

    // textContent 模式：检查内容是否还在
    setTextStyleLost(!oldText.textContent || oldText.textContent.trim() === '');

    setPhase('remounted');

    // 如果是 textContent 模式，模拟 getTag() 的 isConnected 恢复机制
    // 实际上 textContent 本身的文本还在，浏览器自动重新 parse
  };

  // 模拟 textContent 模式的自动修复
  const handleAutoFix = () => {
    if (textStyleRef.current) {
      textStyleRef.current.remove();
    }
    const newTextStyle = document.createElement('style');
    newTextStyle.setAttribute('data-mode', 'textcontent');
    newTextStyle.textContent = textContentBackupRef.current;
    document.head.appendChild(newTextStyle);
    textStyleRef.current = newTextStyle;
    setTextStyleLost(false);
  };

  // 重置整个 Demo
  const handleReset = () => {
    initStyles();
    setPhase('normal');
    setCssomStyleLost(false);
    setTextStyleLost(false);
  };

  return (
    <Card
      title={
        <Space>
          <ExperimentOutlined />
          <span>Live Demo：CSSOM vs textContent 模式对比</span>
        </Space>
      }
    >
      <Typography.Paragraph type="secondary">
        模拟 qiankun 卸载/重挂载过程。CSSOM 模式在 &lt;style&gt; 标签被移除再放回后，CSSStyleSheet 被清零，样式永久丢失。textContent 模式因文本内容跟随标签移动，自动恢复或可手动修复。
      </Typography.Paragraph>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* CSSOM 模式 */}
        <Card
          size="small"
          title={
            <Space>
              <Tag color="blue">CSSOM Injection</Tag>
              <Typography.Text type="secondary">（默认模式）</Typography.Text>
            </Space>
          }
          style={{ borderColor: cssomStyleLost && phase === 'remounted' ? '#f5222d' : undefined }}
        >
          <div
            className="cssom-demo-box"
            style={{
              opacity: cssomStyleLost && phase === 'remounted' ? 0.3 : 1,
              filter: cssomStyleLost && phase === 'remounted' ? 'grayscale(1)' : 'none',
            }}
          >
            CSSOM 模式组件
          </div>
          {cssomStyleLost && phase === 'remounted' && (
            <Alert
              type="error"
              message="样式丢失！"
              description="<style> 被 remove+re-append 后 .sheet 被重置为空"
              style={{ marginTop: 12 }}
            />
          )}
          {!cssomStyleLost && phase === 'remounted' && (
            <Alert
              type="success"
              message="样式仍正常（罕见时序）"
              style={{ marginTop: 12 }}
            />
          )}
        </Card>

        {/* textContent 模式 */}
        <Card
          size="small"
          title={
            <Space>
              <Tag color="green">textContent 模式</Tag>
              <Typography.Text type="secondary">（disableCSSOMInjection）</Typography.Text>
            </Space>
          }
          style={{ borderColor: textStyleLost && phase === 'remounted' ? '#f5222d' : undefined }}
        >
          <div
            className="text-demo-box"
            style={{
              opacity: textStyleLost && phase === 'remounted' ? 0.3 : 1,
              filter: textStyleLost && phase === 'remounted' ? 'grayscale(1)' : 'none',
            }}
          >
            textContent 模式组件
          </div>
          {textStyleLost && phase === 'remounted' && (
            <Alert
              type="warning"
              message="文本内容暂存"
              description="textContent 写入 detached 标签 → 需要 isConnected 触发重建"
              style={{ marginTop: 12 }}
              action={
                <Button size="small" type="primary" onClick={handleAutoFix}>
                  自动修复
                </Button>
              }
            />
          )}
          {!textStyleLost && phase === 'remounted' && (
            <Alert
              type="success"
              message="样式自动恢复！"
              description="textContent 文本跟随标签，浏览器自动重新 parse"
              style={{ marginTop: 12 }}
            />
          )}
        </Card>
      </div>

      <Space>
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={handleDetach}
          disabled={phase !== 'normal'}
        >
          模拟 qiankun 卸载（移除 style 标签）
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRemount}
          disabled={phase !== 'detached'}
        >
          模拟 qiankun 重挂载（重新 append）
        </Button>
        <Button onClick={handleReset}>重置演示</Button>
      </Space>

      <Alert
        type="info"
        message="当前阶段"
        description={
          phase === 'normal'
            ? '正常渲染中——两个模式均正常显示'
            : phase === 'detached'
              ? '<style> 标签已从 DOM 移除（detached），但 JS 引用仍指向原元素'
              : '重挂载后——CSSOM 的 CSSStyleSheet 因 remove+re-append 被重置；textContent 的文本内容跟随标签恢复'
        }
        style={{ marginTop: 16 }}
      />

      <Card
        size="small"
        style={{ marginTop: 16, background: '#fafafa' }}
        title="DevTools 验证步骤"
      >
        <ol style={{ marginBottom: 0, paddingLeft: 20 }}>
          <li>打开 DevTools → Elements 面板</li>
          <li>找到 <code>&lt;style data-mode="cssom"&gt;</code> → 查看 textContent → <Tag>空</Tag></li>
          <li>找到 <code>&lt;style data-mode="textcontent"&gt;</code> → 查看 textContent → <Tag color="green">含 CSS 文本</Tag></li>
          <li>点击卸载再重挂载 → 观察 CSSOM 模式下 textContent 仍为空但样式消失</li>
        </ol>
      </Card>
    </Card>
  );
};

export default LiveDemo;
