import React from 'react';
import { Typography, Space, Divider } from 'antd';
import { pageData } from './data';
import LiveDemo from './LiveDemo';
import SectionIntro from './chapters/SectionIntro';
import SectionChildBuild from './chapters/SectionChildBuild';
import SectionChildEntry from './chapters/SectionChildEntry';
import SectionChildRouter from './chapters/SectionChildRouter';
import SectionHostRegister from './chapters/SectionHostRegister';
import SectionMountContainer from './chapters/SectionMountContainer';

const QiankunBasicPage: React.FC = () => {
  return (
    <div style={{ margin: '0 auto', padding: 24 }}>
      <Typography.Title>{pageData.title}</Typography.Title>
      <Typography.Paragraph type="secondary">{pageData.subtitle}</Typography.Paragraph>

      <Divider />

      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <SectionIntro />

        <LiveDemo />

        <SectionChildBuild />
        <SectionChildEntry />
        <SectionChildRouter />
        <SectionHostRegister />
        <SectionMountContainer />
      </Space>
    </div>
  );
};

export default QiankunBasicPage;
