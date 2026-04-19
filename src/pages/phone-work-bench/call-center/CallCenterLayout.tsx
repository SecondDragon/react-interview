'use client';

import styled from 'styled-components';
import { CommunicationRecords } from './CommunicationRecords';
import { CallContent } from './CallContent';
import { CustomerInfoPanel } from './CustomerInfoPanel';

// 左侧通讯记录面板宽度
const LEFT_PANEL_WIDTH = 320;
// 右侧客户信息面板宽度
const RIGHT_PANEL_WIDTH = 380;
// 中间通话内容最小宽度
const MIN_CENTER_WIDTH = 700;

const LayoutContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

const SidePanel = styled.div<{ width: number; borderSide: 'right' | 'left' }>`
  flex-shrink: 0;
  background-color: #ffffff;
  border-${(props) => props.borderSide}: 1px solid #e5e7eb;
  overflow: hidden;
  width: ${(props) => props.width}px;
`;

const MainContent = styled.div`
  flex: 1;
  background-color: #ffffff;
  overflow: hidden;
  min-width: ${MIN_CENTER_WIDTH}px;
`;

export default function CallCenterLayout() {
  return (
    <LayoutContainer>
      {/* 左侧：通讯记录 - 固定宽度 */}
      <SidePanel width={LEFT_PANEL_WIDTH} borderSide="right">
        <CommunicationRecords />
      </SidePanel>

      {/* 中间：通话内容 - 自适应，最小宽度 */}
      <MainContent>
        <CallContent />
      </MainContent>

      {/* 右侧：客户信息 - 固定宽度 */}
      <SidePanel width={RIGHT_PANEL_WIDTH} borderSide="left">
        <CustomerInfoPanel />
      </SidePanel>
    </LayoutContainer>
  );
}
