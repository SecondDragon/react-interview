import React from 'react';
import { Card, Table, Tag, Typography } from 'antd';
import { dimensionApiData } from './Examples';

const { Text } = Typography;

/**
 * 尺寸 API 对比表格
 * 展示所有浏览器尺寸 API 的详细对比
 */
const DimensionTable: React.FC = () => {
  const columns = [
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: '70px',
      render: (text: string) => {
        const colorMap: Record<string, string> = {
          Window: 'blue',
          Document: 'green',
          Element: 'orange',
        };
        return <Tag color={colorMap[text] || 'default'}>{text}</Tag>;
      },
    },
    {
      title: 'API',
      dataIndex: 'api',
      key: 'api',
      width: '220px',
      render: (text: string) => <Text code style={{ fontSize: '12px' }}>{text}</Text>,
    },
    {
      title: '含义',
      dataIndex: 'meaning',
      key: 'meaning',
      width: '180px',
    },
    {
      title: '包含内容',
      dataIndex: 'includes',
      key: 'includes',
      width: '160px',
      render: (text: string) => <Text type="secondary" style={{ fontSize: '12px' }}>{text}</Text>,
    },
    {
      title: '坐标系',
      dataIndex: 'coordinate',
      key: 'coordinate',
      width: '70px',
      render: (text: string) => {
        const color = text === 'CSS 像素' ? 'blue' : text === 'DIP' ? 'green' : 'orange';
        return <Tag color={color} style={{ fontSize: '11px' }}>{text}</Tag>;
      },
    },
    {
      title: '受缩放影响',
      dataIndex: 'affectedByZoom',
      key: 'affectedByZoom',
      width: '80px',
      render: (value: boolean) => (
        <Tag color={value ? 'red' : 'green'} style={{ fontSize: '11px' }}>
          {value ? '✅ 是' : '❌ 否'}
        </Tag>
      ),
    },
    {
      title: '受滚动影响',
      dataIndex: 'affectedByScroll',
      key: 'affectedByScroll',
      width: '80px',
      render: (value: boolean) => (
        <Tag color={value ? 'red' : 'green'} style={{ fontSize: '11px' }}>
          {value ? '✅ 是' : '❌ 否'}
        </Tag>
      ),
    },
    {
      title: '常见用途',
      dataIndex: 'commonUse',
      key: 'commonUse',
      width: '15%',
      render: (text: string) => <Text style={{ fontSize: '12px' }}>{text}</Text>,
    },
  ];

  return (
    <Card
      title="📊 浏览器尺寸 API 全面对比"
      style={{ marginBottom: '24px', borderLeft: '4px solid #1890ff' }}
    >
      <Table
        columns={columns}
        dataSource={dimensionApiData}
        pagination={false}
        size="small"
        bordered
        scroll={{ x: 'max-content' }}
      />

      <div style={{ marginTop: '16px', padding: '12px', background: '#f6ffed', borderRadius: '4px' }}>
        <Text strong style={{ color: '#52c41a' }}>💡 记忆口诀：</Text>
        <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '13px' }}>
          <li>
            <Text code>clientWidth</Text> = 内容区 + 内边距（不含边框、滚动条）
          </li>
          <li>
            <Text code>offsetWidth</Text> = 内容区 + 内边距 + 边框 + 滚动条（总占位）
          </li>
          <li>
            <Text code>scrollWidth</Text> = 所有内容的总宽度（含溢出部分）
          </li>
          <li>
            <Text code>innerWidth</Text> = 窗口可视区（含滚动条）
          </li>
          <li>
            <Text code>screen.width</Text> = 屏幕 DIP（不受缩放影响）
          </li>
          <li>
            <Text code>visualViewport.width</Text> = 用户实际看到的区域（缩放时变化）
          </li>
        </ul>
      </div>
    </Card>
  );
};

export default DimensionTable;
