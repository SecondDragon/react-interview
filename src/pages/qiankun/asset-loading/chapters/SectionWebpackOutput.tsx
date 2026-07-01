import React from 'react';
import { Typography, List, Alert, Table, Space, Divider } from 'antd';
import CodeDiff from '../../../../components/CodeDiff';
import { webpackOutputData } from '../data';
import badCode from '../demos/webpack-config.bad.ts?raw';
import goodCode from '../demos/webpack-config.good.ts?raw';
import runtimeBadCode from '../demos/publicpath-runtime.bad.ts?raw';
import runtimeGoodCode from '../demos/publicpath-runtime.good.ts?raw';

const SectionWebpackOutput: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{webpackOutputData.title}</Typography.Title>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Typography.Title level={4}>一、现象/问题</Typography.Title>
          <Typography.Paragraph>
            <ul>
              {webpackOutputData.phenomenon.map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          </Typography.Paragraph>
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>二、底层原因</Typography.Title>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {webpackOutputData.cause.map((item, index) => (
              <Typography.Paragraph key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </Space>

          <Typography.Title level={5}>__webpack_public_path__ 为什么能生效？</Typography.Title>
          <Typography.Paragraph>
            webpack 在构建时会把代码中的 <code>import("./mode-sql")</code> 改写成 <strong>__webpack_require__.p</strong> + <code>"js/chunk-mode-sql.js"</code>。
            <strong>__webpack_require__.p</strong> 就是 <strong>publicPath</strong> 的运行时值；在页面顶部设置 <code>__webpack_public_path__ = "https://sql.example.com/sql/"</code> 后，所有动态 <strong>chunk</strong> 的 URL 都会自动拼上这个前缀。
          </Typography.Paragraph>
          <Table
            dataSource={[
              {
                key: '1',
                stage: '源代码',
                code: 'import("./mode-sql")',
                resolvedUrl: '（尚未运行）',
              },
              {
                key: '2',
                stage: 'webpack 编译后',
                code: '__webpack_require__.e("mode-sql") 内部请求 __webpack_require__.p + "js/chunk-mode-sql.js"',
                resolvedUrl: '（依赖 __webpack_require__.p 的值）',
              },
              {
                key: '3',
                stage: '未设置 __webpack_public_path__',
                code: '__webpack_require__.p = "" 或 "/"',
                resolvedUrl: 'https://main.example.com/.../js/chunk-mode-sql.js（404）',
              },
              {
                key: '4',
                stage: '设置 __webpack_public_path__',
                code: '__webpack_public_path__ = "https://sql.example.com/sql/"',
                resolvedUrl: 'https://sql.example.com/sql/js/chunk-mode-sql.js（命中）',
              },
            ]}
            columns={[
              { title: '阶段', dataIndex: 'stage', key: 'stage' },
              { title: '代码形式', dataIndex: 'code', key: 'code' },
              { title: '最终请求 URL', dataIndex: 'resolvedUrl', key: 'resolvedUrl' },
            ]}
            pagination={false}
            size="small"
          />
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>三、如何解决</Typography.Title>
          <Typography.Paragraph>
            <strong>方案 1：</strong>构建时按环境配置 <code>output.publicPath</code>。
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
            <strong>方案 2：</strong>运行时在子应用入口最顶部动态设置 <code>__webpack_public_path__</code>，让 qiankun 和独立运行共享同一套构建产物。
          </Typography.Paragraph>
          <CodeDiff
            oldValue={runtimeBadCode}
            newValue={runtimeGoodCode}
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
            <ul>
              {webpackOutputData.example.map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          </Typography.Paragraph>
          <Alert
            type="info"
            message="结论"
            description="正确设置 publicPath 后，所有 webpack 动态 chunk 都会自动拼上正确前缀，无需在每个 import() 里手写完整 URL。"
            showIcon
          />
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>五、核心原理</Typography.Title>
          <Typography.Paragraph>
            <ul>
              {webpackOutputData.principle.map((item, index) => (
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
              dataSource={webpackOutputData.notes}
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

export default SectionWebpackOutput;
