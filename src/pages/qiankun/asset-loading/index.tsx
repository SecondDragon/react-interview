import React from 'react';
import { Typography, Space, Divider } from 'antd';
import { pageData } from './data';
import LiveDemo from './LiveDemo';
import SectionWebpackOutput from './chapters/SectionWebpackOutput';
import SectionDeploymentPath from './chapters/SectionDeploymentPath';
import SectionQiankunHtmlEntry from './chapters/SectionQiankunHtmlEntry';
import SectionMonacoWorker from './chapters/SectionMonacoWorker';
import SectionEditorBaseUrl from './chapters/SectionEditorBaseUrl';
import SectionBorderCss from './chapters/SectionBorderCss';

const QiankunAssetLoadingPage: React.FC = () => {
  return (
    <div style={{ margin: '0 auto', padding: 24 }}>
      <Typography.Title>{pageData.title}</Typography.Title>
      <Typography.Paragraph type="secondary">{pageData.subtitle}</Typography.Paragraph>

      <Divider />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <SectionWebpackOutput />
        <Divider />
        <SectionDeploymentPath />
        <Divider />
        <LiveDemo />
        <Divider />
        <SectionQiankunHtmlEntry />
        <Divider />
        <SectionMonacoWorker />
        <Divider />
        <SectionEditorBaseUrl />
        <Divider />
        <SectionBorderCss />
      </Space>
    </div>
  );
};

export default QiankunAssetLoadingPage;
