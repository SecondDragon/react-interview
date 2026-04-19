'use client';

import styled from 'styled-components';
import { Flex, Tag, Typography } from 'antd';

const { Text } = Typography;

interface OrderCardProps {
  order: {
    id: string;
    serviceType: string;
    licensePlate: string;
    status: string;
    statusColor: string;
    orderNumber: string;
    startAddress: string;
    startTime: string;
    endAddress: string;
    endTime: string;
    duration: string;
    amount: string;
  };
  onViewDetails?: (orderId: string) => void;
  onCopyOrderNumber?: (orderNumber: string) => void;
}

export function OrderCard({ order, onViewDetails, onCopyOrderNumber }: OrderCardProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(order.orderNumber);
    onCopyOrderNumber?.(order.orderNumber);
  };

  return (
    <CardContainer>
      {/* 卡片顶部信息栏 */}
      <CardHeader justify="space-between" align="center">
        <Flex align="center" gap={8}>
          <ServiceIcon>🚗</ServiceIcon>
          <ServiceType>{order.serviceType}</ServiceType>
          <LicensePlateTag color="#dbeafe">{order.licensePlate}</LicensePlateTag>
        </Flex>
        <Flex align="center" gap={8}>
          <StatusTag color="#dbeafe">{order.status}</StatusTag>
        </Flex>
      </CardHeader>

      {/* 订单编号行 */}
      <OrderNumberRow justify="space-between" align="center">
        <Flex align="center" gap={4}>
          <LabelText>订单编号：</LabelText>
          <OrderNumberText>{order.orderNumber}</OrderNumberText>
        </Flex>
        <CopyButton onClick={handleCopy}>复制</CopyButton>
      </OrderNumberRow>

      {/* 行程信息与金额区 */}
      <TripInfoSection justify="space-between" align="flex-start">
        {/* 左侧：行程信息 */}
        <TripDetails vertical gap={8}>
          {/* 起点 */}
          <Flex vertical gap={4}>
            <Flex align="center">
              <LabelText>起点：</LabelText>
              <AddressText>{order.startAddress}</AddressText>
            </Flex>
            <TimeText>{order.startTime}</TimeText>
          </Flex>

          {/* 终点 */}
          <Flex vertical gap={4}>
            <Flex align="center">
              <LabelText>终点：</LabelText>
              <AddressText>{order.endAddress}</AddressText>
              <DurationTag style={{ marginLeft: '4px' }} color="#dbeafe">
                {order.duration}
              </DurationTag>
            </Flex>
            <Flex align="center" gap={4}>
              <TimeText>{order.endTime}</TimeText>
            </Flex>
          </Flex>
        </TripDetails>

        {/* 右侧：金额和操作 */}
        <AmountSection vertical align="flex-end" gap={4}>
          <AmountText>{order.amount}</AmountText>
          <DetailButton onClick={() => onViewDetails?.(order.id)}>查看详情</DetailButton>
        </AmountSection>
      </TripInfoSection>
    </CardContainer>
  );
}

// --- 样式组件定义 ---

const CardContainer = styled.div`
  background-color: #fafbfc;

  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  scrollbar-gutter: stable;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CardHeader = styled(Flex)`
  margin-bottom: 8px;
`;

const ServiceIcon = styled.span`
  font-size: 16px;
`;

const ServiceType = styled(Text)`
  font-size: 14px;
  font-weight: 500;
  color: #3b82f6;
`;

const LicensePlateTag = styled(Tag)`
  //background-color: #dbeafe !important;
  border: none !important;
  color: #333 !important;
  padding: 2px 8px !important;
  font-size: 12px !important;
`;

const StatusTag = styled(Tag)`
  background-color: #dbeafe !important;
  border: none !important;
  color: #3b82f6 !important;
  padding: 2px 8px !important;
  font-size: 12px !important;
`;

const OrderNumberRow = styled(Flex)`
  margin-bottom: 8px;
  //padding-bottom: 12px;
  //border-bottom: 1px dashed #f0f0f0;
`;

const LabelText = styled(Text)`
  font-size: 12px;
  color: #999;
`;

const OrderNumberText = styled(Text)`
  font-size: 12px;
  color: #333;
  font-family: monospace;
`;

const CopyButton = styled.button`
  background: transparent;
  border: none;
  color: #3b82f6;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 8px;

  &:hover {
    text-decoration: underline;
  }
`;

const TripInfoSection = styled(Flex)`
  gap: 16px;
`;

const TripDetails = styled(Flex)`
  flex: 1;
`;

const AddressText = styled(Text)`
  font-size: 13px;
  color: #333;
`;

const TimeText = styled(Text)`
  font-size: 11px;
  color: #999;
`;

const DurationTag = styled(Tag)`
  background-color: #dbeafe !important;
  border: none !important;
  color: #3b82f6 !important;
  padding: 0 6px !important;
  border-radius: 3px !important;
  font-size: 10px !important;
  line-height: 18px !important;
  height: 18px !important;
`;

const AmountSection = styled(Flex)`
  text-align: right;
`;

const AmountText = styled(Text)`
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1;
`;

const DetailButton = styled.button`
  background: transparent;
  border: none;
  color: #3b82f6;
  font-size: 13px;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;
