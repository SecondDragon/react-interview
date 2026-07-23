import React, { useState, useMemo, useCallback } from 'react';
import { Card, Button, Slider, Switch, Statistic, Timeline, Row, Col, Typography, Space } from 'antd';
import { throttle as throttleSimple } from './demos/simple';
import { throttle as throttleComplex } from './demos/complex';
import { throttle as throttleComplete } from './demos/complete';
import { defaultWait } from './data';

interface ThrottleLiveDemoProps {
  version: 'simple' | 'complex' | 'complete';
}

interface EventRecord {
  type: 'raw' | 'executed';
  time: string;
  label: string;
}

const ThrottleLiveDemo: React.FC<ThrottleLiveDemoProps> = ({ version }) => {
  const [rawCount, setRawCount] = useState(0);
  const [executedCount, setExecutedCount] = useState(0);
  const [wait, setWait] = useState(defaultWait);
  const [leading, setLeading] = useState(true);
  const [trailing, setTrailing] = useState(true);
  const [events, setEvents] = useState<EventRecord[]>([]);

  const showLeading = version !== 'simple';
  const showTrailing = version !== 'simple';

  const addEvent = useCallback((type: EventRecord['type'], label: string) => {
    setEvents((prev) => {
      const next = [...prev, { type, time: new Date().toLocaleTimeString(), label }];
      return next.slice(-8);
    });
  }, []);

  const handleExecute = useCallback(() => {
    setExecutedCount((c) => c + 1);
    addEvent('executed', `执行回调（wait=${wait}ms）`);
  }, [addEvent, wait]);

  const throttledFn = useMemo(() => {
    if (version === 'simple') {
      return throttleSimple(handleExecute, wait);
    }
    if (version === 'complex') {
      return throttleComplex(handleExecute, wait, { leading, trailing });
    }
    return throttleComplete(handleExecute, wait, { leading, trailing });
  }, [version, handleExecute, wait, leading, trailing]);

  const handleTrigger = () => {
    setRawCount((c) => c + 1);
    addEvent('raw', '点击触发');
    throttledFn();
  };

  const handleReset = () => {
    setRawCount(0);
    setExecutedCount(0);
    setEvents([]);
    if ('cancel' in throttledFn) {
      (throttledFn as any).cancel();
    }
  };

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="控制面板" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Typography.Text strong>wait 间隔: {wait}ms</Typography.Text>
                <Slider
                  min={500}
                  max={3000}
                  step={100}
                  value={wait}
                  onChange={setWait}
                  marks={{ 500: '500ms', 1500: '1500ms', 3000: '3000ms' }}
                />
              </div>
              {showLeading && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography.Text>leading（周期开始执行）</Typography.Text>
                  <Switch checked={leading} onChange={setLeading} />
                </div>
              )}
              {showTrailing && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography.Text>trailing（周期结束补齐）</Typography.Text>
                  <Switch checked={trailing} onChange={setTrailing} />
                </div>
              )}
              <Button onClick={handleReset}>重置统计</Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="高频触发区" size="small">
            <Typography.Paragraph type="secondary">
              快速点击按钮，观察右侧统计与下方时间线。
            </Typography.Paragraph>
            <Button type="primary" onClick={handleTrigger} style={{ marginBottom: 16 }}>
              点击触发
            </Button>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="原始触发次数" value={rawCount} />
              </Col>
              <Col span={12}>
                <Statistic title="实际执行次数" value={executedCount} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card title="事件时间线" size="small" style={{ marginTop: 24 }}>
        {events.length === 0 ? (
          <Typography.Paragraph type="secondary">暂无事件，请点击按钮触发。</Typography.Paragraph>
        ) : (
          <Timeline
            items={events.map((event) => ({
              color: event.type === 'raw' ? 'blue' : 'green',
              children: (
                <span>
                  <Typography.Text type="secondary">[{event.time}]</Typography.Text>{' '}
                  {event.label}
                </span>
              ),
            }))}
          />
        )}
      </Card>
    </div>
  );
};

export default ThrottleLiveDemo;
