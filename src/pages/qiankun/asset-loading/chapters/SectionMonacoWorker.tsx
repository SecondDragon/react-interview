import React from 'react';
import { Typography, List, Alert, Table, Space, Divider } from 'antd';
import CodeDiff from '../../../../components/CodeDiff';
import { monacoWorkerData } from '../data';
import badCode from '../demos/monaco-environment.bad.ts?raw';
import goodCode from '../demos/monaco-environment.good.ts?raw';
import workerContextBadCode from '../demos/worker-context.bad.ts?raw';
import workerContextGoodCode from '../demos/worker-context.good.ts?raw';

const SectionMonacoWorker: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{monacoWorkerData.title}</Typography.Title>

      <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Typography.Title level={4}>一、现象/问题</Typography.Title>
          <Typography.Paragraph>
            <ul>
              {monacoWorkerData.phenomenon.map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          </Typography.Paragraph>
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>二、底层原因</Typography.Title>
          <Space orientation="vertical" size="small" style={{ width: '100%' }}>
            {monacoWorkerData.cause.map((item, index) => (
              <Typography.Paragraph key={index}>
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </Typography.Paragraph>
            ))}
          </Space>

          <Typography.Title level={5}>主线程请求 vs Web Worker 请求</Typography.Title>
          <Typography.Paragraph>
            在 HTML/主线程中，webpack 会把动态加载的 <code>import()</code> 替换为基于 <strong>__webpack_require__.p</strong> 的 URL；但 <strong>Web Worker</strong> 的创建和 Worker 内部的 <code>importScripts()</code> 是浏览器原生行为，不经过 webpack 的模块系统。
          </Typography.Paragraph>
          <Table
            dataSource={[
              {
                key: '1',
                phase: '主线程动态加载',
                code: 'import("./mode-sql")',
                resolve: 'webpack 改写为 __webpack_require__.p + chunkId',
                publicPath: '受 __webpack_public_path__ 控制',
              },
              {
                key: '2',
                phase: '创建 Worker',
                code: 'new Worker("./editor.worker.js")',
                resolve: '浏览器按 document.baseURI 解析字符串 URL',
                publicPath: '不受 __webpack_public_path__ 控制',
              },
              {
                key: '3',
                phase: 'Worker 内部加载依赖',
                code: 'self.importScripts("./sql.js")',
                resolve: '浏览器按 Worker 文件所在 URL 解析',
                publicPath: 'Worker 有独立全局作用域，主线程 publicPath 不可见',
              },
            ]}
            columns={[
              { title: '阶段', dataIndex: 'phase', key: 'phase' },
              { title: '示例代码', dataIndex: 'code', key: 'code' },
              { title: 'URL 如何确定', dataIndex: 'resolve', key: 'resolve' },
              { title: 'publicPath 是否生效', dataIndex: 'publicPath', key: 'publicPath' },
            ]}
            pagination={false}
            size="small"
          />
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>三、如何解决</Typography.Title>
          <Typography.Paragraph>
            <strong>方案 1：</strong>配置 <code>MonacoEnvironment.getWorkerUrl</code>，为 Monaco 创建 <strong>Web Worker</strong> 提供正确 URL。
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
            <strong>方案 2：</strong>在 <strong>Web Worker</strong> 内部加载依赖时同样不要依赖主线程的 <code>__webpack_public_path__</code>，而是使用绝对路径或基于 Worker 文件自身 URL 计算的路径。
          </Typography.Paragraph>
          <CodeDiff
            oldValue={workerContextBadCode}
            newValue={workerContextGoodCode}
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
              {monacoWorkerData.comparison.map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          </Typography.Paragraph>
          <Alert
            type="info"
            message="结论"
            description="__webpack_public_path__ 只能救主线程的 webpack chunk，救不了原生 new Worker() 和 importScripts() 的 URL 解析。"
            showIcon
          />
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>五、核心原理</Typography.Title>
          <Typography.Paragraph>
            <ul>
              {monacoWorkerData.principle.map((item, index) => (
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
              dataSource={monacoWorkerData.notes}
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

export default SectionMonacoWorker;
