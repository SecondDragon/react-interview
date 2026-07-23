import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, Input, Slider, Switch, Button, Statistic, Timeline, Row, Col, Typography, Space } from 'antd';
import { debounce as debounceSimple } from './demos/simple';
import { debounce as debounceComplex } from './demos/complex';
import { debounce as debounceComplete } from './demos/complete';
import { defaultWait, waitOptions, maxWaitOptions } from './data';

interface DebounceLiveDemoProps {
  version: 'simple' | 'complex' | 'complete';
}

interface EventRecord {
  type: 'raw' | 'executed';
  time: string;
  label: string;
}

const DebounceLiveDemo: React.FC<DebounceLiveDemoProps> = ({ version }) => {
  const [inputValue, setInputValue] = useState('');
  const [rawCount, setRawCount] = useState(0);
  const [executedCount, setExecutedCount] = useState(0);
  const [wait, setWait] = useState(defaultWait);
  const [leading, setLeading] = useState(false);
  const [trailing, setTrailing] = useState(true);
  const [maxWait, setMaxWait] = useState(1000);
  const [events, setEvents] = useState<EventRecord[]>([]);

  const showLeading = version !== 'simple';
  const showTrailing = version !== 'simple';
  const showMaxWait = version === 'complete';

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

  const debouncedFn = useMemo(() => {
    if (version === 'simple') {
      return debounceSimple(handleExecute, wait);
    }
    if (version === 'complex') {
      return debounceComplex(handleExecute, wait, { leading, trailing });
    }
    return debounceComplete(handleExecute, wait, { leading, trailing, maxWait });
  }, [version, handleExecute, wait, leading, trailing, maxWait]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setRawCount((c) => c + 1);
    addEvent('raw', `输入触发: "${e.target.value}"`);
    debouncedFn();
  };

  const handleReset = () => {
    setInputValue('');
    setRawCount(0);
    setExecutedCount(0);
    setEvents([]);
    if ('cancel' in debouncedFn) {
      (debouncedFn as any).cancel();
    }
  };

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="控制面板" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Typography.Text strong>wait 延迟: {wait}ms</Typography.Text>
                <Slider
                  min={200}
                  max={2000}
                  step={100}
                  value={wait}
                  onChange={setWait}
                  marks={{ 200: '200ms', 1000: '1000ms', 2000: '2000ms' }}
                />
              </div>
              {showLeading && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography.Text>leading（首次立即执行）</Typography.Text>
                  <Switch checked={leading} onChange={setLeading} />
                </div>
              )}
              {showTrailing && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography.Text>trailing（停止后补齐）</Typography.Text>
                  <Switch checked={trailing} onChange={setTrailing} />
                </div>
              )}
              {showMaxWait && (
                <div>
                  <Typography.Text strong>maxWait: {maxWait}ms</Typography.Text>
                  <Slider
                    min={500}
                    max={3000}
                    step={500}
                    value={maxWait}
                    onChange={setMaxWait}
                    marks={{ 500: '500ms', 1500: '1500ms', 3000: '3000ms' }}
                  />
                </div>
              )}
              <Button onClick={handleReset}>重置统计</Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="输入触发区" size="small">
            <Typography.Paragraph type="secondary">
              在输入框中快速输入，观察右侧统计与下方时间线。
            </Typography.Paragraph>
            <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder="快速输入文字触发防抖..."
              style={{ marginBottom: 16 }}
            />
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
          <Typography.Paragraph type="secondary">暂无事件，请在上方输入框触发。</Typography.Paragraph>
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

export default DebounceLiveDemo;
