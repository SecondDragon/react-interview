import React from 'react';
import { Modal, Input, Button } from 'antd';
import { usePhoneStore } from '../usePhoneStore';

export const DialerModal: React.FC = () => {
  const { 
    activeModal, 
    closeModal, 
    dialNumber, 
    setDialNumber,
    setPhoneNumber,
    setCustomerName,
    setCustomerCarrier,
    setCallStatus,
    setAgentStatus,
    setCallDuration
  } = usePhoneStore();

  const dialPadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  const handleDial = () => {
    if (!dialNumber) return;
    setPhoneNumber(dialNumber);
    setCustomerName('张先生');
    setCustomerCarrier('中国移动');
    setCallStatus('dialing');
    setAgentStatus('busy');
    closeModal();

    setTimeout(() => {
      setCallStatus('ringing');
      setTimeout(() => {
        setCallStatus('connected');
        setCallDuration(0);
      }, 2000);
    }, 1500);
  };

  return (
    <Modal
      title="拨号"
      open={activeModal === 'dialer'}
      onOk={handleDial}
      onCancel={closeModal}
      okText="呼叫"
      cancelText="取消"
      okButtonProps={{ disabled: !dialNumber }}
      width={320}
      destroyOnClose
    >
      <div style={{ padding: '4px 0' }}>
        <Input
          size="large"
          value={dialNumber}
          onChange={(e) => setDialNumber(e.target.value)}
          placeholder="请输入号码"
          style={{ textAlign: 'center', fontSize: 20, letterSpacing: 2, marginBottom: 16 }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {dialPadKeys.flat().map((key) => (
            <Button
              key={key}
              size="large"
              onClick={() => setDialNumber((prev) => prev + key)}
              style={{
                height: 48,
                fontSize: 18,
                fontWeight: 500,
                borderRadius: 8,
              }}
            >
              {key}
            </Button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <Button
            block
            onClick={() => setDialNumber((prev) => prev.slice(0, -1))}
            disabled={!dialNumber}
            style={{ borderRadius: 6 }}
          >
            删除
          </Button>
          <Button
            block
            onClick={() => setDialNumber('')}
            disabled={!dialNumber}
            style={{ borderRadius: 6 }}
          >
            清空
          </Button>
        </div>
      </div>
    </Modal>
  );
};
