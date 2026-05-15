import React, { useState } from 'react';
import { Card, Typography, Divider, Tag, Space, Radio, Alert, Table, Button } from 'antd';
import { MobileViewportExamples } from './Examples';
import CodeDiff from '@/components/CodeDiff';

const { Title, Paragraph, Text } = Typography;

/**
 * 互动演示：三种 Viewport 的直观对比
 * 展示 Layout Viewport 和 Visual Viewport 的区别
 */
const ViewportDemo = () => {
  const [viewportMode, setViewportMode] = useState<'default' | 'device-width' | 'ideal'>('default');

  // 模拟手机屏幕
  const phoneWidth = 375;
  const phoneHeight = 240;

  // 不同模式下的布局视口宽度
  const layoutWidths = {
    default: 980,      // 默认 Layout Viewport
    'device-width': 375, // width=device-width
    ideal: 375,        // Ideal Viewport（与 device-width 相同）
  };

  const layoutWidth = layoutWidths[viewportMode];
  const scale = phoneWidth / layoutWidth; // 缩放比例

  return (
    <Card title="📱 互动演示：Viewport 模式对比" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Radio.Group
          value={viewportMode}
          onChange={(e) => setViewportMode(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="default">默认（无 viewport）</Radio.Button>
          <Radio.Button value="device-width">width=device-width</Radio.Button>
          <Radio.Button value="ideal">Ideal Viewport</Radio.Button>
        </Radio.Group>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Text strong>
            {viewportMode === 'default' && '❌ Layout Viewport = 980px，页面被强制缩放'}
            {viewportMode === 'device-width' && '✅ Layout Viewport = 375px，CSS 像素 1:1 映射'}
            {viewportMode === 'ideal' && '✅ Ideal Viewport = 设备宽度，完美适配'}
          </Text>
        </div>

        {/* 模拟手机 */}
        <div style={{
          position: 'relative',
          width: `${phoneWidth}px`,
          height: `${phoneHeight}px`,
          border: '8px solid #333',
          borderRadius: '20px',
          margin: '16px auto',
          overflow: 'hidden',
          background: '#fff'
        }}>
          {/* 屏幕内容 */}
          <div style={{
            width: `${layoutWidth}px`,
            height: `${phoneHeight / scale}px`,
            transform: `scale(${scale})`,
            transformOrigin: '0 0',
            background: '#f5f5f5',
            overflow: 'hidden'
          }}>
            {/* 模拟网页内容 */}
            <div style={{
              padding: '20px',
              fontSize: viewportMode === 'default' ? '32px' : '16px',
              lineHeight: '1.5'
            }}>
              <div style={{
                fontSize: viewportMode === 'default' ? '48px' : '24px',
                fontWeight: 'bold',
                marginBottom: '12px',
                color: '#1890ff'
              }}>
                页面标题
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#ddd',
                marginBottom: '8px',
                borderRadius: '4px'
              }} />
              <div style={{
                width: '80%',
                height: '8px',
                background: '#ddd',
                marginBottom: '8px',
                borderRadius: '4px'
              }} />
              <div style={{
                width: '60%',
                height: '8px',
                background: '#ddd',
                marginBottom: '16px',
                borderRadius: '4px'
              }} />
              <div style={{
                display: 'inline-block',
                padding: '8px 24px',
                background: '#1890ff',
                color: '#fff',
                borderRadius: '4px',
                fontSize: viewportMode === 'default' ? '28px' : '14px'
              }}>
                按钮
              </div>
            </div>
          </div>

          {/* 标注信息 */}
          <div style={{
            position: 'absolute',
            bottom: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            color: '#999',
            whiteSpace: 'nowrap'
          }}>
            Layout Viewport: {layoutWidth}px | Scale: {scale.toFixed(3)}
          </div>
        </div>
      </Space>
    </Card>
  );
};

/**
 * Layout Viewport vs Visual Viewport 对比演示
 * 核心演示：缩放时 Layout 不变，Visual 变化
 */
const VisualViewportDemo = () => {
  const [zoomLevel, setZoomLevel] = useState(1);

  const layoutWidth = 375;
  const layoutHeight = 200;
  const visualWidth = layoutWidth / zoomLevel;
  const visualHeight = layoutHeight / zoomLevel;

  return (
    <Card title="🔍 互动演示：Layout Viewport vs Visual Viewport" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Text strong>模拟用户缩放页面（双击放大/缩小）</Text>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Button onClick={() => setZoomLevel(1)} type={zoomLevel === 1 ? 'primary' : 'default'}>
            未缩放 (1×)
          </Button>
          <Button onClick={() => setZoomLevel(2)} type={zoomLevel === 2 ? 'primary' : 'default'}>
            放大 2×
          </Button>
          <Button onClick={() => setZoomLevel(3)} type={zoomLevel === 3 ? 'primary' : 'default'}>
            放大 3×
          </Button>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '40px',
          marginTop: '20px',
          flexWrap: 'wrap'
        }}>
          {/* 左侧：Layout Viewport（画布） */}
          <div style={{ textAlign: 'center' }}>
            <Text strong type="primary">Layout Viewport（画布）</Text>
            <Paragraph type="secondary" style={{ fontSize: '12px' }}>
              浏览器用于 CSS 布局的虚拟画布
            </Paragraph>
            <div style={{
              position: 'relative',
              width: `${layoutWidth}px`,
              height: `${layoutHeight}px`,
              border: '3px solid #1890ff',
              background: '#e6f7ff',
              margin: '12px auto',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                fontSize: '14px',
                color: '#1890ff',
                fontWeight: 'bold'
              }}>
                画布大小: {layoutWidth}×{layoutHeight}px
              </div>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '24px',
                color: '#1890ff',
                opacity: 0.3
              }}>
                网页内容在这里布局
              </div>

              {/* Visual Viewport 覆盖层 */}
              <div style={{
                position: 'absolute',
                top: `${(layoutHeight - visualHeight) / 2}px`,
                left: `${(layoutWidth - visualWidth) / 2}px`,
                width: `${visualWidth}px`,
                height: `${visualHeight}px`,
                border: '3px dashed #ff4d4f',
                background: 'rgba(255, 77, 79, 0.1)',
                boxSizing: 'border-box'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  fontSize: '11px',
                  color: '#ff4d4f',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}>
                  Visual Viewport
                </div>
              </div>
            </div>
            <Tag color="blue">大小不变: {layoutWidth}×{layoutHeight}px</Tag>
          </div>

          {/* 右侧：Visual Viewport（看到的区域） */}
          <div style={{ textAlign: 'center' }}>
            <Text strong type="danger">Visual Viewport（看到的）</Text>
            <Paragraph type="secondary" style={{ fontSize: '12px' }}>
              用户当前实际能看到的区域
            </Paragraph>
            <div style={{
              position: 'relative',
              width: `${layoutWidth}px`,
              height: `${layoutHeight}px`,
              border: '3px solid #ff4d4f',
              background: '#fff2f0',
              margin: '12px auto',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                fontSize: '14px',
                color: '#ff4d4f',
                fontWeight: 'bold'
              }}>
                可见区域: {Math.round(visualWidth)}×{Math.round(visualHeight)}px
              </div>

              {/* 模拟被放大的内容 */}
              <div style={{
                width: `${layoutWidth * zoomLevel}px`,
                height: `${layoutHeight * zoomLevel}px`,
                transform: `scale(${1 / zoomLevel})`,
                transformOrigin: '0 0',
                position: 'absolute',
                top: '40px',
                left: '0'
              }}>
                <div style={{
                  padding: '20px',
                  fontSize: `${16 * zoomLevel}px`
                }}>
                  <div style={{
                    fontSize: `${24 * zoomLevel}px`,
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    color: '#1890ff'
                  }}>
                    页面标题
                  </div>
                  <div style={{
                    width: '100%',
                    height: `${8 * zoomLevel}px`,
                    background: '#ddd',
                    marginBottom: '8px',
                    borderRadius: '4px'
                  }} />
                  <div style={{
                    display: 'inline-block',
                    padding: `${8 * zoomLevel}px ${24 * zoomLevel}px`,
                    background: '#1890ff',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: `${14 * zoomLevel}px`
                  }}>
                    按钮
                  </div>
                </div>
              </div>
            </div>
            <Tag color="red">缩放后变化: {Math.round(visualWidth)}×{Math.round(visualHeight)}px</Tag>
          </div>
        </div>

        <Alert
          message={zoomLevel === 1
            ? '未缩放：Layout Viewport = Visual Viewport，用户看到全部内容'
            : `放大 ${zoomLevel}×：Layout Viewport 不变（${layoutWidth}×${layoutHeight}），Visual Viewport 缩小为 ${Math.round(visualWidth)}×${Math.round(visualHeight)}，只能看到部分内容`
          }
          type={zoomLevel === 1 ? 'success' : 'warning'}
          showIcon
          style={{ marginTop: '16px' }}
        />
      </Space>
    </Card>
  );
};

/**
 * 三种 Viewport 协作流程演示
 */
const ViewportCollaborationDemo = () => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: '步骤 1：浏览器创建 Layout Viewport',
      desc: '浏览器默认创建 980px 的虚拟画布（为了兼容桌面网页）',
      layoutW: 980,
      visualW: 375,
      scale: 0.38,
      showIdeal: false
    },
    {
      title: '步骤 2：设置 width=device-width',
      desc: '通过 meta 标签将 Layout Viewport 设为设备宽度（375px）',
      layoutW: 375,
      visualW: 375,
      scale: 1.0,
      showIdeal: true
    },
    {
      title: '步骤 3：用户放大页面 2×',
      desc: 'Layout Viewport 保持 375px 不变，Visual Viewport 缩小为 187px',
      layoutW: 375,
      visualW: 187,
      scale: 2.0,
      showIdeal: true
    }
  ];

  const current = steps[step];
  const phoneWidth = 280;
  const layoutScale = phoneWidth / current.layoutW;

  return (
    <Card title="🔄 互动演示：三种 Viewport 协作流程" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {steps.map((s, i) => (
            <Button
              key={i}
              type={step === i ? 'primary' : 'default'}
              onClick={() => setStep(i)}
            >
              步骤 {i + 1}
            </Button>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <Text strong>{current.title}</Text>
          <Paragraph type="secondary">{current.desc}</Paragraph>
        </div>

        {/* 流程图 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          marginTop: '16px',
          flexWrap: 'wrap'
        }}>
          {/* Ideal Viewport */}
          {current.showIdeal && (
            <div style={{ textAlign: 'center' }}>
              <Text strong style={{ color: '#52c41a' }}>Ideal Viewport</Text>
              <div style={{
                width: '80px',
                height: '120px',
                border: '2px solid #52c41a',
                borderRadius: '8px',
                background: '#f6ffed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '8px auto',
                fontSize: '12px',
                color: '#52c41a'
              }}>
                375px
              </div>
              <Text type="secondary" style={{ fontSize: '11px' }}>设备最佳尺寸</Text>
            </div>
          )}

          {current.showIdeal && <div style={{ fontSize: '20px', color: '#999' }}>→</div>}

          {/* Layout Viewport */}
          <div style={{ textAlign: 'center' }}>
            <Text strong style={{ color: '#1890ff' }}>Layout Viewport</Text>
            <div style={{
              width: `${current.layoutW > 400 ? 120 : 80}px`,
              height: '120px',
              border: '2px solid #1890ff',
              borderRadius: '8px',
              background: '#e6f7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '8px auto',
              fontSize: '12px',
              color: '#1890ff'
            }}>
              {current.layoutW}px
            </div>
            <Text type="secondary" style={{ fontSize: '11px' }}>CSS 布局画布</Text>
          </div>

          <div style={{ fontSize: '20px', color: '#999' }}>→</div>

          {/* 手机屏幕 */}
          <div style={{ textAlign: 'center' }}>
            <Text strong>手机屏幕</Text>
            <div style={{
              width: `${phoneWidth}px`,
              height: '140px',
              border: '4px solid #333',
              borderRadius: '12px',
              background: '#fff',
              position: 'relative',
              overflow: 'hidden',
              margin: '8px auto'
            }}>
              {/* Layout Viewport 内容 */}
              <div style={{
                width: `${current.layoutW}px`,
                height: '200px',
                transform: `scale(${layoutScale})`,
                transformOrigin: '0 0',
                position: 'absolute',
                top: 0,
                left: 0
              }}>
                <div style={{
                  padding: '16px',
                  fontSize: '14px'
                }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1890ff',
                    marginBottom: '8px'
                  }}>
                    网页内容
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#ddd', marginBottom: '6px' }} />
                  <div style={{ width: '60%', height: '6px', background: '#ddd' }} />
                </div>
              </div>

              {/* Visual Viewport 指示框 */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                right: '20px',
                bottom: '20px',
                border: '2px dashed #ff4d4f',
                borderRadius: '4px',
                background: 'rgba(255, 77, 79, 0.05)'
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  fontSize: '10px',
                  color: '#ff4d4f'
                }}>
                  Visual: {current.visualW}px
                </div>
              </div>
            </div>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              缩放比例: {current.scale.toFixed(2)}
            </Text>
          </div>
        </div>
      </Space>
    </Card>
  );
};

/**
 * DIP 存在意义演示
 * 核心问题：如果没有 DIP，物理像素直接对应 CSS 像素会怎样？
 */
const DipDemo = () => {
  const [device, setDevice] = useState<'old' | 'new'>('old');

  const devices = {
    old: {
      name: '旧手机 A',
      size: '4.7 英寸',
      physical: 750,
      ppi: 326,
      dpr: 2,
      dip: 375,
    },
    new: {
      name: '新手机 B',
      size: '6.1 英寸',
      physical: 1170,
      ppi: 460,
      dpr: 3,
      dip: 390,
    },
  };

  const current = devices[device];
  const cssWidth = 187.5; // CSS 像素宽度（占屏幕一半）
  const withoutDipWidth = cssWidth; // 如果没有 DIP，直接用物理像素
  const withDipWidth = device === 'old' ? cssWidth : (cssWidth * 390 / 375); // 有 DIP 时

  return (
    <Card title="🎯 互动演示：为什么需要设备独立像素（DIP）？" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Text strong>对比两种方案：物理像素直接对应 CSS 像素 vs 引入 DIP</Text>
        </div>

        <Radio.Group
          value={device}
          onChange={(e) => setDevice(e.target.value)}
          buttonStyle="solid"
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <Radio.Button value="old">旧手机 A（750px，326 PPI）</Radio.Button>
          <Radio.Button value="new">新手机 B（1170px，460 PPI）</Radio.Button>
        </Radio.Group>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '40px',
          marginTop: '20px',
          flexWrap: 'wrap'
        }}>
          {/* 方案一：没有 DIP */}
          <div style={{ textAlign: 'center', maxWidth: '300px' }}>
            <Text strong type="danger">❌ 没有 DIP（物理像素 = CSS 像素）</Text>
            <div style={{
              width: '280px',
              height: '160px',
              border: '3px solid #ff4d4f',
              background: '#fff2f0',
              margin: '12px auto',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '8px'
            }}>
              {/* 模拟屏幕 */}
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                fontSize: '11px',
                color: '#ff4d4f'
              }}>
                {current.name}：{current.physical}px 宽
              </div>

              {/* 按钮：width: 187.5px */}
              <div style={{
                position: 'absolute',
                top: '40px',
                left: '20px',
                width: `${withoutDipWidth * (280 / current.physical)}px`,
                height: '36px',
                background: '#ff4d4f',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                transition: 'all 0.3s'
              }}>
                width: 187.5px
              </div>

              {/* 文字 */}
              <div style={{
                position: 'absolute',
                top: '90px',
                left: '20px',
                fontSize: `${16 * (280 / current.physical)}px`,
                color: '#333',
                transition: 'all 0.3s'
              }}>
                这是一段文字
              </div>

              {/* 占比标注 */}
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                fontSize: '11px',
                color: '#999'
              }}>
                按钮占屏幕 {(withoutDipWidth / current.physical * 100).toFixed(1)}%
              </div>
            </div>
            <Alert
              message={device === 'old'
                ? '旧手机：187.5px 占屏幕 25%，按钮大小正常'
                : '新手机：187.5px 只占屏幕 16%，按钮变得很小！'
              }
              type={device === 'old' ? 'success' : 'error'}
              showIcon
              style={{ textAlign: 'left' }}
            />
          </div>

          {/* 方案二：有 DIP */}
          <div style={{ textAlign: 'center', maxWidth: '300px' }}>
            <Text strong type="success">✅ 引入 DIP（CSS 像素 = DIP）</Text>
            <div style={{
              width: '280px',
              height: '160px',
              border: '3px solid #52c41a',
              background: '#f6ffed',
              margin: '12px auto',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '8px'
            }}>
              {/* 模拟屏幕 */}
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                fontSize: '11px',
                color: '#52c41a'
              }}>
                {current.name}：{current.dip} DIP（DPR={current.dpr}）
              </div>

              {/* 按钮：width: 50% → 对应 DIP 的一半 */}
              <div style={{
                position: 'absolute',
                top: '40px',
                left: '20px',
                width: `${140}px`,
                height: '36px',
                background: '#52c41a',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                width: 50%
              </div>

              {/* 文字 */}
              <div style={{
                position: 'absolute',
                top: '90px',
                left: '20px',
                fontSize: '16px',
                color: '#333'
              }}>
                这是一段文字
              </div>

              {/* 占比标注 */}
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                fontSize: '11px',
                color: '#999'
              }}>
                按钮占屏幕 50%
              </div>
            </div>
            <Alert
              message={device === 'old'
                ? '旧手机：50% 宽度 = 187.5 DIP = 375 物理像素'
                : '新手机：50% 宽度 = 195 DIP = 585 物理像素，按钮大小一致！'
              }
              type="success"
              showIcon
              style={{ textAlign: 'left' }}
            />
          </div>
        </div>

        <Divider />

        <div style={{
          background: '#f5f5f5',
          padding: '16px',
          borderRadius: '8px'
        }}>
          <Text strong>核心结论：</Text>
          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li>
              <Text>
                <Text strong>没有 DIP：</Text>
                同一套 CSS 在不同设备上显示大小不同，开发者需要为每台设备单独适配
              </Text>
            </li>
            <li>
              <Text>
                <Text strong>引入 DIP：</Text>
                操作系统保证同样数量的 DIP 显示的实际尺寸一致，
                <Text type="success">一套 CSS 适配所有设备</Text>
              </Text>
            </li>
            <li>
              <Text>
                <Text strong>类比：</Text>
                DIP 就像"厘米"这个单位——无论打印机的分辨率多高，1 厘米就是 1 厘米
              </Text>
            </li>
          </ul>
        </div>
      </Space>
    </Card>
  );
};

/**
 * 375px 基准适配演示
 * 展示为什么设计稿用 375px，以及不同设备的适配效果
 */
const Baseline375Demo = () => {
  const [device, setDevice] = useState<'se' | 'standard' | 'pro' | 'android'>('standard');

  const devices = {
    se: { name: 'iPhone SE', dip: 375, inch: '4.7"', desc: '小屏设备' },
    standard: { name: 'iPhone 12/13', dip: 390, inch: '6.1"', desc: '标准设备' },
    pro: { name: 'iPhone 14 Pro Max', dip: 430, inch: '6.7"', desc: '大屏设备' },
    android: { name: 'Android 典型', dip: 360, inch: '6.0"', desc: 'Android 设备' },
  };

  const current = devices[device];
  const scale = current.dip / 375; // 相对于 375 基准的缩放比例

  // 设计稿上的元素（以 375 为基准）
  const cardWidthPercent = 50; // 50%
  const buttonWidthPercent = 92; // 92%
  const fontSize = 16; // 16px
  const padding = 16; // 16px

  return (
    <Card title="🎨 互动演示：为什么设计稿用 375px 基准？" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Text strong>选择不同设备，观察 375px 基准的适配效果</Text>
        </div>

        <Radio.Group
          value={device}
          onChange={(e) => setDevice(e.target.value)}
          buttonStyle="solid"
          style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Radio.Button value="se">iPhone SE (375)</Radio.Button>
          <Radio.Button value="standard">iPhone 12/13 (390)</Radio.Button>
          <Radio.Button value="pro">iPhone Pro Max (430)</Radio.Button>
          <Radio.Button value="android">Android (360)</Radio.Button>
        </Radio.Group>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '40px',
          marginTop: '20px',
          flexWrap: 'wrap'
        }}>
          {/* 设计稿 */}
          <div style={{ textAlign: 'center' }}>
            <Text strong type="primary">设计稿（375px 基准）</Text>
            <div style={{
              width: '280px',
              height: '180px',
              border: '3px solid #1890ff',
              background: '#e6f7ff',
              margin: '12px auto',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '8px',
              padding: '12px',
              boxSizing: 'border-box'
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1890ff',
                marginBottom: '12px'
              }}>
                页面标题
              </div>

              {/* 卡片：50% 宽度 */}
              <div style={{
                width: `${cardWidthPercent}%`,
                height: '50px',
                background: '#1890ff',
                borderRadius: '4px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '12px'
              }}>
                卡片 50%
              </div>

              {/* 按钮：92% 宽度 */}
              <div style={{
                width: `${buttonWidthPercent}%`,
                height: '36px',
                background: '#52c41a',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '12px',
                margin: '0 auto'
              }}>
                按钮 92%
              </div>
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              卡片: 187px | 按钮: 345px
            </Text>
          </div>

          {/* 实际设备渲染 */}
          <div style={{ textAlign: 'center' }}>
            <Text strong type="success">
              实际渲染：{current.name}
            </Text>
            <div style={{
              width: `${280 * scale}px`,
              height: '180px',
              border: '3px solid #52c41a',
              background: '#f6ffed',
              margin: '12px auto',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '8px',
              padding: `${12 * scale}px`,
              boxSizing: 'border-box',
              transition: 'all 0.3s'
            }}>
              <div style={{
                fontSize: `${18 * scale}px`,
                fontWeight: 'bold',
                color: '#52c41a',
                marginBottom: `${12 * scale}px`,
                transition: 'all 0.3s'
              }}>
                页面标题
              </div>

              {/* 卡片：50% 宽度 */}
              <div style={{
                width: `${cardWidthPercent}%`,
                height: `${50 * scale}px`,
                background: '#52c41a',
                borderRadius: '4px',
                marginBottom: `${12 * scale}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: `${12 * scale}px`,
                transition: 'all 0.3s'
              }}>
                卡片 50%
              </div>

              {/* 按钮：92% 宽度 */}
              <div style={{
                width: `${buttonWidthPercent}%`,
                height: `${36 * scale}px`,
                background: '#1890ff',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: `${12 * scale}px`,
                margin: '0 auto',
                transition: 'all 0.3s'
              }}>
                按钮 92%
              </div>
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              DIP: {current.dip}px | 缩放: {scale.toFixed(2)}× | 
              卡片: {Math.round(187 * scale)}px | 按钮: {Math.round(345 * scale)}px
            </Text>
          </div>
        </div>

        <Alert
          message={
            device === 'se' ? 'iPhone SE：1:1 完美匹配 375 基准' :
            device === 'standard' ? 'iPhone 12/13：放大 4%，视觉差异几乎不可感知' :
            device === 'pro' ? 'iPhone Pro Max：放大 15%，大屏上元素更大，符合预期' :
            'Android：缩小 4%，视觉差异几乎不可感知'
          }
          type="success"
          showIcon
          style={{ marginTop: '16px' }}
        />

        <div style={{
          background: '#f5f5f5',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '8px'
        }}>
          <Text strong>核心结论：</Text>
          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li>
              <Text>
                设计稿用 <Text strong>375px 基准</Text>，前端写相对比例（%、vw、rem）
              </Text>
            </li>
            <li>
              <Text>
                不同 DIP 设备按比例缩放，<Text type="success">相对比例保持一致</Text>
              </Text>
            </li>
            <li>
              <Text>
                375 与 390 只差 <Text strong>4%</Text>，视觉上几乎不可感知
              </Text>
            </li>
            <li>
              <Text>
                真正需要特殊处理的是 <Text type="warning">极端设备</Text>（iPad、折叠屏）
              </Text>
            </li>
          </ul>
        </div>
      </Space>
    </Card>
  );
};

/**
 * DPR 演示组件
 */
const DprDemo = () => {
  const [dpr, setDpr] = useState(2);

  const pixelSize = 40; // CSS 像素大小
  const physicalSize = pixelSize * dpr; // 物理像素大小

  return (
    <Card title="🔍 互动演示：DPR 与物理像素映射" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Radio.Group
          value={dpr}
          onChange={(e) => setDpr(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value={1}>DPR = 1 (普通屏)</Radio.Button>
          <Radio.Button value={2}>DPR = 2 (Retina)</Radio.Button>
          <Radio.Button value={3}>DPR = 3 (Super Retina)</Radio.Button>
        </Radio.Group>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '40px',
          marginTop: '20px',
          padding: '20px',
          background: '#f5f5f5',
          borderRadius: '8px'
        }}>
          {/* CSS 像素示意 */}
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">CSS 像素 (逻辑)</Text>
            <div style={{
              width: `${pixelSize}px`,
              height: `${pixelSize}px`,
              border: '2px solid #1890ff',
              margin: '12px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#1890ff',
              fontWeight: 'bold'
            }}>
              1px
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>{pixelSize}×{pixelSize} CSS px</Text>
          </div>

          <div style={{ fontSize: '24px', color: '#999' }}>→</div>

          {/* 物理像素示意 */}
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">物理像素 (实际发光点)</Text>
            <div style={{
              width: `${physicalSize}px`,
              height: `${physicalSize}px`,
              border: '2px solid #ff4d4f',
              margin: '12px auto',
              backgroundImage: `
                linear-gradient(to right, rgba(255,77,79,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,77,79,0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${pixelSize}px ${pixelSize}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#ff4d4f',
              fontWeight: 'bold'
            }}>
              {dpr}×{dpr} = {dpr * dpr} 点
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {physicalSize}×{physicalSize} 物理 px
            </Text>
          </div>
        </div>

        <Alert
          message={dpr === 1
            ? 'DPR=1：1 个 CSS 像素 = 1 个物理像素，显示正常'
            : `DPR=${dpr}：1 个 CSS 像素 = ${dpr}×${dpr}=${dpr * dpr} 个物理像素，边框会变粗 ${dpr} 倍`
          }
          type={dpr === 1 ? 'success' : 'warning'}
          showIcon
          style={{ marginTop: '12px' }}
        />
      </Space>
    </Card>
  );
};

/**
 * 像素概念对比表
 */
const pixelConceptColumns = [
  {
    title: '概念',
    dataIndex: 'concept',
    key: 'concept',
    render: (text: string) => <Text strong>{text}</Text>,
  },
  {
    title: '英文',
    dataIndex: 'english',
    key: 'english',
    render: (text: string) => <Text code>{text}</Text>,
  },
  {
    title: '定义',
    dataIndex: 'definition',
    key: 'definition',
  },
  {
    title: '示例',
    dataIndex: 'example',
    key: 'example',
    render: (text: string) => <Text type="secondary">{text}</Text>,
  },
];

const pixelConceptData = [
  {
    key: '1',
    concept: '物理像素',
    english: 'Physical Pixel',
    definition: '屏幕实际的发光点数量，由硬件决定',
    example: 'iPhone 14: 1170×2532',
  },
  {
    key: '2',
    concept: '设备独立像素',
    english: 'DIP / Device Independent Pixel',
    definition: '操作系统抽象的逻辑单位，与硬件无关。同样数量的 DIP 在不同设备上显示的实际尺寸大致相同',
    example: 'iPhone 14: 390×844',
  },
  {
    key: '3',
    concept: 'CSS 像素',
    english: 'CSS Pixel',
    definition: '前端开发使用的逻辑单位，默认等于 DIP',
    example: 'width: 375px',
  },
  {
    key: '4',
    concept: '设备像素比',
    english: 'DPR',
    definition: '物理像素 / 设备独立像素。表示 1 个 DIP 对应多少个物理像素',
    example: 'iPhone 14: 1170/390 = 3',
  },
  {
    key: '5',
    concept: '像素密度',
    english: 'PPI',
    definition: '每英寸物理像素数，衡量屏幕清晰度',
    example: 'iPhone 14: 460 PPI',
  },
];

/**
 * Viewport 类型对比表
 */
const viewportTypeColumns = [
  {
    title: 'Viewport 类型',
    dataIndex: 'type',
    key: 'type',
    render: (text: string) => <Text strong>{text}</Text>,
  },
  {
    title: '一句话理解',
    dataIndex: 'analogy',
    key: 'analogy',
  },
  {
    title: '宽度',
    dataIndex: 'width',
    key: 'width',
  },
  {
    title: '作用',
    dataIndex: 'purpose',
    key: 'purpose',
  },
  {
    title: '缩放时',
    dataIndex: 'changeable',
    key: 'changeable',
    render: (text: string) => <Tag color={text === '不变' ? 'green' : 'red'}>{text}</Tag>,
  },
];

const viewportTypeData = [
  {
    key: '1',
    type: 'Layout Viewport',
    analogy: '一张 A4 纸的大小',
    width: '默认 980px，或 device-width',
    purpose: '浏览器用于 CSS 布局计算的虚拟画布',
    changeable: '不变',
  },
  {
    key: '2',
    type: 'Visual Viewport',
    analogy: '放大镜下的视野范围',
    width: '用户当前可见区域',
    purpose: '决定用户实际看到的内容范围',
    changeable: '变化',
  },
  {
    key: '3',
    type: 'Ideal Viewport',
    analogy: '量身定制的衣服尺寸',
    width: '等于设备宽度',
    purpose: '设备制造商认为最适合网页的视口',
    changeable: '不变',
  },
];

/**
 * Viewport 与基础概念页面
 * 严格遵循 AGENTS.md 五点结构规范
 */
const MobileViewport: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Title level={2}>{MobileViewportExamples.title}</Title>
      <Paragraph type="secondary">
        {MobileViewportExamples.description}
      </Paragraph>

      {/* 一、现象描述 */}
      <Card title="一、Bug 出现的现象" style={{ marginBottom: '24px' }}>
        <Alert
          message="页面显示异常"
          description={<div style={{ whiteSpace: 'pre-wrap' }}>{MobileViewportExamples.phenomenon}</div>}
          type="warning"
          showIcon
        />
      </Card>

      {/* 二、底层原因 */}
      <Card title="二、Bug 出现的底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>核心原因：浏览器的历史包袱与多层级像素映射。</Text>
        </Paragraph>
        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
          {MobileViewportExamples.reason}
        </Paragraph>

        <Divider orientation="left">三种 Viewport 对比</Divider>
        <Table
          columns={viewportTypeColumns}
          dataSource={viewportTypeData}
          pagination={false}
          size="small"
          bordered
        />

        <Divider orientation="left">像素概念一览</Divider>
        <Table
          columns={pixelConceptColumns}
          dataSource={pixelConceptData}
          pagination={false}
          size="small"
          bordered
        />
      </Card>

      {/* 三、解决方案 */}
      <Card title="三、Bug 如何解决" style={{ marginBottom: '24px' }}>
        <Paragraph>
          正确的 viewport 设置是移动端适配的第一步，也是最重要的一步。
        </Paragraph>

        <CodeDiff
          oldValue={MobileViewportExamples.bad}
          newValue={MobileViewportExamples.good}
          leftTitle="❌ 反面教材"
          rightTitle="✅ 最佳实践"
          type="error"
          hideDiffMarkers={true}
        />
      </Card>

      {/* 四、权衡与互动演示 */}
      <Card
        title={<span>四、为什么要这样解决 且互动演示 <Tag color="blue">Live Demo</Tag></span>}
        style={{ marginBottom: '24px' }}
      >
        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
          {MobileViewportExamples.whySolveThisWay}
        </Paragraph>

        <Divider />
        <ViewportDemo />

        <Divider />
        <VisualViewportDemo />

        <Divider />
        <ViewportCollaborationDemo />

        <Divider />
        <DipDemo />

        <Divider />
        <DprDemo />
      </Card>

      {/* 五、核心原理 */}
      <Card title="五、Bug 能解决的核心原理" style={{ background: '#f0f5ff' }}>
        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
          {MobileViewportExamples.principle}
        </Paragraph>

        <Divider />

        <Title level={5}>面试高频考点</Title>
        <ul>
          <li>
            <Text strong>为什么要提出设备独立像素（DIP）？物理像素直接对应 CSS 像素不好吗？</Text>
            <Paragraph type="secondary" style={{ whiteSpace: 'pre-wrap' }}>
              {MobileViewportExamples.whyDip}
            </Paragraph>
          </li>
          <li>
            <Text strong>设计稿 750px，代码为什么写 375px？</Text>
            <Paragraph type="secondary">
              因为 iPhone 6/7/8 的宽度是 375 CSS 像素，而设计稿按 DPR=2 的物理像素绘制（375×2=750）。代码中使用相对单位（rem/vw）或百分比，由构建工具自动转换。
            </Paragraph>
          </li>
          <li>
            <Text strong>window.innerWidth 获取的是哪种像素？</Text>
            <Paragraph type="secondary">
              获取的是 CSS 像素（即设备独立像素）。在 iPhone 14 上，window.innerWidth = 390，而不是 1170。
            </Paragraph>
          </li>
          <li>
            <Text strong>Visual Viewport 和 Layout Viewport 何时会不一致？</Text>
            <Paragraph type="secondary">
              当用户缩放页面时，Visual Viewport 会变化（用户看到的区域变大或变小），但 Layout Viewport 保持不变。可以通过 window.visualViewport API 获取 Visual Viewport 的尺寸。
            </Paragraph>
          </li>
          <li>
            <Text strong>viewport-fit=cover 和 env() 的协作原理？</Text>
            <Paragraph type="secondary">
              viewport-fit=cover 允许页面内容延伸到刘海/圆角区域，env(safe-area-inset-*) 则提供这些不可显示区域的具体尺寸，两者配合实现全面屏适配。
            </Paragraph>
          </li>
        </ul>

        <Divider />

        <Title level={5}>代码获取三种 Viewport</Title>
        <CodeDiff
          code={`// 1. Layout Viewport 宽度（CSS 布局画布）
const layoutWidth = document.documentElement.clientWidth;

// 2. Visual Viewport 宽度（用户实际看到的区域，缩放后会变化）
const visualWidth = window.visualViewport?.width || window.innerWidth;

// 3. Ideal Viewport 宽度（设备最佳尺寸）
const idealWidth = window.screen.width;

// 4. 计算当前缩放比例
const scale = visualWidth / layoutWidth;

console.log({
  layoutWidth,    // 375（设置了 device-width 后）
  visualWidth,    // 375（未缩放）或 187.5（放大2倍）
  idealWidth,     // 375
  scale           // 1.0 或 0.5
});`}
          type="info"
          title="JavaScript API"
        />
      </Card>
    </div>
  );
};

export default MobileViewport;
