import React, { useState, useTransition, useDeferredValue, useEffect, useRef } from 'react';
import { Input, Switch, Button, Badge, Skeleton, Tabs, Tag, Card, Space, Alert, Steps } from 'antd';
import { RocketOutlined, StopOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';

export type LiveDemoType =
  | 'search'
  | 'tab'
  | 'pending-badge'
  | 'pending-skeleton'
  | 'deferred'
  | 'pitfall-sync-read'
  | 'principle-visual'
  | 'time-slicing';

interface LiveDemoProps {
  type: LiveDemoType;
}

/**
 * 沉重的列表组件，用于模拟复杂渲染
 */
const HeavyList: React.FC<{ query: string; count?: number }> = ({ query, count = 30000 }) => {
  const items = React.useMemo(() => {
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push(`数据条目 ${i} - 内容: ${Math.random().toString(36).substring(7)}`);
    }
    return list;
  }, [count]);

  const filtered = items.filter((item) => item.includes(query));

  if (query === '') {
    return <div style={{ color: '#999', textAlign: 'center', marginTop: 40 }}>请输入关键词开始体验...</div>;
  }

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 10, color: '#666' }}>找到 {filtered.length} 条匹配结果</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '8px',
          maxHeight: 320,
          overflow: 'auto',
        }}
      >
        {filtered.map((item, index) => (
          <div
            key={index}
            style={{
              padding: '8px',
              backgroundColor: '#f0f2f5',
              borderRadius: '4px',
              fontSize: '12px',
            }}
          >
            #{index} - {item}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 案例一：搜索框过滤
 */
const SearchDemo: React.FC = () => {
  const [useTransitionMode, setUseTransitionMode] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (useTransitionMode) {
      startTransition(() => setSearchQuery(value));
    } else {
      setSearchQuery(value);
    }
  };

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <span>模式：</span>
        <Switch
          checkedChildren={<><RocketOutlined /> Transition 模式</>}
          unCheckedChildren={<><StopOutlined /> 同步模式</>}
          checked={useTransitionMode}
          onChange={(val) => {
            setUseTransitionMode(val);
            setInputValue('');
            setSearchQuery('');
          }}
        />
        {useTransitionMode && isPending && <Tag color="processing">后台过滤中...</Tag>}
      </Space>
      <Input
        placeholder="请快速输入内容（如：数据）"
        value={inputValue}
        onChange={handleChange}
        allowClear
      />
      <div style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        <HeavyList query={searchQuery} />
      </div>
    </Card>
  );
};

/**
 * 案例二：Tab 切换
 */
const TabDemo: React.FC = () => {
  const [useTransitionMode, setUseTransitionMode] = useState(false);
  const [activeKey, setActiveKey] = useState('simple');
  const [displayKey, setDisplayKey] = useState('simple');
  const [isPending, startTransition] = useTransition();

  const items: TabsProps['items'] = [
    { key: 'simple', label: '简单内容', children: <div style={{ padding: 40, textAlign: 'center' }}>轻量内容</div> },
    { key: 'heavy', label: '复杂内容', children: <HeavyTabContent /> },
  ];

  const handleChange = (key: string) => {
    if (useTransitionMode) {
      setActiveKey(key);
      startTransition(() => setDisplayKey(key));
    } else {
      setActiveKey(key);
      setDisplayKey(key);
    }
  };

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <span>模式：</span>
        <Switch
          checkedChildren={<><RocketOutlined /> Transition 模式</>}
          unCheckedChildren={<><StopOutlined /> 同步模式</>}
          checked={useTransitionMode}
          onChange={(val) => {
            setUseTransitionMode(val);
            setActiveKey('simple');
            setDisplayKey('simple');
          }}
        />
        {useTransitionMode && isPending && <Tag color="processing">加载复杂内容中...</Tag>}
      </Space>
      <Tabs activeKey={activeKey} items={items} onChange={handleChange} />
      <div style={{ opacity: isPending ? 0.5 : 1, transition: 'opacity 0.2s' }}>
        {items?.find((item) => item?.key === displayKey)?.children}
      </div>
    </Card>
  );
};

const HeavyTabContent: React.FC = () => {
  const list = Array.from({ length: 30000 }, (_, i) => i);
  return (
    <div style={{ maxHeight: 300, overflow: 'auto' }}>
      {list.map((i) => (
        <div key={i} style={{ padding: 4, borderBottom: '1px solid #eee' }}>
          复杂行 {i}
        </div>
      ))}
    </div>
  );
};

/**
 * 案例三：Pending 徽标
 */
const PendingBadgeDemo: React.FC = () => {
  const [count, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      const start = performance.now();
      while (performance.now() - start < 600) {}
      setCount((c) => c + 1);
    });
  };

  return (
    <Card>
      <Space>
        <Badge dot={isPending}>
          <Button onClick={handleClick} disabled={isPending}>
            {isPending ? '处理中...' : '提交'}
          </Button>
        </Badge>
        <span>已提交次数：{count}</span>
      </Space>
    </Card>
  );
};

/**
 * 案例四：骨架屏
 */
const PendingSkeletonDemo: React.FC = () => {
  const [displayView, setDisplayView] = useState<'list' | 'chart'>('list');
  const [isPending, startTransition] = useTransition();

  const handleSwitch = (next: 'list' | 'chart') => {
    startTransition(() => setDisplayView(next));
  };

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => handleSwitch('list')}>列表视图</Button>
        <Button onClick={() => handleSwitch('chart')}>图表视图</Button>
      </Space>
      {isPending ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : displayView === 'list' ? (
        <HeavyList query="数据" count={30000} />
      ) : (
        <HeavyChartContent />
      )}
    </Card>
  );
};

const HeavyChartContent: React.FC = () => {
  const points = Array.from({ length: 30000 }, (_, i) => i);
  return (
    <div style={{ maxHeight: 300, overflow: 'auto' }}>
      {points.map((i) => (
        <div key={i} style={{ padding: 4, borderBottom: '1px solid #eee' }}>
          图表点 {i}
        </div>
      ))}
    </div>
  );
};

/**
 * 案例五：useDeferredValue
 */
const DeferredDemo: React.FC = () => {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  return (
    <Card>
      <Input
        placeholder="输入搜索词"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <Alert
        message="说明"
        description={`当前输入值：${query}；延迟值：${deferredQuery}。列表使用延迟值渲染，输入框保持即时响应。`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <HeavyList query={deferredQuery} />
    </Card>
  );
};

/**
 * 案例六：同步读取 DOM 的坑
 */
const PitfallSyncReadDemo: React.FC = () => {
  const [height, setHeight] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [, startTransition] = useTransition();
  const boxRef = useRef<HTMLDivElement>(null);

  const handleBadClick = () => {
    startTransition(() => {
      setExpanded((prev) => !prev);
      const el = document.getElementById('pitfall-box');
      setHeight(el?.offsetHeight ?? 0);
    });
  };

  const handleGoodClick = () => {
    startTransition(() => {
      setExpanded((prev) => !prev);
    });
  };

  useEffect(() => {
    setHeight(boxRef.current?.offsetHeight ?? 0);
  }, [expanded]);

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={handleBadClick}>错误：transition 内同步读取</Button>
        <Button type="primary" onClick={handleGoodClick}>
          正确：useEffect 中读取
        </Button>
      </Space>
      <div>读取到的高度：{height}px</div>
      <div
        ref={boxRef}
        id="pitfall-box"
        style={{ border: '1px solid #ccc', padding: expanded ? 40 : 10, marginTop: 16 }}
      >
        {expanded ? '展开后的内容' : '收起后的内容'}
      </div>
    </Card>
  );
};

/**
 * 案例七：原理可视化
 */
const PrincipleVisualDemo: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSteps = 5;

  useEffect(() => {
    if (!running) return;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setStep((s) => {
            const next = s + 1;
            if (next >= totalSteps) {
              setRunning(false);
              return s;
            }
            return next;
          });
          return 0;
        }
        return prev + 10;
      });
    }, 80);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  const handleStart = () => {
    setStep(0);
    setProgress(0);
    setRunning(true);
  };

  const stepItems = [
    { title: 'transition 开始', description: '标记为 TransitionLane，进入时间切片' },
    { title: '输入事件插入', description: 'InputDiscreteLane 优先级更高，准备插队' },
    { title: 'transition 暂停', description: 'React 保存 workInProgress 进度' },
    { title: '处理输入事件', description: '高优先级更新先完成渲染和提交' },
    { title: '重新调度 transition', description: '丢弃旧工作，基于最新状态重新渲染' },
  ];

  return (
    <Card title="并发调度时间线模拟">
      <Steps current={step} items={stepItems} direction="vertical" size="small" />

      <div
        style={{
          marginTop: 24,
          height: 140,
          position: 'relative',
          background: '#f5f5f5',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 16,
            top: 24,
            right: 16,
            height: 28,
            background: '#1890ff',
            borderRadius: 4,
            width: step === 0 || step === 4 ? `${progress}%` : '100%',
            opacity: step === 2 || step === 3 ? 0.4 : 1,
            transition: 'width 0.1s linear',
          }}
        >
          <Tag color="blue" style={{ position: 'absolute', top: -28, left: 0 }}>
            TransitionLane
          </Tag>
        </div>

        {(step === 1 || step === 2 || step === 3) && (
          <div
            style={{
              position: 'absolute',
              left: `${40 + progress * 0.3}%`,
              top: 80,
              height: 28,
              width: '30%',
              background: '#fa8c16',
              borderRadius: 4,
            }}
          >
            <Tag color="orange" style={{ position: 'absolute', top: -28, left: 0 }}>
              InputDiscreteLane
            </Tag>
          </div>
        )}
      </div>

      <Button type="primary" onClick={handleStart} disabled={running} style={{ marginTop: 16 }}>
        {running ? '运行中...' : '开始模拟'}
      </Button>
    </Card>
  );
};

/**
 * 案例八：时间切片可视化
 * 模拟 React 如何用 shouldYield 把长任务切成小片
 */
const TimeSlicingDemo: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [slices, setSlices] = useState<{ start: number; end: number; yielded: boolean }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const totalNodes = 60;
  const nodesPerSlice = 10;

  useEffect(() => {
    if (!running) return;

    let current = 0;
    const newSlices: { start: number; end: number; yielded: boolean }[] = [];

    const runSlice = () => {
      if (current >= totalNodes) {
        setProgress(100);
        setRunning(false);
        return;
      }

      const start = current;
      const end = Math.min(current + nodesPerSlice, totalNodes);
      const shouldYield = Math.random() > 0.5; // 模拟某些切片需要让出
      newSlices.push({ start, end, yielded: shouldYield });
      setSlices([...newSlices]);
      current = end;
      setProgress(Math.floor((current / totalNodes) * 100));

      if (shouldYield) {
        // 模拟把控制权交还浏览器，下一帧继续
        setTimeout(runSlice, 300);
      } else {
        runSlice();
      }
    };

    runSlice();

    return () => {
      current = totalNodes;
    };
  }, [running]);

  const handleStart = () => {
    setSlices([]);
    setProgress(0);
    setRunning(true);
  };

  return (
    <Card title="时间切片可视化">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="动画播放时尝试输入，观察主线程是否被释放"
        style={{ marginBottom: 16 }}
      />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          marginBottom: 16,
          padding: 12,
          background: '#f5f5f5',
          borderRadius: 8,
        }}
      >
        {Array.from({ length: totalNodes }, (_, i) => {
          const slice = slices.find((s) => s.start <= i && i < s.end);
          let background = '#d9d9d9';
          if (slice) {
            background = slice.yielded ? '#52c41a' : '#1890ff';
          }
          return (
            <div
              key={i}
              style={{
                width: 20,
                height: 20,
                background,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                color: '#fff',
              }}
            >
              {i + 1}
            </div>
          );
        })}
      </div>

      <div style={{ marginBottom: 16 }}>
        <Tag color="blue">蓝色</Tag> 表示当前切片连续执行
        <Tag color="green" style={{ marginLeft: 8 }}>绿色</Tag> 表示该切片执行后让出主线程
        <Tag color="default" style={{ marginLeft: 8 }}>灰色</Tag> 表示尚未执行
      </div>

      <div style={{ marginBottom: 16 }}>
        进度：{progress}% | 已让出次数：{slices.filter((s) => s.yielded).length}
      </div>

      <Button type="primary" onClick={handleStart} disabled={running}>
        {running ? '切片执行中...' : '开始模拟时间切片'}
      </Button>
    </Card>
  );
};

/**
 * 统一分发入口
 */
const LiveDemo: React.FC<LiveDemoProps> = ({ type }) => {
  switch (type) {
    case 'search':
      return <SearchDemo />;
    case 'tab':
      return <TabDemo />;
    case 'pending-badge':
      return <PendingBadgeDemo />;
    case 'pending-skeleton':
      return <PendingSkeletonDemo />;
    case 'deferred':
      return <DeferredDemo />;
    case 'pitfall-sync-read':
      return <PitfallSyncReadDemo />;
    case 'principle-visual':
      return <PrincipleVisualDemo />;
    case 'time-slicing':
      return <TimeSlicingDemo />;
    default:
      return null;
  }
};

export default LiveDemo;
