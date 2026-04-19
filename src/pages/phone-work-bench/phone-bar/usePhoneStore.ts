import { create } from 'zustand';
import { type AgentStatus, type CallStatus, agents as allAgents } from './constants';

export type ModalType = 'login' | 'dialer' | 'transfer' | 'incoming' | null;

interface PhoneState {
  // 基础状态
  agentStatus: AgentStatus;
  callStatus: CallStatus;
  callDuration: number;
  phoneNumber: string;
  customerName: string;
  customerCarrier: string;
  queueCount: number;
  agentId: string;

  // 弹窗状态
  activeModal: ModalType;

  // 位置状态
  position: { x: number; y: number };

  // 来电信息
  incomingCaller: {
    name: string;
    phone: string;
    avatar: string;
  };

  // 表单数据
  selectedAgentType: string;
  selectedCallerId: string;
  dialNumber: string;
  transferSkillGroup: string | undefined;
  transferAgent: string | undefined;

  // 动态数据
  dynamicAgents: { value: string; label: string }[];
  isFetchingAgents: boolean;

  // Actions
  setAgentStatus: (status: AgentStatus) => void;
  setCallStatus: (status: CallStatus) => void;
  setCallDuration: (duration: number | ((prev: number) => number)) => void;
  setPhoneNumber: (num: string) => void;
  setCustomerName: (name: string) => void;
  setCustomerCarrier: (carrier: string) => void;
  setQueueCount: (count: number) => void;
  setAgentId: (id: string) => void;

  // 弹窗控制
  setActiveModal: (type: ModalType) => void;
  closeModal: () => void;

  // 位置控制
  setPosition: (pos: { x: number; y: number }) => void;

  setIncomingCaller: (caller: { name: string; phone: string; avatar: string }) => void;
  setSelectedAgentType: (type: string) => void;
  setSelectedCallerId: (id: string) => void;
  setDialNumber: (num: string | ((prev: string) => string)) => void;
  setTransferSkillGroup: (group: string | undefined) => void;
  setTransferAgent: (agent: string | undefined) => void;

  // 业务逻辑：获取坐席
  fetchAgentsByGroup: (groupId: string) => Promise<void>;

  resetCall: () => void;
}

export const usePhoneStore = create<PhoneState>((set, get) => ({
  agentStatus: 'offline',
  callStatus: 'none',
  callDuration: 0,
  phoneNumber: '',
  customerName: '',
  customerCarrier: '',
  queueCount: 0,
  agentId: '1001',

  activeModal: null,
  position: { x: 0, y: 0 },

  incomingCaller: { name: '', phone: '', avatar: '' },

  selectedAgentType: 'normal',
  selectedCallerId: '010-12345678',
  dialNumber: '',
  transferSkillGroup: undefined,
  transferAgent: undefined,

  dynamicAgents: [],
  isFetchingAgents: false,

  setAgentStatus: (status) => set({ agentStatus: status }),
  setCallStatus: (status) => set({ callStatus: status }),
  setCallDuration: (duration) => set((state) => ({
    callDuration: typeof duration === 'function' ? duration(state.callDuration) : duration
  })),
  setPhoneNumber: (num) => set({ phoneNumber: num }),
  setCustomerName: (name) => set({ customerName: name }),
  setCustomerCarrier: (carrier) => set({ customerCarrier: carrier }),
  setQueueCount: (count) => set({ queueCount: count }),
  setAgentId: (id) => set({ agentId: id }),

  setActiveModal: (type) => set({ activeModal: type }),
  closeModal: () => set({
    activeModal: null,
    dialNumber: '',
    transferSkillGroup: undefined,
    transferAgent: undefined,
    dynamicAgents: [],
    isFetchingAgents: false,
    selectedAgentType: 'normal',
    selectedCallerId: '010-12345678'
  }),

  setPosition: (pos) => set({ position: pos }),

  setIncomingCaller: (caller) => set({ incomingCaller: caller }),
  setSelectedAgentType: (type) => set({ selectedAgentType: type }),
  setSelectedCallerId: (id) => set({ selectedCallerId: id }),
  setDialNumber: (num) => set((state) => ({
    dialNumber: typeof num === 'function' ? num(state.dialNumber) : num
  })),
  setTransferSkillGroup: (group) => set({ transferSkillGroup: group }),
  setTransferAgent: (agent) => set({ transferAgent: agent }),

  fetchAgentsByGroup: async (groupId: string) => {
    set({ isFetchingAgents: true, dynamicAgents: [], transferAgent: undefined });

    // 模拟接口延迟
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 模拟根据技能组返回不同的坐席
    const mockAgents = allAgents.map(a => ({
      ...a,
      label: `${a.label} [${groupId.toUpperCase()}]`
    }));

    set({ dynamicAgents: mockAgents, isFetchingAgents: false });
  },

  resetCall: () => set({
    callStatus: 'none',
    callDuration: 0,
    phoneNumber: '',
    customerName: '',
    customerCarrier: '',
    dialNumber: '',
    transferSkillGroup: undefined,
    transferAgent: undefined,
    dynamicAgents: [],
    isFetchingAgents: false,
    incomingCaller: { name: '', phone: '', avatar: '' }
  }),
}));
