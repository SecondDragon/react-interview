import React from 'react';
import { Typography, List, Alert } from 'antd';
import CodeDiff from '../../../../components/CodeDiff';
import { hostRegisterData } from '../data';
import badCode from '../demos/host-register-js.bad.ts?raw';
import goodCode from '../demos/host-register-js.good.ts?raw';

const SectionHostRegister: React.FC = () => {
  return (
    <section>
      <Typography.Title level={2}>{hostRegisterData.title}</Typography.Title>

      <Typography.Title level={4}>一、现象/问题</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {hostRegisterData.phenomenon.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>二、底层原因</Typography.Title>
      <Typography.Paragraph>{hostRegisterData.cause}</Typography.Paragraph>

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
      <Typography.Paragraph>{hostRegisterData.solution}</Typography.Paragraph>

      <Typography.Title level={4}>五、核心原理</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {hostRegisterData.principle.map((item, index) => (
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
            dataSource={hostRegisterData.notes}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        }
      />
    </section>
  );
};

export default SectionHostRegister;
