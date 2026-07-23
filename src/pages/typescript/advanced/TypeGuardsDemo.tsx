import React, { useState } from 'react';
import { Card, Radio, Typography, Tag, Alert, Space, Divider } from 'antd';

type DemoMode = 'predicate' | 'discriminated' | 'asserts' | 'in-operator';

const TypeGuardsDemo: React.FC = () => {
  const [mode, setMode] = useState<DemoMode>('predicate');

  return (
    <div>
      <Radio.Group
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        optionType="button"
        buttonStyle="solid"
        style={{ marginBottom: 16, flexWrap: 'wrap' }}
      >
        <Radio.Button value="predicate">类型谓词 x is T</Radio.Button>
        <Radio.Button value="discriminated">可辨识联合</Radio.Button>
        <Radio.Button value="asserts">断言守卫 asserts</Radio.Button>
        <Radio.Button value="in-operator">in 操作符收窄</Radio.Button>
      </Radio.Group>

      {mode === 'predicate' && <PredicateGuard />}
      {mode === 'discriminated' && <DiscriminatedUnion />}
      {mode === 'asserts' && <AssertsGuard />}
      {mode === 'in-operator' && <InOperatorGuard />}
    </div>
  );
};

/** 类型谓词 x is T */
const PredicateGuard: React.FC = () => {
  return (
    <Card size="small" title="自定义类型谓词：x is T">
      <Typography.Paragraph>
        通过返回类型 <code>x is Type</code>，告诉 TypeScript：如果函数返回 true，则参数 x 的类型被收窄为 Type。这是<strong>运行时检查 → 编译时收窄</strong>的桥梁：
      </Typography.Paragraph>

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
        <div style={{ color: '#808080' }}>
          {'// 定义多个类型谓词'}
        </div>
        <div>
          <span style={{ color: '#569cd6' }}>function</span>{' '}
          <span style={{ color: '#dcdcaa' }}>isString</span>
          {'(x: unknown): x is string {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          return typeof x === "string";
        </div>
        <div>{'}'}</div>
        <br />

        <div>
          <span style={{ color: '#569cd6' }}>function</span>{' '}
          <span style={{ color: '#dcdcaa' }}>isNumber</span>
          {'(x: unknown): x is number {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          return typeof x === "number";
        </div>
        <div>{'}'}</div>
        <br />

        <div style={{ color: '#808080' }}>{'// 联合类型数组，每个元素可能是不同类型'}</div>
        <div>
          const mixed: (string | number)[] = [1, "hello", 42, "world"];
        </div>
        <br />

        <div style={{ color: '#808080' }}>{'// 使用自定义类型守卫过滤——filter 也能收窄类型'}</div>
        <div>
          const strings = mixed.filter(isString);
        </div>
        <div style={{ paddingLeft: 16, color: '#82c91e' }}>
          {'// strings 的类型是 string[]，不是 (string | number)[]'}
        </div>
        <div>
          const numbers = mixed.filter(isNumber);
        </div>
        <div style={{ paddingLeft: 16, color: '#82c91e' }}>
          {'// numbers 的类型是 number[]'}
        </div>
        <br />

        <div style={{ color: '#569cd6' }}>
          {'// 🔑 没有类型谓词：filter 返回的仍是 (string | number)[]'}
        </div>
        <div style={{ color: '#808080' }}>
          {'// .filter(x => typeof x === "string") 不会收窄类型'}
        </div>
        <div style={{ color: '#808080' }}>
          {'// 因为箭头函数返回的是 boolean，不是 "x is string"'}
        </div>
      </div>

      <Alert
        type="success"
        showIcon
        message="类型谓词的核心机制"
        description={
          <div>
            <p><strong>编译时效果</strong>：函数返回类型写了 <code>x is Type</code> → TS 在 true 分支内将 x 收窄为 Type。</p>
            <p><strong>运行时效果</strong>：函数体仍按正常 JS 逻辑执行。谓词不改变运行时的行为，只影响编译时的类型推断。</p>
            <p><strong>应用场景</strong>：<code>Array.filter</code> 的类型收窄、复杂的运行时类型校验。</p>
          </div>
        }
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

/** 可辨识联合 */
const DiscriminatedUnion: React.FC = () => {
  const [shape, setShape] = useState<'circle' | 'square' | 'triangle'>('circle');

  return (
    <Card size="small" title="可辨识联合（Discriminated Union）">
      <Typography.Paragraph>
        可辨识联合是 TypeScript 中最优雅的模式之一：联合类型的每个成员都有一个<strong>字面量类型的共有属性</strong>（辨识标签），在 switch/case 中编译器通过标签值自动收窄类型：
      </Typography.Paragraph>

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
        <div style={{ color: '#808080' }}>{'// 可辨识联合：每个成员都有 kind 标签'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>type</span>{' '}
          <span style={{ color: '#4ec9b0' }}>Shape</span>
          {' = '}
        </div>
        <div style={{ paddingLeft: 16 }}>
          {'| { kind: "circle"; radius: number }'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          {'| { kind: "square"; side: number }'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          {'| { kind: "triangle"; base: number; height: number }'}
        </div>
        <br />

        <div style={{ color: '#808080' }}>{'// 面积计算函数：switch 自动收窄'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>function</span>{' '}
          <span style={{ color: '#dcdcaa' }}>getArea</span>
          {'(s: Shape): number {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#c586c0' }}>switch</span>
          {' (s.kind) {'}
        </div>

        {shape === 'circle' && (
          <>
            <div style={{ paddingLeft: 32, color: '#82c91e' }}>
              {'    // ✅ 这里 s 被收窄为 { kind: "circle"; radius: number }'}
            </div>
          </>
        )}
        {shape === 'square' && (
          <>
            <div style={{ paddingLeft: 32, color: '#82c91e' }}>
              {'    // ✅ 这里 s 被收窄为 { kind: "square"; side: number }'}
            </div>
          </>
        )}
        {shape === 'triangle' && (
          <>
            <div style={{ paddingLeft: 32, color: '#82c91e' }}>
              {'    // ✅ 这里 s 被收窄为 { kind: "triangle"; base: number; height: number }'}
            </div>
          </>
        )}

        <div style={{ paddingLeft: 32, color: '#808080' }}>{'case "circle":'}</div>
        {shape === 'circle' ? (
          <div style={{ paddingLeft: 32 }}>
            return Math.PI * s.radius{' '}
            <span style={{ color: '#569cd6' }}>**</span> 2;{' '}
            <Tag color="blue" style={{ fontSize: 11 }}>s.radius: number ✅</Tag>
          </div>
        ) : (
          <div style={{ paddingLeft: 32, color: '#808080' }}>
            {'// s.radius: number（当 switch 进入此分支时）'}
          </div>
        )}
        <div style={{ paddingLeft: 32, color: '#808080' }}>{'case "square":'}</div>
        {shape === 'square' ? (
          <div style={{ paddingLeft: 32 }}>
            return s.side * s.side;{' '}
            <Tag color="green" style={{ fontSize: 11 }}>s.side: number ✅</Tag>
          </div>
        ) : (
          <div style={{ paddingLeft: 32, color: '#808080' }}>
            {'// s.side: number'}
          </div>
        )}
        <div style={{ paddingLeft: 32, color: '#808080' }}>{'case "triangle":'}</div>
        {shape === 'triangle' ? (
          <div style={{ paddingLeft: 32 }}>
            return 0.5 * s.base * s.height;{' '}
            <Tag color="orange" style={{ fontSize: 11 }}>s.base & s.height: number ✅</Tag>
          </div>
        ) : (
          <div style={{ paddingLeft: 32, color: '#808080' }}>
            {'// s.base: number, s.height: number'}
          </div>
        )}
        <div style={{ paddingLeft: 16 }}>{'}'}</div>
        <div>{'}'}</div>

        <div style={{ marginTop: 8 }}>
          <Radio.Group
            value={shape}
            onChange={(e) => setShape(e.target.value)}
            size="small"
            optionType="button"
          >
            <Radio.Button value="circle">选中 circle</Radio.Button>
            <Radio.Button value="square">选中 square</Radio.Button>
            <Radio.Button value="triangle">选中 triangle</Radio.Button>
          </Radio.Group>
        </div>
      </div>

      <Alert
        type="info"
        showIcon
        message="可辨识联合的三个要素"
        description={'(1) 共有字面量属性作为标签（如 kind）；(2) 每个分支的标签值不同（如「circle」|「square」）；(3) 使用 switch 或 if 按标签值分支配。TypeScript 自动收窄，提供精确的类型安全。'}
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

/** 断言守卫 asserts */
const AssertsGuard: React.FC = () => {
  return (
    <Card size="small" title="断言守卫：asserts x is T">
      <Typography.Paragraph>
        断言守卫不返回 boolean，而是"如果通过就继续，不通过就抛异常"。通过后，后续代码中的变量类型被收窄。非常适合参数校验场景：
      </Typography.Paragraph>

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
        <div style={{ color: '#808080' }}>{'// 断言守卫：确认 x 是 string，否则抛异常'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>function</span>{' '}
          <span style={{ color: '#dcdcaa' }}>assertString</span>
          {'(x: unknown): '}
          <span style={{ color: '#569cd6' }}>asserts</span>
          {' x is string {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#c586c0' }}>if</span>
          {' (typeof x !== "string") {'}
        </div>
        <div style={{ paddingLeft: 32 }}>
          <span style={{ color: '#c586c0' }}>throw</span>
          {' new TypeError("Expected a string");'}
        </div>
        <div style={{ paddingLeft: 16 }}>{'}'}</div>
        <div>{'}'}</div>
        <br />

        <div style={{ color: '#808080' }}>{'// 断言守卫 + 类型谓词组合'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>function</span>{' '}
          <span style={{ color: '#dcdcaa' }}>assertNumber</span>
          {'(x: unknown): '}
          <span style={{ color: '#569cd6' }}>asserts</span>
          {' x is number {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#c586c0' }}>if</span>
          {' (typeof x !== "number") {'}
        </div>
        <div style={{ paddingLeft: 32 }}>
          <span style={{ color: '#c586c0' }}>throw</span>
          {' new TypeError("Expected a number");'}
        </div>
        <div style={{ paddingLeft: 16 }}>{'}'}</div>
        <div>{'}'}</div>
        <br />

        <div style={{ color: '#808080' }}>{'// 使用场景：校验函数入参'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>function</span>{' '}
          <span style={{ color: '#dcdcaa' }}>processUserInput</span>
          {'(input: unknown) {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          assertString(input);{' '}
          <span style={{ color: '#808080' }}>{'// 通过后，input 收窄为 string'}</span>
        </div>
        <div style={{ paddingLeft: 16, color: '#82c91e' }}>
          {'// ✅ 后续代码可以直接调用 string 方法'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          console.log(input.toUpperCase());
        </div>
        <div style={{ paddingLeft: 16 }}>
          console.log(input.length);
        </div>
        <div>{'}'}</div>
        <br />

        <div style={{ color: '#569cd6' }}>
          {'// 🔑 asserts vs is 的区别：'}
        </div>
        <div style={{ color: '#808080' }}>
          {'// asserts x is T：不返回值，通不过就抛异常'}
        </div>
        <div style={{ color: '#808080' }}>
          {'// x is T（类型谓词）：返回 boolean，用在 if 分支中'}
        </div>
        <div style={{ color: '#808080' }}>
          {'// 两者都收窄类型，但运行时行为不同'}
        </div>
      </div>

      <Alert
        type="warning"
        showIcon
        message="断言守卫 vs 类型谓词：选择策略"
        description={
          <div>
            <p><strong>类型谓词 </strong><code>x is T</code>：用在 if 条件中，适合"检查后分支处理"。</p>
            <p><strong>断言守卫 </strong><code>asserts x is T</code>：用在函数开始处，适合"确认参数合法，否则快速失败"的校验场景。</p>
            <p>两者核心区别：谓词返回 boolean，守卫不返回（抛异常）。</p>
          </div>
        }
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

/** in 操作符收窄 */
const InOperatorGuard: React.FC = () => {
  const [demoItem, setDemoItem] = useState<'bird' | 'fish'>('bird');

  return (
    <Card size="small" title="in 操作符：通过属性存在性收窄对象类型">
      <Typography.Paragraph>
        <code>in</code> 操作符可以检查对象上是否存在某个属性。TypeScript 利用它在条件分支中将联合类型收窄到包含该属性的具体分支。这是区分对象类型<strong>首选</strong>的方式（typeof 对对象无效）：
      </Typography.Paragraph>

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
        <div style={{ color: '#808080' }}>{'// 联合类型：Bird | Fish'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>interface</span>{' '}
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
        <div>
          <span style={{ color: '#569cd6' }}>interface</span>{' '}
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

        <div>
          <span style={{ color: '#569cd6' }}>function</span>{' '}
          <span style={{ color: '#dcdcaa' }}>act</span>
          {'(pet: Bird | Fish) {'}
        </div>

        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#c586c0' }}>if</span>
          {' ('}
          <span style={{ color: '#ce9178' }}>"swim"</span>
          {' '}
          <span style={{ color: '#569cd6' }}>in</span>
          {' pet) {'}
        </div>
        <div style={{ paddingLeft: 32, color: '#82c91e' }}>
          {'  // pet 被收窄为 Fish'}
        </div>
        {demoItem === 'fish' ? (
          <div style={{ paddingLeft: 32 }}>
            pet.swim();{' '}
            <Tag color="success" style={{ fontSize: 11 }}>swim 方法 ✅</Tag>
          </div>
        ) : (
          <div style={{ paddingLeft: 32, color: '#808080' }}>
            pet.swim();{' // 进入此分支时可调用'}
          </div>
        )}
        <div style={{ paddingLeft: 16 }}>{'}'}</div>

        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#c586c0' }}>else</span>
          {' {'}
        </div>
        <div style={{ paddingLeft: 32, color: '#82c91e' }}>
          {'  // pet 被收窄为 Bird（因为 Fish 有 swim ）'}
        </div>
        {demoItem === 'bird' ? (
          <div style={{ paddingLeft: 32 }}>
            pet.fly();{' '}
            <Tag color="success" style={{ fontSize: 11 }}>fly 方法 ✅</Tag>
          </div>
        ) : (
          <div style={{ paddingLeft: 32, color: '#808080' }}>
            pet.fly();{' // 进入此分支时可调用'}
          </div>
        )}
        <div style={{ paddingLeft: 16 }}>{'}'}</div>
        <div>{'}'}</div>

        <div style={{ marginTop: 8 }}>
          <Radio.Group
            value={demoItem}
            onChange={(e) => setDemoItem(e.target.value)}
            size="small"
            optionType="button"
          >
            <Radio.Button value="bird">鸟（有 fly）</Radio.Button>
            <Radio.Button value="fish">鱼（有 swim）</Radio.Button>
          </Radio.Group>
        </div>
      </div>

      <Alert
        type="success"
        showIcon
        message="in 操作符的优点"
        description={
          <div>
            <p><strong>区分对象类型的最佳方式</strong>：typeof 对对象类型返回 "object"，无法区分 Bird 和 Fish。in 通过"是否存在特定独有属性"来区分。</p>
            <p><strong>与可辨识联合互补</strong>：可辨识联合需要设计时提前约定共有标签（如 kind），in 操作符不需要——它根据属性的存在与否自动推断。</p>
          </div>
        }
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

export default TypeGuardsDemo;
