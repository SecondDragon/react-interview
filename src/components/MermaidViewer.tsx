import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Button, Space, Tooltip } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined, ReloadOutlined, ExpandOutlined, DownloadOutlined } from '@ant-design/icons';

interface MermaidViewerProps {
  source: string;
  id?: string;
  className?: string;
  theme?: 'default' | 'dark' | 'forest' | 'neutral';
}

/**
 * Mermaid 图表渲染组件
 *
 * 用法：
 * 1. 将 Mermaid 源码保存为独立的 .mmd 文件
 * 2. 通过 `import source from './diagrams/xxx.mmd?raw';` 导入
 * 3. 在 .mdx 中 `<MermaidViewer source={source} />`
 */
export default function MermaidViewer({
  source,
  id,
  className,
  theme = 'default',
}: MermaidViewerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wrapperRef.current || !source.trim()) return;

    mermaid.initialize({
      startOnLoad: false,
      theme,
      securityLevel: 'loose',
      suppressErrorRendering: true,
    });

    const renderId = id || `mermaid-${Math.random().toString(36).slice(2, 11)}`;

    mermaid
      .render(renderId, source.trim())
      .then(({ svg }) => {
        if (wrapperRef.current) {
          wrapperRef.current.innerHTML = svg;
          const svgEl = wrapperRef.current.querySelector('svg');
          if (svgEl) {
            svgEl.style.display = 'block';
            svgEl.style.margin = '0 auto';
            svgEl.style.transition = 'transform 0.2s ease';
            svgRef.current = svgEl;
          }
          setScale(1);
          setError(null);
        }
      })
      .catch((err) => {
        setError(err.message || 'Mermaid 渲染失败');
        if (wrapperRef.current) {
          wrapperRef.current.innerHTML = '';
        }
      });
  }, [source, id, theme]);

  useEffect(() => {
    if (svgRef.current) {
      svgRef.current.style.transform = `scale(${scale})`;
      svgRef.current.style.transformOrigin = 'top center';
    }
  }, [scale]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.4));
  const handleReset = () => setScale(1);
  const handleDownload = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mermaid-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div
        className={`mermaid-error ${className || ''}`}
        style={{
          color: '#ff4d4f',
          padding: 16,
          border: '1px solid #ff4d4f',
          borderRadius: 4,
          background: '#fff2f0',
        }}
      >
        <p>图表渲染失败：{error}</p>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{source}</pre>
      </div>
    );
  }

  return (
    <div
      className={`mermaid-viewer ${className || ''}`}
      style={{
        border: '1px solid #d9d9d9',
        borderRadius: 4,
        background: '#fafafa',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          borderBottom: '1px solid #d9d9d9',
          background: '#fff',
        }}
      >
        <span style={{ color: '#666', fontSize: 12 }}>缩放: {Math.round(scale * 100)}%</span>
        <Space>
          <Tooltip title="放大">
            <Button icon={<ZoomInOutlined />} size="small" onClick={handleZoomIn} />
          </Tooltip>
          <Tooltip title="缩小">
            <Button icon={<ZoomOutOutlined />} size="small" onClick={handleZoomOut} />
          </Tooltip>
          <Tooltip title="重置">
            <Button icon={<ReloadOutlined />} size="small" onClick={handleReset} />
          </Tooltip>
          <Tooltip title="下载 SVG">
            <Button icon={<DownloadOutlined />} size="small" onClick={handleDownload} />
          </Tooltip>
        </Space>
      </div>
      <div
        ref={wrapperRef}
        style={{
          padding: 24,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: 120,
        }}
      />
    </div>
  );
}
