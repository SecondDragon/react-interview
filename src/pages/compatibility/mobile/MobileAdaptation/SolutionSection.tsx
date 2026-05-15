import React from 'react';
import { Card, Typography, Divider, Tag, List } from 'antd';
import CodeDiff from '@/components/CodeDiff';

const { Title, Paragraph, Text } = Typography;

/**
 * 方案数据接口
 * 每种方案都遵循 Five Dimensions 结构
 */
export interface SolutionExamples {
  title: string;
  phenomenon: string;
  reason: string;
  bad: string;
  good: string;
  whySolveThisWay: string;
  principle: string;
  pros: string[];
  cons: string[];
}

interface SolutionSectionProps {
  examples: SolutionExamples;
  demo: React.ReactNode;
  borderColor: string;
  bgColor: string;
}

/**
 * 方案章节通用包装组件
 * 严格遵循 Five Dimensions 结构渲染
 */
const SolutionSection: React.FC<SolutionSectionProps> = ({
  examples,
  demo,
  borderColor,
  bgColor,
}) => {
  return (
    <Card
      title={<Title level={4} style={{ margin: 0 }}>{examples.title}</Title>}
      style={{
        marginBottom: 32,
        borderLeft: `4px solid ${borderColor}`,
      }}
      headStyle={{ background: bgColor }}
    >
      {/* 一、现象 */}
      <Card type="inner" title="一、Bug 出现的现象" size="small" style={{ marginBottom: 16 }}>
        <Paragraph>{examples.phenomenon}</Paragraph>
      </Card>

      {/* 二、原因 */}
      <Card type="inner" title="二、Bug 出现的底层原因" size="small" style={{ marginBottom: 16 }}>
        <Paragraph>{examples.reason}</Paragraph>
      </Card>

      {/* 三、解决 */}
      <Card type="inner" title="三、Bug 如何解决" size="small" style={{ marginBottom: 16 }}>
        <CodeDiff
          oldValue={examples.bad}
          newValue={examples.good}
          leftTitle="❌ 反面教材"
          rightTitle="✅ 最佳实践"
          type="error"
          hideDiffMarkers={true}
        />
      </Card>

      {/* 四、互动演示 */}
      <Card
        type="inner"
        title={
          <span>
            四、为什么要这样解决 且互动演示
            <Tag color="blue" style={{ marginLeft: 8 }}>Live Demo</Tag>
          </span>
        }
        size="small"
        style={{ marginBottom: 16 }}
      >
        <Paragraph style={{ whiteSpace: 'pre-line' }}>{examples.whySolveThisWay}</Paragraph>
        <Divider />
        {demo}
      </Card>

      {/* 五、核心原理 */}
      <Card type="inner" title="五、Bug 能解决的核心原理" size="small">
        <Paragraph style={{ whiteSpace: 'pre-line' }}>{examples.principle}</Paragraph>

        <Divider orientation="left">优缺点总结</Divider>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          <Card size="small" title={<Tag color="green">优点</Tag>}>
            <List
              size="small"
              dataSource={examples.pros}
              renderItem={(item) => (
                <List.Item>
                  <Text>✅ {item}</Text>
                </List.Item>
              )}
            />
          </Card>
          <Card size="small" title={<Tag color="red">缺点</Tag>}>
            <List
              size="small"
              dataSource={examples.cons}
              renderItem={(item) => (
                <List.Item>
                  <Text>❌ {item}</Text>
                </List.Item>
              )}
            />
          </Card>
        </div>
      </Card>
    </Card>
  );
};

export default SolutionSection;
