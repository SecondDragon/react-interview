import React, { useEffect, useRef } from 'react';
import { Card, Tag } from 'antd';
import * as echarts from 'echarts';

/**
 * 示例代码位置说明：
 * 该组件定义在 @src/samples/HeavyChart.tsx
 * 模拟一个引入了大型可视化库 (ECharts) 的重型组件
 * 核心痛点：该组件 JS Bundle 很大，不应在首屏加载
 */
const HeavyChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const myChart = echarts.init(chartRef.current);
    const option = {
      title: { text: '大型数据报表组件 (5MB+ JS)' },
      tooltip: {},
      xAxis: { data: ['A', 'B', 'C', 'D', 'E'] },
      yAxis: {},
      series: [{ name: '销量', type: 'bar', data: [5, 20, 36, 10, 10] }]
    };
    myChart.setOption(option);
    return () => myChart.dispose();
  }, []);

  return (
    <Card title="📊 业务报表 (重型图表库)" extra={<Tag color="red">Large Bundle</Tag>}>
      <div ref={chartRef} style={{ width: '100%', height: '300px' }} />
    </Card>
  );
};

export default HeavyChart;
