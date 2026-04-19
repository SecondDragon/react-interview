'use client';

import styled from 'styled-components';
import { Flex, Input, Tabs, Button, Avatar, Tag, Typography, Space } from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  PhoneOutlined,
  InboxOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

// 模拟通话记录数据
const callRecords = [
  {
    id: '1',
    name: '张司机',
    phone: '138****5678',
    type: 'incoming',
    status: 'connected',
    time: '今天 14:32',
    duration: '03:45',
    avatar: '张',
  },
  {
    id: '2',
    name: '李乘客',
    phone: '139****1234',
    type: 'missed',
    status: 'missed',
    time: '今天 11:45',
    duration: '--:--',
    avatar: '李',
  },
  {
    id: '3',
    name: '王师傅',
    phone: '137****8765',
    type: 'outgoing',
    status: 'connected',
    time: '昨天 16:20',
    duration: '05:12',
    avatar: '王',
  },
];

const Container = styled(Flex)`
  height: 100%;
`;

const Header = styled(Flex)`
  height: 56px;
  align-items: center;
  padding: 0 1rem;
  border-bottom: 1px solid #f3f4f6;
`;

const TitleText = styled(Text)`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
`;

const RefreshButton = styled(Button)`
  color: #6b7280;
`;

const TabWrapper = styled.div`
  padding: 0.75rem 1rem 0;
`;

const SearchWrapper = styled.div`
  padding: 0.5rem 1rem;
`;

const StyledInput = styled(Input)`
  border-radius: 0.5rem;
  .ant-input-prefix {
    color: #9ca3af;
  }
`;

const RecordList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 0.5rem;
  scrollbar-gutter: stable;
`;

const RecordItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 0.25rem;
  border-bottom: 1px solid #f3f4f6;

  &:hover {
    background-color: #f9fafb;
  }
`;

const RecordInfo = styled(Flex)`
  flex: 1;
  min-width: 0;
`;

const NameText = styled(Text)`
  font-weight: 500;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatusTag = styled(Tag)`
  font-size: 0.75rem;
  margin: 0 !important;
`;

const PhoneText = styled(Text)`
  font-size: 0.75rem;
  color: #6b7280;
`;

const TimeText = styled(Text)`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const DurationText = styled(Text)`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const CallbackButton = styled(Button)`
  color: #3b82f6;
  border-color: #3b82f6;
  flex-shrink: 0;
  &:hover {
    background-color: #eff6ff !important;
    color: #2563eb !important;
    border-color: #2563eb !important;
  }
`;

// 获取通话类型图标
const getCallTypeIcon = (type: string, status: string) => {
  if (status === 'missed') {
    return <InboxOutlined style={{ color: '#ef4444' }} />;
  }
  if (type === 'incoming') {
    return <PhoneOutlined style={{ color: '#22c55e' }} />;
  }
  return <PhoneOutlined style={{ color: '#3b82f6' }} />;
};

export function CommunicationRecords() {
  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'incoming', label: '呼入' },
    { key: 'outgoing', label: '呼出' },
    { key: 'missed', label: '未接' },
  ];

  return (
    <Container vertical>
      {/* 标题栏 */}
      <Header  justify="space-between" align="center">
        <TitleText>通讯记录</TitleText>
        <RefreshButton
          type="text"
          icon={<ReloadOutlined />}
          size="small"
        />
      </Header>

      {/* 标签切换 */}
      <TabWrapper>
        <Tabs
          items={tabItems}
          defaultActiveKey="all"
          size="small"
        />
      </TabWrapper>

      {/* 搜索框 */}
      <SearchWrapper>
        <StyledInput
          placeholder="搜索通话记录..."
          prefix={<SearchOutlined />}
        />
      </SearchWrapper>

      {/* 通话列表 */}
      <RecordList>
        {callRecords.map((record) => (
          <RecordItem key={record.id}>
            {/* 头像 */}
            <Avatar
              size={42}
              style={{ backgroundColor: '#3b82f6' }}
            >
              {record.avatar}
            </Avatar>

            {/* 通话信息 */}
            <RecordInfo vertical>
              <Flex justify="space-between" align="center">
                <NameText>{record.name}</NameText>
                <StatusTag color={record.status === 'connected' ? 'success' : 'error'}>
                  {record.status === 'connected' ? '已接通' : '未接听'}
                </StatusTag>
              </Flex>
              <Space size={4} style={{ marginTop: '0.25rem' }}>
                {getCallTypeIcon(record.type, record.status)}
                <PhoneText>{record.phone}</PhoneText>
              </Space>
              <Flex justify="space-between" align="center" style={{ marginTop: '0.25rem' }}>
                <TimeText>{record.time}</TimeText>
                <Space size={2}>
                  <ClockCircleOutlined style={{ fontSize: '0.75rem', color: '#9ca3af' }} />
                  <DurationText>{record.duration}</DurationText>
                </Space>
              </Flex>
            </RecordInfo>

            {/* 回拨按钮 */}
            <CallbackButton
              type="primary"
              ghost
              size="small"
              icon={<PhoneOutlined />}
            >
              回拨
            </CallbackButton>
          </RecordItem>
        ))}
      </RecordList>
    </Container>
  );
}
