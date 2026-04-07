import React from 'react';
import {Card, Descriptions, Tag} from 'antd';

const Sub1Page1: React.FC = () => (
  <Card title="三级路由 1-1">
    <Descriptions title="页面元数据" bordered>
      <Descriptions.Item label="所属模块">二级菜单 A</Descriptions.Item>
      <Descriptions.Item label="路由层级">3</Descriptions.Item>
      <Descriptions.Item label="状态"><Tag color="processing">测试中</Tag></Descriptions.Item>
    </Descriptions>
  </Card>
);

export default Sub1Page1;
