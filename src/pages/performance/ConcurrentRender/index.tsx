import React, { useState, useTransition, useDeferredValue } from 'react';
import { Input, Switch, Alert, Tag, Divider, Typography } from 'antd';
import { RocketOutlined, StopOutlined } from '@ant-design/icons';
import CodeDiff from '@/components/CodeDiff';
import { ConcurrentExamples } from './Examples';
import HeavyList from './HeavyList';

const { Title, Paragraph, Text } = Typography;

const ConcurrentRenderDemo: React.FC = () => {
  const [useConcurrent, setUseConcurrent] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  // 也可以使用 useDeferredValue 达到类似效果
  const deferredQuery = useDeferredValue(inputValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (useConcurrent) {
      // ✅ 并发模式：将沉重的搜索更新标记为“非紧急”
      startTransition(() => {
        setSearchQuery(val);
      });
    } else {
      // ❌ 传统模式：同步更新，阻塞 UI
      setSearchQuery(val);
    }
  };

  return (
    <div>
      <Title level={2}>React 18 并发渲染 (Concurrent Rendering) 实战</Title>

      <Alert
        message="面试高频考点"
        description={
          <div>
            <p>
              <b>场景：</b>当你在搜索框输入时，下方列表包含 5000
              个复杂节点，每次过滤都会导致大量重绘。
            </p>
            <p>
              <b>实验：</b>请先关闭并发模式，尝试在搜索框快速输入，感受打字的<b>延迟和卡顿</b>
              ；然后开启并发模式，再次输入，观察<b>输入响应</b>的变化。
            </p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <div
        style={{
          backgroundColor: '#fff',
          padding: 24,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <Text strong>模式切换：</Text>
          <Switch
            checkedChildren={
              <>
                <RocketOutlined /> 并发模式 ON
              </>
            }
            unCheckedChildren={
              <>
                <StopOutlined /> 并发模式 OFF
              </>
            }
            checked={useConcurrent}
            onChange={(val) => {
              setUseConcurrent(val);
              setInputValue('');
              setSearchQuery('');
            }}
          />
          {useConcurrent && isPending && <Tag color="processing">正在后台渲染中...</Tag>}
        </div>

        <div style={{ maxWidth: 400 }}>
          <Input
            placeholder="请在此快速输入内容（如：数据）"
            value={inputValue}
            onChange={handleInputChange}
            size="large"
            allowClear
          />
        </div>

        {/* 渲染区域 */}
        <div
          style={{
            minHeight: 400,
            marginTop: 20,
            border: '1px dashed #d9d9d9',
            borderRadius: 8,
            padding: 20,
            opacity: isPending ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          <HeavyList query={searchQuery} />
        </div>
      </div>

      <Divider style={{ margin: '40px 0' }} />

      <Title level={3}>一、 现象解析</Title>
      <Paragraph>{ConcurrentExamples.bugPhenomenon}</Paragraph>

      <Title level={3}>二、 核心原因</Title>
      <Paragraph>{ConcurrentExamples.bugReason}</Paragraph>

      <Title level={3}>三、 代码对比</Title>
      <CodeDiff
        oldValue={ConcurrentExamples.badCode}
        newValue={ConcurrentExamples.goodCode}
        leftTitle="❌ 反面教材"
        rightTitle="✅ 最佳实践"
        type="error"
        hideDiffMarkers={true}
        language="tsx"
      />

      <Title level={3}>四、 核心原理解析</Title>
      <Paragraph>
        <Text mark>时间切片 (Time Slicing)</Text> 是并发模式的灵魂。在开启{' '}
        <code>startTransition</code> 后：
      </Paragraph>
      <ul style={{ lineHeight: 2 }}>
        <li>
          React 会将更新标记为 <b>“过渡更新 (Transition updates)”</b>。
        </li>
        <li>它不会像以前那样一次性把 5000 个组件全渲染完才交还控制权。</li>
        <li>
          而是渲染一小部分，检查一下是否有<b>紧急任务</b>（如用户又敲了一个字母）。
        </li>
        <li>
          如果有，它会<b>丢弃</b>当前正在进行的渲染，转而去处理新输入。
        </li>
        <li>这种“可中断渲染”保证了主线程永远能第一时间响应用户，从而在听感和触感上达到“丝滑”。</li>
      </ul>

      <Title level={3}>五、 面试避坑指南</Title>
      <Alert
        message="useTransition vs Debounce (防抖)"
        description={
          <ul>
            <li>
              <b>Debounce</b>：强行等待 X 毫秒才开始执行，会有明显的“断层感”。
            </li>
            <li>
              <b>useTransition</b>
              ：只要主线程有空就立刻开始渲染，一旦有新任务就中断。它是“自适应”的，比防抖更智能、更顺滑。
            </li>
          </ul>
        }
        type="warning"
      />
    </div>
  );
};

export default ConcurrentRenderDemo;
