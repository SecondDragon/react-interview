import React from 'react';
import { Table, Tag, Card } from 'antd';
import { useUserStore } from '../../store/useUserStore';

const UserList: React.FC = () => {
  const { username } = useUserStore();
  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '角色', dataIndex: 'role', key: 'role', render: (role: string) => <Tag color="blue">{role}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color="green">{status}</Tag> },
  ];

  const data = Array.from({ length: 5 }).map((_, i) => ({
    key: i,
    name: `用户 ${i + 1}`,
    role: i === 0 ? '管理员' : '普通用户',
    status: '在线',
  }));

  return (
    <Card title={`用户管理 (操作人: ${username})`}>
      <Table columns={columns} dataSource={data} pagination={false} />
      <Table columns={columns} dataSource={data} pagination={false} />
      <Table columns={columns} dataSource={data} pagination={false} />
      <Table columns={columns} dataSource={data} pagination={false} />
      <Table columns={columns} dataSource={data} pagination={false} />
      <Table columns={columns} dataSource={data} pagination={false} />
      <Table columns={columns} dataSource={data} pagination={false} />
      <Table columns={columns} dataSource={data} pagination={false} />
      <Table columns={columns} dataSource={data} pagination={false} />
      <Table columns={columns} dataSource={data} pagination={false} />
      <Table columns={columns} dataSource={data} pagination={false} />
      <Table columns={columns} dataSource={data} pagination={false} />
      <Table columns={columns} dataSource={data} pagination={false} />
      <Table columns={columns} dataSource={data} pagination={false} />
      <Table columns={columns} dataSource={data} pagination={false} />
      <Table columns={columns} dataSource={data} pagination={false} />
      <Table columns={columns} dataSource={data} pagination={false} />
      <Table columns={columns} dataSource={data} pagination={false} />
      <Table columns={columns} dataSource={data} pagination={false} />
      <Table columns={columns} dataSource={data} pagination={false} />
    </Card>
  );
};

export default UserList;
