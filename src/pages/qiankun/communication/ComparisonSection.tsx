import React from 'react';
import { Table } from 'antd';
import { comparisonTable } from './data';

const ComparisonSection: React.FC = () => {
  return (
    <section>
      <Table dataSource={comparisonTable.dataSource} columns={comparisonTable.columns} pagination={false} size="small" bordered />
    </section>
  );
};

export default ComparisonSection;
