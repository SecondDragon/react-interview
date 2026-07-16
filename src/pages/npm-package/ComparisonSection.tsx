import React from 'react';
import { Card, Table, Tag, Typography, Space, Alert } from 'antd';
import { buildToolComparison } from './data';

const { Title, Text } = Typography;

const FeatureTag: React.FC<{ value: string }> = ({ value }) => {
  if (value.includes('极')) return <Tag color="green">{value}</Tag>;
  if (value.includes('低') || value.includes('最低')) return <Tag color="green">{value}</Tag>;
  if (value.includes('中等')) return <Tag color="orange">{value}</Tag>;
  if (value.includes('不支持') || value.includes('较慢')) return <Tag color="red">{value}</Tag>;
  if (value.includes('最佳')) return <Tag color="blue">{value}</Tag>;
  return <span>{value}</span>;
};

const ComparisonSection: React.FC = () => {
  return (
    <Card title="构建工具全方位对比" style={{ marginBottom: 24 }}>
      <Alert
        type="info"
        showIcon
        message="如何选择？"
        description="如果是新项目或中型组件库，tsup 是最优解。如果需要极致的 tree-shaking 或 UMD 输出，选 Rollup。仅用于学习或简单包，tsc 够用。"
        style={{ marginBottom: 16 }}
      />
      <Table
        columns={buildToolComparison.columns.map((col) => ({
          ...col,
          render: (val: string) => <FeatureTag value={val} />,
        }))}
        dataSource={buildToolComparison.dataSource}
        pagination={false}
        size="small"
        bordered
      />
    </Card>
  );
};

export default ComparisonSection;
