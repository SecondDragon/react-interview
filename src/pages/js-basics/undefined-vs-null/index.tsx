import React from 'react';
import { Card, Typography, Divider, Alert, Tag, Table } from 'antd';
import { UndefinedVsNullMeta, comparisonData, bestPracticeData } from './Examples';
import CodeDiff from '@/components/CodeDiff';
import LiveDemo from './LiveDemo';

const { Title, Paragraph, Text } = Typography;

const columns = [
  {
    title: '对比维度',
    dataIndex: 'dimension',
    key: 'dimension',
    render: (text: string) => <Tag color="purple">{text}</Tag>,
  },
  {
    title: 'undefined',
    dataIndex: 'undefinedDesc',
    key: 'undefinedDesc',
  },
  {
    title: 'null',
    dataIndex: 'nullDesc',
    key: 'nullDesc',
  },
];

const practiceColumns = [
  {
    title: '场景',
    dataIndex: 'scenario',
    key: 'scenario',
  },
  {
    title: '推荐做法',
    dataIndex: 'recommendation',
    key: 'recommendation',
    render: (text: string) => <Text strong>{text}</Text>,
  },
  {
    title: '原因',
    dataIndex: 'reason',
    key: 'reason',
  },
];

/**
 * undefined 与 null 的区别 - 主页面
 * 遵循 Five Dimensions 结构
 */
const UndefinedVsNull: React.FC = () => {
  return (
    <div>
      <Title level={2}>{UndefinedVsNullMeta.title}</Title>
      <Paragraph type="secondary">{UndefinedVsNullMeta.description}</Paragraph>

      {/* 一、现象描述 */}
      <Card title="一、问题现象" style={{ marginBottom: '24px' }}>
        <Alert
          message="undefined 与 null 的混淆点"
          description={
            <div style={{ whiteSpace: 'pre-wrap' }}>{UndefinedVsNullMeta.phenomenon}</div>
          }
          type="warning"
          showIcon
        />
      </Card>

      {/* 二、底层原因 */}
      <Card title="二、底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{UndefinedVsNullMeta.reason}</Paragraph>

        <Divider orientation="left">10+ 维度对比表</Divider>
        <Table
          dataSource={comparisonData}
          columns={columns}
          pagination={false}
          bordered
          size="small"
        />
      </Card>

      {/* 三、解决方案 */}
      <Card title="三、如何正确区分与使用" style={{ marginBottom: '24px' }}>
        <Paragraph>
          核心原则：<Text strong>undefined 表示"未设置"，null 表示"有意清空"</Text>。
          在代码中应根据语义选择，并结合 TypeScript、空值合并运算符等现代工具减少 bug。
        </Paragraph>

        <CodeDiff
          oldValue={UndefinedVsNullMeta.bad}
          newValue={UndefinedVsNullMeta.good}
          leftTitle="❌ 反面教材"
          rightTitle="✅ 最佳实践"
          type="error"
          hideDiffMarkers={true}
        />

        <Divider orientation="left">工程实践建议</Divider>
        <Table
          dataSource={bestPracticeData}
          columns={practiceColumns}
          pagination={false}
          bordered
          size="small"
        />
      </Card>

      {/* 四、互动演示 */}
      <Card
        title={
          <span>
            四、为什么要这样解决 且互动演示 <Tag color="blue">Live Demo</Tag>
          </span>
        }
        style={{ marginBottom: '24px' }}
      >
        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
          {UndefinedVsNullMeta.whySolveThisWay}
        </Paragraph>

        <Divider />
        <LiveDemo />
      </Card>

      {/* 五、核心原理 */}
      <Card title="五、核心原理" style={{ background: '#f0f5ff' }}>
        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{UndefinedVsNullMeta.principle}</Paragraph>

        <Divider />

        <Title level={5}>面试高频考点</Title>
        <ul>
          <li>
            <Text strong>typeof null 为什么是 'object'？</Text>
            <Paragraph type="secondary">
              JavaScript 第一个版本使用低位标记类型信息：对象类型标记为 000，而 null
              在机器码中被表示为全 0（0x00）， 所以 typeof null 被误判为 'object'。这是历史遗留
              bug，ES 规范为了兼容性一直保留。
            </Paragraph>
          </li>
          <li>
            <Text strong>null == undefined 为 true，=== 为 false 的原因是什么？</Text>
            <Paragraph type="secondary">
              抽象相等比较（==）在规范中专门规定 null 与 undefined
              互相相等；严格相等（===）同时比较类型和值， 而 null 和 undefined 属于不同类型，所以为
              false。
            </Paragraph>
          </li>
          <li>
            <Text strong>Number(undefined) 与 Number(null) 为什么不同？</Text>
            <Paragraph type="secondary">
              ECMAScript 的 ToNumber 抽象操作对 undefined 返回 NaN，对 null 返回
              +0。这与数学上的"未定义"和"空集"语义一致。
            </Paragraph>
          </li>
          <li>
            <Text strong>函数默认参数在什么情况下生效？</Text>
            <Paragraph type="secondary">
              只有当传入的实参为 undefined 时才会触发默认参数；传入 null 不会触发，函数内部会得到
              null。
            </Paragraph>
          </li>
          <li>
            <Text strong>为什么推荐用 ?? 而不是 || 设置默认值？</Text>
            <Paragraph type="secondary">
              || 会在操作数为 0、''、false 等 falsy 值时触发默认值，可能覆盖合法值；?? 只在 null 或
              undefined 时 fallback，语义更精确。
            </Paragraph>
          </li>
          <li>
            <Text strong>JSON.stringify 如何处理 undefined 和 null？</Text>
            <Paragraph type="secondary">
              对象属性为 undefined 时会被忽略；属性为 null 时会被序列化为 null。数组中的 undefined
              会被转换为 null。
            </Paragraph>
          </li>
          <li>
            <Text strong>TypeScript strictNullChecks 下应该注意什么？</Text>
            <Paragraph type="secondary">
              开启 strictNullChecks 后，null 和 undefined 不能赋值给普通类型（如
              string）。需要显式声明联合类型 string | null | undefined， 并在使用前通过类型守卫或 ??
              处理。
            </Paragraph>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default UndefinedVsNull;
