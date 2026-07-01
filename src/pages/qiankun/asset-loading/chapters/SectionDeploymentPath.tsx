import React from 'react';
import { Typography, List, Alert } from 'antd';
import CodeDiff from '../../../../components/CodeDiff';
import { deploymentPathData } from '../data';
import badCode from '../demos/runtime-publicpath.bad.ts?raw';
import goodCode from '../demos/runtime-publicpath.good.ts?raw';
import nginxCode from '../demos/nginx-location.good.conf?raw';

const SectionDeploymentPath: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{deploymentPathData.title}</Typography.Title>

      <Typography.Title level={4}>一、现象/问题</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {deploymentPathData.phenomenon.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Typography.Paragraph>

      <Typography.Title level={4}>二、底层原因</Typography.Title>
      <Typography.Paragraph>{deploymentPathData.cause}</Typography.Paragraph>

      <Typography.Title level={4}>三、如何解决</Typography.Title>
      <Typography.Paragraph>1. 运行时 __webpack_public_path__：</Typography.Paragraph>
      <CodeDiff
        oldValue={badCode}
        newValue={goodCode}
        leftTitle="❌ 反面教材"
        rightTitle="✅ 最佳实践"
        type="error"
        hideDiffMarkers={true}
      />
      <Typography.Paragraph>2. nginx 转发配置：</Typography.Paragraph>
      <CodeDiff
        oldValue={"# 未配置 nginx 转发或转发路径错误\n# （此处仅作占位，实际对比 nginx 正确配置）"}
        newValue={nginxCode}
        leftTitle="❌ 反面教材"
        rightTitle="✅ 最佳实践"
        type="error"
        hideDiffMarkers={true}
      />

      <Typography.Title level={4}>四、为什么要这样解决</Typography.Title>
      <Typography.Paragraph>{deploymentPathData.solution}</Typography.Paragraph>

      <Typography.Title level={4}>五、核心原理</Typography.Title>
      <Typography.Paragraph>
        <ul>
          {deploymentPathData.principle.map((item, index) => (
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
            dataSource={deploymentPathData.notes}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        }
      />
    </section>
  );
};

export default SectionDeploymentPath;
