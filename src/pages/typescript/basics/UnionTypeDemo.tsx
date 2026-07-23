import React, { useState } from 'react';
import { Card, Radio, Typography, Tag, Alert, Space, Divider } from 'antd';

type DemoMode = 'common-props' | 'narrowing-flow';

const UnionTypeDemo: React.FC = () => {
  const [mode, setMode] = useState<DemoMode>('common-props');

  return (
    <div>
      <Radio.Group
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        optionType="button"
        buttonStyle="solid"
        style={{ marginBottom: 16 }}
      >
        <Radio.Button value="common-props">共有 vs 独占属性</Radio.Button>
        <Radio.Button value="narrowing-flow">收窄后调用独占方法</Radio.Button>
      </Radio.Group>

      {mode === 'common-props' && <CommonPropsDemo />}
      {mode === 'narrowing-flow' && <NarrowingCallDemo />}
    </div>
  );
};

/** 演示联合类型只能访问共有属性，收窄后才可访问独占属性 */
const CommonPropsDemo: React.FC = () => {
  const [accessMode, setAccessMode] = useState<'common' | 'exclusive'>('common');

  return (
    <Card size="small" title="关键规则：只能访问共有属性">
      <div
        style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: 16,
          borderRadius: 6,
          fontFamily: 'Consolas, monospace',
          fontSize: 13,
          lineHeight: 1.8,
        }}
      >
        <div>
          <Tag color="purple" style={{ fontSize: 11 }}>
            interface
          </Tag>
          {' '}
          <span style={{ color: '#4ec9b0' }}>Bird</span>
          {' {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#9cdcfe' }}>name</span>: string;
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#9cdcfe' }}>fly</span>(): void;
        </div>
        <div>{'}'}</div>
        <br />
        <div>
          <Tag color="purple" style={{ fontSize: 11 }}>
            interface
          </Tag>
          {' '}
          <span style={{ color: '#4ec9b0' }}>Fish</span>
          {' {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#9cdcfe' }}>name</span>: string;
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#9cdcfe' }}>swim</span>(): void;
        </div>
        <div>{'}'}</div>
        <br />
        <div style={{ color: '#808080' }}>
          {'// 联合类型：pet 要么是 Bird，要么是 Fish'}
        </div>
        <div>
          <span style={{ color: '#569cd6' }}>function</span>{' '}
          <span style={{ color: '#dcdcaa' }}>act</span>
          {'(pet: Bird | Fish) {'}
        </div>

        {/* 访问模式选择器：共有 vs 独占 */}
        <div style={{ paddingLeft: 16, marginTop: 8 }}>
          <Radio.Group
            value={accessMode}
            onChange={(e) => setAccessMode(e.target.value)}
            size="small"
            optionType="button"
          >
            <Radio.Button value="common">访问共有属性</Radio.Button>
            <Radio.Button value="exclusive">❌ 访问独占方法</Radio.Button>
          </Radio.Group>
        </div>

        <div style={{ paddingLeft: 16, marginTop: 8 }}>
          {accessMode === 'common' ? (
            <>
              <div style={{ color: '#82c91e' }}>
                {'  // ✅ pet.name — 编译通过，name 是 Bird 和 Fish 共有的'}
              </div>
              <div>
                {'  console.log('}
                <span style={{ color: '#9cdcfe' }}>pet</span>.name
                {');'}
              </div>
              <Tag color="success" style={{ fontSize: 11, marginTop: 4 }}>
                编译通过
              </Tag>
            </>
          ) : (
            <>
              <div style={{ color: '#ff6b6b' }}>
                {'  // ❌ pet.swim() — 编译错误！Fish 有 swim()，但 Bird 没有'}
              </div>
              <div>
                {'  '}
                <span style={{ color: '#9cdcfe' }}>pet</span>.
                <span style={{ color: '#dcdcaa' }}>swim</span>();
              </div>
              <div style={{ color: '#ff6b6b', fontSize: 12 }}>
                {'  // ⚠ Error: Property "swim" does not exist on type "Bird | Fish"'}
              </div>
              <Tag color="error" style={{ fontSize: 11, marginTop: 4 }}>
                编译错误
              </Tag>
            </>
          )}
        </div>
        <div>{'}'}</div>
      </div>

      <Alert
        type="info"
        showIcon
        message="核心解释"
        description={
          <div>
            <p>
              当 <code>pet</code> 的类型是 <code>Bird | Fish</code>，TypeScript 只知道它可能是 Bird 也可能是 Fish，因此只允许访问两者都有的属性——即 <code>name</code>。
            </p>
            <p>
              要调用 <code>swim()</code> 或 <code>fly()</code>，必须先通过类型守卫将联合类型收窄到具体的分支。
            </p>
          </div>
        }
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

/** 演示类型收窄后如何安全地调用独占方法 */
const NarrowingCallDemo: React.FC = () => {
  const [step, setStep] = useState<'before' | 'typeof' | 'in'>('before');

  return (
    <Card size="small" title="类型收窄后才能调用独占成员">
      <div
        style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: 16,
          borderRadius: 6,
          fontFamily: 'Consolas, monospace',
          fontSize: 13,
          lineHeight: 1.8,
        }}
      >
        <div>
          <span style={{ color: '#569cd6' }}>function</span>{' '}
          <span style={{ color: '#dcdcaa' }}>act</span>
          {'(pet: Bird | Fish) {'}
        </div>

        {/* 步骤控制 */}
        <div style={{ paddingLeft: 16, paddingTop: 8, paddingBottom: 8 }}>
          <Radio.Group
            value={step}
            onChange={(e) => setStep(e.target.value)}
            size="small"
            optionType="button"
          >
            <Radio.Button value="before">收窄前（❌）</Radio.Button>
            <Radio.Button value="typeof">typeof 收窄</Radio.Button>
            <Radio.Button value="in">in 操作符收窄</Radio.Button>
          </Radio.Group>
        </div>

        <div style={{ paddingLeft: 16 }}>
          {step === 'before' && (
            <>
              <div style={{ color: '#ff6b6b' }}>
                {'  // ❌ 编译错误：类型 Bird | Fish 上不存在 swim()'}
              </div>
              <div>
                {'  '}return pet.
                <span style={{ color: '#dcdcaa' }}>swim</span>();
              </div>
            </>
          )}

          {step === 'typeof' && (
            <>
              <div style={{ color: '#82c91e', marginBottom: 4 }}>
                {'  // ✅ typeof 守卫收窄——但不能区分对象类型'}
              </div>
              <div style={{ color: '#808080' }}>
                {'  // 无法用 typeof 区分 Bird 和 Fish（都是 object）'}
              </div>
              <div>
                {'  '}
                <span style={{ color: '#c586c0' }}>if</span>
                {' ('}
                <span style={{ color: '#569cd6' }}>typeof</span>
                {' (pet as Bird).fly === "function") {'}
              </div>
            </>
          )}

          {step === 'in' && (
            <>
              <div style={{ color: '#82c91e' }}>
                {'  // ✅ 使用 "in" 操作符收窄——最佳方案'}
              </div>
              <div>
                {'  '}
                <span style={{ color: '#c586c0' }}>if</span>
                {' ('}
                <span style={{ color: '#ce9178' }}>"swim"</span>
                {' '}
                <span style={{ color: '#569cd6' }}>in</span>
                {' pet) {'}
              </div>
              <div style={{ paddingLeft: 16, color: '#82c91e' }}>
                {'  // ✅ 收窄为 Fish，可安全调用 swim()'}
              </div>
              <div style={{ paddingLeft: 16 }}>
                {'  '}return pet.
                <span style={{ color: '#dcdcaa' }}>swim</span>();
              </div>
              <div>{'  }'}</div>
              <div>
                {'  '}
                <span style={{ color: '#c586c0' }}>else</span>
                {' {'}
              </div>
              <div style={{ paddingLeft: 16, color: '#82c91e' }}>
                {'  // ✅ 收窄为 Bird，可安全调用 fly()'}
              </div>
              <div style={{ paddingLeft: 16 }}>
                {'  '}return pet.
                <span style={{ color: '#dcdcaa' }}>fly</span>();
              </div>
              <div>{'  }'}</div>
            </>
          )}
        </div>
        <div>{'}'}</div>
      </div>

      <Alert
        type="success"
        showIcon
        message="关键技巧"
        description={
          <div>
            <p>
              原始类型用 <code>typeof</code> 守卫收窄；对象类型用 <code>in</code> 操作符或可辨识联合（discriminated union）收窄。
            </p>
            <p>收窄后 TypeScript 就能精确知道当前分支的具体类型，从而安全调用独占属性和方法。</p>
          </div>
        }
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

export default UnionTypeDemo;
