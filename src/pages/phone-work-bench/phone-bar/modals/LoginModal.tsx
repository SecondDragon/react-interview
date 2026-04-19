import React from 'react';
import { Modal, Select } from 'antd';
import { usePhoneStore } from '../usePhoneStore';
import { agentTypes, callerIds } from '../constants';

export const LoginModal: React.FC = () => {
  const { 
    activeModal, 
    closeModal, 
    selectedAgentType, 
    setSelectedAgentType, 
    selectedCallerId, 
    setSelectedCallerId,
    setAgentStatus,
    setAgentId
  } = usePhoneStore();

  const handleLogin = () => {
    setAgentStatus('idle');
    setAgentId('1001');
    closeModal();
  };

  return (
    <Modal
      title="坐席上线"
      open={activeModal === 'login'}
      onOk={handleLogin}
      onCancel={closeModal}
      okText="上线"
      cancelText="取消"
      width={340}
      destroyOnClose
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '8px 0' }}>
        <div>
          <div style={{ marginBottom: 6, color: '#595959', fontSize: 13 }}>坐席类型</div>
          <Select
            value={selectedAgentType}
            onChange={setSelectedAgentType}
            options={agentTypes}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <div style={{ marginBottom: 6, color: '#595959', fontSize: 13 }}>外显号码</div>
          <Select
            value={selectedCallerId}
            onChange={setSelectedCallerId}
            options={callerIds}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </Modal>
  );
};
