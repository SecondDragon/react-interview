'use client';

import styled from 'styled-components';
import { Flex } from 'antd';
import { CustomerInfo } from './CustomerInfo';
import { HistoricalTickets } from './HistoricalTickets';
import { ScriptHelper } from './ScriptHelper';

const PanelContainer = styled(Flex)`
  height: 100%;
  overflow-y: auto;
  scrollbar-gutter: stable;
`;

export function CustomerInfoPanel() {
  return (
    <PanelContainer vertical>
      {/* 客户信息 */}
      <CustomerInfo />

      {/* 历史工单 */}
      <HistoricalTickets />

      {/* 话术辅助 */}
      <ScriptHelper />
    </PanelContainer>
  );
}
