import React from 'react';
import { Card, Typography, List, Alert } from 'antd';
import CodeDiff from '@/components/CodeDiff';
import badCode from '../demos/commonjs-native.bad.cjs?raw';
import goodCode from '../demos/commonjs-native.good.cjs?raw';
import badCircular from '../demos/commonjs-circular.bad.cjs?raw';
import goodCircular from '../demos/commonjs-circular.good.cjs?raw';

const { Paragraph, Text } = Typography;

const CommonJSIntro: React.FC = () => {
  return (
    <>
      <Card title="语法与核心概念" style={{ marginBottom: 24 }}>
        <Paragraph>
          <Text code>require(id)</Text> 是同步加载函数，返回 <Text code>module.exports</Text>。
          <Text code>module.exports</Text> 初始为 <Text code>{ }</Text>，是真正的导出对象。
          <Text code>exports</Text> 只是 <Text code>module.exports</Text> 的引用，只能附加属性，不能整体赋值。
        </Paragraph>
      </Card>

      <Card title="运行时数据结构" style={{ marginBottom: 24 }}>
        <List>
          <List.Item>
            <Text strong>Module 对象：</Text>包含 id、filename、exports、parent、children、loaded 等字段
          </List.Item>
          <List.Item>
            <Text strong>require.cache / Module._cache：</Text>缓存已加载模块，避免重复执行
          </List.Item>
          <List.Item>
            <Text strong>module.exports：</Text>初始为 {'{}'}，顶层代码执行后可能被替换为新的对象或基本类型
          </List.Item>
        </List>
      </Card>

      <Card title="执行流程" style={{ marginBottom: 24 }}>
        <List>
          <List.Item>1. require(&apos;x&apos;) 调用 Module._resolveFilename 解析路径</List.Item>
          <List.Item>2. Module._load 检查缓存，若未加载则创建 Module 实例</List.Item>
          <List.Item>3. 调用 Module.load 读取文件内容并包装成函数</List.Item>
          <List.Item>4. 同步执行模块顶层代码，填充 module.exports</List.Item>
          <List.Item>5. 返回 module.exports</List.Item>
        </List>
      </Card>

      <Card title="常见错误：exports 被重新赋值" style={{ marginBottom: 24 }}>
        <CodeDiff
          oldValue={badCode}
          newValue={goodCode}
          leftTitle="❌ 反面教材"
          rightTitle="✅ 最佳实践"
          type="error"
          hideDiffMarkers={true}
        />
      </Card>

      <Card title="循环依赖" style={{ marginBottom: 24 }}>
        <Alert
          message="循环依赖中的半成品导出"
          description="当 a 执行到 require('./b') 时暂停，b 又 require('./a')，此时 a 的 module.exports 已存在但尚未填充。若 b 立即读取 a 的导出，会拿到 undefined。"
          type="warning"
          showIcon
        />
        <div style={{ marginTop: 16 }}>
          <CodeDiff
            oldValue={badCircular}
            newValue={goodCircular}
            leftTitle="❌ 立即读取导致 undefined"
            rightTitle="✅ 导出函数延迟访问"
            type="error"
            hideDiffMarkers={true}
          />
        </div>
      </Card>
    </>
  );
};

export default CommonJSIntro;
