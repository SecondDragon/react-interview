import React, { useState, useRef, useEffect } from 'react';
import { Card, Typography, Tag, List, Collapse, Alert, Button, Input } from 'antd';
import { useCaseData } from './Examples';
import CodeDiff from '@/components/CodeDiff';

const { Text, Title } = Typography;
const { Panel } = Collapse;

/**
 * 实际应用场景演示
 * 展示各种尺寸 API 在高级开发中的具体用法
 */
const UseCases: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBottom, setIsBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // 滚动监听演示
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const progress = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
      setIsBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 1);
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // 键盘检测演示（模拟）
  useEffect(() => {
    if (window.visualViewport) {
      const handleResize = () => {
        const height = window.innerHeight - window.visualViewport.height;
        setKeyboardHeight(height > 100 ? height : 0);
      };
      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <Card
      title="🚀 实际应用场景"
      style={{ marginBottom: '24px', borderLeft: '4px solid #eb2f96' }}
    >
      <Alert
        message="以下场景展示了尺寸 API 在实际开发中的高级用法"
        description="每个场景都包含：问题描述、使用的 API、核心代码和交互演示"
        type="info"
        showIcon
        style={{ marginBottom: '16px' }}
      />

      {/* 场景 1：滚动进度条 */}
      <Card
        size="small"
        title={<span><Tag color="blue">场景 1</Tag> 滚动进度条</span>}
        style={{ marginBottom: '16px' }}
      >
        <Text>
          使用 <Text code>scrollTop</Text>、<Text code>clientHeight</Text>、<Text code>scrollHeight</Text> 计算滚动进度。
        </Text>

        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '4px',
            background: '#f0f0f0',
            marginTop: '8px',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              width: `${scrollProgress}%`,
              height: '100%',
              background: '#1890ff',
              transition: 'width 0.1s',
            }}
          />
        </div>

        <div
          ref={scrollContainerRef}
          style={{
            height: '150px',
            overflow: 'auto',
            border: '1px solid #d9d9d9',
            padding: '16px',
            borderRadius: '4px',
          }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>
              列表项 {i + 1} - 向下滚动查看进度条变化
            </div>
          ))}
        </div>

        <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
          进度：{scrollProgress.toFixed(1)}% | {isBottom ? '✅ 已到底部' : '继续滚动'}
        </div>

        <CodeDiff
          code={`// 滚动进度计算
const progress = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;

// 是否滚动到底部（考虑舍入误差）
const isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;`}
          type="info"
          title="核心代码"
        />
      </Card>

      {/* 场景 2：键盘弹出检测 */}
      <Card
        size="small"
        title={<span><Tag color="green">场景 2</Tag> 移动端键盘弹出检测</span>}
        style={{ marginBottom: '16px' }}
      >
        <Text>
          使用 <Text code>visualViewport.height</Text> 检测键盘是否弹出。
        </Text>

        <div style={{ marginTop: '8px' }}>
          <Input.TextArea
            placeholder="在移动端点击此输入框，键盘弹出时下方会显示键盘高度"
            rows={3}
            style={{ marginBottom: '8px' }}
          />
          <div style={{ fontSize: '12px', color: '#999' }}>
            键盘高度：<Text strong style={{ color: keyboardHeight > 0 ? '#ff4d4f' : '#52c41a' }}>
              {keyboardHeight > 0 ? `${Math.round(keyboardHeight)}px（键盘弹出）` : '0px（键盘收起）'}
            </Text>
          </div>
        </div>

        <CodeDiff
          code={`if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    const keyboardHeight = window.innerHeight - window.visualViewport.height;
    if (keyboardHeight > 150) {
      // 键盘弹出了，调整布局
      document.body.style.paddingBottom = keyboardHeight + 'px';
    }
  });
}`}
          type="info"
          title="核心代码"
        />
      </Card>

      {/* 场景 3：元素视口检测 */}
      <Card
        size="small"
        title={<span><Tag color="orange">场景 3</Tag> 元素是否进入视口（懒加载）</span>}
        style={{ marginBottom: '16px' }}
      >
        <Text>
          使用 <Text code>getBoundingClientRect()</Text> 判断元素是否进入可视区域。
        </Text>

        <ViewportDetectionDemo />

        <CodeDiff
          code={`// 传统方式（会触发强制重排）
function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

// 现代方式（性能更好）
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 元素进入视口，加载图片
      entry.target.src = entry.target.dataset.src;
    }
  });
});`}
          type="info"
          title="核心代码"
        />
      </Card>

      {/* 场景 4：虚拟滚动 */}
      <Card
        size="small"
        title={<span><Tag color="purple">场景 4</Tag> 虚拟滚动可视区域计算</span>}
        style={{ marginBottom: '16px' }}
      >
        <Text>
          使用 <Text code>clientHeight</Text> 和 <Text code>scrollTop</Text> 计算应该渲染哪些元素。
        </Text>

        <VirtualScrollDemo />

        <CodeDiff
          code={`function getVisibleRange(el, itemHeight, totalCount) {
  const startIndex = Math.floor(el.scrollTop / itemHeight);
  const visibleCount = Math.ceil(el.clientHeight / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, totalCount);
  return { startIndex, endIndex };
}`}
          type="info"
          title="核心代码"
        />
      </Card>

      {/* 更多场景折叠面板 */}
      <Collapse>
        {useCaseData.slice(4).map((item) => (
          <Panel header={item.title} key={item.key}>
            <Text strong>场景：</Text>
            <Paragraph>{item.scenario}</Paragraph>
            <Text strong>公式：</Text>
            <div style={{ padding: '8px', background: '#f5f5f5', borderRadius: '4px', margin: '8px 0' }}>
              <Text code>{item.formula}</Text>
            </div>
            <Text strong>解释：</Text>
            <Paragraph>{item.explanation}</Paragraph>
            <CodeDiff code={item.code} type="info" title="代码示例" />
          </Panel>
        ))}
      </Collapse>
    </Card>
  );
};

/**
 * 视口检测演示组件
 */
const ViewportDetectionDemo: React.FC = () => {
  const [status, setStatus] = useState<'in' | 'out'>('out');
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setStatus(entry.isIntersecting ? 'in' : 'out');
      },
      { threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ height: '100px', overflow: 'auto', border: '1px solid #d9d9d9', padding: '8px' }}>
        <div style={{ height: '200px', padding: '8px' }}>
          向下滚动，观察下方元素状态变化
        </div>
        <div
          ref={targetRef}
          style={{
            padding: '16px',
            background: status === 'in' ? '#f6ffed' : '#fff2f0',
            border: `2px solid ${status === 'in' ? '#52c41a' : '#ff4d4f'}`,
            borderRadius: '4px',
            textAlign: 'center',
          }}
        >
          <Text strong style={{ color: status === 'in' ? '#52c41a' : '#ff4d4f' }}>
            {status === 'in' ? '✅ 已进入视口' : '❌ 不在视口内'}
          </Text>
        </div>
        <div style={{ height: '200px' }} />
      </div>
    </div>
  );
};

/**
 * 虚拟滚动演示组件
 */
const VirtualScrollDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const itemHeight = 40;
  const totalCount = 1000;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const start = Math.floor(el.scrollTop / itemHeight);
      const visibleCount = Math.ceil(el.clientHeight / itemHeight);
      setVisibleRange({
        start: Math.max(0, start - 1),
        end: Math.min(totalCount, start + visibleCount + 2),
      });
    };

    el.addEventListener('scroll', handleScroll);
    handleScroll(); // 初始计算
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const visibleItems = Array.from(
    { length: visibleRange.end - visibleRange.start },
    (_, i) => visibleRange.start + i
  );

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
        总数据：{totalCount} 条 | 可视区域：{visibleRange.start} - {visibleRange.end} |
        实际渲染：{visibleItems.length} 条
      </div>
      <div
        ref={containerRef}
        style={{
          height: '200px',
          overflow: 'auto',
          border: '1px solid #d9d9d9',
          position: 'relative',
        }}
      >
        <div style={{ height: `${totalCount * itemHeight}px`, position: 'relative' }}>
          {visibleItems.map((index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: `${index * itemHeight}px`,
                height: `${itemHeight}px`,
                width: '100%',
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid #f0f0f0',
                background: index % 2 === 0 ? '#fafafa' : '#fff',
              }}
            >
              列表项 {index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UseCases;
