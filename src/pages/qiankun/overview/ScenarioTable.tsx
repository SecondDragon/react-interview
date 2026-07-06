import React from 'react';
import { Table, Tag, Typography } from 'antd';
import { scenarioTableData } from './data';

const ScenarioTable: React.FC = () => {
  return (
    <>
      <Typography.Title level={4}>常见场景对照</Typography.Title>
      <Table
        dataSource={scenarioTableData}
        pagination={false}
        size="small"
        bordered
        columns={[
          { title: '场景', dataIndex: 'scenario', key: 'scenario' },
          {
            title: '推荐方案',
            dataIndex: 'recommendation',
            key: 'recommendation',
            render: (text: string) => {
              const color = text.includes('qiankun') ? 'blue' : text.includes('两者') ? 'purple' : 'green';
              return <Tag color={color}>{text}</Tag>;
            },
          },
          { title: '原因', dataIndex: 'reason', key: 'reason' },
        ]}
      />
    </>
  );
};

export default ScenarioTable;
