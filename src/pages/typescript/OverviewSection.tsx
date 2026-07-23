import React from 'react';
import { Card, Row, Col, Tag, Typography, Progress } from 'antd';
import { useNavigate } from 'react-router-dom';
import { chapters, ChapterItem } from './data';

const themeColors = [
  { bg: '#e6f7ff', border: '#91d5ff', tag: 'blue' },
  { bg: '#fff7e6', border: '#ffd591', tag: 'orange' },
  { bg: '#f6ffed', border: '#b7eb8f', tag: 'green' },
  { bg: '#fff0f6', border: '#ffadd2', tag: 'pink' },
  { bg: '#f0f5ff', border: '#adc6ff', tag: 'purple' },
  { bg: '#e6fffb', border: '#87e8de', tag: 'cyan' },
  { bg: '#fffbe6', border: '#ffe58f', tag: 'gold' },
  { bg: '#f9f0ff', border: '#d3adf7', tag: 'magenta' },
  { bg: '#fcfcfc', border: '#d9d9d9', tag: 'default' },
  { bg: '#f0f2f5', border: '#a0a0a0', tag: 'geekblue' },
];

const chapterIcons = [
  '🔤',
  '🔗',
  '🎯',
  '🏗️',
  '🛡️',
  '⚡',
  '🧰',
  '📄',
  '⚙️',
  '🏋️',
];

const OverviewSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Row gutter={[16, 16]}>
      {chapters.map((chapter: ChapterItem, index: number) => {
        const color = themeColors[index % themeColors.length];
        const isDone = !!chapter.path;

        return (
          <Col xs={24} sm={12} lg={8} key={chapter.key}>
            <Card
              hoverable={isDone}
              style={{
                borderLeft: `4px solid ${color.border}`,
                background: color.bg,
                height: '100%',
                cursor: isDone ? 'pointer' : 'default',
                opacity: isDone ? 1 : 0.7,
              }}
              onClick={() => {
                if (isDone && chapter.path) {
                  navigate(chapter.path);
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 24, marginRight: 10 }}>
                  {chapterIcons[index]}
                </span>
                <div>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    {chapter.order}. {chapter.title}
                  </Typography.Title>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {chapter.subtitle}
                  </Typography.Text>
                </div>
              </div>

              <Typography.Paragraph
                type="secondary"
                style={{ fontSize: 13, marginBottom: 12 }}
              >
                {chapter.description}
              </Typography.Paragraph>

              <div style={{ marginBottom: 12 }}>
                {chapter.topics.map((topic) => (
                  <Tag
                    key={topic}
                    color={color.tag as string}
                    style={{ marginBottom: 4, fontSize: 12 }}
                  >
                    {topic}
                  </Tag>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {isDone ? '✅ 已完成' : '📝 待更新'}
                </Typography.Text>
                {isDone && (
                  <Typography.Text type="primary" style={{ fontSize: 12 }}>
                    开始学习 →
                  </Typography.Text>
                )}
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default OverviewSection;
