'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Flex, Button, Avatar, Typography, Space } from 'antd';
import { FileTextOutlined, SearchOutlined, CalculatorOutlined } from '@ant-design/icons';
import { AudioPlayer } from './AudioPlayer';
import { QueryOrderModal } from './QueryOrderModal.tsx';

const { Text, Paragraph } = Typography;

// 模拟对话数据
const messages = [
  {
    id: '1',
    sender: 'customer',
    name: '张司机',
    avatar: '张',
    time: '14:32:15',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    content:
      '你好，我这边有个订单问题想咨询一下。我的订单编号是 20240315001，乘客取消了，但是我没有收到取消费用补偿。',
    duration: '00:15',
  },
  {
    id: '2',
    sender: 'agent',
    name: '李漂亮',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    avatar: '李',

    time: '14:32:45',
    content:
      '您好，张司机！我是客服李漂亮，很高兴为您服务。请您提供一下订单编号，我来帮您查询一下具体情况。',
    duration: '00:12',
  },
  {
    id: '3',
    sender: 'customer',
    name: '张司机',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',

    avatar: '张',
    time: '14:33:20',
    content: '订单编号是 20240315001，3月15日下午3点从A点到B点的行程。',
    duration: '00:08',
  },
  {
    id: '4',
    sender: 'agent',
    name: '李漂亮',
    avatar: '李',
    time: '14:34:05',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',

    content:
      '好的，我已经查询到您的订单信息了。您的订单确实存在，状态显示为"乘客取消"。根据平台规则，乘客取消后司机可获得补偿，但是我看到这笔补偿确实还没有到账。请稍等，我帮您核实一下具体情况...',
    duration: '02:34',
    isVoice: true,
    voiceProgress: 35,
  },
];

const Container = styled(Flex)`
  height: 100%;
`;

const Header = styled(Flex)`
  padding: 0 1rem;
  height: 56px;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
`;

const TitleText = styled(Text)`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  scrollbar-gutter: stable;
`;

const MessageRow = styled(Flex)<{ justify: string }>`
  margin-bottom: 1rem;
  justify-content: ${(props) => props.justify};
`;

const MessageWrapper = styled(Flex)`
  max-width: 75%;
`;

const SenderName = styled(Text)`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const SendTime = styled(Text)`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const MessageBubble = styled(Flex)<{ sender: string; isVoice?: boolean }>`
  border-radius: 0.5rem;
  padding: 0.75rem;
  background-color: ${(props) => (props.sender === 'agent' ? '#f0fdf4' : '#eff6ff')};
  color: #1f2937;
  border-top-right-radius: ${(props) => (props.sender === 'agent' ? '0' : '0.5rem')};
  border-top-left-radius: ${(props) => (props.sender === 'customer' ? '0' : '0.5rem')};
`;

const MessageContent = styled(Paragraph)`
  font-size: 0.875rem;
  line-height: 1.625;
  margin: 0 !important;
`;

export function CallContent() {
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [queryOrderModalOpen, setQueryOrderModalOpen] = useState(false);
  return (
    <Container vertical>
      {/* 标题栏 */}
      <Header justify="space-between" align="center">
        <Space size={10}>
          <TitleText>通话内容</TitleText>
          <Button type="primary" icon={<FileTextOutlined />}>
            创建工单
          </Button>
        </Space>

        <Space size={8}>
          <Button onClick={() => setQueryOrderModalOpen(true)} icon={<SearchOutlined />}>
            查询订单
          </Button>
          <Button icon={<CalculatorOutlined />}>车费计算</Button>
        </Space>
      </Header>

      {/* 对话内容区 */}
      <MessageList>
        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          return (
            <MessageRow key={msg.id} justify={isAgent ? 'flex-end' : 'flex-start'}>
              <MessageWrapper
                gap={12}
                align="flex-start"
                style={{ flexDirection: isAgent ? 'row-reverse' : 'row' }}
              >
                {/* 头像与名称：头像在上，名字在下 */}
                <Flex vertical align="center" gap={4} style={{ flexShrink: 0, width: 56 }}>
                  <Avatar size={40} style={{ backgroundColor: isAgent ? '#22c55e' : '#3b82f6' }}>
                    {msg.avatar}
                  </Avatar>
                  <SenderName style={{ fontSize: '0.75rem', textAlign: 'center', width: '100%' }}>
                    {msg.name}
                  </SenderName>
                </Flex>

                {/* 消息内容与时间：时间在消息气泡正下方 */}
                <Flex
                  vertical
                  gap={4}
                  align={isAgent ? 'flex-end' : 'flex-start'}
                  style={{ flex: 1 }}
                >
                  {/* 消息气泡 */}
                  <MessageBubble vertical sender={msg.sender}>
                    <MessageContent>{msg.content}</MessageContent>

                    {/* 录音播放条：支持真实音频播放与时长显示 */}
                    <AudioPlayer
                      src={msg.audioUrl}
                      id={msg.id}
                      activeId={activeAudioId}
                      onPlay={(id) => setActiveAudioId(id)}
                    />
                  </MessageBubble>

                  {/* 时间：在聊天记录正下方 */}
                  <SendTime style={{ padding: isAgent ? '0 4px 0 0' : '0 0 0 4px' }}>
                    {msg.time}
                  </SendTime>
                </Flex>
              </MessageWrapper>
            </MessageRow>
          );
        })}
      </MessageList>

      {/* 查询订单弹窗 */}
      <QueryOrderModal open={queryOrderModalOpen} onClose={() => setQueryOrderModalOpen(false)} />
    </Container>
  );
}
