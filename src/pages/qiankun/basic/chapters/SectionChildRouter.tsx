import React from 'react';
import { Typography, List, Alert } from 'antd';
import CodeDiff from '../../../../components/CodeDiff';
import { childRouterData } from '../data';
import badCode from '../demos/child-router.bad.ts?raw';
import goodCode from '../demos/child-router.good.ts?raw';

const SectionChildRouter: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{childRouterData.title}</Typography.Title>

      <Typography.Title level={4}>一、现象/问题</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {childRouterData.phenomenon.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>二、底层原因</Typography.Title>
      <Typography.Paragraph>{childRouterData.cause}</Typography.Paragraph>

      <Typography.Title level={4}>三、如何解决</Typography.Title>
      <CodeDiff
        oldValue={badCode}
        newValue={goodCode}
        leftTitle="❌ 反面教材"
        rightTitle="✅ 最佳实践"
        type="error"
        hideDiffMarkers={true}
      />

      <Typography.Title level={4}>四、为什么要这样解决</Typography.Title>
      <Typography.Paragraph>{childRouterData.solution}</Typography.Paragraph>

      <Typography.Title level={4}>五、核心原理</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {childRouterData.principle.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Alert
        type="warning"
        message="注意事项"
        description={
          <List
            size="small"
            dataSource={childRouterData.notes}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        }
      />
    </section>
  );
};

export default SectionChildRouter;
