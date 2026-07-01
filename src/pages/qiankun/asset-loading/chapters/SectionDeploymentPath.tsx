import React from 'react';
import { Typography, List, Alert, Table, Space, Divider } from 'antd';
import CodeDiff from '../../../../components/CodeDiff';
import { deploymentPathData } from '../data';
import badCode from '../demos/runtime-publicpath.bad.ts?raw';
import goodCode from '../demos/runtime-publicpath.good.ts?raw';
import nginxCode from '../demos/nginx-location.good.conf?raw';

const SectionDeploymentPath: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{deploymentPathData.title}</Typography.Title>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Typography.Title level={4}>一、现象/问题</Typography.Title>
          <Typography.Paragraph>
            <ul>
              {deploymentPathData.phenomenon.map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          </Typography.Paragraph>
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>二、底层原因</Typography.Title>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {deploymentPathData.cause.map((item, index) => (
              <Typography.Paragraph key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </Space>
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>三、如何解决</Typography.Title>
          <Typography.Paragraph>
            <strong>方案 1：</strong>运行时通过 <code>__webpack_public_path__</code> 动态修正资源前缀。
          </Typography.Paragraph>
          <CodeDiff
            oldValue={badCode}
            newValue={goodCode}
            leftTitle="❌ 反面教材"
            rightTitle="✅ 最佳实践"
            type="error"
            hideDiffMarkers={true}
          />
          <Typography.Paragraph>
            <strong>方案 2：</strong><strong>nginx</strong> 转发配置。
          </Typography.Paragraph>
          <Typography.Paragraph>
            由于 <strong>nginx</strong> 会把 <code>/sql/</code> 下的请求转发到子应用真实路径，<strong>Monaco</strong> 默认以当前页面路径 <code>/sql/editor.worker.js</code> 请求 <strong>Web Worker</strong> 时，<strong>nginx</strong> 会自动将其转发到子应用的 <code>editor.worker.js</code>，因此在这种部署模式下不一定需要手动配置 <code>MonacoEnvironment.getWorkerUrl</code>。
          </Typography.Paragraph>
          <Alert
            type="warning"
            message="注意"
            description="这与 qiankun 直接加载独立域名子应用的场景不同：后者浏览器地址是主应用路径，worker 文件在子应用域名下，必须显式指定绝对 URL。"
            showIcon
          />
          <CodeDiff
            oldValue={"# 未配置 nginx 转发或转发路径错误\n# （此处仅作占位，实际对比 nginx 正确配置）"}
            newValue={nginxCode}
            leftTitle="❌ 反面教材"
            rightTitle="✅ 最佳实践"
            type="error"
            hideDiffMarkers={true}
          />
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>四、为什么要这样解决</Typography.Title>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {deploymentPathData.solution.map((item, index) => (
              <Typography.Paragraph key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </Space>
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>五、核心原理</Typography.Title>
          <Typography.Paragraph>
            <ul>
              {deploymentPathData.principle.map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          </Typography.Paragraph>
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>六、nginx 相对路径转发是“万能”的吗？</Typography.Title>
          <Typography.Paragraph>
            <ul>
              {deploymentPathData.universalSummary.map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          </Typography.Paragraph>
          <Table
            dataSource={deploymentPathData.universalTable}
            columns={[
              { title: '场景', dataIndex: 'scenario', key: 'scenario' },
              { title: '是否适合', dataIndex: 'suitable', key: 'suitable' },
              { title: '说明', dataIndex: 'reason', key: 'reason' },
            ]}
            pagination={false}
            size="small"
          />
          <Typography.Paragraph style={{ marginTop: 16 }}>
            {deploymentPathData.universalConclusion}
          </Typography.Paragraph>
        </div>

        <Alert
          type="warning"
          message="注意事项"
          description={
            <List
              size="small"
              dataSource={deploymentPathData.notes}
              renderItem={(item) => (
                <List.Item>
                  <span dangerouslySetInnerHTML={{ __html: item }} />
                </List.Item>
              )}
            />
          }
          showIcon
        />
      </Space>
    </section>
  );
};

export default SectionDeploymentPath;
