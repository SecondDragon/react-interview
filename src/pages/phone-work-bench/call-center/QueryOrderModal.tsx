'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Modal, Flex, Input, Typography } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { OrderCard } from './OrderCard';

const { Text } = Typography;

// 模拟订单数据
const mockOrders = [
  {
    id: '1',
    serviceType: '花小猪-快车',
    licensePlate: '皖A·88888',
    status: '已完成',
    statusColor: 'completed',
    orderNumber: 'HXZ12321312312123312313',
    startAddress: '安徽省合肥市高新区青龙岗地铁站',
    startTime: '2026年12月31日 19:40',
    endAddress: '安徽省合肥市包河区龙川路中国视界',
    endTime: '2026年12月31日 21:40',
    duration: '2小时',
    amount: '¥51.8',
  },
  {
    id: '2',
    serviceType: '花小猪-快车',
    licensePlate: '皖B·66666',
    status: '已完成',
    statusColor: 'completed',
    orderNumber: 'HXZ98765432198765432',
    startAddress: '北京市朝阳区国贸CBD',
    startTime: '2026年12月30日 08:30',
    endAddress: '北京市海淀区中关村',
    endTime: '2026年12月30日 09:15',
    duration: '45分钟',
    amount: '¥32.5',
  },
];

interface QueryOrderModalProps {
  open: boolean;
  onClose: () => void;
}

export function QueryOrderModal({ open, onClose }: QueryOrderModalProps) {
  const [orderNumber, setOrderNumber] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [orders, setOrders] = useState(mockOrders);

  const handleSearch = () => {
    // 模拟搜索逻辑
    if (orderNumber || searchKeyword) {
      const filtered = mockOrders.filter(
        (order) =>
          order.orderNumber.includes(orderNumber || '') ||
          order.startAddress.includes(searchKeyword) ||
          order.endAddress.includes(searchKeyword)
      );
      setOrders(filtered.length > 0 ? filtered : mockOrders);
    } else {
      setOrders(mockOrders);
    }
  };

  const handleViewDetails = (orderId: string) => {
    console.log('查看订单详情:', orderId);
  };

  const handleCopyOrderNumber = (orderNumber: string) => {
    console.log('已复制:', orderNumber);
  };

  return (
    <StyledModal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={600}
    >
      {/* 标题栏 */}
      <ModalHeader justify="space-between" align="center">
        <ModalTitle>查询订单</ModalTitle>
        <CloseButton onClick={onClose}>
          <CloseOutlined />
        </CloseButton>
      </ModalHeader>

      {/* 搜索表单区 */}
      <SearchSection>
        <SearchForm>
          {/* 订单号搜索 */}
          <SearchRow>
            <StyledInput
              placeholder="请输入订单号"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              onPressEnter={handleSearch}
            />
            <SearchButton onClick={handleSearch}>
              <SearchOutlined />
            </SearchButton>
          </SearchRow>

          {/* 订单搜索条件 */}
          <SearchRow>
            <StyledInput
              placeholder="请输入订单搜索条件"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
            />
            <SearchButton onClick={handleSearch}>
              <SearchOutlined />
            </SearchButton>
          </SearchRow>
        </SearchForm>
      </SearchSection>

      {/* 订单列表区 */}
      <OrderListSection>
        <OrderListContainer>
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onViewDetails={handleViewDetails}
              onCopyOrderNumber={handleCopyOrderNumber}
            />
          ))}
        </OrderListContainer>
      </OrderListSection>
    </StyledModal>
  );
}

// --- 样式组件定义 ---

const StyledModal = styled(Modal)`
  .ant-modal-content {
    padding: 0;
    border-radius: 12px;
    overflow: hidden;
  }
`;

const ModalHeader = styled(Flex)`
  padding: 10px 10px;
  //border-bottom: 1px solid #f0f0f0;
`;

const ModalTitle = styled(Text)`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
  color: #666;
  font-size: 16px;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const SearchSection = styled.div`
  padding: 10px 10px;
  //border-bottom: 1px solid #f0f0f0;
`;

const SearchForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SearchRow = styled.div`
  display: flex;
  gap: 12px;
`;

const StyledInput = styled(Input)`
  flex: 1;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  background-color: #fafafa;

  &:hover,
  &:focus {
    border-color: #3b82f6;
    background-color: #fff;
  }
`;

const SearchButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #3b82f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #fff;
  font-size: 16px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }
`;

const OrderListSection = styled.div`
  padding: 16px 10px 24px;
  max-height: 480px;
  overflow-y: auto;
  scrollbar-gutter: stable;
`;

const OrderListContainer = styled.div`
  border: 1px solid #e8e8e8;
  background-color: #fff;
  border-radius: 12px;
  padding: 12px;
`;
