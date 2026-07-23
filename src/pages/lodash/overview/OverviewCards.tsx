import React from 'react';
import { Card, Row, Col, Tag, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { lodashCategories, type LodashFunction } from './data';

const FunctionCard: React.FC<{ func: LodashFunction }> = ({ func }) => {
  const body = (
    <Card
      size="small"
      style={{
        height: '100%',
        opacity: func.done ? 1 : 0.6,
        border: func.done ? '1px solid #1890ff' : '1px solid #d9d9d9',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Text strong>{func.name}</Typography.Text>
        {func.done ? (
          <Tag color="blue">已实现</Tag>
        ) : (
          <Tag>待实现</Tag>
        )}
      </div>
      <Typography.Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
        {func.desc}
      </Typography.Paragraph>
      {func.done && func.path && (
        <Link to={func.path}>
          <Button type="link" size="small" style={{ padding: 0, marginTop: 8 }}>
            查看实现
          </Button>
        </Link>
      )}
    </Card>
  );

  return <Col xs={24} sm={12} md={8} lg={6} style={{ marginBottom: 16 }}>{body}</Col>;
};

const OverviewCards: React.FC = () => {
  return (
    <div>
      {lodashCategories.map((category) => (
        <div key={category.key} style={{ marginBottom: 24 }}>
          <Typography.Title level={4}>{category.title}</Typography.Title>
          <Row gutter={[16, 0]}>
            {category.functions.map((func) => (
              <FunctionCard key={func.name} func={func} />
            ))}
          </Row>
        </div>
      ))}
    </div>
  );
};

export default OverviewCards;
