import React from 'react';
import { Card, Table, Tag } from 'antd';
import { useTodoStore } from '../../store/useTodoStore';

const TaskList: React.FC = () => {
  const { todos } = useTodoStore();
  const columns = [
    { title: '任务内容', dataIndex: 'text', key: 'text' },
    { title: '任务内容', dataIndex: 'text', key: 'text' },
    { title: '任务内容', dataIndex: 'text', key: 'text' },
    { title: '任务内容', dataIndex: 'text', key: 'text' },
    { title: '任务内容', dataIndex: 'text', key: 'text' },
    { title: '任务内容', dataIndex: 'text', key: 'text' },
    { title: '任务内容', dataIndex: 'text', key: 'text' },
    { title: '任务内容', dataIndex: 'text', key: 'text' },
    { title: '任务内容', dataIndex: 'text', key: 'text' },
    { title: '状态', dataIndex: 'completed', key: 'completed', render: (val: boolean) => <Tag color={val ? 'green' : 'orange'}>{val ? '已完成' : '进行中'}</Tag> }
  ];

  return (
    <Card title="全部任务列表">
      <Table dataSource={todos} columns={columns} rowKey="id" />
    </Card>
  );
};

export default TaskList;
