import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { useUserStore } from '../../store/useUserStore';
import { useTodoStore } from '../../store/useTodoStore';
import { observer } from 'mobx-react-lite';

const Overview: React.FC = observer(() => {
  const { username } = useUserStore();
  const { todos } = useTodoStore();
  const completedCount = todos.filter(t => t.completed).length;

  return (
    <Card title="系统概览">
      <Row gutter={16}>
        <Col span={12}><Statistic title="当前用户" value={username || '未登录'} /></Col>
        <Col span={12}><Statistic title="任务完成率" value={completedCount} suffix={`/ ${todos.length}`} /></Col>
      </Row>
    </Card>
  );
});

export default Overview;
