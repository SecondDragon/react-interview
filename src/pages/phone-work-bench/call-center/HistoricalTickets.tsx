'use client';

import styled from 'styled-components';
import { Flex, Button, Tag, Typography, Space } from 'antd';

const { Text } = Typography;

// 模拟历史工单数据
const tickets = [
  {
    id: '1',
    title: '订单问题咨询',
    description: '订单取消补偿相关问题',
    date: '2024-03-10',
    status: 'resolved',
  },
  {
    id: '2',
    title: '车辆故障申报',
    description: '车辆空调不制冷',
    date: '2024-02-28',
    status: 'resolved',
  },
  {
    id: '3',
    title: '乘客投诉处理',
    description: '关于服务态度投诉',
    date: '2024-02-15',
    status: 'resolved',
  },
];

const Container = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
`;

const Header = styled(Flex)`
  margin-bottom: 0.75rem;
`;

const HeaderTitle = styled(Text)`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
`;

const ViewAllButton = styled(Button)`
  color: #3b82f6;
  padding: 0;
  height: auto;
`;

const TicketSpace = styled(Space)`
  width: 100%;
`;

const TicketItem = styled.div`
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover {
    background-color: #f3f4f6;
  }
`;

const TicketTitleWrapper = styled(Flex)`
  margin-bottom: 0.5rem;
`;

const TicketTitleText = styled(Text)`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const TicketStatusTag = styled(Tag)`
  margin: 0 !important;
  flex-shrink: 0;
`;

const TicketDescription = styled(Text)`
  font-size: 0.75rem;
  color: #6b7280;
  display: block;
  margin-bottom: 0.5rem;
`;

const TicketFooter = styled(Flex)``;

const TicketDate = styled(Text)`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const DetailButton = styled(Button)`
  color: #3b82f6;
  padding: 0;
  height: auto;
  font-size: 0.75rem;
`;

export function HistoricalTickets() {
  return (
    <Container>
      {/* 标题栏 */}
      <Header justify="space-between" align="center">
        <HeaderTitle>历史工单</HeaderTitle>
        <ViewAllButton type="link" size="small">
          查看全部
        </ViewAllButton>
      </Header>

      {/* 工单列表 */}
      <TicketSpace direction="vertical" size={8}>
        {tickets.map((ticket) => (
          <TicketItem key={ticket.id}>
            <TicketTitleWrapper justify="space-between" align="flex-start">
              <TicketTitleText>{ticket.title}</TicketTitleText>
              <TicketStatusTag color="success">已解决</TicketStatusTag>
            </TicketTitleWrapper>
            <TicketDescription>{ticket.description}</TicketDescription>
            <TicketFooter justify="space-between" align="center">
              <TicketDate>{ticket.date}</TicketDate>
              <DetailButton type="link" size="small">
                详情
              </DetailButton>
            </TicketFooter>
          </TicketItem>
        ))}
      </TicketSpace>
    </Container>
  );
}
