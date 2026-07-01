import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Steps, Tag } from 'antd';

/**
 * 原理可视化组件：展示时间切片 + Lane 模型
 * 用于 ?raw 提取源码，也可直接运行
 */
const PrincipleVisual: React.FC = () => {
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

      <div style={{ marginTop: 24, height: 120, position: 'relative', background: '#f5f5f5', borderRadius: 8 }}>
        <div
          style={{
            position: 'absolute',
            left: 16,
            top: 20,
            right: 16,
            height: 24,
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
              top: 60,
              height: 24,
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

export default PrincipleVisual;
