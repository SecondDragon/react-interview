import React from 'react';
import { Typography, List, Alert, Table, Space, Divider } from 'antd';
import { htmlEntryData } from '../data';
import CodeDiff from '../../../../components/CodeDiff';
import htmlEntryBad from '../demos/html-entry.bad.html?raw';
import htmlEntryGood from '../demos/html-entry.good.html?raw';
import htmlEntryAbsolute from '../demos/html-entry.absolute.html?raw';
import webpackPublicPathGood from '../demos/webpack-config.publicpath.good.ts?raw';
import runtimePublicPathGood from '../demos/runtime-publicpath.good.ts?raw';

const SectionQiankunHtmlEntry: React.FC = () => {
  return (
    <section>
      <Typography.Title level={3}>{htmlEntryData.title}</Typography.Title>

      <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Typography.Title level={4}>一、现象/问题</Typography.Title>
          <Typography.Paragraph>
            <ul>
              {htmlEntryData.phenomenon.map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          </Typography.Paragraph>
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>二、底层原因</Typography.Title>
          <Space orientation="vertical" size="small" style={{ width: '100%' }}>
            {htmlEntryData.cause.map((item, index) => (
              <Typography.Paragraph key={index}>
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </Typography.Paragraph>
            ))}
          </Space>
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>三、如何解决</Typography.Title>
          <Typography.Paragraph>
            下面给出 4 种方案，按侵入性从低到高排列。每种方案都提供“反面教材”与“最佳实践”对比。
          </Typography.Paragraph>

          <Typography.Title level={5}>方案 1：静态 HTML 标签使用绝对路径或协议相对 URL</Typography.Title>
          <Typography.Paragraph>
            在子应用构建产物 <code>index.html</code> 中，把相对路径改成以子应用真实域名为基准的绝对路径或协议相对 URL。
          </Typography.Paragraph>
          <CodeDiff
            oldValue={htmlEntryBad}
            newValue={htmlEntryGood}
            leftTitle="❌ 相对路径"
            rightTitle="✅ 协议相对 URL"
            type="error"
            language="html"
            hideDiffMarkers={true}
          />

          <Typography.Title level={5}>方案 2：webpack output.publicPath 配置绝对路径</Typography.Title>
          <Typography.Paragraph>
            构建时统一把 <strong>chunk</strong> 路径前缀指向子应用真实部署路径或 CDN，这样 JS 内部动态加载 <code>import()</code> 或按需 <strong>chunk</strong> 也会带上正确前缀。
          </Typography.Paragraph>
          <CodeDiff
            code={webpackPublicPathGood}
            title="webpack.config.js：配置绝对 publicPath"
            type="success"
            language="typescript"
          />

          <Typography.Title level={5}>方案 3：运行时通过 __webpack_public_path__ 动态设置</Typography.Title>
          <Typography.Paragraph>
            qiankun 加载子应用时会把 entry URL 注入到 <code>window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__</code>。子应用入口 JS 最顶部读取该变量并赋值给 <code>__webpack_public_path__</code>，让 webpack 的 <strong>chunk</strong> 加载路径随环境变化。
          </Typography.Paragraph>
          <CodeDiff
            code={runtimePublicPathGood}
            title="子应用入口：运行时设置 __webpack_public_path__"
            type="success"
            language="typescript"
          />

          <Typography.Title level={5}>方案 4：HTML 标签全部使用绝对路径</Typography.Title>
          <Typography.Paragraph>
            如果子应用无法运行时设置 <code>__webpack_public_path__</code>，可以构建时把所有入口标签都写成绝对路径，并把 CSS 中 <code>url()</code> 也处理成绝对路径。最稳妥但维护成本最高。
          </Typography.Paragraph>
          <CodeDiff
            code={htmlEntryAbsolute}
            title="index.html：所有资源写死绝对路径或协议相对 URL"
            type="success"
            language="html"
          />

          <Typography.Title level={5}>URL 形式对比表</Typography.Title>
          <Table
            dataSource={htmlEntryData.urlFormTable}
            columns={[
              { title: '形式', dataIndex: 'form', key: 'form' },
              { title: '写法示例', dataIndex: 'example', key: 'example' },
              { title: '独立运行解析结果', dataIndex: 'standalone', key: 'standalone' },
              { title: 'qiankun 嵌入解析结果', dataIndex: 'qiankun', key: 'qiankun' },
              { title: '适用场景', dataIndex: 'scenario', key: 'scenario' },
            ]}
            pagination={false}
            size="small"
          />
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>四、为什么要这样解决</Typography.Title>
          <Space orientation="vertical" size="small" style={{ width: '100%' }}>
            {htmlEntryData.solution.map((item, index) => (
              <Typography.Paragraph key={index}>
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </Typography.Paragraph>
            ))}
          </Space>
        </div>

        <Divider />

        <div>
          <Typography.Title level={4}>五、核心原理</Typography.Title>
          <Typography.Paragraph>
            <ul>
              {htmlEntryData.principle.map((item, index) => (
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
              dataSource={htmlEntryData.notes}
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

export default SectionQiankunHtmlEntry;
