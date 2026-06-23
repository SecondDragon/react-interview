import React, { useState } from 'react';
import { Card, Button, Input, Typography, Space, Alert, Tag, Row, Col } from 'antd';
import { liveDemoSnippets } from './Examples';
import CodeBlock from '@/components/CodeBlock';

const { Title, Text, Paragraph } = Typography;

/**
 * 互动演示区：让用户亲手验证 undefined 与 null 的差异
 */
const LiveDemo: React.FC = () => {
  const [inputValue, setInputValue] = useState<string | null | undefined>('');

  // 把输入框的字符串解析成 JS 值
  const parsedValue = (() => {
    const raw = inputValue;
    if (raw === '') return undefined;
    if (raw === 'null') return null;
    if (raw === 'undefined') return undefined;
    try {
      // 尝试解析数字、布尔等
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  })();

  const isNull = parsedValue === null;
  const isUndefined = parsedValue === undefined;

  return (
    <div>
      <Title level={5}>实时观察：typeof / == / === / ?? / 默认参数</Title>
      <Paragraph type="secondary">
        在下方输入框中输入 <Text code>null</Text>、<Text code>undefined</Text>、<Text code>0</Text>
        、<Text code>""</Text> 或 <Text code>false</Text>，观察右侧结果。
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={10}>
          <Card size="small" title="输入值">
            <Input
              placeholder="输入 null / undefined / 0 / '' / false"
              value={
                inputValue === undefined
                  ? 'undefined'
                  : inputValue === null
                    ? 'null'
                    : String(inputValue)
              }
              onChange={(e) => {
                const v = e.target.value;
                if (v === 'undefined') setInputValue(undefined);
                else if (v === 'null') setInputValue(null);
                else setInputValue(v);
              }}
            />
            <Space style={{ marginTop: 12 }} wrap>
              <Button size="small" onClick={() => setInputValue('undefined')}>
                undefined
              </Button>
              <Button size="small" onClick={() => setInputValue('null')}>
                null
              </Button>
              <Button size="small" onClick={() => setInputValue('0')}>
                0
              </Button>
              <Button size="small" onClick={() => setInputValue('')}>
                ''
              </Button>
              <Button size="small" onClick={() => setInputValue('false')}>
                false
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={14}>
          <Card size="small" title="求值结果">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Tag color="blue">typeof</Tag>
                <Text code>{typeof parsedValue}</Text>
              </div>
              <div>
                <Tag color="blue">== null</Tag>
                <Text code>{String(parsedValue == null)}</Text>
              </div>
              <div>
                <Tag color="blue">=== null</Tag>
                <Text code>{String(parsedValue === null)}</Text>
              </div>
              <div>
                <Tag color="blue">=== undefined</Tag>
                <Text code>{String(parsedValue === undefined)}</Text>
              </div>
              <div>
                <Tag color="blue">Number()</Tag>
                <Text code>{String(Number(parsedValue))}</Text>
              </div>
              <div>
                <Tag color="blue">?? 'default'</Tag>
                <Text code>{String(parsedValue ?? 'default')}</Text>
              </div>
              <div>
                <Tag color="blue">默认参数</Tag>
                <Text code>
                  {(() => {
                    const fn = (a = 'default') => a;
                    return String(fn(parsedValue));
                  })()}
                </Text>
              </div>
            </Space>

            {(isNull || isUndefined) && (
              <Alert
                message={isNull ? '当前值为 null' : '当前值为 undefined'}
                description="注意 ?? 运算符会触发默认值，但 0 / '' / false 不会。"
                type={isNull ? 'warning' : 'info'}
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Title level={5} style={{ marginTop: 24 }}>
        关键代码片段
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <CodeBlock code={liveDemoSnippets.typeofCheck} title="类型检测" type="info" />
        </Col>
        <Col xs={24} md={12}>
          <CodeBlock code={liveDemoSnippets.equalityCheck} title="相等性比较" type="info" />
        </Col>
        <Col xs={24} md={12}>
          <CodeBlock code={liveDemoSnippets.numberConversion} title="数值转换" type="warning" />
        </Col>
        <Col xs={24} md={12}>
          <CodeBlock code={liveDemoSnippets.jsonStringify} title="JSON 序列化" type="warning" />
        </Col>
        <Col xs={24} md={12}>
          <CodeBlock code={liveDemoSnippets.defaultParams} title="函数默认参数" type="info" />
        </Col>
        <Col xs={24} md={12}>
          <CodeBlock code={liveDemoSnippets.destructuring} title="解构默认值" type="info" />
        </Col>
        <Col xs={24} md={12}>
          <CodeBlock code={liveDemoSnippets.optionalChaining} title="可选链 ?." type="info" />
        </Col>
        <Col xs={24} md={12}>
          <CodeBlock code={liveDemoSnippets.nullishCoalescing} title="空值合并 ??" type="success" />
        </Col>
      </Row>
    </div>
  );
};

export default LiveDemo;
