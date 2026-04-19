import React from 'react';
import { Card, Result, Button } from 'antd';
import { useUserStore } from '../../store/useUserStore';

const MyTasks: React.FC = () => {
  const { username } = useUserStore();
  return (
    <Card title="我的专属任务">
      <Result
        status="success"
        title={`${username}，这是您的个人待办区`}
        subTitle="Zustand 状态管理已为您同步数据。"
        extra={[
          <Button type="primary" key="console">
            去处理任务
          </Button>,
        ]}
      />
    </Card>
  );
};

export default MyTasks;
