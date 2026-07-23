import React from 'react';
import { Table, Tag, Typography, Space } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { xssVectors, vectorColumns } from './data';

const XssVectorTable: React.FC = () => {
  return (
    <Table
      dataSource={xssVectors}
      columns={vectorColumns}
      pagination={false}
      size="small"
      bordered
      scroll={{ x: 1100 }}
      rowKey="key"
      expandable={{
        expandedRowRender: (record) => (
          <div style={{ padding: '12px 24px', background: '#fafafa' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Typography.Text strong style={{ color: '#faad14' }}>
                🛠️ 绕过思路
              </Typography.Text>
              <Typography.Text style={{ fontSize: 13, lineHeight: 1.8, color: '#333' }}>
                {record.bypassMethod}
              </Typography.Text>
              <div style={{ marginTop: 4 }}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  💡 说明：{record.description}
                </Typography.Text>
              </div>
            </Space>
          </div>
        ),
        expandIcon: ({ expanded, onExpand, record }) => (
          <span
            onClick={(e) => onExpand(record, e)}
            style={{ cursor: 'pointer', fontSize: 16, color: '#1890ff' }}
          >
            {expanded ? (
              <MinusCircleOutlined style={{ color: '#ff4d4f' }} />
            ) : (
              <PlusCircleOutlined />
            )}
          </span>
        ),
        rowExpandable: () => true,
      }}
    />
  );
};

export default XssVectorTable;
