import LazyMount from '@/components/LazyMount';
import MermaidViewer from '@/components/MermaidViewer';
import source from './diagrams/complex-flow.mmd?raw';

function DocsPage() {
  return (
    <div>
      {/* 这个图在首屏，立即加载 */}
      <MermaidViewer source={source} />

      <div style={{ height: '200vh' }} />

      {/* 这个图在页面底部，用 lazy 延迟渲染 */}
      <MermaidViewer lazy source={source} />
    </div>
  );
}
