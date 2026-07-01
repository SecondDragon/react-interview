import React from 'react';
import { Card, Typography, Tag, List, Steps, Alert } from 'antd';
import { principleData } from '../data';
import CodeDiff from '@/components/CodeDiff';
import LiveDemo from '../LiveDemo';
import principleVisualCode from '../demos/principle-visual.tsx?raw';
import timeSlicingBad from '../demos/time-slicing.bad.tsx?raw';
import timeSlicingGood from '../demos/time-slicing.good.tsx?raw';

const { Paragraph, Text } = Typography;

/**
 * 章节五：实现原理
 * 用可视化案例讲解并发更新、时间切片、Lane 模型
 */
const Principle: React.FC = () => {
  return (
    <div style={{ marginBottom: 24 }}>
      <Card
        title={
          <span>
            章节五：实现原理 <Tag color="gold">并发渲染</Tag>
          </span>
        }
        style={{ marginBottom: 24 }}
      >
        <Card title="一、原理总览" style={{ marginBottom: 16 }}>
          <Paragraph>{principleData.intro}</Paragraph>
        </Card>

        <Card title="二、核心概念" style={{ marginBottom: 16 }}>
          <List
            dataSource={principleData.points}
            renderItem={(item) => (
              <List.Item>
                <div style={{ width: '100%' }}>
                  <Text strong>{item.title}</Text>
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    {item.content}
                  </Paragraph>
                </div>
              </List.Item>
            )}
          />
        </Card>

        <Card title="三、时间切片：任务如何被切分" style={{ marginBottom: 16 }}>
          <Paragraph>
            很多人误以为 React 会先把一棵组件树“切成几大块”，然后一块一块执行。实际上，React
            的切分粒度是<strong>单个节点</strong>，切分时机由{' '}
            <Text code>scheduler</Text> 包的 <Text code>shouldYield()</Text>{' '}
            决定。
          </Paragraph>
          <List
            dataSource={[
              {
                title: '1. 创建 workInProgress 树',
                desc: 'React 开始 render 阶段时，会基于 current 树复制出一棵 workInProgress 树。所有更新都在这棵树上进行。',
              },
              {
                title: '2. 逐节点遍历（beginWork / completeWork）',
                desc: 'React 从根节点开始，递归调用 beginWork 处理每个节点，再调用 completeWork 回溯。每处理完一个节点，就完成了一小步工作。',
              },
              {
                title: '3. 调用 shouldYield() 检查',
                desc: '每处理完一个节点，React 会调用 scheduler 的 shouldYield()。它检查当前帧剩余时间是否不足 5ms，或是否有更高优先级任务需要处理。',
              },
              {
                title: '4. 保存进度并退出 render',
                desc: '如果 shouldYield() 返回 true，React 会记录当前遍历到的 workInProgress 节点，然后退出 render 函数，把主线程交还浏览器。',
              },
              {
                title: '5. 恢复渲染',
                desc: '浏览器处理完事件/输入后，通过 scheduleCallback 再次调度 React 的 render。React 从之前保存的 workInProgress 节点继续遍历，而不是从头开始。',
              },
            ]}
            renderItem={(item) => (
              <List.Item>
                <div style={{ width: '100%' }}>
                  <Text strong>{item.title}</Text>
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    {item.desc}
                  </Paragraph>
                </div>
              </List.Item>
            )}
          />
        </Card>

        <Card title="四、调度时间线" style={{ marginBottom: 16 }}>
          <Steps
            direction="vertical"
            current={-1}
            items={principleData.timelineSteps.map((step) => ({
              title: step.label,
              description: step.desc,
            }))}
          />
        </Card>

        <Card
          title={
            <span>
              五、互动演示：时间线模拟 <Tag color="blue">Live Demo</Tag>
            </span>
          }
          style={{ marginBottom: 16 }}
        >
          <Alert
            message="如何理解这个动画"
            description={
              <ul>
                <li>蓝色条代表 TransitionLane 的渲染进程。</li>
                <li>橙色条代表 InputDiscreteLane（输入事件）插队。</li>
                <li>当橙色条出现时，蓝色条会变淡（暂停/保存进度）。</li>
                <li>橙色条处理完后，蓝色条会从头开始（丢弃旧工作，基于最新状态重新渲染）。</li>
              </ul>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <LiveDemo type="principle-visual" />
        </Card>

        <Card title="六、时间切片互动演示" style={{ marginBottom: 16 }}>
          <Paragraph>
            下面这个动画把 60 个“组件节点”渲染任务分成多片。蓝色表示当前切片连续执行，绿色表示该切片执行后调用{' '}
            <Text code>shouldYield()</Text> 让出主线程。你可以边播放边在输入框里打字，感受主线程被释放的过程。
          </Paragraph>
          <LiveDemo type="time-slicing" />
        </Card>

        <Card title="七、代码对比：同步长任务 vs 时间切片" style={{ marginBottom: 16 }}>
          <Paragraph>
            左侧一次性处理所有节点，阻塞主线程；右侧每处理一个节点就检查 <Text code>shouldYield()</Text>，
            适时让出主线程。React 内部正是用类似右侧的逻辑实现时间切片。
          </Paragraph>
          <CodeDiff
            oldValue={timeSlicingBad}
            newValue={timeSlicingGood}
            leftTitle="❌ 同步长任务"
            rightTitle="✅ 手动模拟时间切片"
            type="error"
            hideDiffMarkers={true}
            language="tsx"
          />
        </Card>

        <Card title="八、源码参考" style={{ marginBottom: 16 }}>
          <Paragraph>
            下面是原理可视化组件的实现源码，展示了如何用 React 状态模拟时间切片和 Lane 插队过程。
          </Paragraph>
          <CodeDiff code={principleVisualCode} title="原理可视化组件源码" type="info" language="tsx" />
        </Card>

        <Card title="九、每一步对应 React 的什么操作" style={{ background: '#f0f5ff' }}>
          <List
            dataSource={[
              {
                step: 'transition 开始',
                action: 'React 调用 requestIdleCallback / scheduler 调度一个低优先级任务，标记 Lane 为 TransitionLane。',
              },
              {
                step: '输入事件插入',
                action: '用户输入触发新的更新，React 比较 Lane 优先级，发现 InputDiscreteLane 更高。',
              },
              {
                step: 'transition 暂停',
                action: 'React 保存当前 workInProgress 树，记录已完成的组件和副作用，释放主线程。',
              },
              {
                step: '处理输入事件',
                action: '高优先级更新完成 render 和 commit，输入框立刻呈现最新值。',
              },
              {
                step: '丢弃旧 transition',
                action: 'Lane 模型判断旧 transition 基于过期状态，直接废弃，避免展示不一致内容。',
              },
              {
                step: '重新调度 transition',
                action: 'React 基于最新 state 重新创建 workInProgress 树，再次进入时间切片。',
              },
            ]}
            renderItem={(item) => (
              <List.Item>
                <Text strong>{item.step}</Text>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {item.action}
                </Paragraph>
              </List.Item>
            )}
          />
        </Card>
      </Card>
    </div>
  );
};

export default Principle;
