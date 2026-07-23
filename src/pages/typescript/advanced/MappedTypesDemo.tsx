import React, { useState } from 'react';
import { Card, Radio, Typography, Tag, Alert, Space, Divider } from 'antd';

type DemoMode = 'basic' | 'modifier' | 'remap' | 'filter';

const MappedTypesDemo: React.FC = () => {
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
        <Radio.Button value="basic">基础映射 + keyof</Radio.Button>
        <Radio.Button value="modifier">修饰符 + -/+</Radio.Button>
        <Radio.Button value="remap">as 重映射</Radio.Button>
        <Radio.Button value="filter">条件过滤模式</Radio.Button>
      </Radio.Group>

      {mode === 'basic' && <BasicMapped />}
      {mode === 'modifier' && <ModifierMapped />}
      {mode === 'remap' && <RemapMapped />}
      {mode === 'filter' && <FilterMapped />}
    </div>
  );
};

/** 基础映射 + keyof */
const BasicMapped: React.FC = () => {
  return (
    <Card size="small" title="基础映射类型：遍历 keyof T 的每个键">
      <Typography.Paragraph>
        映射类型通过 <code>[P in keyof T]</code> 遍历类型 T 的所有键，对每个属性应用变换。这是 Partial、Readonly、Pick 等内置工具类型的底层实现：
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
        <div style={{ color: '#808080' }}>{'// 原始类型'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>interface</span>{' '}
          <span style={{ color: '#4ec9b0' }}>Person</span>
          {' {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#9cdcfe' }}>name</span>: string;
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#9cdcfe' }}>age</span>: number;
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#9cdcfe' }}>email</span>: string;
        </div>
        <div>{'}'}</div>
        <br />

        <div style={{ color: '#808080' }}>{'// 手写 MyPartial：所有属性变为可选'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>type</span>{' '}
          <span style={{ color: '#4ec9b0' }}>MyPartial</span>
          {'<T> = {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#ce9178' }}>{'{'}</span>
          <span style={{ color: '#569cd6' }}>P</span> in{' '}
          <span style={{ color: '#569cd6' }}>keyof</span> T]<span style={{ color: '#ce9178' }}>{'{'}</span>:
          T[P]?;
        </div>
        <div>{'};'}</div>
        <br />

        <div style={{ color: '#808080' }}>{'// 手写 MyReadonly：所有属性变为只读'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>type</span>{' '}
          <span style={{ color: '#4ec9b0' }}>MyReadonly</span>
          {'<T> = {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#c586c0' }}>readonly</span>
          {' ['}<span style={{ color: '#569cd6' }}>P</span> in{' '}
          <span style={{ color: '#569cd6' }}>keyof</span> T]: T[P];
        </div>
        <div>{'};'}</div>
        <br />

        <div style={{ color: '#808080' }}>{'// 手写 MyPick：只选择某些键'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>type</span>{' '}
          <span style={{ color: '#4ec9b0' }}>MyPick</span>
          {'<T, K '}
          <span style={{ color: '#569cd6' }}>extends</span>
          {' keyof T> = {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          [<span style={{ color: '#ce9178' }}>{'{'}</span>
          <span style={{ color: '#569cd6' }}>P</span> in K]: T[P];
        </div>
        <div>{'};'}</div>
        <br />

        <div style={{ color: '#82c91e' }}>
          {'// 使用: PartialPerson = { name?: string; age?: number; email?: string }'}
        </div>
        <div>
          type PartialPerson = MyPartial
          {'<Person>'};
        </div>
        <div style={{ color: '#82c91e' }}>
          {'// 使用: PickPerson = { name: string; email: string }'}
        </div>
        <div>
          type PickPerson = MyPick
          {'<Person, "name" | "email">'};
        </div>
      </div>

      <Alert
        type="info"
        showIcon
        message={'映射类型实际就是类型的「map」操作'}
        description="JavaScript 的 Array.map 遍历数组元素生成新数组；TS 的 [P in keyof T] 遍历类型的键生成新类型。理解了这个类比，映射类型就变得直观了。"
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

/** 修饰符 + -/+ */
const ModifierMapped: React.FC = () => {
  return (
    <Card size="small" title="修饰符操作：+ / - 控制 readonly 和 ?">
      <Typography.Paragraph>
        映射类型支持对 <code>readonly</code> 和 <code>?</code>（可选）使用 <code>+</code> 添加或 <code>-</code> 移除修饰符。默认 <code>readonly</code> 和 <code>?</code> 不带符号就是添加，<code>-readonly</code> 和 <code>-?</code> 表示移除：
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
        <div style={{ color: '#808080' }}>{'// 原始类型：混合 readonly 和可选'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>interface</span>{' '}
          <span style={{ color: '#4ec9b0' }}>Config</span>
          {' {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#c586c0' }}>readonly</span>{' '}
          <span style={{ color: '#9cdcfe' }}>id</span>: string;
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#9cdcfe' }}>label</span>?: string;
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#c586c0' }}>readonly</span>{' '}
          <span style={{ color: '#9cdcfe' }}>version</span>?: number;
        </div>
        <div>{'}'}</div>
        <br />

        <div style={{ color: '#808080' }}>{'// Required<T>：移除所有 ?（-?）'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>type</span>{' '}
          <span style={{ color: '#4ec9b0' }}>MyRequired</span>
          {'<T> = {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          [<span style={{ color: '#ce9178' }}>{'{'}</span>
          <span style={{ color: '#569cd6' }}>P</span> in{' '}
          <span style={{ color: '#569cd6' }}>keyof</span> T]-?: T[P];
        </div>
        <div>{'};'}</div>
        <br />

        <div style={{ color: '#808080' }}>{'// Mutable<T>：移除所有 readonly（-readonly）'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>type</span>{' '}
          <span style={{ color: '#4ec9b0' }}>Mutable</span>
          {'<T> = {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          -<span style={{ color: '#c586c0' }}>readonly</span>
          {' ['}<span style={{ color: '#569cd6' }}>P</span> in{' '}
          <span style={{ color: '#569cd6' }}>keyof</span> T]: T[P];
        </div>
        <div>{'};'}</div>
        <br />

        <div style={{ color: '#82c91e' }}>
          {'// MyRequired<Config> → { id: string; label: string; version: number }'}
        </div>
        <div style={{ color: '#82c91e' }}>
          {'// Mutable<Config>  → { id: string; label?: string; version?: number }'}
        </div>
        <div style={{ color: '#82c91e' }}>
          {'// 组合: MyRequired<Mutable<Config>> → 全部必填且可写'}
        </div>
      </div>

      <Alert
        type="success"
        showIcon
        message="+ / - 修饰符规则"
        description={
          <span>
            不加符号 = <code>+</code>（添加），<code>-readonly</code> = 移除 readonly，<code>-?</code> = 移除可选（变成必填）。组合使用如 <code>-readonly [P in keyof T]-?: T[P]</code> 同时移除 readonly 和可选。
          </span>
        }
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

/** as 重映射 */
const RemapMapped: React.FC = () => {
  return (
    <Card size="small" title="as 重映射：改造键名（TS 4.1+）">
      <Typography.Paragraph>
        TypeScript 4.1 引入的 <code>as</code> 重映射允许在映射类型中<strong>变换键名</strong>。结合模板字面量类型，可以生成全新的键：
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
        <div style={{ color: '#808080' }}>{'// 原始接口'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>interface</span>{' '}
          <span style={{ color: '#4ec9b0' }}>Person</span>
          {' {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#9cdcfe' }}>name</span>: string;
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#9cdcfe' }}>age</span>: number;
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#9cdcfe' }}>email</span>: string;
        </div>
        <div>{'}'}</div>
        <br />

        <div style={{ color: '#808080' }}>{'// 生成 Getters（name → getName, age → getAge）'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>type</span>{' '}
          <span style={{ color: '#4ec9b0' }}>Getters</span>
          {'<T> = {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          [<span style={{ color: '#ce9178' }}>{'{'}</span>
          <span style={{ color: '#569cd6' }}>K</span> in{' '}
          <span style={{ color: '#569cd6' }}>keyof</span> T{' '}
          <span style={{ color: '#c586c0' }}>as</span>{' '}
          <span style={{ color: '#ce9178' }}>`</span>get
          <span style={{ color: '#4ec9b0' }}>{'${Capitalize<string & K>}'}</span>
          <span style={{ color: '#ce9178' }}>`</span>]: () =&gt; T[K];
        </div>
        <div>{'};'}</div>
        <br />

        <div>
          type PersonGetters = Getters
          {'<Person>'};
        </div>
        <div style={{ paddingLeft: 16, color: '#82c91e' }}>
          {'// 结果：'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          {'{'}
        </div>
        <div style={{ paddingLeft: 32 }}>
          getName: () =&gt; string;
        </div>
        <div style={{ paddingLeft: 32 }}>
          getAge: () =&gt; number;
        </div>
        <div style={{ paddingLeft: 32 }}>
          getEmail: () =&gt; string;
        </div>
        <div style={{ paddingLeft: 16 }}>
          {'}'}
        </div>
        <br />

        <Divider style={{ borderColor: '#333' }} />

        <div style={{ color: '#808080' }}>{'// 过滤特定键：只保留 string 类型的属性'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>type</span>{' '}
          <span style={{ color: '#4ec9b0' }}>StringKeys</span>
          {'<T> = {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          [<span style={{ color: '#ce9178' }}>{'{'}</span>
          <span style={{ color: '#569cd6' }}>K</span> in{' '}
          <span style={{ color: '#569cd6' }}>keyof</span> T{' '}
          <span style={{ color: '#c586c0' }}>as</span>{' '}
          T[K] <span style={{ color: '#569cd6' }}>extends</span> string ? K :{' '}
          <span style={{ color: '#eb2f96' }}>never</span>]: T[K];
        </div>
        <div>{'};'}</div>
        <br />
        <div>
          type StrProps = StringKeys
          {'<Person>'};
        </div>
        <div style={{ paddingLeft: 16, color: '#82c91e' }}>
          {'// → { name: string; email: string }（age 是 number，被过滤）'}
        </div>
      </div>

      <Alert
        type="info"
        showIcon
        message="as 重映射的两种效果"
        description={
          <span>
            <code>as NewKey</code> 可以<strong>变换</strong>键名（如 name → getName），<code>as ... ? K : never</code> 可以<strong>过滤</strong>键。这是 TS 4.1 最重要的类型系统增强之一。
          </span>
        }
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

/** 条件过滤模式：两步走 */
const FilterMapped: React.FC = () => {
  return (
    <Card size="small" title="映射 + 条件查询：两步过滤模式">
      <Typography.Paragraph>
        一种经典的两步类型操作模式：<strong>先映射</strong>（条件判断保留或标记为 never），<strong>再索引访问</strong>（过滤掉 never）。这是实现 <code>PickByType</code>、<code>FilterKeys</code> 等工具类型的核心技巧：
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
        <div style={{ color: '#808080' }}>{'// 原始类型'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>interface</span>{' '}
          <span style={{ color: '#4ec9b0' }}>Model</span>
          {' {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#9cdcfe' }}>id</span>: number;
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#9cdcfe' }}>name</span>: string;
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#9cdcfe' }}>createdAt</span>: Date;
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#9cdcfe' }}>isActive</span>: boolean;
        </div>
        <div>{'}'}</div>
        <br />

        <div style={{ color: '#808080' }}>
          {'// 第一步：映射——值类型符合条件返回 K，否则返回 never'}
        </div>
        <div>
          <span style={{ color: '#569cd6' }}>type</span>{' '}
          <span style={{ color: '#4ec9b0' }}>FilterKeys</span>
          {'<T, U> = {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          [<span style={{ color: '#ce9178' }}>{'{'}</span>
          <span style={{ color: '#569cd6' }}>K</span> in{' '}
          <span style={{ color: '#569cd6' }}>keyof</span> T]: T[K]{' '}
          <span style={{ color: '#569cd6' }}>extends</span> U ? K :{' '}
          <span style={{ color: '#eb2f96' }}>never</span>;
        </div>
        <div>{'};'}</div>
        <br />

        <div style={{ color: '#808080' }}>
          {'// FilterKeys<Model, string> 的结果：'}
        </div>
        <div>
          {'{'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          id: <span style={{ color: '#eb2f96' }}>never</span>;
        </div>
        <div style={{ paddingLeft: 16 }}>
          name: <span style={{ color: '#ce9178' }}>"name"</span>;
        </div>
        <div style={{ paddingLeft: 16 }}>
          createdAt: <span style={{ color: '#eb2f96' }}>never</span>;
        </div>
        <div style={{ paddingLeft: 16 }}>
          isActive: <span style={{ color: '#eb2f96' }}>never</span>;
        </div>
        <div>{'}'}</div>
        <br />

        <div style={{ color: '#808080' }}>
          {'// 第二步：索引访问 [keyof T]——取出所有值，never 被过滤'}
        </div>
        <div>
          <span style={{ color: '#569cd6' }}>type</span>{' '}
          <span style={{ color: '#4ec9b0' }}>KeysOfType</span>
          {'<T, U> = FilterKeys<T, U>[keyof T];'}
        </div>
        <br />

        <div>
          type StrKeys = KeysOfType
          {'<Model, string>'};
        </div>
        <div style={{ paddingLeft: 16, color: '#82c91e' }}>
          {'// = never | "name" | never | never = "name"'}
        </div>
        <br />
        <div>
          type NumKeys = KeysOfType
          {'<Model, number>'};
        </div>
        <div style={{ paddingLeft: 16, color: '#82c91e' }}>
          {'// = "id" | never | never | never = "id"'}
        </div>
        <br />
        <div>
          type DateKeys = KeysOfType
          {'<Model, Date>'};
        </div>
        <div style={{ paddingLeft: 16, color: '#82c91e' }}>
          {'// = never | never | "createdAt" | never = "createdAt"'}
        </div>
      </div>

      <Alert
        type="warning"
        showIcon
        message="面试高频题型"
        description={
          <span>
            这是 TS 类型体操面试中出现频率最高的模式之一。理解"映射 → 条件 → 索引访问"三步走，就能手写 <code>PickByType</code>、<code>PickByValue</code>、<code>OmitByType</code> 等自定义工具类型。
          </span>
        }
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

export default MappedTypesDemo;
