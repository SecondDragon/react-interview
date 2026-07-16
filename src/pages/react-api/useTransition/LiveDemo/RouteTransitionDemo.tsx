import React, { useState, useTransition } from 'react';
import { Alert, Button, Card, Space, Switch, Tag, Skeleton } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import { HeavyTabContent } from './shared';

const RouteTransitionDemo: React.FC = () => {
  const [mode, setMode] = useState<'sync' | 'transition'>('sync');
  const [entered, setEntered] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleEnter = () => {
    setEntered(true);
    if (mode === 'transition') {
      startTransition(() => setLoaded(true));
    } else {
      setLoaded(true);
    }
  };

  const handleReset = () => {
    setEntered(false);
    setLoaded(false);
  };

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <span>模式：</span>
        <Switch
          checkedChildren={<><RocketOutlined /> Transition</>}
          unCheckedChildren="同步"
          checked={mode === 'transition'}
          onChange={(val) => {
            setMode(val ? 'transition' : 'sync');
            setEntered(false);
            setLoaded(false);
          }}
        />
      </Space>

      {!entered ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Alert
            type="info"
            showIcon
            message="模拟路由切换"
            description="点击下方按钮模拟从其他路由导航到本页。对比同步和 Transition 模式下的首页渲染效果。"
            style={{ marginBottom: 16 }}
          />
          <Button type="primary" size="large" onClick={handleEnter}>
            模拟进入页面
          </Button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <Tag color="blue">页面标题</Tag>
              <Tag>骨架屏阶段</Tag>
            </div>
            <Button size="small" onClick={handleReset}>重置</Button>
          </div>

          {mode === 'transition' && isPending && (
            <Alert
              type="success"
              showIcon
              message="UI 已响应！isPending = true，主线程未被阻塞"
              description="你可以尝试在骨架屏显示期间点击页面上的按钮或输入文字，观察交互是否流畅。"
              style={{ marginBottom: 16 }}
            />
          )}

          {mode === 'sync' && entered && (
            <Alert
              type="error"
              showIcon
              message="同步渲染中...点击后页面将卡住 ~200ms"
              description="注意观察：点击后按钮是否立即响应？页面是否有短暂白屏？"
              style={{ marginBottom: 16 }}
            />
          )}

          {isPending || !loaded ? (
            <div>
              <Skeleton active style={{ marginBottom: 8 }} />
              <Skeleton active paragraph={{ rows: 6 }} style={{ marginBottom: 8 }} />
              <Skeleton active paragraph={{ rows: 4 }} />
              <div style={{ textAlign: 'center', marginTop: 16, color: '#999', fontSize: 12 }}>
                {mode === 'transition' ? '⏳ 重内容正在后台渲染（时间切片），主线程流畅...' : '加载中...'}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 8, color: '#52c41a', fontSize: 12 }}>
                ✅ 重内容渲染完成（{mode === 'transition' ? '后台时间切片完成' : '同步阻塞后完成'}）
              </div>
              <HeavyTabContent />
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default RouteTransitionDemo;
