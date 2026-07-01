import React from 'react';
import { Typography, List, Alert, Space, Divider } from 'antd';
import CodeDiff from '../../../../components/CodeDiff';
import { editorBaseUrlData } from '../data';
import badCode from '../demos/codemirror-config.bad.ts?raw';
import goodCode from '../demos/codemirror-config.good.ts?raw';

const SectionEditorBaseUrl: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{editorBaseUrlData.title}</Typography.Title>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Typography.Title level={4}>一、现象/问题</Typography.Title>
          <Typography.Paragraph>
            <ul>
              {editorBaseUrlData.phenomenon.map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          </Typography.Paragraph>
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>二、底层原因</Typography.Title>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {editorBaseUrlData.cause.map((item, index) => (
              <Typography.Paragraph key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </Space>
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>三、如何解决</Typography.Title>
          <Typography.Paragraph>
            通过 <code>CodeMirror.modeURL</code> 和 <code>CodeMirror.themeURL</code> 显式指定资源基础路径，避免依赖浏览器默认相对路径解析。
          </Typography.Paragraph>
          <CodeDiff
            oldValue={badCode}
            newValue={goodCode}
            leftTitle="❌ 反面教材"
            rightTitle="✅ 最佳实践"
            type="error"
            hideDiffMarkers={true}
          />
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>四、为什么要这样解决</Typography.Title>
          <Typography.Paragraph>
            <strong>CodeMirror</strong> 和 <strong>Monaco</strong> 这类编辑器库都是运行时按需加载资源，它们的加载逻辑不经过 webpack 的 <strong>publicPath</strong>。只有显式配置它们的 base URL，才能确保子应用在任何部署路径下都能找到对应的 mode、theme 和 addon 文件。
          </Typography.Paragraph>
          <Alert
            type="info"
            message="核心结论"
            description="编辑器资源加载失败时，优先检查是否显式设置了 modeURL / themeURL / getWorkerUrl，而不是反复调整 webpack publicPath。"
            showIcon
          />
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>五、核心原理</Typography.Title>
          <Typography.Paragraph>
            <ul>
              {editorBaseUrlData.principle.map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          </Typography.Paragraph>
        </div>

        <Alert
          type="warning"
          message="注意事项"
          description={
            <List
              size="small"
              dataSource={editorBaseUrlData.notes}
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

export default SectionEditorBaseUrl;
