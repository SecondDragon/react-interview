import React from 'react';
import { Card, Typography, Alert, Collapse, Tag, Empty } from 'antd';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

/**
 * React API 学习专题入口页面
 * 展示本专题的前提说明与 API 学习导航
 */
const ReactApiLearning: React.FC = () => {
  return (
    <div>
      <Title level={2}>React API 学习专题</Title>
      <Paragraph type="secondary">
        系统性地学习 React 的各个 API 用法，并探索一些少见但实用的 "Hack" 级技巧。
      </Paragraph>

      {/* 专题前提说明 */}
      <Card title="专题前提" style={{ marginBottom: '24px' }}>
        <Alert
          message="学习目标"
          description="深入理解 React API 的设计理念，掌握基础用法的同时，发掘那些能显著提升开发效率的隐藏技巧。"
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />

        <Collapse defaultActiveKey={['1', '2', '3']}>
          <Panel
            header={
              <span>
                <Tag color="blue" style={{ marginRight: 8 }}>
                  结构
                </Tag>
                每个 API 的学习都是一个单独的文件夹
              </span>
            }
            key="1"
          >
            <Paragraph>
              每个 API 拥有独立的文件夹，内部包含该 API 的所有案例与说明文件。
              案例的元数据（描述、原理简述、Bad/Good Code）维护在 <Text code>Examples.ts</Text> 或{' '}
              <Text code>Examples.tsx</Text> 中，按字母排序时与展示组件 <Text code>index.tsx</Text>{' '}
              相邻，便于维护与查阅。
            </Paragraph>
          </Panel>
          <Panel
            header={
              <span>
                <Tag color="green" style={{ marginRight: 8 }}>
                  展示
                </Tag>
                案例统一放入 Collapse 面板（默认展开前三个）
              </span>
            }
            key="2"
          >
            <Paragraph>
              为了节省页面空间并保持良好的阅读体验，每个 API 下的各种案例统一使用 Ant Design 的{' '}
              <Text strong>Collapse（折叠面板）</Text> 组件进行展示。 当存在多个案例时，
              <Text strong>默认展开前三个</Text>，其余保持折叠状态，用户可按需展开查看。
            </Paragraph>
          </Panel>
          <Panel
            header={
              <span>
                <Tag color="purple" style={{ marginRight: 8 }}>
                  内容
                </Tag>
                API 名字 + 用法一 + 用法二（含 Hack 用法）
              </span>
            }
            key="3"
          >
            <Paragraph>
              每个 API 的学习内容按照以下维度组织：
              <ul>
                <li>
                  <Text strong>API 名称与简介：</Text>明确当前 API 的核心作用。
                </li>
                <li>
                  <Text strong>API 的基础用法：</Text>最标准、最常见的使用方式。
                </li>
                <li>
                  <Text strong>API 的进阶 / 特定用法：</Text>较为少见但在特定场景下非常有用的 Hack
                  用法。
                </li>
                <li>
                  <Text strong>Live Demo 互动演示：</Text>每个案例都必须包含真实可运行的
                  Demo，仅有代码片段是不够的，用户需要能够亲手操作并直观感受 API 的行为与差异。
                </li>
              </ul>
            </Paragraph>
          </Panel>
          <Panel
            header={
              <span>
                <Tag color="orange" style={{ marginRight: 8 }}>
                  规范
                </Tag>
                代码对比与注释语言要求
              </span>
            }
            key="4"
          >
            <Paragraph>
              代码对比优先使用 <Text code>CodeDiff</Text> 组件展示 "反面教材 (Bad Practice)" 与
              "最佳实践 (Best Practice)"。 所有代码注释及文档解释必须使用<Text strong>中文</Text>
              ，确保团队成员阅读无障碍。
            </Paragraph>
          </Panel>
        </Collapse>
      </Card>

      {/* API 列表占位 */}
      <Card title="API 学习列表">
        <Empty
          description="暂无已创建的 API 学习案例，请通过左侧菜单或路由添加"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    </div>
  );
};

export default ReactApiLearning;
