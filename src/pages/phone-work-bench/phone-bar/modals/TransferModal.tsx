import React from 'react';
import { Modal, Select, Divider, Spin } from 'antd';
import { usePhoneStore } from '../usePhoneStore';
import { skillGroups } from '../constants';

export const TransferModal: React.FC = () => {
  const { 
    activeModal, 
    closeModal, 
    transferSkillGroup, 
    setTransferSkillGroup, 
    transferAgent, 
    setTransferAgent,
    resetCall,
    setAgentStatus,
    dynamicAgents,
    isFetchingAgents,
    fetchAgentsByGroup
  } = usePhoneStore();

  const handleTransfer = () => {
    if (!transferSkillGroup && !transferAgent) return;
    closeModal();
    setTimeout(() => {
      resetCall();
      setAgentStatus('idle');
      Modal.success({
        title: '转接成功',
        content: `已转接至${transferAgent ? dynamicAgents.find((a) => a.value === transferAgent)?.label : skillGroups.find((s) => s.value === transferSkillGroup)?.label}`,
      });
    }, 1000);
  };

  const onSkillGroupChange = (value: string | undefined) => {
    setTransferSkillGroup(value);
    if (value) {
      void fetchAgentsByGroup(value);
    } else {
      // 如果清空了技能组，也清空坐席
      usePhoneStore.setState({ dynamicAgents: [], transferAgent: undefined });
    }
  };

  return (
    <Modal
      title="电话转接"
      open={activeModal === 'transfer'}
      onOk={handleTransfer}
      onCancel={closeModal}
      okText="转接"
      cancelText="取消"
      okButtonProps={{ disabled: !transferSkillGroup && !transferAgent }}
      width={340}
      destroyOnClose
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '8px 0' }}>
        <div>
          <div style={{ marginBottom: 6, color: '#595959', fontSize: 13 }}>转接到技能组</div>
          <Select
            value={transferSkillGroup}
            onChange={onSkillGroupChange}
            options={skillGroups}
            style={{ width: '100%' }}
            placeholder="选择技能组"
            allowClear
          />
        </div>
        
        <Divider style={{ margin: 0 }}>或</Divider>
        
        <div>
          <div style={{ marginBottom: 6, color: '#595959', fontSize: 13 }}>转接到坐席</div>
          <Select
            value={transferAgent}
            onChange={setTransferAgent}
            options={dynamicAgents}
            style={{ width: '100%' }}
            placeholder={transferSkillGroup ? "选择坐席" : "请先选择技能组"}
            disabled={!transferSkillGroup || isFetchingAgents}
            loading={isFetchingAgents}
            allowClear
            notFoundContent={isFetchingAgents ? <Spin size="small" /> : "暂无坐席"}
          />
        </div>
      </div>
    </Modal>
  );
};
