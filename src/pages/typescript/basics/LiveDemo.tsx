import React, { useState } from 'react';
import {
  Card,
  Radio,
  Typography,
  Space,
  Tag,
  Alert,
  Divider,
  Input,
  Select,
} from 'antd';

type DemoMode = 'narrowing' | 'union-intersection' | 'literal';

const LiveDemo: React.FC = () => {
  const [mode, setMode] = useState<DemoMode>('narrowing');

  return (
    <div>
      <Radio.Group
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        style={{ marginBottom: 16 }}
        optionType="button"
        buttonStyle="solid"
      >
        <Radio.Button value="narrowing">类型收窄演示</Radio.Button>
        <Radio.Button value="union-intersection">联合/交叉类型</Radio.Button>
        <Radio.Button value="literal">字面量类型</Radio.Button>
      </Radio.Group>

      {mode === 'narrowing' && <NarrowingDemo />}
      {mode === 'union-intersection' && <UnionIntersectionDemo />}
      {mode === 'literal' && <LiteralDemo />}
    </div>
  );
};

/** 类型收窄演示 */
const NarrowingDemo: React.FC = () => {
  const [inputType, setInputType] = useState<'string' | 'number'>('string');

  return (
    <Card size="small" title="类型收窄（Type Narrowing）">
      <Typography.Paragraph>
        选择输入类型，观察 TypeScript 如何通过 <code>typeof</code> 守卫收窄类型：
      </Typography.Paragraph>

      <Select
        value={inputType}
        onChange={setInputType}
        options={[
          { value: 'string', label: 'string: "Hello TypeScript"' },
          { value: 'number', label: 'number: 42' },
        ]}
        style={{ width: 300, marginBottom: 16 }}
      />

      <div
        style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: 16,
          borderRadius: 6,
          fontFamily: 'Consolas, monospace',
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        <div>
          <span style={{ color: '#569cd6' }}>function</span>
          <span style={{ color: '#dcdcaa' }}> processValue</span>
          <span>(value: string | number) {'{'}</span>
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#c586c0' }}>if</span>
          {' ('}
          <span style={{ color: '#569cd6' }}>typeof</span>
          {' value === "'}
          <span style={{ color: inputType === 'string' ? '#ce9178' : '#808080' }}>
            {inputType}
          </span>
          {'") {'}
        </div>
        <div style={{ paddingLeft: 32 }}>
          {/* 类型收窄后的代码：根据选中的类型显示 */}
          {inputType === 'string' ? (
            <span>
              {'// 此处 value 的类型已收窄为 '}
              <Tag color="blue" style={{ fontSize: 11, lineHeight: '16px' }}>
                string
              </Tag>
              {' 可安全调用 string 方法'}
              <br />
              <span>
                console.log(value.
                <span style={{ color: '#dcdcaa' }}>toUpperCase</span>
                ());
              </span>
            </span>
          ) : (
            <span>
              {'// 此处 value 的类型已收窄为 '}
              <Tag color="green" style={{ fontSize: 11, lineHeight: '16px' }}>
                number
              </Tag>
              {' 可安全调用 number 方法'}
              <br />
              <span>
                console.log(value.
                <span style={{ color: '#dcdcaa' }}>toFixed</span>
                (2));
              </span>
            </span>
          )}
        </div>
        <div style={{ paddingLeft: 16 }}>{'}'}</div>
        <div>{'}'}</div>
      </div>

      <Alert
        type="info"
        showIcon
        message="关键理解"
        description="在 typeof 条件分支内，TypeScript 自动将联合类型 string | number 收窄为具体的分支类型。这使得我们在不丢失类型安全的前提下，安全地调用特定类型的方法。"
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

/** 联合类型与交叉类型演示 */
const UnionIntersectionDemo: React.FC = () => {
  const [demoType, setDemoType] = useState<'union' | 'intersection'>('union');

  return (
    <Card size="small" title="联合类型 | vs 交叉类型 &">
      <Radio.Group
        value={demoType}
        onChange={(e) => setDemoType(e.target.value)}
        optionType="button"
        style={{ marginBottom: 16 }}
      >
        <Radio.Button value="union">联合类型 A | B</Radio.Button>
        <Radio.Button value="intersection">交叉类型 A & B</Radio.Button>
      </Radio.Group>

      <div
        style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: 16,
          borderRadius: 6,
          fontFamily: 'Consolas, monospace',
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        {demoType === 'union' ? (
          <>
            <div>
              <span style={{ color: '#569cd6' }}>interface</span>
              {' '}
              <span style={{ color: '#4ec9b0' }}>User</span>
              {' { name: string; email: string; }'}
            </div>
            <div>
              <span style={{ color: '#569cd6' }}>interface</span>
              {' '}
              <span style={{ color: '#4ec9b0' }}>Admin</span>
              {' { name: string; role: string; }'}
            </div>
            <br />
            <div>
              <span style={{ color: '#569cd6' }}>type</span>
              {' '}
              <span style={{ color: '#4ec9b0' }}>Person</span>
              {' = User '}
              <span style={{ color: '#ce9178' }}>|</span>
              {' Admin;'}
            </div>
            <br />
            <div>
              <span style={{ color: '#569cd6' }}>const</span>
              {' p1: Person = { name: "Tom", email: "t@x.com" }; '}
              <Tag color="success" style={{ fontSize: 11 }}>
                OK
              </Tag>
            </div>
            <div>
              <span style={{ color: '#569cd6' }}>const</span>
              {' p2: Person = { name: "Jerry", role: "admin" }; '}
              <Tag color="success" style={{ fontSize: 11 }}>
                OK
              </Tag>
            </div>
            <div style={{ color: '#808080' }}>
              {'// 联合类型: p 可以是 User 或 Admin 中的任意一种'}
            </div>
            <div style={{ color: '#808080' }}>
              {'// 只能访问共有的 name 属性'}
            </div>
          </>
        ) : (
          <>
            <div>
              <span style={{ color: '#569cd6' }}>interface</span>
              {' '}
              <span style={{ color: '#4ec9b0' }}>A</span>
              {' { name: string; }'}
            </div>
            <div>
              <span style={{ color: '#569cd6' }}>interface</span>
              {' '}
              <span style={{ color: '#4ec9b0' }}>B</span>
              {' { age: number; }'}
            </div>
            <br />
            <div>
              <span style={{ color: '#569cd6' }}>type</span>
              {' '}
              <span style={{ color: '#4ec9b0' }}>C</span>
              {' = A '}
              <span style={{ color: '#ce9178' }}>&</span>
              {' B;'}
            </div>
            <br />
            <div>
              <span style={{ color: '#569cd6' }}>const</span>
              {' obj: C = {'}
            </div>
            <div style={{ paddingLeft: 16 }}>
              <span style={{ color: '#9cdcfe' }}>name</span>: "Tom",
            </div>
            <div style={{ paddingLeft: 16 }}>
              <span style={{ color: '#9cdcfe' }}>age</span>: 25,
            </div>
            <div>{'};'}
              <Tag color="success" style={{ fontSize: 11 }}>
                OK
              </Tag>
            </div>
            <div style={{ color: '#808080' }}>
              {'// 交叉类型: obj 必须同时包含 A 和 B 的所有属性'}
            </div>
            <div style={{ color: '#808080' }}>
              {'// 缺少任意一个属性都会导致编译错误'}
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

/** 字面量类型演示 */
const LiteralDemo: React.FC = () => {
  const [selectedDir, setSelectedDir] = useState<string>('up');

  return (
    <Card size="small" title="字面量类型（Literal Types）">
      <Typography.Paragraph>
        字面量类型将变量限制为具体的值集合。选择方向：
      </Typography.Paragraph>

      <Radio.Group
        value={selectedDir}
        onChange={(e) => setSelectedDir(e.target.value)}
        optionType="button"
        style={{ marginBottom: 16 }}
      >
        <Radio.Button value="up">⬆ up</Radio.Button>
        <Radio.Button value="down">⬇ down</Radio.Button>
        <Radio.Button value="left">⬅ left</Radio.Button>
        <Radio.Button value="right">➡ right</Radio.Button>
      </Radio.Group>

      <div
        style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: 16,
          borderRadius: 6,
          fontFamily: 'Consolas, monospace',
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        <div>
          <span style={{ color: '#569cd6' }}>type</span>
          {' '}
          <span style={{ color: '#4ec9b0' }}>Direction</span>
          {' = '}
          <span style={{ color: '#ce9178' }}>"up"</span>
          {' | '}
          <span style={{ color: '#ce9178' }}>"down"</span>
          {' | '}
          <span style={{ color: '#ce9178' }}>"left"</span>
          {' | '}
          <span style={{ color: '#ce9178' }}>"right"</span>
          ;
        </div>
        <br />
        <div>
          <span style={{ color: '#569cd6' }}>const</span>
          {' dir: Direction = "'}
          <span style={{ color: '#ce9178' }}>{selectedDir}</span>
          {'";'}
        </div>
        <br />
        <div>
          <span style={{ color: '#569cd6' }}>function</span>
          {' '}
          <span style={{ color: '#dcdcaa' }}>move</span>
          {'(dir: Direction) {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          console.log(`Moving {dir}`);
        </div>
        <div>{'}'}</div>
      </div>

      <Alert
        type="success"
        showIcon
        message={`当前方向: ${selectedDir}`}
        description={`类型安全: 由于 Direction 是字面量联合类型，传入 "diagonal" 等非法值会在编译时报错。`}
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

export default LiveDemo;
