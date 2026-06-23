import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Row, Col, Tag, Alert, Slider, Typography } from 'antd';

const { Text } = Typography;

/**
 * 实时尺寸监控面板
 * 使用 requestAnimationFrame 实时展示当前浏览器的各种尺寸值
 */
const LiveDemo: React.FC = () => {
  const [tick, setTick] = useState(0); // 用于触发重渲染的计数器
  const dimensionsRef = useRef({
    innerWidth: 0,
    innerHeight: 0,
    clientWidth: 0,
    clientHeight: 0,
    scrollWidth: 0,
    scrollHeight: 0,
    offsetWidth: 0,
    offsetHeight: 0,
    screenWidth: 0,
    screenHeight: 0,
    dpr: 1,
    visualViewportWidth: 0,
    visualViewportHeight: 0,
    visualViewportScale: 1,
    scrollTop: 0,
    scrollLeft: 0,
  });

  const [demoWidth, setDemoWidth] = useState(300);
  const demoRef = useRef<HTMLDivElement>(null);
  const [demoStats, setDemoStats] = useState({ clientWidth: 0, offsetWidth: 0, scrollWidth: 0 });

  // 更新尺寸数据（使用 ref 避免不必要的重渲染）
  const updateDimensions = useCallback(() => {
    const vv = window.visualViewport;
    const prev = dimensionsRef.current;
    const next = {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      clientWidth: document.documentElement.clientWidth,
      clientHeight: document.documentElement.clientHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      offsetWidth: document.documentElement.offsetWidth,
      offsetHeight: document.documentElement.offsetHeight,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      dpr: window.devicePixelRatio,
      visualViewportWidth: vv?.width || window.innerWidth,
      visualViewportHeight: vv?.height || window.innerHeight,
      visualViewportScale: vv?.scale || 1,
      scrollTop: window.scrollY,
      scrollLeft: window.scrollX,
    };

    // 只有当值真正变化时才更新 ref 并触发重渲染
    const hasChanged = Object.keys(next).some((key) => (prev as any)[key] !== (next as any)[key]);

    if (hasChanged) {
      dimensionsRef.current = next;
      setTick((t) => t + 1);
    }
  }, []);

  // 更新实验区域统计
  const updateDemoStats = useCallback(() => {
    const el = demoRef.current;
    if (!el) return;
    setDemoStats({
      clientWidth: el.clientWidth,
      offsetWidth: el.offsetWidth,
      scrollWidth: el.scrollWidth,
    });
  }, []);

  useEffect(() => {
    // 初始更新
    updateDimensions();
    updateDemoStats();

    // 使用 requestAnimationFrame 实现平滑更新（但只在值变化时才 setState）
    let rafId: number;
    const loop = () => {
      updateDimensions();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    // 监听各种事件
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('scroll', updateDimensions);
    window.visualViewport?.addEventListener('resize', updateDimensions);
    window.visualViewport?.addEventListener('scroll', updateDimensions);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('scroll', updateDimensions);
      window.visualViewport?.removeEventListener('resize', updateDimensions);
      window.visualViewport?.removeEventListener('scroll', updateDimensions);
    };
  }, [updateDimensions]);

  // demoWidth 变化时更新实验区域统计
  useEffect(() => {
    // 使用 setTimeout 确保 DOM 已经更新
    const timer = setTimeout(updateDemoStats, 0);
    return () => clearTimeout(timer);
  }, [demoWidth, updateDemoStats]);

  const dims = dimensionsRef.current;

  const StatItem = ({
    label,
    value,
    unit = 'px',
  }: {
    label: string;
    value: number;
    unit?: string;
  }) => (
    <div
      style={{ padding: '8px', background: '#f5f5f5', borderRadius: '4px', marginBottom: '8px' }}
    >
      <div style={{ fontSize: '11px', color: '#999' }}>{label}</div>
      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
        {value}
        {unit}
      </div>
    </div>
  );

  return (
    <Card
      title="📏 实时尺寸监控面板"
      style={{ marginBottom: '24px', borderLeft: '4px solid #52c41a' }}
    >
      <Alert
        message="实时数据"
        description="以下数值通过 requestAnimationFrame 实时更新。尝试缩放页面（Ctrl+/Ctrl-）、滚动页面、改变窗口大小，观察各值的变化。"
        type="info"
        showIcon
        style={{ marginBottom: '16px' }}
      />

      <Row gutter={[16, 16]}>
        {/* Window 级别 */}
        <Col xs={24} sm={12} md={8}>
          <Card size="small" title={<Tag color="blue">Window</Tag>} bordered={false}>
            <StatItem label="innerWidth" value={dims.innerWidth} />
            <StatItem label="innerHeight" value={dims.innerHeight} />
            <StatItem label="screen.width" value={dims.screenWidth} />
            <StatItem label="screen.height" value={dims.screenHeight} />
            <StatItem label="devicePixelRatio" value={dims.dpr} unit="" />
          </Card>
        </Col>

        {/* Document 级别 */}
        <Col xs={24} sm={12} md={8}>
          <Card size="small" title={<Tag color="green">Document</Tag>} bordered={false}>
            <StatItem label="clientWidth" value={dims.clientWidth} />
            <StatItem label="clientHeight" value={dims.clientHeight} />
            <StatItem label="scrollWidth" value={dims.scrollWidth} />
            <StatItem label="scrollHeight" value={dims.scrollHeight} />
            <StatItem label="offsetWidth" value={dims.offsetWidth} />
            <StatItem label="offsetHeight" value={dims.offsetHeight} />
          </Card>
        </Col>

        {/* Visual Viewport */}
        <Col xs={24} sm={12} md={8}>
          <Card size="small" title={<Tag color="purple">Visual Viewport</Tag>} bordered={false}>
            <StatItem label="vv.width" value={Math.round(dims.visualViewportWidth)} />
            <StatItem label="vv.height" value={Math.round(dims.visualViewportHeight)} />
            <StatItem
              label="vv.scale"
              value={Math.round(dims.visualViewportScale * 100) / 100}
              unit=""
            />
            <StatItem label="scrollTop" value={Math.round(dims.scrollTop)} />
            <StatItem label="scrollLeft" value={Math.round(dims.scrollLeft)} />
          </Card>
        </Col>
      </Row>

      {/* 演示区域：改变宽度观察 clientWidth/scrollWidth/offsetWidth 的差异 */}
      <Card
        size="small"
        title="🔬 实验：改变下方容器宽度，观察三种 Width 的差异"
        style={{ marginTop: '16px' }}
      >
        <div style={{ marginBottom: '16px' }}>
          <Text>容器宽度：</Text>
          <Slider
            min={200}
            max={800}
            value={demoWidth}
            onChange={setDemoWidth}
            marks={{ 200: '200', 400: '400', 600: '600', 800: '800' }}
          />
        </div>

        <div
          ref={demoRef}
          style={{
            width: `${demoWidth}px`,
            height: '150px',
            border: '5px solid #1890ff',
            padding: '20px',
            overflow: 'auto',
            background: '#e6f7ff',
            margin: '0 auto',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '600px',
              height: '100px',
              background: '#1890ff',
              color: '#fff',
              padding: '8px',
            }}
          >
            内容区宽度固定 600px（超出容器宽度，产生滚动条）
          </div>
        </div>

        <Row gutter={16} style={{ marginTop: '16px' }}>
          <Col span={8}>
            <StatItem label="clientWidth（内容+内边距）" value={demoStats.clientWidth} />
          </Col>
          <Col span={8}>
            <StatItem label="offsetWidth（含边框+滚动条）" value={demoStats.offsetWidth} />
          </Col>
          <Col span={8}>
            <StatItem label="scrollWidth（内容总宽度）" value={demoStats.scrollWidth} />
          </Col>
        </Row>

        <div
          style={{ marginTop: '16px', padding: '12px', background: '#fff7e6', borderRadius: '4px' }}
        >
          <Text strong style={{ color: '#fa8c16' }}>
            📐 计算公式：
          </Text>
          <div style={{ marginTop: '8px', fontSize: '13px' }}>
            <div>
              滚动条宽度 = offsetWidth - clientWidth ={' '}
              <Text strong>{demoStats.offsetWidth - demoStats.clientWidth}px</Text>
            </div>
            <div>
              内容溢出 = scrollWidth - clientWidth ={' '}
              <Text strong>{demoStats.scrollWidth - demoStats.clientWidth}px</Text>
            </div>
          </div>
        </div>
      </Card>
    </Card>
  );
};

export default LiveDemo;
