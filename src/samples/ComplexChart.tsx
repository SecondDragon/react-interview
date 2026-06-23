import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

/**
 * 示例代码位置说明：
 * 该组件定义在 @src/samples/ComplexChart.tsx
 * 被加载于 @src/pages/overview/index.tsx 的 SmartIdleLoad 演示中
 */
const ComplexChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 打印加载成功的时间点，用于后续观察
    console.log('[ComplexChart] 渲染开始 - 时间戳:', performance.now().toFixed(2));

    const myChart = echarts.init(chartRef.current);

    // 生成 50,000 个随机数据点，模拟繁重计算和渲染
    const dataCount = 50000;
    const data = [];
    let base = +new Date(1988, 9, 3);
    const oneDay = 24 * 3600 * 1000;
    let value = Math.random() * 1000;
    for (let i = 0; i < dataCount; i++) {
      const now = new Date((base += oneDay));
      value = value + Math.random() * 21 - 10;
      data.push([
        [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'),
        Math.round(value),
      ]);
    }

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        position: function (pt) {
          return [pt[0], '10%'];
        },
      },
      title: {
        left: 'center',
        text: '50k 数据量折线图 (SmartIdleLoad 渲染)',
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: 'none',
          },
          restore: {},
          saveAsImage: {},
        },
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%'],
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 20,
        },
        {
          start: 0,
          end: 20,
        },
      ],
      series: [
        {
          name: '模拟数据',
          type: 'line',
          smooth: true,
          symbol: 'none',
          areaStyle: {},
          data: data,
        },
      ],
    };

    myChart.setOption(option);

    const handleResize = () => myChart.resize();
    window.addEventListener('resize', handleResize);

    console.log('[ComplexChart] 渲染完成 - 时间戳:', performance.now().toFixed(2));

    return () => {
      window.removeEventListener('resize', handleResize);
      myChart.dispose();
    };
  }, []);

  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        height: '400px',
        border: '1px solid #f0f0f0',
        borderRadius: '8px',
        marginTop: '20px',
        padding: '20px',
        background: '#fff',
      }}
    />
  );
};

export default ComplexChart;
