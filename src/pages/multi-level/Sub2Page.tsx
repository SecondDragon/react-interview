import React from 'react';
import {Card, Result, Button} from 'antd';
import {useNavigate} from 'react-router-dom';

const Sub2Page: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Card title="二级菜单 B (直达页面)">
      <Result
        status="warning"
        title="该页面演示：从二级直接跳转，不开启三级"
        extra={
          <Button type="primary" onClick={() => navigate('/dashboard/multi-level/sub1/page1')}>
            去三级页面看看
          </Button>
        }
      />
    </Card>
  );
};

export default Sub2Page;
