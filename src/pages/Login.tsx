import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { useUserStore } from '../store/useUserStore';

const Login: React.FC = observer(() => {
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  const onFinish = (values: any) => {
    console.log('Success:', values);
    setUser(values.username); // 保存用户名
    message.success('登录成功');
    navigate('/dashboard');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card title="用户登录" style={{ width: 400 }}>
        <Form name="basic" onFinish={onFinish} layout="vertical">
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
});

export default Login;
