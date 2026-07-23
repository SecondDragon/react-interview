import React, { useState } from 'react';
import { Card, Radio, Typography, Tag, Alert, Space, Divider } from 'antd';

type DemoMode = 'basic' | 'constraint' | 'keyof' | 'class-demo';

const GenericsDemo: React.FC = () => {
  const [mode, setMode] = useState<DemoMode>('basic');

  return (
    <div>
      <Radio.Group
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        optionType="button"
        buttonStyle="solid"
        style={{ marginBottom: 16, flexWrap: 'wrap' }}
      >
        <Radio.Button value="basic">泛型函数与推断</Radio.Button>
        <Radio.Button value="constraint">泛型约束 extends</Radio.Button>
        <Radio.Button value="keyof">keyof 约束</Radio.Button>
        <Radio.Button value="class-demo">泛型 Class</Radio.Button>
      </Radio.Group>

      {mode === 'basic' && <BasicGenerics />}
      {mode === 'constraint' && <ConstrainedGenerics />}
      {mode === 'keyof' && <KeyofConstraint />}
      {mode === 'class-demo' && <GenericClass />}
    </div>
  );
};

/** 泛型函数与自动推断 */
const BasicGenerics: React.FC = () => {
  return (
    <Card size="small" title="泛型函数：类型参数的自动推断">
      <Typography.Paragraph>
        泛型函数的类型参数在调用时由 TS 根据传入参数自动推断。以下展示 `identity` 和 `first` 两个常见泛型函数：
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
        <div style={{ color: '#808080' }}>{'// 最简单的泛型函数'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>function</span>{' '}
          <span style={{ color: '#dcdcaa' }}>identity</span>
          {'<T>'}
          <span>(arg: T): T {'=>'} arg;</span>
        </div>
        <br />
        <div>
          const num = identity(42);
          <Tag color="blue" style={{ fontSize: 11, marginLeft: 8 }}>
            推断: T = number → num: number
          </Tag>
        </div>
        <div>
          const str = identity("hello");
          <Tag color="green" style={{ fontSize: 11, marginLeft: 8 }}>
            推断: T = string → str: string
          </Tag>
        </div>
        <div>
          const bool = identity(true);
          <Tag color="orange" style={{ fontSize: 11, marginLeft: 8 }}>
            推断: T = boolean → bool: boolean
          </Tag>
        </div>
        <br />
        <div style={{ color: '#808080' }}>{'// 也可以显式指定 T'}</div>
        <div>
          const num2 = identity
          <span style={{ color: '#ce9178' }}>{'<number>'}</span>(99);
          <Tag color="purple" style={{ fontSize: 11, marginLeft: 8 }}>
            显式指定: T = number
          </Tag>
        </div>
        <br />
        <div style={{ color: '#808080' }}>{'// 另一个例子：获取数组第一个元素'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>function</span>{' '}
          <span style={{ color: '#dcdcaa' }}>first</span>
          {'<T>(arr: T[]): T | undefined {'}
        </div>
        <div style={{ paddingLeft: 16 }}>return arr[0];</div>
        <div>{'}'}</div>
        <br />
        <div>
          const item = first([1, 2, 3]);
          <Tag color="blue" style={{ fontSize: 11, marginLeft: 8 }}>
            推断: T = number → item: number | undefined
          </Tag>
        </div>
        <div>
          const name = first(["a", "b"]);
          <Tag color="green" style={{ fontSize: 11, marginLeft: 8 }}>
            推断: T = string → name: string | undefined
          </Tag>
        </div>
      </div>

      <Alert
        type="info"
        showIcon
        message="推断优先，显式兜底"
        description="绝大多数情况下让 TS 自动推断即可。显式指定类型参数只在编译器无法推断（如空数组 `first<number>([])`）或需要强制类型时使用。"
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

/** 泛型约束 extends */
const ConstrainedGenerics: React.FC = () => {
  const [selectDemo, setSelectDemo] = useState<'length' | 'merge'>('length');

  return (
    <Card size="small" title="泛型约束：<T extends 约束类型>">
      <Typography.Paragraph>
        用 <code>extends</code> 关键字约束 T 必须具备某些属性。这样既能保持泛型的灵活性，又能安全访问约束中的方法和属性：
      </Typography.Paragraph>

      <Radio.Group
        value={selectDemo}
        onChange={(e) => setSelectDemo(e.target.value)}
        optionType="button"
        size="small"
        style={{ marginBottom: 12 }}
      >
        <Radio.Button value="length">约束有 length 属性</Radio.Button>
        <Radio.Button value="merge">约束可合并的对象</Radio.Button>
      </Radio.Group>

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
        {selectDemo === 'length' ? (
          <>
            <div style={{ color: '#808080' }}>
              {'// 约束 T 必须有 length: number'}
            </div>
            <div>
              <span style={{ color: '#569cd6' }}>function</span>{' '}
              <span style={{ color: '#dcdcaa' }}>logLength</span>
              {'<T '}
              <span style={{ color: '#569cd6' }}>extends</span>
              {' { length: number }>'}
            </div>
            <div style={{ paddingLeft: 16 }}>
              (arg: T): number {'{'}
            </div>
            <div style={{ paddingLeft: 32 }}>
              return arg.length;
            </div>
            <div style={{ paddingLeft: 16 }}>{'}'}</div>
            <br />
            <div style={{ color: '#82c91e' }}>
              {'// ✅ string 有 length → 合法'}
            </div>
            <div>
              logLength(<span style={{ color: '#ce9178' }}>"hello"</span>);
            </div>
            <div style={{ color: '#82c91e' }}>
              {'// ✅ Array 有 length → 合法'}
            </div>
            <div>
              logLength([1, 2, 3]);
            </div>
            <div style={{ color: '#ff6b6b' }}>
              {'// ❌ number 没有 length → 编译错误!'}
            </div>
            <div>
              {'// logLength(42);'}
            </div>
          </>
        ) : (
          <>
            <div style={{ color: '#808080' }}>
              {'// 约束：T 和 U 都是对象，可以安全合并'}
            </div>
            <div>
              <span style={{ color: '#569cd6' }}>function</span>{' '}
              <span style={{ color: '#dcdcaa' }}>merge</span>
              {'<T '}
              <span style={{ color: '#569cd6' }}>extends</span>
              {' object, U '}
              <span style={{ color: '#569cd6' }}>extends</span>
              {' object>'}
            </div>
            <div style={{ paddingLeft: 16 }}>
              (a: T, b: U): T & U {'{'}
            </div>
            <div style={{ paddingLeft: 32 }}>
              return {'{'} ...a, ...b {'}'};
            </div>
            <div style={{ paddingLeft: 16 }}>{'}'}</div>
            <br />
            <div style={{ color: '#808080' }}>
              {'// 两个参数都被约束为对象，但具体类型可自由组合'}
            </div>
            <div>
              const result = merge(
              {'{'} name: "Tom" {'}'}, {'{'} age: 25 {'}'});
            </div>
            <div style={{ color: '#82c91e' }}>
              {'// result 类型: { name: string } & { age: number }'}
            </div>
            <div style={{ color: '#82c91e' }}>
              {'// result.name ✅; result.age ✅'}
            </div>
          </>
        )}
      </div>

      <Alert
        type="success"
        showIcon
        message="约束 vs 不约束"
        description={'不约束的 `T` 只能做赋值和传递，不能访问任何属性。`T extends { length: number }` 给 T 一个「下限」，让编译器知道 T 一定有 length 属性，从而安全访问。'}
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

/** keyof 约束 */
const KeyofConstraint: React.FC = () => {
  return (
    <Card size="small" title="keyof 约束：K extends keyof T">
      <Typography.Paragraph>
        <code>keyof T</code> 返回 T 所有键的联合类型。<code>K extends keyof T</code> 约束 K 必须是 T 的合法键之一。这是编写类型安全属性访问函数的核心模式：
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
          {'// 类型安全的 getProperty：K 被约束为 T 的键'}
        </div>
        <div>
          <span style={{ color: '#569cd6' }}>function</span>{' '}
          <span style={{ color: '#dcdcaa' }}>getProperty</span>
          {'<T, K '}
          <span style={{ color: '#569cd6' }}>extends</span>
          {' keyof T>'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          (obj: T, key: K): T[K] {'{'}
        </div>
        <div style={{ paddingLeft: 32 }}>return obj[key];</div>
        <div style={{ paddingLeft: 16 }}>{'}'}</div>
        <br />
        <div style={{ color: '#808080' }}>{'// 定义一个人物对象'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>const</span> person = {'{'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          name: <span style={{ color: '#ce9178' }}>"Tom"</span>,
        </div>
        <div style={{ paddingLeft: 16 }}>age: 25,</div>
        <div style={{ paddingLeft: 16 }}>
          email: <span style={{ color: '#ce9178' }}>"t@x.com"</span>,
        </div>
        <div>{'}'};</div>
        <br />
        <div style={{ color: '#82c91e' }}>
          {'// ✅ K = "name", T[K] = string'}
        </div>
        <div>
          const name = getProperty(person,
          <span style={{ color: '#ce9178' }}>"name"</span>);
        </div>
        <div style={{ color: '#82c91e' }}>
          {'// ✅ K = "age", T[K] = number'}
        </div>
        <div>
          const age = getProperty(person,
          <span style={{ color: '#ce9178' }}>"age"</span>);
        </div>
        <div style={{ color: '#ff6b6b' }}>
          {'// ❌ "email" 不存在于 person 中 → 编译错误!'}
        </div>
        <div>
          {'// getProperty(person, "email");'}
        </div>
      </div>

      <Alert
        type="info"
        showIcon
        message="T[K] 索引访问类型"
        description="`T[K]` 是索引访问类型（Lookup Type），当 K 是 keyof T 的子集时，返回 K 对应的值类型。如 person 的 `name` 是 string，`age` 是 number。这保证了返回类型的精确性。"
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

/** 泛型 Class */
const GenericClass: React.FC = () => {
  return (
    <Card size="small" title="泛型 Class：类型参数贯穿整个类">
      <Typography.Paragraph>
        泛型类的类型参数在构造函数中推断，并贯穿到所有方法。这是实现类型安全容器、数据结构的基石：
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
        <div style={{ color: '#808080' }}>{'// 泛型容器类'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>class</span>{' '}
          <span style={{ color: '#4ec9b0' }}>Box</span>
          {'<T> {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#c586c0' }}>private</span> value: T;
        </div>
        <div style={{ paddingLeft: 16, color: '#808080' }}>
          {'// 构造函数参数类型也是 T'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          constructor(initialValue: T) {'{'}
        </div>
        <div style={{ paddingLeft: 32 }}>
          <span style={{ color: '#c586c0' }}>this</span>.value = initialValue;
        </div>
        <div style={{ paddingLeft: 16 }}>{'}'}</div>
        <br />
        <div style={{ paddingLeft: 16, color: '#808080' }}>
          {'// 方法返回值类型也是 T'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          getValue(): T {'{'}
        </div>
        <div style={{ paddingLeft: 32 }}>
          return <span style={{ color: '#c586c0' }}>this</span>.value;
        </div>
        <div style={{ paddingLeft: 16 }}>{'}'}</div>
        <br />
        <div style={{ paddingLeft: 16, color: '#808080' }}>
          {'// 方法参数类型也是 T'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          setValue(newValue: T): void {'{'}
        </div>
        <div style={{ paddingLeft: 32 }}>
          <span style={{ color: '#c586c0' }}>this</span>.value = newValue;
        </div>
        <div style={{ paddingLeft: 16 }}>{'}'}</div>
        <div>{'}'}</div>
        <br />
        <div style={{ color: '#808080' }}>{'// 使用：从构造参数推断 T = number'}</div>
        <div>
          const numBox = new Box(42);
        </div>
        <div>
          const val = numBox.getValue();
          <Tag color="blue" style={{ fontSize: 11, marginLeft: 8 }}>
            val: number
          </Tag>
        </div>
        <div>
          numBox.setValue(100);
          <Tag color="green" style={{ fontSize: 11, marginLeft: 8 }}>
            setValue 只接受 number
          </Tag>
        </div>
        <br />
        <div style={{ color: '#82c91e' }}>
          {'// numBox.setValue("hello");  ❌ 编译错误！类型安全'}
        </div>
      </div>
    </Card>
  );
};

export default GenericsDemo;
