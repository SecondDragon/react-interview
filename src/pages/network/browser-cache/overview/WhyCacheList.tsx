import React from 'react';
import { List } from 'antd';

interface WhyCacheListProps {
  items: string[];
}

const WhyCacheList: React.FC<WhyCacheListProps> = ({ items }) => {
  return (
    <List
      dataSource={items}
      renderItem={(item) => <List.Item>• {item}</List.Item>}
    />
  );
};

export default WhyCacheList;
