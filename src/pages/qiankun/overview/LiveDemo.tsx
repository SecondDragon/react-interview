import React, { useState, useMemo } from 'react';
import { Card, Switch, Typography, Space, Collapse, Tag, Alert, Divider } from 'antd';
import { liveDemoQuestions, recommendByAnswers, scenarioTableData } from './data';

const LiveDemo: React.FC = () => {
  const [answers, setAnswers] = useState<Record<string, boolean>>({
    needUnifiedUrl: true,
    needSeo: false,
    needFullStyleIsolation: false,
    needStyleSharing: true,
    needCrossOrigin: false,
    isAppTrusted: true,
    needAdaptiveLayout: true,
    needFastPrototype: false,
  });

  const results = useMemo(() => recommendByAnswers(answers), [answers]);

  const toggleAnswer = (key: string) => {
    setAnswers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const groupLabels: Record<string, string> = {
    url: '路由与 SEO',
    style: '样式',
    security: '安全与跨域',
    other: '其他',
  };

  return (
    <Card title="对比决策器" id="live-demo">
      <Typography.Paragraph>
        根据你的场景选择条件，系统会实时分析推荐方案。
      </Typography.Paragraph>

      <Space direction="vertical" style={{ width: '100%' }}>
        {(['url', 'style', 'security', 'other'] as const).map((group) => (
          <React.Fragment key={group}>
            <Typography.Title level={5}>{groupLabels[group]}</Typography.Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {liveDemoQuestions
                .filter((q) => q.group === group)
                .map((q) => (
                  <div
                    key={q.key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '4px 0',
                    }}
                  >
                    <span>
                      <strong>{q.label}</strong>
                      <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                        {q.description}
                      </Typography.Text>
                    </span>
                    <Switch
                      checked={answers[q.key]}
                      onChange={() => toggleAnswer(q.key)}
                    />
                  </div>
                ))}
            </div>
            <Divider />
          </React.Fragment>
        ))}
      </Space>

      <Divider />

      <Typography.Title level={5}>分析结果</Typography.Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        {results.map((r, i) => (
          <Alert
            key={i}
            type={r.recommendation.includes('qiankun') && r.recommendation.includes('iframe') ? 'info' : r.recommendation.includes('qiankun') ? 'success' : 'warning'}
            message={
              <Space>
                <strong>{r.recommendation}</strong>
                <Tag color={r.recommendation.includes('qiankun') ? 'blue' : 'green'}>{r.reason}</Tag>
              </Space>
            }
            description={r.detail}
            showIcon
          />
        ))}
      </Space>

      <Collapse style={{ marginTop: 24 }}>
        <Collapse.Panel header="常见场景对照表" key="scenarios">
          {scenarioTableData.map((s) => (
            <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>{s.scenario}</span>
              <Space>
                <Tag color={s.recommendation.includes('qiankun') ? 'blue' : 'green'}>{s.recommendation}</Tag>
                <Typography.Text type="secondary">{s.reason}</Typography.Text>
              </Space>
            </div>
          ))}
        </Collapse.Panel>
      </Collapse>
    </Card>
  );
};

export default LiveDemo;
