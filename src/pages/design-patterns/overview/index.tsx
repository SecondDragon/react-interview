import React from 'react';
import { Card, Typography, Row, Col, Tag, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  patternCategories,
  type DesignPattern,
  type PatternCategory,
} from './data';

const { Title, Paragraph, Text } = Typography;

/**
 * 设计模式概览页
 * 按四大类展示所有设计模式，点击卡片跳转至对应专题
 */
const DesignPatternsOverview: React.FC = () => {
  const navigate = useNavigate();

  const getCategoryColor = (category: PatternCategory) => {
    switch (category) {
      case 'creational':
        return '#52c41a';
      case 'structural':
        return '#1890ff';
      case 'behavioral':
        return '#fa8c16';
      case 'frontend':
        return '#722ed1';
      default:
        return '#999';
    }
  };

  const getCategoryLabel = (category: PatternCategory) => {
    switch (category) {
      case 'creational':
        return '创建型模式';
      case 'structural':
        return '结构型模式';
      case 'behavioral':
        return '行为型模式';
      case 'frontend':
        return '前端特有模式';
      default:
        return '其他';
    }
  };

  const handlePatternClick = (pattern: DesignPattern) => {
    if (pattern.available) {
      navigate(pattern.path);
    }
  };

  return (
    <div>
      <Title level={2}>设计模式专题</Title>
      <Paragraph type="secondary">
        系统梳理前端开发中常用的设计模式，从经典 GoF 模式到前端特有模式，
        每个模式均包含原理讲解、代码对比、Live Demo 和实战场景分析。
      </Paragraph>

      {patternCategories.map((category) => (
        <div key={category.type} style={{ marginBottom: 32 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            <Badge
              color={getCategoryColor(category.type)}
              text={getCategoryLabel(category.type)}
            />
          </Title>

          <Row gutter={[16, 16]}>
            {category.patterns.map((pattern) => (
              <Col xs={24} sm={12} lg={8} key={pattern.key}>
                <Card
                  hoverable={pattern.available}
                  onClick={() => handlePatternClick(pattern)}
                  style={{
                    height: '100%',
                    cursor: pattern.available ? 'pointer' : 'not-allowed',
                    opacity: pattern.available ? 1 : 0.6,
                    borderTop: `3px solid ${getCategoryColor(category.type)}`,
                  }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ fontSize: 16 }}>
                      {pattern.name}
                    </Text>
                    {!pattern.available && (
                      <Tag style={{ marginLeft: 8 }} color="default">
                        待实现
                      </Tag>
                    )}
                  </div>

                  <Paragraph
                    type="secondary"
                    style={{ fontSize: 13, marginBottom: 12 }}
                  >
                    {pattern.description}
                  </Paragraph>

                  <div>
                    {pattern.scenarios.map((scenario) => (
                      <Tag
                        key={scenario}
                        color="processing"
                        style={{ marginBottom: 4, fontSize: 12 }}
                      >
                        {scenario}
                      </Tag>
                    ))}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}

      <Card style={{ marginTop: 24, background: '#f6ffed' }}>
        <Title level={5} style={{ color: '#52c41a', marginBottom: 12 }}>
          学习建议
        </Title>
        <ul style={{ paddingLeft: 20, color: '#444' }}>
          <li>
            建议按 <Text strong>创建型 → 结构型 → 行为型</Text> 的顺序学习，
            符合从对象创建到交互设计的认知路径。
          </li>
          <li>
            每个模式页面均包含 <Text strong>六维度结构</Text>：意图、原理、代码实现、
            实战场景、Live Demo、核心原理与模式关联。
          </li>
          <li>
            重点关注 <Text strong>前端特有模式</Text>，这些是面试高频考点，
            与实际开发结合最紧密。
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default DesignPatternsOverview;
