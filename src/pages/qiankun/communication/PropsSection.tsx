import React from 'react';
import { Table, Typography } from 'antd';
import CodeDiff from '@/components/CodeDiff';
import { propsAdvantageTable } from './data';
import propsRegister from './demos/props-register.tsx?raw';
import propsMount from './demos/props-mount.tsx?raw';
import propsUpdate from './demos/props-update.tsx?raw';

const PropsSection: React.FC = () => {
  return (
    <section>
      <CodeDiff oldValue={propsRegister} newValue={propsRegister} leftTitle="" rightTitle="✅ registerMicroApps 传入 props" type="error" hideDiffMarkers={true} />

      <CodeDiff oldValue={propsMount} newValue={propsMount} leftTitle="" rightTitle="✅ mount 接收 props" type="error" hideDiffMarkers={true} />

      <CodeDiff oldValue={propsUpdate} newValue={propsUpdate} leftTitle="" rightTitle="✅ loadMicroApp update props" type="error" hideDiffMarkers={true} />

      <Typography.Title level={4}>对比</Typography.Title>
      <Table dataSource={propsAdvantageTable.dataSource} columns={propsAdvantageTable.columns} pagination={false} size="small" bordered />
    </section>
  );
};

export default PropsSection;
