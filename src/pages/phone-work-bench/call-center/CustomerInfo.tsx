'use client';

import styled from 'styled-components';
import { Flex, Avatar, Tag, Button, Typography, Row, Col } from 'antd';
import { EditOutlined, CarOutlined, StarOutlined, CalendarOutlined, NumberOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const InfoContainer = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
`;

const SectionHeader = styled(Flex)`
  margin-bottom: 0.75rem;
`;

const SectionTitle = styled(Title)`
  margin: 0 !important;
  color: #1f2937 !important;
`;

const HistoryButton = styled(Button)`
  color: #3b82f6;
  padding: 0;
  height: auto;
`;

const BasicInfo = styled(Flex)`
  gap: 0.75rem;
`;

const AvatarWrapper = styled(Avatar)`
  font-size: 1.125rem;
`;

const CustomerName = styled(Text)`
  font-weight: 500;
  color: #1f2937;
`;

const CustomerPhone = styled(Text)`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
  display: block;
`;

const EditButton = styled(Button)`
  color: #9ca3af;
`;

const DetailRow = styled(Row)`
  margin-top: 1rem;
`;

const DetailLabel = styled(Text)`
  font-size: 0.75rem;
  color: #9ca3af;
  display: block;
`;

const DetailValueWrapper = styled(Flex)`
  margin-top: 0.25rem;
  align-items: center;
  gap: 0.25rem;
`;

const DetailValue = styled(Text)`
  font-size: 0.875rem;
  color: #374151;
`;

const IconWrapper = styled.span`
  color: #9ca3af;
  display: flex;
  align-items: center;
`;

const StarIcon = styled(StarOutlined)`
  color: #facc15;
`;

export function CustomerInfo() {
  return (
    <InfoContainer>
      {/* 标题栏 */}
      <SectionHeader justify="space-between" align="center">
        <SectionTitle level={5}>客户信息</SectionTitle>
        <HistoryButton type="link" size="small">
          历史会话
        </HistoryButton>
      </SectionHeader>

      {/* 客户基本信息 */}
      <BasicInfo align="flex-start">
        <AvatarWrapper
          size={48}
          style={{ backgroundColor: '#3b82f6' }}
        >
          张
        </AvatarWrapper>
        <Flex vertical style={{ flex: 1 }}>
          <Flex align="center" gap={8}>
            <CustomerName>张司机</CustomerName>
            <Tag color="success" style={{ margin: 0 }}>
              已认证司机
            </Tag>
          </Flex>
          <CustomerPhone>138****5678</CustomerPhone>
        </Flex>
        <EditButton
          type="text"
          icon={<EditOutlined />}
          size="small"
        />
      </BasicInfo>

      {/* 详细信息 */}
      <DetailRow gutter={[16, 12]}>
        <Col span={12}>
          <DetailLabel>司机编号</DetailLabel>
          <DetailValueWrapper>
            <IconWrapper><NumberOutlined /></IconWrapper>
            <DetailValue>DRV20230615</DetailValue>
          </DetailValueWrapper>
        </Col>
        <Col span={12}>
          <DetailLabel>注册时间</DetailLabel>
          <DetailValueWrapper>
            <IconWrapper><CalendarOutlined /></IconWrapper>
            <DetailValue>2022-03-15</DetailValue>
          </DetailValueWrapper>
        </Col>
        <Col span={12}>
          <DetailLabel>车辆类型</DetailLabel>
          <DetailValueWrapper>
            <IconWrapper><CarOutlined /></IconWrapper>
            <DetailValue>舒适型</DetailValue>
          </DetailValueWrapper>
        </Col>
        <Col span={12}>
          <DetailLabel>服务评分</DetailLabel>
          <DetailValueWrapper>
            <StarIcon />
            <DetailValue>4.9分</DetailValue>
          </DetailValueWrapper>
        </Col>
      </DetailRow>
    </InfoContainer>
  );
}
