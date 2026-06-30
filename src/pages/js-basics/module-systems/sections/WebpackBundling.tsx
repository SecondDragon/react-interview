import React from 'react';
import { Card, Typography, List } from 'antd';
import CodeDiff from '@/components/CodeDiff';
import badCode from '../demos/webpack-cjs-vs-esm.bad.ts?raw';
import goodCode from '../demos/webpack-cjs-vs-esm.good.ts?raw';

const { Paragraph, Text } = Typography;

const WebpackBundling: React.FC = () => {
  return (
    <>
      <Card title="产物形态" style={{ marginBottom: 24 }}>
        <Paragraph>
          ESM 被转译为 <Text code>__webpack_require__.d(__webpack_exports__, {'{'} foo: () => foo {'}'})</Text>，使用 getter 实现 live binding。
          CJS 被转译为 <Text code>module.exports = ...</Text> 或 <Text code>__webpack_require__.n</Text> 兼容包装器。
          动态 import() 被拆分为单独 chunk，使用 <Text code>__webpack_require__.e</Text> 加载。
        </Paragraph>
      </Card>

      <Card title="对 tree-shaking 的影响" style={{ marginBottom: 24 }}>
        <List>
          <List.Item>Webpack 需要静态分析才能确定哪些导出被使用</List.Item>
          <List.Item>如果源码中存在 require 或 module.exports，Webpack 无法安全删除未使用导出</List.Item>
          <List.Item>sideEffects 配置在 ESM 项目下才能准确标记无副作用模块</List.Item>
        </List>
      </Card>

      <Card title="源码写法对比" style={{ marginBottom: 24 }}>
        <CodeDiff
          oldValue={badCode}
          newValue={goodCode}
          leftTitle="❌ 混用 CJS 导致 tree-shaking 失效"
          rightTitle="✅ 全部 ESM 利于静态分析"
          type="error"
          hideDiffMarkers={true}
        />
      </Card>
    </>
  );
};

export default WebpackBundling;
