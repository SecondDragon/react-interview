import React from 'react';
import { Card, Table, Tag } from 'antd';
import { comparisonData } from '../data';

const Comparison: React.FC = () => {
  const columns = [
    {
      title: '对比维度',
      dataIndex: 'dimension',
      key: 'dimension',
      render: (text: string) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: 'CommonJS',
      dataIndex: 'commonjs',
      key: 'commonjs',
    },
    {
      title: 'ES Module',
      dataIndex: 'esm',
      key: 'esm',
    },
  ];

  return (
    <Card title="CommonJS vs ES Module 对比" style={{ marginBottom: 24 }}>
      <Table dataSource={comparisonData} columns={columns} pagination={false} bordered size="small" />
    </Card>
  );
};

export default Comparison;
