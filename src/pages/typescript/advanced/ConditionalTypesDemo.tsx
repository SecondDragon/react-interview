import React, { useState } from 'react';
import { Card, Radio, Typography, Tag, Alert, Space, Divider } from 'antd';

type DemoMode = 'basic' | 'distributive' | 'infer' | 'never-trap';

const ConditionalTypesDemo: React.FC = () => {
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
        <Radio.Button value="basic">基础语法与流程</Radio.Button>
        <Radio.Button value="distributive">分布式条件类型</Radio.Button>
        <Radio.Button value="infer">infer 类型推导</Radio.Button>
        <Radio.Button value="never-trap">never 分发陷阱</Radio.Button>
      </Radio.Group>

      {mode === 'basic' && <BasicConditional />}
      {mode === 'distributive' && <DistributiveConditional />}
      {mode === 'infer' && <InferDemo />}
      {mode === 'never-trap' && <NeverTrap />}
    </div>
  );
};

/** 基础条件类型 */
const BasicConditional: React.FC = () => {
  const [testType, setTestType] = useState<'string' | 'number' | 'boolean'>('string');

  return (
    <Card size="small" title="条件类型基础：T extends U ? X : Y">
      <Typography.Paragraph>
        条件类型是 TypeScript 类型系统中的"三元表达式"。根据类型是否满足条件，计算出不同的类型结果：
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
        <div>
          <span style={{ color: '#569cd6' }}>type</span>{' '}
          <span style={{ color: '#4ec9b0' }}>IsString</span>
          {' = T '}
          <span style={{ color: '#569cd6' }}>extends</span>
          {' string ? "yes" : "no";'}
        </div>
        <br />
        <div>
          <span style={{ color: '#808080' }}>{'// 选择要测试的类型：'}</span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <Radio.Group
            value={testType}
            onChange={(e) => setTestType(e.target.value)}
            size="small"
            optionType="button"
          >
            <Radio.Button value="string"><span style={{color:'#ce9178'}}>string</span></Radio.Button>
            <Radio.Button value="number"><span style={{color:'#b5cea8'}}>number</span></Radio.Button>
            <Radio.Button value="boolean"><span style={{color:'#569cd6'}}>boolean</span></Radio.Button>
          </Radio.Group>
        </div>

        <div>
          type Result = IsString
          {'<'}
          <span style={{ color: testType === 'string' ? '#ce9178' : testType === 'number' ? '#b5cea8' : '#569cd6' }}>
            {testType}
          </span>
          {'>'}
          {' = '}
          <Tag
            color={testType === 'string' ? 'success' : 'error'}
            style={{ fontSize: 11 }}
          >
            {testType === 'string' ? '"yes"' : '"no"'}
          </Tag>
        </div>
        <div style={{ color: '#808080', marginTop: 8 }}>
          {'// 因为 '}
          {testType}
          {' extends string 的求值结果为 '}
          {testType === 'string' ? 'true' : 'false'}
        </div>
      </div>

      <Alert
        type="info"
        showIcon
        message="条件类型的语法结构"
        description={
          <div>
            <code>T extends U ? X : Y</code> 可以嵌套：<br />
            <code>T extends string ? "是字符串" : T extends number ? "是数字" : "其他"</code>
            <br />条件类型在编译时计算，不产生运行时代码。
          </div>
        }
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

/** 分布式条件类型 */
const DistributiveConditional: React.FC = () => {
  return (
    <Card size="small" title="分布式条件类型（Distributive Conditional Types）">
      <Typography.Paragraph>
        当条件类型作用于<strong>裸类型参数</strong>（即直接用 T，没有被 <code>[]</code> 包裹）且 T 是联合类型时，TS 会将联合的每个成员分别求值再合并。这是条件类型最难也最重要的机制：
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
          {'// 裸类型参数 — 会触发分发'}
        </div>
        <div>
          <span style={{ color: '#569cd6' }}>type</span>{' '}
          <span style={{ color: '#4ec9b0' }}>ToArray</span>
          {'<T> = T '}
          <span style={{ color: '#569cd6' }}>extends</span>
          {' any ? T[] : never;'}
        </div>
        <br />
        <div>
          type StrArr = ToArray
          {'<'}
          <span style={{ color: '#ce9178' }}>string</span>
          {'>'}
        </div>
        <div style={{ paddingLeft: 16, color: '#82c91e' }}>
          {'// → string extends any ? string[] : never → string[]'}
        </div>
        <br />
        <div>
          type Multi = ToArray
          {'<'}
          <span style={{ color: '#ce9178' }}>string</span> |{' '}
          <span style={{ color: '#b5cea8' }}>number</span>
          {'>'}
        </div>
        <div style={{ paddingLeft: 16, color: '#82c91e' }}>
          {'// → 分布计算: ToArray<string> | ToArray<number>'}
        </div>
        <div style={{ paddingLeft: 16, color: '#82c91e' }}>
          {'// → string[] | number[]'}
        </div>
        <br />

        <Divider style={{ borderColor: '#333' }} />

        <div style={{ color: '#808080' }}>
          {'// 条件类型的"过滤"效果：Exclude<T, U> 的原理'}
        </div>
        <div>
          <span style={{ color: '#569cd6' }}>type</span>{' '}
          <span style={{ color: '#4ec9b0' }}>MyExclude</span>
          {'<T, U> = T '}
          <span style={{ color: '#569cd6' }}>extends</span>
          {' U ? '}
          <span style={{ color: '#eb2f96' }}>never</span>
          {' : T;'}
        </div>
        <br />
        <div>
          type Test = MyExclude
          {'<'}
          <span style={{ color: '#ce9178' }}>"a"</span> |{' '}
          <span style={{ color: '#ce9178' }}>"b"</span> |{' '}
          <span style={{ color: '#ce9178' }}>"c"</span>
          {', '}
          <span style={{ color: '#ce9178' }}>"a"</span>
          {'>'}
        </div>
        <div style={{ paddingLeft: 16, color: '#82c91e' }}>
          {'// 分布: ("a" extends "a" ? never : "a") | ("b" extends "a" ? never : "b") | ("c" extends "a" ? never : "c")'}
        </div>
        <div style={{ paddingLeft: 16, color: '#82c91e' }}>
          {'// → never | "b" | "c" → "b" | "c"  ✅ 过滤掉了 "a"'}
        </div>
      </div>

      <Alert
        type="warning"
        showIcon
        message="关键规则：裸参数才分发"
        description={
          <div>
            <code>T extends U ? X : Y</code> 只有当 T 是"裸类型参数"时才会触发分发。<br />
            <code>[T] extends [U] ? X : Y</code> 用元组包裹后不会分发，将 T 视为一个整体。
          </div>
        }
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

/** infer 类型推导 */
const InferDemo: React.FC = () => {
  return (
    <Card size="small" title="infer：在条件类型中声明待推断类型">
      <Typography.Paragraph>
        <code>infer</code> 关键字在条件类型的 true 分支中声明一个"待推断"的类型变量。TS 编译器会根据传入的具体类型自动推导它的值。这是 <code>ReturnType</code>、<code>Parameters</code> 等工具类型的底层机制：
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
        <div style={{ color: '#808080' }}>{'// infer 基础：提取数组元素类型'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>type</span>{' '}
          <span style={{ color: '#4ec9b0' }}>ElementType</span>
          {'<T> = T '}
          <span style={{ color: '#569cd6' }}>extends</span>
          {' (infer R)[] ? R : '}
          <span style={{ color: '#eb2f96' }}>never</span>
          ;
        </div>
        <br />
        <div style={{ color: '#808080' }}>{'// 逐步推导过程：'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>type</span> A = ElementType
          {'<'}
          <span style={{ color: '#b5cea8' }}>number</span>[]
          {'>'};
        </div>
        <div style={{ paddingLeft: 16, color: '#82c91e' }}>
          {'// number[] extends (infer R)[] → R 被推断为 number → A = number'}
        </div>
        <br />
        <div>
          <span style={{ color: '#569cd6' }}>type</span> B = ElementType
          {'<'}
          <span style={{ color: '#ce9178' }}>string</span>[]
          {'>'};
        </div>
        <div style={{ paddingLeft: 16, color: '#82c91e' }}>
          {'// string[] extends (infer R)[] → R 被推断为 string → B = string'}
        </div>
        <br />

        <Divider style={{ borderColor: '#333' }} />

        <div style={{ color: '#808080' }}>{'// 手写 ReturnType：提取函数返回值类型'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>type</span>{' '}
          <span style={{ color: '#4ec9b0' }}>MyReturnType</span>
          {'<T> = T '}
          <span style={{ color: '#569cd6' }}>extends</span>
        </div>
        <div style={{ paddingLeft: 16 }}>
          (...args: any[]) ={'>'} infer R ? R :{' '}
          <span style={{ color: '#eb2f96' }}>never</span>;
        </div>
        <br />
        <div>
          <span style={{ color: '#569cd6' }}>type</span>{' '}
          <span style={{ color: '#4ec9b0' }}>MyParams</span>
          {'<T> = T '}
          <span style={{ color: '#569cd6' }}>extends</span>
        </div>
        <div style={{ paddingLeft: 16 }}>
          (...args: infer P) ={'>'} any ? P :{' '}
          <span style={{ color: '#eb2f96' }}>never</span>;
        </div>
        <br />
        <div>
          const fn = (x: string, y: number) ={'>'} x + y;
        </div>
        <div>
          <span style={{ color: '#569cd6' }}>type</span> Ret = MyReturnType
          {'<typeof fn>'};
          <Tag color="blue" style={{ fontSize: 11, marginLeft: 8 }}>
            Ret = string
          </Tag>
        </div>
        <div>
          <span style={{ color: '#569cd6' }}>type</span> Params = MyParams
          {'<typeof fn>'};
          <Tag color="green" style={{ fontSize: 11, marginLeft: 8 }}>
            Params = [string, number]
          </Tag>
        </div>
      </div>

      <Alert
        type="success"
        showIcon
        message="infer 核心规则"
        description="infer 只能在条件类型的 extends 子句的 true 分支中使用，且只能声明新的类型变量（不能引用外部变量）。一个条件类型中可以出现多个 infer，如 `T extends { a: infer A, b: infer B } ? [A, B] : never`。"
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

/** never 分发陷阱 */
const NeverTrap: React.FC = () => {
  return (
    <Card size="small" title="never 分发陷阱：空联合的特殊行为">
      <Typography.Paragraph>
        never 是"空联合类型"。当条件类型作用于裸类型参数且被传入 never 时，因为 never 没有任何成员，分发后结果就是 never。这是 TS 类型编程中一个著名的陷阱：
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
        <div style={{ color: '#ff6b6b' }}>
          {'// ❌ 错误的 IsNever：无法判断 never'}
        </div>
        <div>
          <span style={{ color: '#569cd6' }}>type</span>{' '}
          <span style={{ color: '#4ec9b0' }}>IsNeverWrong</span>
          {'<T> = T '}
          <span style={{ color: '#569cd6' }}>extends</span>
          {' never ? true : false;'}
        </div>
        <br />
        <div>
          type Test1 = IsNeverWrong
          {'<'}
          <span style={{ color: '#ce9178' }}>string</span>
          {'>'}
        </div>
        <div style={{ paddingLeft: 16, color: '#82c91e' }}>
          {'// string extends never? false → false ✅'}
        </div>
        <br />
        <div>
          type Test2 = IsNeverWrong
          {'<'}
          <span style={{ color: '#eb2f96' }}>never</span>
          {'>'}
        </div>
        <div style={{ paddingLeft: 16, color: '#ff6b6b' }}>
          {'// never 是空联合 → 分发到空集 → 结果 never ❌'}
        </div>
        <div style={{ paddingLeft: 16, color: '#ff6b6b' }}>
          {'// 期望得到 true，实际得到了 never！'}
        </div>
        <br />

        <Divider style={{ borderColor: '#333' }} />

        <div style={{ color: '#82c91e' }}>
          {'// ✅ 正确的 IsNever：用元组包裹避免分发'}
        </div>
        <div>
          <span style={{ color: '#569cd6' }}>type</span>{' '}
          <span style={{ color: '#4ec9b0' }}>IsNever</span>
          {'<T> = ['}
          <span style={{ color: '#9cdcfe' }}>T</span>{'] '}
          <span style={{ color: '#569cd6' }}>extends</span>
          {' [never] ? true : false;'}
        </div>
        <br />
        <div>
          type Test3 = IsNever
          {'<'}
          <span style={{ color: '#ce9178' }}>string</span>
          {'>'}
        </div>
        <div style={{ paddingLeft: 16, color: '#82c91e' }}>
          {'// [string] extends [never]? false → false ✅'}
        </div>
        <br />
        <div>
          type Test4 = IsNever
          {'<'}
          <span style={{ color: '#eb2f96' }}>never</span>
          {'>'}
        </div>
        <div style={{ paddingLeft: 16, color: '#82c91e' }}>
          {'// [never] extends [never]? true → true ✅'}
        </div>
        <br />

        <Divider style={{ borderColor: '#333' }} />

        <div style={{ color: '#569cd6' }}>
          {'// 🔑 核心原理'}
        </div>
        <div style={{ color: '#808088' }}>
          {'// 裸 T：T 是联合类型时，每个成员分别计算（分发）'}
        </div>
        <div style={{ color: '#808088' }}>
          {'// [T]：T 被整体看待，不再分发'}
        </div>
        <div style={{ color: '#808088' }}>
          {'// never 是空联合，分发到空集 = never'}
        </div>
        <div style={{ color: '#808088' }}>
          {'// 因此判断 never 必须用 [T] extends [never]'}
        </div>
      </div>

      <Alert
        type="warning"
        showIcon
        message="面试高频陷阱"
        description="这条规则是 TS 类型体操面试中最常被考察的细节。记住：`type IsNever<T> = [T] extends [never] ? true : false` 才是正确的写法。用元组包裹（或任何非裸参数的包装方式）可以抑制分发行为。"
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

export default ConditionalTypesDemo;
