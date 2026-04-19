'use client';

import styled from 'styled-components';
import { Input, Button, Typography, Space } from 'antd';
import { SearchOutlined, CustomerServiceOutlined } from '@ant-design/icons';

const { Text } = Typography;

// 模拟话术数据
const scripts = [
  '您好，欢迎致电客服中心，请问有什么可以帮助您的？',
  '请您提供一下订单编号，我帮您查询具体情况。',
  '非常抱歉给您带来不便，我们会尽快为您处理。',
  '感谢您的反馈，我们会不断改进服务质量。',
];

const Container = styled.div`
  padding: 1rem;
`;

const StyledInput = styled(Input)`
  margin-bottom: 0.75rem;
  border-radius: 0.5rem;
  .ant-input-prefix {
    color: #9ca3af;
  }
`;

const SectionTitle = styled(Text)`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
  display: block;
`;

const ScriptSpace = styled(Space)`
  width: 100%;
  margin-top: 0.5rem;
`;

const ScriptButton = styled(Button)`
  text-align: left;
  height: auto;
  justify-content: flex-start;
  padding: 0.5rem 0.75rem;
  background-color: #f9fafb;
  color: #4b5563;
  border-radius: 0.5rem;
  transition: color 0.15s, background-color 0.15s;
  border: none;

  &:hover {
    background-color: #eff6ff !important;
    color: #2563eb !important;
    border: none !important;
  }

  // 覆盖 antd 默认样式
  &.ant-btn-text:not(:disabled):not(.ant-btn-disabled):hover {
    background-color: #eff6ff;
  }
`;

const ScriptIcon = styled(CustomerServiceOutlined)`
  color: #9ca3af;
  margin-top: 0.125rem;
  flex-shrink: 0;
`;

const ScriptText = styled(Text)`
  font-size: 0.75rem;
  line-height: 1.625;
  text-align: left;
  margin: 0 !important;
  color: inherit;
`;

export function ScriptHelper() {
  return (
    <Container>
      {/* 搜索框 */}
      <StyledInput
        placeholder="搜索话术..."
        prefix={<SearchOutlined />}
      />

      {/* 话术列表 */}
      <SectionTitle>常用话术</SectionTitle>
      <ScriptSpace direction="vertical" size={8}>
        {scripts.map((script, index) => (
          <ScriptButton
            key={index}
            type="text"
            block
          >
            <Space align="start" size={8}>
              <ScriptIcon />
              <ScriptText>{script}</ScriptText>
            </Space>
          </ScriptButton>
        ))}
      </ScriptSpace>
    </Container>
  );
}
