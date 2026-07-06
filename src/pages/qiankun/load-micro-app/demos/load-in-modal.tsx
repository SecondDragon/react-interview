// ✅ 在弹窗中加载子应用

import React, { useEffect, useRef } from 'react';
import { Modal } from 'antd';
import { loadMicroApp } from 'qiankun';

interface AdvancedQueryModalProps {
  visible: boolean;
  onClose: () => void;
}

const AdvancedQueryModal: React.FC<AdvancedQueryModalProps> = ({ visible, onClose }) => {
  const appRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && !appRef.current && containerRef.current) {
      appRef.current = loadMicroApp({
        name: 'query-tool',
        entry: '//localhost:8002',
        container: containerRef.current,
        props: { onClose },
      });
    }
    if (!visible && appRef.current) {
      appRef.current.unmount();
      appRef.current = null;
    }
  }, [visible, onClose]);

  return (
    <Modal open={visible} title="高级查询" onCancel={onClose} width={800}>
      <div ref={containerRef} style={{ minHeight: 400 }} />
    </Modal>
  );
};

export default AdvancedQueryModal;
