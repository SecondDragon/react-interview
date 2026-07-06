import React from 'react';
import { Typography, Table, Divider } from 'antd';
import CodeDiff from '@/components/CodeDiff';
import { comparisonData } from './data';

import iframeBasic from './demos/iframe-basic.html?raw';
import iframeCommunication from './demos/iframe-communication.html?raw';
import iframeAutoHeight from './demos/iframe-auto-height.html?raw';
import iframeMemoryLeak from './demos/iframe-memory-leak.html?raw';
import qiankunRegister from './demos/qiankun-register.tsx?raw';
import qiankunCommunication from './demos/qiankun-communication.tsx?raw';
import qiankunStyleSharing from './demos/qiankun-style-sharing.tsx?raw';

const demoMap: Record<string, string> = {
  'iframe-basic.html': iframeBasic,
  'iframe-communication.html': iframeCommunication,
  'iframe-auto-height.html': iframeAutoHeight,
  'iframe-memory-leak.html': iframeMemoryLeak,
  'qiankun-register.tsx': qiankunRegister,
  'qiankun-communication.tsx': qiankunCommunication,
  'qiankun-style-sharing.tsx': qiankunStyleSharing,
};

const ComparisonSection: React.FC = () => {
  return (
    <>
      {comparisonData.map((dimension) => (
        <section key={dimension.id}>
          <Typography.Title level={3}>{dimension.title}</Typography.Title>

          <Typography.Paragraph>{dimension.summary}</Typography.Paragraph>

          <Table
            dataSource={dimension.table.dataSource}
            columns={dimension.table.columns}
            pagination={false}
            size="small"
            bordered
            style={{ marginBottom: 16 }}
          />

          {dimension.badDemo && dimension.goodDemo && (
            <>
              <Typography.Title level={5}>代码示例对比</Typography.Title>
              <CodeDiff
                oldValue={demoMap[dimension.badDemo] || ''}
                newValue={demoMap[dimension.goodDemo] || ''}
                leftTitle={dimension.badDesc ? `❌ ${dimension.badDesc}` : '❌ iframe'}
                rightTitle={dimension.goodDesc ? `✅ ${dimension.goodDesc}` : '✅ qiankun'}
                type="error"
                hideDiffMarkers={true}
              />
            </>
          )}

          <Divider />
        </section>
      ))}
    </>
  );
};

export default ComparisonSection;
