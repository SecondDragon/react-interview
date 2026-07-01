import React, { useMemo, useState } from 'react';
import { Card, Checkbox, Space, Table, Tag, Typography, Progress, Row, Col } from 'antd';
import { treeShakingExports, treeShakingComparisonData } from './data';
import type { TreeShakingExportItem } from './data';

const { Paragraph, Text, Title } = Typography;

const TreeShakingDemo: React.FC = () => {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set(['debounce']));

  const toggleKey = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectedExports = useMemo(
    () => treeShakingExports.filter((item) => selectedKeys.has(item.key)),
    [selectedKeys]
  );

  const removedExports = useMemo(
    () => treeShakingExports.filter((item) => !selectedKeys.has(item.key)),
    [selectedKeys]
  );

  const totalSize = useMemo(
    () => treeShakingExports.reduce((sum, item) => sum + item.size, 0),
    []
  );
  const keptSize = useMemo(
    () => selectedExports.reduce((sum, item) => sum + item.size, 0),
    [selectedExports]
  );
  const removedSize = useMemo(
    () => removedExports.reduce((sum, item) => sum + item.size, 0),
    [removedExports]
  );
  const reductionPercent = Math.round((removedSize / totalSize) * 100) || 0;

  const columns = [
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (_: unknown, record: TreeShakingExportItem & { status: string }) =>
        record.status === 'kept' ? <Tag color="green">保留</Tag> : <Tag color="red">剔除</Tag>,
    },
    { title: '导出', dataIndex: 'name', key: 'name' },
    { title: '大小', dataIndex: 'size', key: 'size', render: (size: number) => `${size.toFixed(1)} KB` },
    { title: '说明', dataIndex: 'description', key: 'description' },
  ];

  const tableData = [
    ...selectedExports.map((item) => ({ ...item, status: 'kept' })),
    ...removedExports.map((item) => ({ ...item, status: 'removed' })),
  ];

  return (
    <Card title="互动演示：tree-shaking 如何决定 bundle 里留下什么">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Title level={5}>1. 模拟你在业务代码中的 import 行为</Title>
          <Paragraph>
            假设你引入了一个名为 <Text code>@utils/core</Text> 的工具库，它导出了 6 个函数。
            请勾选你实际使用到的导出：
          </Paragraph>
          <Space direction="vertical" style={{ width: '100%' }}>
            {treeShakingExports.map((item) => (
              <Checkbox
                key={item.key}
                checked={selectedKeys.has(item.key)}
                onChange={() => toggleKey(item.key)}
              >
                <Text code>{item.name}</Text> — {item.description}
              </Checkbox>
            ))}
          </Space>
        </Col>

        <Col xs={24} md={12}>
          <Title level={5}>2. 构建产物模拟</Title>
          <Paragraph>
            开启 tree-shaking 后，打包工具会根据你的 import 行为生成最终 bundle。
            未被引用的导出会被视为 dead code 并移除。
          </Paragraph>
          <Progress
            percent={reductionPercent}
            status="active"
            format={() => `已剔除 ${removedSize.toFixed(1)} KB / 共 ${totalSize.toFixed(1)} KB`}
            strokeColor="#ff4d4f"
          />
          <div style={{ marginTop: 16 }}>
            <Text strong>最终 bundle 大小：{keptSize.toFixed(1)} KB</Text>
            <br />
            <Text type="secondary">
              相比全部导入节省了 {reductionPercent}% ({removedSize.toFixed(1)} KB)
            </Text>
          </div>
        </Col>
      </Row>

      <Title level={5} style={{ marginTop: 24 }}>3. 哪些代码被保留 / 被剔除</Title>
      <Table
        dataSource={tableData}
        columns={columns}
        pagination={false}
        rowKey="key"
        size="small"
        bordered
      />

      <Title level={5} style={{ marginTop: 24 }}>4. 手动删除 vs tree-shaking 对比</Title>
      <Table
        dataSource={treeShakingComparisonData}
        columns={[
          { title: '场景', dataIndex: 'scenario', key: 'scenario' },
          { title: 'WebStorm 提示', dataIndex: 'webstorm', key: 'webstorm' },
          { title: '手动删除', dataIndex: 'manualDelete', key: 'manualDelete' },
          { title: 'tree-shaking', dataIndex: 'treeShaking', key: 'treeShaking' },
        ]}
        pagination={false}
        rowKey="key"
        size="small"
        bordered
      />
    </Card>
  );
};

export default TreeShakingDemo;
