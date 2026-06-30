import React from 'react';
import { Card, Typography, List, Alert } from 'antd';
import CodeDiff from '@/components/CodeDiff';
import badCircular from '../demos/esm-circular.bad.mjs?raw';
import goodCircular from '../demos/esm-circular.good.mjs?raw';

const { Title, Paragraph, Text } = Typography;

const ESModuleIntro: React.FC = () => {
  return (
    <>
      <Card title="语法与核心概念" style={{ marginBottom: 24 }}>
        <Paragraph>
          <Text code>import {'{'} a {'}'} from './a.mjs'</Text> 与{' '}
          <Text code>export const a = 1</Text> 是静态声明。
          <Text code>export default</Text> 导出表达式的值，命名导出绑定到内存槽位。
          <Text code>import * as mod</Text> 创建模块命名空间对象；
          <Text code>import('./mod.mjs')</Text> 返回 Promise。
        </Paragraph>
      </Card>

      <Card title="三阶段与数据结构" style={{ marginBottom: 24 }}>
        <Title level={5}>阶段一：构造（Construction）</Title>
        <Paragraph>
          解析入口模块，递归发现并加载所有依赖。为每个模块创建 Module Record，记录 RequestedModules、ImportEntries、LocalExportEntries 等。使用 Module Map 去重，保证同一模块只加载一次。
        </Paragraph>

        <Title level={5}>阶段二：实例化（Instantiation）</Title>
        <Paragraph>
          为每个模块创建 Module Environment Record，为 export 分配 binding（初始为 uninitialized，即 TDZ），为 import 创建 Import Binding 指向被导出模块的 binding 槽位。
        </Paragraph>

        <Title level={5}>阶段三：求值（Evaluation）</Title>
        <Paragraph>
          按深度优先执行模块顶层代码。执行到 export const x = 1 时，binding 从 uninitialized 变为具体值。由于 import 是绑定引用，后续重新赋值也会同步到所有导入方。
        </Paragraph>
      </Card>

      <Card title="循环依赖" style={{ marginBottom: 24 }}>
        <Alert
          message="循环依赖中的 TDZ"
          description="实例化阶段 a 和 b 的 binding 都已存在，但值未初始化。求值顺序取决于入口，先求值的模块访问后求值模块可能触发 TDZ。"
          type="warning"
          showIcon
        />
        <div style={{ marginTop: 16 }}>
          <CodeDiff
            oldValue={badCircular}
            newValue={goodCircular}
            leftTitle="❌ 顶层访问触发 TDZ"
            rightTitle="✅ 导出函数延迟访问"
            type="error"
            hideDiffMarkers={true}
          />
        </div>
      </Card>

      <Card title="常见 bug 与最佳实践" style={{ marginBottom: 24 }}>
        <List>
          <List.Item>在模块顶层代码执行前访问 import 变量会触发 TDZ</List.Item>
          <List.Item>在循环依赖中读取 export const 可能拿到未初始化的 binding</List.Item>
          <List.Item>export default 导出的是值快照，不支持 live binding</List.Item>
          <List.Item>动态 import() 返回的 Namespace Object 是快照，后续重新赋值不会同步</List.Item>
          <List.Item>推荐：命名导出优先用于需要热更新/绑定同步的场景；循环依赖时导出函数并延迟调用</List.Item>
        </List>
      </Card>
    </>
  );
};

export default ESModuleIntro;
