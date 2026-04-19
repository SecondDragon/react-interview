'use client';

import { useEffect, useCallback } from 'react';
import { Button, Select, Modal, Tooltip, Badge, Divider, ConfigProvider } from 'antd';
import {
  PhoneOutlined,
  PoweroffOutlined,
  SwapOutlined,
  UserOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
  StopOutlined,
  AudioOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { usePhoneStore } from './usePhoneStore';
import { statusConfig, type AgentStatus } from './constants';
import { LoginModal } from './modals/LoginModal';
import { DialerModal } from './modals/DialerModal';
import { TransferModal } from './modals/TransferModal';
import { IncomingCallModal } from './modals/IncomingCallModal';

export function PhoneBar() {
  const store = usePhoneStore();

  const {
    agentStatus,
    callStatus,
    callDuration,
    phoneNumber,
    customerName,
    customerCarrier,
    queueCount,
    selectedCallerId,
    setAgentStatus,
    setCallDuration,
    setQueueCount,
    setActiveModal,
    // setIncomingCaller,
    resetCall,
  } = store;

  // 模拟排队人数变化
  useEffect(() => {
    if (agentStatus !== 'offline') {
      const timer = setInterval(() => {
        setQueueCount(Math.floor(Math.random() * 15));
      }, 5000);
      setQueueCount(Math.floor(Math.random() * 15));
      return () => clearInterval(timer);
    }
  }, [agentStatus, setQueueCount]);

  // 通话计时
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callStatus === 'connected') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus, setCallDuration]);

  // 格式化时间
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 下线
  const handleLogout = () => {
    if (callStatus !== 'none') {
      Modal.warning({ title: '提示', content: '请先结束当前通话后再下线' });
      return;
    }
    setAgentStatus('offline');
  };

  // 状态切换
  const handleStatusChange = (status: AgentStatus) => {
    if (callStatus !== 'none' && status !== 'busy') {
      Modal.warning({ title: '提示', content: '通话中无法切换状态' });
      return;
    }
    setAgentStatus(status);
  };

  // 挂断
  const handleHangup = useCallback(() => {
    resetCall();
    setAgentStatus('idle');
  }, [resetCall, setAgentStatus]);

  // 模拟来电
  // const simulateIncomingCall = useCallback(() => {
  //   if (agentStatus === 'offline' || callStatus !== 'none') return;
  //
  //   const callers = [
  //     { name: '王建国', phone: '13812345678', avatar: '' },
  //     { name: '李美玲', phone: '15987654321', avatar: '' },
  //     { name: '赵晓明', phone: '18666668888', avatar: '' },
  //     { name: '陈思远', phone: '13955556666', avatar: '' },
  //   ];
  //   const caller = callers[Math.floor(Math.random() * callers.length)];
  //
  //   setIncomingCaller(caller);
  //   setActiveModal('incoming');
  // }, [agentStatus, callStatus, setIncomingCaller, setActiveModal]);

  const isOnline = agentStatus !== 'offline';
  const isInCall = callStatus !== 'none';
  const currentStatus = statusConfig[agentStatus];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
          fontSize: 13,
        },
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '5px 16px',
          background: '#ffffff',
          borderRadius: 10,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.1)',
          border: '1px solid #e8e8e8',
          height: 64,
          minWidth: isOnline ? 500   : 240,
          maxWidth: 600,
        }}
      >
        {!isOnline ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: currentStatus.dotColor,
                  boxShadow: `0 0 0 3px ${currentStatus.dotColor}20`,
                }}
              />
              <span style={{ color: '#8c8c8c', fontSize: 15, fontWeight: 500 }}>当前离线</span>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<AudioOutlined />}
              onClick={() => setActiveModal('login')}
              style={{
                height: 44,
                paddingInline: 28,
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
                boxShadow: '0 4px 12px rgba(22, 119, 255, 0.35)',
              }}
            >
              上线
            </Button>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 44,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <TeamOutlined style={{ fontSize: 11, color: '#8c8c8c' }} />
                  <span style={{ fontSize: 11, color: '#8c8c8c' }}>排队</span>
                </div>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: queueCount > 5 ? '#faad14' : '#52c41a',
                  }}
                >
                  {queueCount}
                </span>
              </div>
              <Divider type="vertical" style={{ height: 40, margin: 0, borderColor: '#e8e8e8' }} />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  // gap: 2,
                  minWidth: 100,
                  maxWidth: 140,
                }}
              >
                {isInCall ? (
                  <div style={{ position: 'relative', paddingBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <UserOutlined style={{ fontSize: 12, color: '#1677ff' }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#262626' }}>
                        {customerName}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontFamily: 'monospace',
                        color: '#595959',
                        letterSpacing: 0.5,
                      }}
                    >
                      {phoneNumber}
                    </span>
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        fontSize: 10,
                        color: '#b0b0b0',
                        lineHeight: 1,
                      }}
                    >
                      {customerCarrier}
                    </span>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PhoneOutlined style={{ fontSize: 12, color: '#1677ff' }} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#262626' }}>
                        外显号码
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 14,
                        fontFamily: 'monospace',
                        color: '#595959',
                        letterSpacing: 0.5,
                      }}
                    >
                      {selectedCallerId}
                    </span>
                  </>
                )}
              </div>
              {isInCall && (
                <>
                  <Divider
                    type="vertical"
                    style={{ height: 40, margin: 0, borderColor: '#e8e8e8' }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      alignItems: 'center',
                      minWidth: 56,
                    }}
                  >
                    {callStatus === 'dialing' && (
                      <>
                        <LoadingOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                        <span style={{ color: '#1677ff', fontSize: 12, fontWeight: 500 }}>
                          呼叫中
                        </span>
                      </>
                    )}
                    {callStatus === 'ringing' && (
                      <>
                        <PhoneOutlined
                          style={{ color: '#1677ff', fontSize: 16 }}
                          className="animate-pulse"
                        />
                        <span style={{ color: '#1677ff', fontSize: 12, fontWeight: 500 }}>
                          振铃中
                        </span>
                      </>
                    )}
                    {callStatus === 'connected' && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Badge status="processing" color="#52c41a" />
                          <span style={{ color: '#52c41a', fontSize: 12, fontWeight: 500 }}>
                            通话中
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ClockCircleOutlined style={{ color: '#8c8c8c', fontSize: 11 }} />
                          <span
                            style={{
                              color: '#595959',
                              fontSize: 14,
                              fontFamily: 'monospace',
                              fontWeight: 600,
                            }}
                          >
                            {formatDuration(callDuration)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            <Divider
              type="vertical"
              style={{ height: 44, margin: '0 10px', borderColor: '#e8e8e8' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isInCall ? (
                <>
                  <Tooltip title="转接">
                    <Button
                      size="middle"
                      icon={<SwapOutlined />}
                      onClick={() => setActiveModal('transfer')}
                      disabled={callStatus !== 'connected'}
                      style={{ borderRadius: 6, height: 36 }}
                    >
                      转接
                    </Button>
                  </Tooltip>
                  <Button
                    size="middle"
                    danger
                    type="primary"
                    icon={<StopOutlined />}
                    onClick={handleHangup}
                    style={{ borderRadius: 6, height: 36 }}
                  >
                    挂断
                  </Button>
                </>
              ) : (
                <>
                  <Select
                    size="middle"
                    value={agentStatus}
                    onChange={handleStatusChange}
                    style={{ width: 90 }}
                    options={[
                      { value: 'idle', label: <span style={{ color: '#52c41a' }}>空闲</span> },
                      { value: 'busy', label: <span style={{ color: '#ff4d4f' }}>忙碌</span> },
                      { value: 'rest', label: <span style={{ color: '#faad14' }}>小休</span> },
                    ]}
                  />
                  <Button
                    type="primary"
                    size="middle"
                    icon={<PhoneOutlined />}
                    onClick={() => setActiveModal('dialer')}
                    style={{ borderRadius: 6, height: 36, fontWeight: 500 }}
                  >
                    拨号
                  </Button>
                  {/*<Tooltip title="模拟来电">*/}
                  {/*  <Button*/}
                  {/*    size="middle"*/}
                  {/*    icon={<PhoneOutlined style={{ transform: 'rotate(135deg)' }} />}*/}
                  {/*    onClick={simulateIncomingCall}*/}
                  {/*    style={{ borderRadius: 6, height: 36 }}*/}
                  {/*  />*/}
                  {/*</Tooltip>*/}
                  <Button
                    danger
                    type="primary"
                    size="middle"
                    icon={<PoweroffOutlined />}
                    onClick={handleLogout}
                    style={{
                      height: 36,
                      paddingInline: 14,
                      fontWeight: 600,
                      borderRadius: 6,
                      background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                      boxShadow: '0 2px 8px rgba(255, 77, 79, 0.35)',
                      border: 'none',
                    }}
                  >
                    下线
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* 弹窗组件 */}
      <LoginModal />
      <DialerModal />
      <TransferModal />
      <IncomingCallModal />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .animate-pulse {
          animation: pulse 1s ease-in-out infinite;
        }
      `}</style>
    </ConfigProvider>
  );
}
