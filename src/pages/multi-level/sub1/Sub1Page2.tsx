import React from 'react';
import {Card, Result} from 'antd';
import {SmileOutlined} from '@ant-design/icons';

const Sub1Page2: React.FC = () => (
  <Card title="三级路由 1-2">
    <Result
      icon={<SmileOutlined/>}
      title="三级页面：已完成渲染"
      subTitle="这是基于 React 19 并发渲染和 Vite 懒加载特性的深度嵌套路由示范。"
    />
  </Card>
);

export default Sub1Page2;
