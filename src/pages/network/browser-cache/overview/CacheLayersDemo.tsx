import React, { useState } from 'react';
import { Card, Col, Descriptions, Row, Tag, Typography } from 'antd';
import type { CacheLayer } from './data';

interface CacheLayersDemoProps {
  layers: CacheLayer[];
}

const CacheLayersDemo: React.FC<CacheLayersDemoProps> = ({ layers }) => {
  const [selected, setSelected] = useState<CacheLayer>(layers[0]);

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {layers.map((layer) => (
          <Col xs={24} sm={12} md={6} key={layer.key}>
            <Card
              hoverable
              onClick={() => setSelected(layer)}
              style={{
                borderColor: selected.key === layer.key ? '#1890ff' : undefined,
                background: selected.key === layer.key ? '#e6f7ff' : undefined,
              }}
            >
              <Typography.Text strong>
                <Tag color="blue">{layer.priority}</Tag> {layer.name}
              </Typography.Text>
            </Card>
          </Col>
        ))}
      </Row>
      <Card title={`${selected.name} 详情`}>
        <Descriptions bordered column={{ xs: 1, md: 2 }}>
          <Descriptions.Item label="优先级">{selected.priority}</Descriptions.Item>
          <Descriptions.Item label="速度">{selected.speed}</Descriptions.Item>
          <Descriptions.Item label="容量">{selected.capacity}</Descriptions.Item>
          <Descriptions.Item label="生命周期">{selected.lifecycle}</Descriptions.Item>
          <Descriptions.Item label="典型资源" span={2}>
            {selected.examples}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default CacheLayersDemo;
