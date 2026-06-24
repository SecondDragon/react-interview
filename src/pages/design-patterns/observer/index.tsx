import React from 'react';
import { Card, Typography, Divider, Tag, Table, List } from 'antd';
import {
  ObserverMeta,
  patternOverview,
  basicObserverData,
  eventEmitterData,
  reactContextData,
  customHookData,
  patternComparison,
  comparisonColumns,
} from './data';
import BasicObserver from './chapters/BasicObserver';
import EventEmitter from './chapters/EventEmitter';
import ReactContext from './chapters/ReactContext';
import CustomHook from './chapters/CustomHook';

const { Title, Paragraph, Text } = Typography;

/**
 * 观察者模式专题主页面
 * 组合展示模式总览和各应用方式章节
 */
const ObserverPattern: React.FC = () => {
  return (
    <div>
      <Title level={2}>{ObserverMeta.title}</Title>
      <Paragraph type="secondary">{ObserverMeta.description}</Paragraph>

      {/* 模式总览卡片 */}
      <Card title="模式总览" style={{ marginBottom: 24 }}>
        <Paragraph>
          <Text strong>定义：</Text>
          {patternOverview.definition}
        </Paragraph>

        <Divider orientation="left">核心角色</Divider>
        <List
          dataSource={patternOverview.roles}
          renderItem={(role) => (
            <List.Item>
              <Text strong>{role.name}</Text>
              <Text type="secondary"> — {role.desc}</Text>
            </List.Item>
          )}
        />

        <Divider orientation="left">UML 结构描述</Divider>
        <div
          style={{
            background: '#f5f5f5',
            padding: 16,
            borderRadius: 8,
            fontFamily: 'monospace',
            fontSize: 13,
            whiteSpace: 'pre-wrap',
          }}
        >
          {patternOverview.umlDescription}
        </div>
      </Card>

      {/* 章节一：基础观察者实现 */}
      <BasicObserver />

      {/* 章节二：EventEmitter 发布订阅 */}
      <EventEmitter />

      {/* 章节三：React Context 订阅 */}
      <ReactContext />

      {/* 章节四：自定义 Hook 封装 */}
      <CustomHook />

      {/* 模式关联与对比 */}
      <Card title="模式关联与对比" style={{ background: '#f0f5ff', marginTop: 24 }}>
        <Paragraph>
          观察者模式、发布订阅模式和中介者模式都涉及对象间的通信，但它们的耦合程度和适用场景不同：
        </Paragraph>

        <Table
          dataSource={patternComparison}
          columns={comparisonColumns}
          pagination={false}
          bordered
          size="small"
        />

        <Divider />

        <Title level={5}>面试高频考点</Title>
        <ul>
          <li>
            <Text strong>观察者模式 vs 发布订阅模式的本质区别？</Text>
            <Paragraph type="secondary">
              观察者模式中 Subject 直接维护 Observer 列表，两者存在依赖关系；
              发布订阅模式中引入事件中心作为中间层，发布者和订阅者完全解耦。
            </Paragraph>
          </li>
          <li>
            <Text strong>React Context 为什么不适合高频更新？</Text>
            <Paragraph type="secondary">
              Context value 变化会导致所有消费该 Context 的组件重新渲染，
              即使它们只使用了 Context 中未变化的部分。建议使用拆分 Context 或 useSyncExternalStore。
            </Paragraph>
          </li>
          <li>
            <Text strong>如何防止 EventEmitter 的内存泄漏？</Text>
            <Paragraph type="secondary">
              组件卸载时务必调用 off() 或 removeAllListeners() 移除监听器；
              使用 WeakMap 或 once() 方法也可以减少泄漏风险。
            </Paragraph>
          </li>
          <li>
            <Text strong>useSyncExternalStore 解决了什么问题？</Text>
            <Paragraph type="secondary">
              解决了并发渲染下的 tearing 问题（外部存储与 React 状态不一致），
              同时提供了服务端渲染的 hydration 支持。
            </Paragraph>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default ObserverPattern;
