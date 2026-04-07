import React from 'react';
import {Card, Table, Tag} from 'antd';
import {useTodoStore} from '../../store/useTodoStore';
import {observer} from 'mobx-react-lite';

const TaskList: React.FC = observer(() => {
  const {todos} = useTodoStore();
  const columns = [
    {title: '任务内容', dataIndex: 'text', key: 'text'},
    {title: '任务内容', dataIndex: 'text', key: 'text'},
    {title: '任务内容', dataIndex: 'text', key: 'text'},
    {title: '任务内容', dataIndex: 'text', key: 'text'},
    {title: '任务内容', dataIndex: 'text', key: 'text'},
    {title: '任务内容', dataIndex: 'text', key: 'text'},
    {title: '任务内容', dataIndex: 'text', key: 'text'},
    {title: '任务内容', dataIndex: 'text', key: 'text'},
    {title: '任务内容', dataIndex: 'text', key: 'text'},
    {
      title: '状态',
      dataIndex: 'completed',
      key: 'completed',
      render: (val: boolean) => <Tag color={val ? 'green' : 'orange'}>{val ? '已完成' : '进行中'}</Tag>
    }
  ];

  // MobX observable arrays are sometimes strictly type-checked and might need slicing.
  // But usually Ant Design Table handles it. If not, we can use todos.slice().
  return (
    <Card title="全部任务列表">
      <Table dataSource={todos.slice()} columns={columns} rowKey="id"/>
    </Card>
  );
});

export default TaskList;
