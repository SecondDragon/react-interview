import React from 'react';
import { Table, Tag } from 'antd';
import { comparisonData } from './data';

const columns = [
  {
    title: '对比维度',
    dataIndex: 'dimension',
    key: 'dimension',
    render: (text: string) => <Tag color="purple">{text}</Tag>,
  },
  { title: 'CommonJS', dataIndex: 'commonjs', key: 'commonjs' },
  { title: 'ES Module', dataIndex: 'esm', key: 'esm' },
];

const ComparisonTable: React.FC = () => {
  return (
    <Table
      dataSource={comparisonData}
      columns={columns}
      pagination={false}
      bordered
      size="small"
    />
  );
};

export default ComparisonTable;
