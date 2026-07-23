import React, { useState } from 'react';
import { Card, Radio, Typography, Tag, Alert, Space, Divider, Table } from 'antd';

type DemoMode = 'extend' | 'merge' | 'union' | 'mapped';

const sections = {
  extend: {
    label: '扩展方式',
    icon: '🔗',
  },
  merge: {
    label: '声明合并',
    icon: '🔄',
  },
  union: {
    label: '联合类型',
    icon: '🔀',
  },
  mapped: {
    label: '映射类型',
    icon: '🔄',
  },
};

const InterfaceVsTypeDemo: React.FC = () => {
  const [mode, setMode] = useState<DemoMode>('extend');

  return (
    <div>
      <Typography.Title level={5} style={{ marginBottom: 12 }}>
        interface vs type 详细对比
      </Typography.Title>

      <Radio.Group
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        optionType="button"
        buttonStyle="solid"
        style={{ marginBottom: 16, flexWrap: 'wrap' }}
      >
        <Radio.Button value="extend">{sections.extend.icon} 扩展方式</Radio.Button>
        <Radio.Button value="merge">{sections.merge.icon} 声明合并</Radio.Button>
        <Radio.Button value="union">{sections.union.icon} 联合类型</Radio.Button>
        <Radio.Button value="mapped">{sections.mapped.icon} 映射类型</Radio.Button>
      </Radio.Group>

      {mode === 'extend' && <ExtendDemo />}
      {mode === 'merge' && <MergeDemo />}
      {mode === 'union' && <UnionCapabilityDemo />}
      {mode === 'mapped' && <MappedTypeDemo />}
    </div>
  );
};

/** 扩展方式对比：extends vs & */
const ExtendDemo: React.FC = () => {
  const [showType, setShowType] = useState<'interface' | 'type'>('interface');

  return (
    <Card size="small" title="🔗 扩展方式：extends（interface） vs & 交叉（type）">
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* Interface 面板 */}
        <div
          style={{
            flex: 1,
            minWidth: 280,
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: 16,
            borderRadius: 6,
            fontFamily: 'Consolas, monospace',
            fontSize: 13,
            lineHeight: 1.8,
          }}
        >
          <div style={{ marginBottom: 4 }}>
            <Tag color="blue" style={{ fontSize: 11 }}>
              interface（extends）
            </Tag>
          </div>
          <div>
            <span style={{ color: '#569cd6' }}>interface</span>{' '}
            <span style={{ color: '#4ec9b0' }}>Base</span>
            {' { x: number; }'}
          </div>
          <div>
            <span style={{ color: '#569cd6' }}>interface</span>{' '}
            <span style={{ color: '#4ec9b0' }}>Extended</span>{' '}
            <span style={{ color: '#569cd6' }}>extends</span>{' '}
            <span style={{ color: '#4ec9b0' }}>Base</span>
            {' {'}
          </div>
          <div style={{ paddingLeft: 16 }}>
            <span style={{ color: '#9cdcfe' }}>y</span>: number;
          </div>
          <div>{'}'}</div>
          <br />
          <div>
            <span style={{ color: '#808080' }}>
              {'// Extended 有 x（继承）+ y（自有）两个属性'}
            </span>
          </div>
          <div style={{ color: '#82c91e' }}>
            {'// ✅ extends 语义清晰，报错信息友好'}
          </div>
        </div>

        {/* Type 面板 */}
        <div
          style={{
            flex: 1,
            minWidth: 280,
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: 16,
            borderRadius: 6,
            fontFamily: 'Consolas, monospace',
            fontSize: 13,
            lineHeight: 1.8,
          }}
        >
          <div style={{ marginBottom: 4 }}>
            <Tag color="orange" style={{ fontSize: 11 }}>
              type（& 交叉）
            </Tag>
          </div>
          <div>
            <span style={{ color: '#569cd6' }}>type</span>{' '}
            <span style={{ color: '#4ec9b0' }}>Base</span>
            {' = { x: number; }'}
          </div>
          <div>
            <span style={{ color: '#569cd6' }}>type</span>{' '}
            <span style={{ color: '#4ec9b0' }}>Extended</span>
            {' = Base '}
            <span style={{ color: '#ce9178' }}>&</span>
            {' {'}
          </div>
          <div style={{ paddingLeft: 16 }}>
            <span style={{ color: '#9cdcfe' }}>y</span>: number;
          </div>
          <div>{'};'}</div>
          <br />
          <div>
            <span style={{ color: '#808080' }}>
              {'// & 交叉类型同样能实现继承效果'}
            </span>
          </div>
          <div style={{ color: '#808080' }}>
            {'// 但报错信息不如 interface 直观'}
          </div>
        </div>
      </div>

      <Alert
        type="info"
        showIcon
        message="如何选择"
        description={
          <span>
            定义对象类型「继承」关系时，优先用 <code>interface extends</code>。
            type 的 <code>&</code> 交叉更适合组合多个不相关的类型。
          </span>
        }
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

/** 声明合并：interface 支持同名合并，type 不支持 */
const MergeDemo: React.FC = () => {
  return (
    <Card size="small" title="🔄 声明合并（Declaration Merging）">
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* Interface 面板 */}
        <div
          style={{
            flex: 1,
            minWidth: 280,
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: 16,
            borderRadius: 6,
            fontFamily: 'Consolas, monospace',
            fontSize: 13,
            lineHeight: 1.8,
          }}
        >
          <div style={{ marginBottom: 4 }}>
            <Tag color="blue" style={{ fontSize: 11 }}>
              interface ✅ 同名自动合并
            </Tag>
          </div>
          <div>
            <span style={{ color: '#569cd6' }}>interface</span>{' '}
            <span style={{ color: '#4ec9b0' }}>User</span>
            {' {'}
          </div>
          <div style={{ paddingLeft: 16 }}>
            <span style={{ color: '#9cdcfe' }}>name</span>: string;
          </div>
          <div>{'}'}</div>
          <br />
          <div>
            <span style={{ color: '#569cd6' }}>interface</span>{' '}
            <span style={{ color: '#4ec9b0' }}>User</span>
            {' {'}
          </div>
          <div style={{ paddingLeft: 16 }}>
            <span style={{ color: '#9cdcfe' }}>age</span>: number;
          </div>
          <div>{'}'}</div>
          <br />
          <div style={{ color: '#808080' }}>{'// 合并后 User 有 name + age'}</div>
          <div>
            <span style={{ color: '#569cd6' }}>const</span>{' '}
            <span style={{ color: '#9cdcfe' }}>u</span>: User
            {' = { name: "Tom", age: 25 }; '}
            <Tag color="success" style={{ fontSize: 11 }}>
              ✅
            </Tag>
          </div>
          <div style={{ color: '#82c91e', marginTop: 8 }}>
            {'// 💡 第三方库类型补全时非常有用'}
          </div>
        </div>

        {/* Type 面板 */}
        <div
          style={{
            flex: 1,
            minWidth: 280,
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: 16,
            borderRadius: 6,
            fontFamily: 'Consolas, monospace',
            fontSize: 13,
            lineHeight: 1.8,
          }}
        >
          <div style={{ marginBottom: 4 }}>
            <Tag color="orange" style={{ fontSize: 11 }}>
              type ❌ 重复定义报错
            </Tag>
          </div>
          <div>
            <span style={{ color: '#569cd6' }}>type</span>{' '}
            <span style={{ color: '#4ec9b0' }}>User</span>
            {' = {'}
          </div>
          <div style={{ paddingLeft: 16 }}>
            <span style={{ color: '#9cdcfe' }}>name</span>: string;
          </div>
          <div>{'};'}</div>
          <br />
          <div>
            <span style={{ color: '#569cd6' }}>type</span>{' '}
            <span style={{ color: '#4ec9b0' }}>User</span>
            {' = {'}
          </div>
          <div style={{ paddingLeft: 16 }}>
            <span style={{ color: '#9cdcfe' }}>age</span>: number;
          </div>
          <div>
            {'}; '}
            <Tag color="error" style={{ fontSize: 11 }}>
              ❌
            </Tag>
          </div>
          <div style={{ color: '#ff6b6b', marginTop: 4 }}>
            {'// ⚠ Error: 标识符 "User" 重复'}
          </div>
          <div style={{ color: '#808080', marginTop: 8 }}>
            {'// type 不支持声明合并'}
          </div>
        </div>
      </div>

      <Alert
        type="success"
        showIcon
        message="实用场景"
        description={
          <span>
            当需要为第三方库（如 Window、Express Request）添加自定义属性时，<code>interface</code> 的声明合并是唯一选择。<code>type</code> 无法做到。
          </span>
        }
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

/** 联合类型：type 支持，interface 不支持 */
const UnionCapabilityDemo: React.FC = () => {
  const [showType, setShowType] = useState<'union' | 'primitive'>('union');

  return (
    <Card size="small" title="🔀 联合类型：type 可以，interface 不行">
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* Type 面板 */}
        <div
          style={{
            flex: 1,
            minWidth: 280,
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: 16,
            borderRadius: 6,
            fontFamily: 'Consolas, monospace',
            fontSize: 13,
            lineHeight: 1.8,
          }}
        >
          <div style={{ marginBottom: 4 }}>
            <Tag color="orange" style={{ fontSize: 11 }}>
              type ✅ 轻松定义联合类型
            </Tag>
          </div>
          {showType === 'union' ? (
            <>
              <div>
                <span style={{ color: '#569cd6' }}>type</span>{' '}
                <span style={{ color: '#4ec9b0' }}>Result</span>
                {' = '}
              </div>
              <div style={{ paddingLeft: 16 }}>
                <span style={{ color: '#4ec9b0' }}>Success</span>
                {' | '}
                <span style={{ color: '#4ec9b0' }}>Error</span>
                {' | '}
                <span style={{ color: '#4ec9b0' }}>Loading</span>
                ;
              </div>
              <br />
              <div style={{ color: '#808080' }}>{'// 联合类型方便表达多态'}</div>
              <div style={{ color: '#808080' }}>{'// interface 无法做到'}</div>
            </>
          ) : (
            <>
              <div>
                <span style={{ color: '#569cd6' }}>type</span>{' '}
                <span style={{ color: '#4ec9b0' }}>Status</span>
                {' = '}
                <span style={{ color: '#ce9178' }}>"success"</span>
                {' | '}
                <span style={{ color: '#ce9178' }}>"error"</span>
                {' | '}
                <span style={{ color: '#ce9178' }}>"loading"</span>
                ;
              </div>
              <div style={{ color: '#82c91e', marginTop: 8 }}>
                {'// ✅ 原始类型联合 —— interface 完全做不到'}
              </div>
            </>
          )}

          <div style={{ marginTop: 8 }}>
            <Radio.Group
              value={showType}
              onChange={(e) => setShowType(e.target.value)}
              size="small"
              optionType="button"
            >
              <Radio.Button value="union">对象联合</Radio.Button>
              <Radio.Button value="primitive">原始类型联合</Radio.Button>
            </Radio.Group>
          </div>
        </div>

        {/* Interface 面板（不能做什么） */}
        <div
          style={{
            flex: 1,
            minWidth: 280,
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: 16,
            borderRadius: 6,
            fontFamily: 'Consolas, monospace',
            fontSize: 13,
            lineHeight: 1.8,
          }}
        >
          <div style={{ marginBottom: 4 }}>
            <Tag color="blue" style={{ fontSize: 11 }}>
              interface ❌ 不能定义联合类型
            </Tag>
          </div>
          <div>
            <span style={{ color: '#569cd6' }}>interface</span>{' '}
            <span style={{ color: '#4ec9b0' }}>Status</span>
            {' = '}
          </div>
          <div style={{ paddingLeft: 16 }}>
            <span style={{ color: '#ce9178' }}>"success"</span>
            {' | '}
            <span style={{ color: '#ce9178' }}>"error"</span>
            ;
          </div>
          <div style={{ color: '#ff6b6b', marginTop: 4 }}>
            {'// ⚠ Error: interface 只能定义对象类型'}
          </div>
          <br />
          <div style={{ color: '#808080' }}>
            {'// interface 只能描述对象的"形状"'}
          </div>
          <div style={{ color: '#808080' }}>
            {'// 联合类型是 type 独有的能力'}
          </div>
        </div>
      </div>
    </Card>
  );
};

/** 映射类型：type 支持，interface 不支持 */
const MappedTypeDemo: React.FC = () => {
  return (
    <Card size="small" title="🔄 映射类型：type + keyof 的灵活组合">
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* Type 的映射类型能力 */}
        <div
          style={{
            flex: 1,
            minWidth: 280,
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: 16,
            borderRadius: 6,
            fontFamily: 'Consolas, monospace',
            fontSize: 13,
            lineHeight: 1.8,
          }}
        >
          <div style={{ marginBottom: 4 }}>
            <Tag color="orange" style={{ fontSize: 11 }}>
              type ✅ 映射类型（Mapped Type）
            </Tag>
          </div>
          <div>
            <span style={{ color: '#569cd6' }}>type</span>{' '}
            <span style={{ color: '#4ec9b0' }}>Readonly</span>
            {'&lt;T&gt; = {'}
          </div>
          <div style={{ paddingLeft: 16 }}>
            <span style={{ color: '#c586c0' }}>readonly</span>
            {' ['}
            <span style={{ color: '#569cd6' }}>keyof T</span>]:
            <span style={{ color: '#4ec9b0' }}>T</span>[key];
          </div>
          <div>{'};'}</div>
          <br />
          <div>
            <span style={{ color: '#569cd6' }}>type</span>{' '}
            <span style={{ color: '#4ec9b0' }}>Partial</span>
            {'&lt;T&gt; = {'}
          </div>
          <div style={{ paddingLeft: 16 }}>
            {'['}<span style={{ color: '#569cd6' }}>keyof T</span>{']'}?:
            <span style={{ color: '#4ec9b0' }}>T</span>[key];
          </div>
          <div>{'};'}</div>
          <br />
          <div>
            <span style={{ color: '#569cd6' }}>type</span>{' '}
            <span style={{ color: '#4ec9b0' }}>Nullable</span>
            {'&lt;T&gt; = T | null;'}
          </div>
          <div style={{ color: '#82c91e', marginTop: 8 }}>
            {'// ✅ type 可以组合泛型、条件类型、映射类型'}
          </div>
        </div>

        {/* Interface 的限制 */}
        <div
          style={{
            flex: 1,
            minWidth: 280,
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: 16,
            borderRadius: 6,
            fontFamily: 'Consolas, monospace',
            fontSize: 13,
            lineHeight: 1.8,
          }}
        >
          <div style={{ marginBottom: 4 }}>
            <Tag color="blue" style={{ fontSize: 11 }}>
              interface ❌ 不能做类型运算
            </Tag>
          </div>
          <div>
            <span style={{ color: '#569cd6' }}>interface</span>{' '}
            <span style={{ color: '#4ec9b0' }}>MyPartial</span>
            {'&lt;T&gt; {'}
          </div>
          <div style={{ paddingLeft: 16 }}>
            {'['}<span style={{ color: '#569cd6' }}>keyof T</span>{']'}?:
            <span style={{ color: '#4ec9b0' }}>T</span>{'['}key{']'};
          </div>
          <div>
            {'}; '}
            <Tag color="error" style={{ fontSize: 11 }}>
              ❌
            </Tag>
          </div>
          <div style={{ color: '#ff6b6b', marginTop: 4 }}>
            {'// ⚠ Error: interface 不能使用映射类型语法'}
          </div>
          <br />
          <div style={{ color: '#808080' }}>
            {'// interface 只能定义固定的属性结构'}
          </div>
          <div style={{ color: '#808080' }}>
            {'// 无法根据输入类型计算输出类型'}
          </div>
        </div>
      </div>

      <Alert
        type="info"
        showIcon
        message="选择策略"
        description={
          <span>
            需要类型运算（泛型 + 映射 + 条件）时用 <code>type</code>；定义纯对象结构、需要声明合并时用 <code>interface</code>。TypeScript 官方推荐：能用 interface 就用 interface，不行再用 type。
          </span>
        }
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

export default InterfaceVsTypeDemo;
