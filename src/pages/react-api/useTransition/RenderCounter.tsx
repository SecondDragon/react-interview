import { useEffect, useRef, ReactNode } from 'react';

/**
 * 性能检测组件：监控子组件的 render 次数
 */
export default function RenderCounter({ children, name }: { children: ReactNode; name: string }) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <div style={{ border: '1px dashed #1890ff', padding: 8, marginBottom: 8, borderRadius: 4 }}>
      <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>
        [{name}] render 次数: {renderCount.current}
      </div>
      {children}
    </div>
  );
}
