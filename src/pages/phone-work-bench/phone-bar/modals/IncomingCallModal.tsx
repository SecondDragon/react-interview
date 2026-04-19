import React from 'react';
import { Modal, Button } from 'antd';
import { PhoneOutlined, StopOutlined, SwapOutlined } from '@ant-design/icons';
import { usePhoneStore } from '../usePhoneStore';

export const IncomingCallModal: React.FC = () => {
  const { 
    activeModal, 
    setActiveModal,
    closeModal, 
    incomingCaller,
    setPhoneNumber,
    setCustomerName,
    setCustomerCarrier,
    setCallStatus,
    setCallDuration,
    setAgentStatus,
    resetCall
  } = usePhoneStore();

  const getNameInitial = (name: string) => name ? name.charAt(0) : '?';

  const getAvatarBgColor = (name: string) => {
    const colors = ['#1677ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96', '#13c2c2'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleAccept = () => {
    setPhoneNumber(incomingCaller.phone);
    setCustomerName(incomingCaller.name);
    setCustomerCarrier('中国移动');
    setCallStatus('connected');
    setCallDuration(0);
    setAgentStatus('busy');
    closeModal();
  };

  const handleReject = () => {
    resetCall();
    setAgentStatus('idle');
    closeModal();
  };

  const handleTransfer = () => {
    setPhoneNumber(incomingCaller.phone);
    setCustomerName(incomingCaller.name);
    setCustomerCarrier('中国移动');
    setCallStatus('connected');
    setAgentStatus('busy');
    setActiveModal('transfer');
  };

  return (
    <Modal
      open={activeModal === 'incoming'}
      footer={null}
      closable={false}
      centered
      width={360}
      styles={{ body: { padding: '36px 28px' } }}
      destroyOnClose
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            background: incomingCaller.avatar
              ? `url(${incomingCaller.avatar}) center/cover`
              : getAvatarBgColor(incomingCaller.name),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          }}
        >
          {!incomingCaller.avatar && (
            <span style={{ fontSize: 36, fontWeight: 600, color: '#fff' }}>
              {getNameInitial(incomingCaller.name)}
            </span>
          )}
        </div>

        <div style={{ fontSize: 24, fontWeight: 600, color: '#262626', marginTop: 4 }}>
          {incomingCaller.name}
        </div>

        <div style={{ fontSize: 18, fontFamily: 'monospace', color: '#595959', letterSpacing: 1.5 }}>
          {incomingCaller.phone}
        </div>

        <div style={{ fontSize: 14, color: '#8c8c8c', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <PhoneOutlined className="animate-pulse" />
          来电中...
        </div>

        <div style={{ display: 'flex', gap: 12, width: '100%', marginTop: 16 }}>
          <Button
            danger
            type="primary"
            size="large"
            icon={<StopOutlined />}
            onClick={handleReject}
            style={{
              flex: 1,
              height: 52,
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
              boxShadow: '0 4px 12px rgba(255, 77, 79, 0.35)',
              border: 'none',
            }}
          >
            挂断
          </Button>

          <Button
            size="large"
            icon={<SwapOutlined />}
            onClick={handleTransfer}
            style={{
              flex: 1,
              height: 52,
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
              boxShadow: '0 4px 12px rgba(250, 173, 20, 0.35)',
              border: 'none',
              color: '#fff',
            }}
          >
            转接
          </Button>

          <Button
            type="primary"
            size="large"
            icon={<PhoneOutlined />}
            onClick={handleAccept}
            style={{
              flex: 1,
              height: 52,
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
              boxShadow: '0 4px 12px rgba(82, 196, 26, 0.35)',
              border: 'none',
            }}
          >
            接听
          </Button>
        </div>
      </div>
    </Modal>
  );
};
