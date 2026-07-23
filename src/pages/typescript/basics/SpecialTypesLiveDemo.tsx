import React, { useState } from 'react';
import { Card, Radio, Typography, Tag, Alert, Space, Table, Divider } from 'antd';

type ViewMode = 'hierarchy' | 'assign' | 'narrow';

/** 三轴对比表格数据 */
const comparisonData = [
  {
    dimension: '类型层级中的角色',
    any: '顶级类型（top type）—— 所有类型的父类型',
    unknown: '顶级类型（top type）—— 所有类型的父类型',
    never: '底部类型（bottom type）—— 所有类型的子类型',
    highlight: 'dimension',
  },
  {
    dimension: '能否被赋值给其他类型（作为源）',
    any: '✅ 可以赋值给任何类型（放弃类型检查）',
    unknown: '❌ 不可赋值给除 any 外的任何类型',
    never: '✅ 可以赋值给任何类型（"空集"合规）',
    highlight: 'any',
  },
  {
    dimension: '其他类型能否赋值给它（作为目标）',
    any: '✅ 任何类型都可以赋值给 any',
    unknown: '✅ 任何类型都可以赋值给 unknown',
    never: '❌ 只能从 never 赋值给 never',
    highlight: 'never',
  },
  {
    dimension: '对值可执行的操作',
    any: '✅ 任意操作（不做任何检查）',
    unknown: '❌ 必须先收窄类型，才能操作',
    never: 'N/A（不可能有值持有 never 类型）',
    highlight: 'unknown',
  },
  {
    dimension: '运行时存在',
    any: '是，any 类型的值在 JS 中正常运行',
    unknown: '是，unknown 类型的值在 JS 中正常运行',
    never: '否，never 是没有值的"空类型"',
    highlight: 'never',
  },
  {
    dimension: '典型出现场景',
    any: '迁移旧 JS 代码、第三方无类型库',
    unknown: 'JSON.parse 返回值、用户输入',
    never: '抛出异常的函数、穷举检查（exhaustive check）',
    highlight: 'dimension',
  },
];

/** 演示赋值规则 */
type AssignDemoMode = 'source' | 'target';

const SpecialTypesLiveDemo: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('hierarchy');

  return (
    <div>
      <Radio.Group
        value={viewMode}
        onChange={(e) => setViewMode(e.target.value)}
        optionType="button"
        buttonStyle="solid"
        style={{ marginBottom: 16 }}
      >
        <Radio.Button value="hierarchy">类型层级视图</Radio.Button>
        <Radio.Button value="assign">赋值规则演示</Radio.Button>
        <Radio.Button value="narrow">收窄操作对比</Radio.Button>
      </Radio.Group>

      {viewMode === 'hierarchy' && <HierarchyView />}
      {viewMode === 'assign' && <AssignRules />}
      {viewMode === 'narrow' && <NarrowingView />}
    </div>
  );
};

/** 层级视图：top type vs bottom type */
const HierarchyView: React.FC = () => {
  return (
    <Card size="small" title="类型层级：top type（any/unknown）vs bottom type（never）">
      <Typography.Paragraph>
        在 TypeScript 类型系统中，类型之间存在"兼容性"层级关系。理解这种层级是理解三者区别的基础：
      </Typography.Paragraph>

      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div
          style={{
            display: 'inline-block',
            border: '2px solid #722ed1',
            borderRadius: 8,
            padding: '8px 24px',
            marginBottom: 4,
            background: '#f9f0ff',
          }}
        >
          <Typography.Text strong style={{ color: '#722ed1', fontSize: 16 }}>
            Top Type（顶级类型）
          </Typography.Text>
        </div>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', margin: '8px 0' }}>
          <div
            style={{
              border: '2px solid #fa8c16',
              borderRadius: 8,
              padding: '8px 20px',
              background: '#fff7e6',
            }}
          >
            <Typography.Text strong style={{ color: '#d46b08' }}>
              any
            </Typography.Text>
            <div style={{ fontSize: 12, color: '#666' }}>放弃所有类型检查</div>
          </div>
          <div
            style={{
              border: '2px solid #1890ff',
              borderRadius: 8,
              padding: '8px 20px',
              background: '#e6f7ff',
            }}
          >
            <Typography.Text strong style={{ color: '#096dd9' }}>
              unknown
            </Typography.Text>
            <div style={{ fontSize: 12, color: '#666' }}>安全的顶级类型</div>
          </div>
        </div>

        <div style={{ fontSize: 13, color: '#666', margin: '8px 0' }}>
          ↑ 任何类型都可以赋值给 any/unknown（向上兼容）
        </div>

        <div
          style={{
            border: '2px solid #52c41a',
            borderRadius: 8,
            padding: '8px 40px',
            margin: '8px auto',
            display: 'inline-block',
            background: '#f6ffed',
          }}
        >
          <Typography.Text style={{ color: '#389e0d' }}>
            string | number | boolean | ... 所有具体类型
          </Typography.Text>
        </div>

        <div style={{ fontSize: 13, color: '#666', margin: '8px 0' }}>
          ↓ never 可以赋值给任何类型（向下兼容）
        </div>

        <div
          style={{
            border: '2px solid #eb2f96',
            borderRadius: 8,
            padding: '8px 24px',
            margin: '8px auto',
            display: 'inline-block',
            background: '#fff0f6',
          }}
        >
          <Typography.Text strong style={{ color: '#c41d7f', fontSize: 16 }}>
            Bottom Type（底部类型）
          </Typography.Text>
          <div style={{ fontSize: 12, color: '#666' }}>
            never —— 空集，没有值可以持有此类型
          </div>
        </div>
      </div>

      <Alert
        type="info"
        showIcon
        message="关键理解：从集合论角度看类型"
        description={
          <div>
            <p>
              <strong>any / unknown = top type（全集）</strong>：一个值可以是任何可能的 JS 值。unknown 是"安全的 top type"——你必须先证明它是什么才能操作它。
            </p>
            <p>
              <strong>never = bottom type（空集）</strong>：没有值可以属于 never 类型。它是所有类型的子类型。抛出异常的函数、死循环函数、交叉类型中的不可能分支都会产生 never。
            </p>
            <p>
              <strong>关键区别</strong>：让 never 和 any/unknown 处于层级的两端。never 是"什么都不可能是"；any/unknown 是"什么都可能是"——但 any 放弃检查，unknown 强制检查。
            </p>
          </div>
        }
        style={{ marginTop: 12 }}
      />

      <Divider />

      <Typography.Text strong style={{ fontSize: 14 }}>
        never 产生的三种方式
      </Typography.Text>
      <div
        style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: 16,
          borderRadius: 6,
          fontFamily: 'Consolas, monospace',
          fontSize: 13,
          lineHeight: 1.8,
          marginTop: 8,
        }}
      >
        <div style={{ color: '#808080' }}>{'// 方式 1：抛出异常的函数的返回类型'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>function</span>{' '}
          <span style={{ color: '#dcdcaa' }}>throwError</span>
          {'(msg: string): '}
          <span style={{ color: '#eb2f96' }}>never</span>
          {' {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#c586c0' }}>throw</span>
          {' new Error(msg);'}
        </div>
        <div>{'}'}</div>
        <br />
        <div style={{ color: '#808080' }}>{'// 方式 2：死循环'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>function</span>{' '}
          <span style={{ color: '#dcdcaa' }}>infiniteLoop</span>
          {'(): '}
          <span style={{ color: '#eb2f96' }}>never</span>
          {' {'}
        </div>
        <div style={{ paddingLeft: 16 }}>
          <span style={{ color: '#c586c0' }}>while</span>
          {' (true) {'}
        </div>
        <div style={{ paddingLeft: 32 }}>
          {/* noop */}
        </div>
        <div style={{ paddingLeft: 16 }}>{'}'}</div>
        <div>{'}'}</div>
        <br />
        <div style={{ color: '#808080' }}>{'// 方式 3：交叉类型中的不可能'}</div>
        <div>
          <span style={{ color: '#569cd6' }}>type</span>{' '}
          <span style={{ color: '#4ec9b0' }}>Impossible</span>
          {' = string & number; '}
          <span style={{ color: '#808080' }}>{'// string & number => never'}</span>
        </div>
        <div style={{ color: '#808080' }}>{'// 一个值不可能同时是 string 和 number'}</div>
      </div>
    </Card>
  );
};

/** 赋值规则交互演示 */
const AssignRules: React.FC = () => {
  const [mode, setMode] = useState<AssignDemoMode>('source');

  return (
    <Card size="small" title="赋值规则：作为源头 vs 作为目标">
      <Radio.Group
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        optionType="button"
        style={{ marginBottom: 16 }}
      >
        <Radio.Button value="source">作为源头（赋给别人）</Radio.Button>
        <Radio.Button value="target">作为目标（别人赋给它）</Radio.Button>
      </Radio.Group>

      <div
        style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: 16,
          borderRadius: 6,
          fontFamily: 'Consolas, monospace',
          fontSize: 13,
          lineHeight: 2,
        }}
      >
        {mode === 'source' ? (
          <>
            <div style={{ color: '#808080', marginBottom: 8 }}>
              {'// 场景：声明了一个 any/unknown/never 类型的变量，把它赋值给 string 变量'}
            </div>

            <div style={{ color: '#82c91e' }}>
              {'// ✅ any → string 可以（放弃检查）'}
            </div>
            <div>
              <span style={{ color: '#569cd6' }}>const</span>{' '}
              <span style={{ color: '#9cdcfe' }}>a</span>: any = 42;
              <br />
              <span style={{ color: '#569cd6' }}>const</span>{' '}
              <span style={{ color: '#9cdcfe' }}>s1</span>: string = a;{' '}
              <span style={{ color: '#808080' }}>{'// ✅ 编译通过（运行时可能报错）'}</span>
            </div>
            <br />

            <div style={{ color: '#ff6b6b' }}>
              {'// ❌ unknown → string 不可以（类型不安全）'}
            </div>
            <div>
              <span style={{ color: '#569cd6' }}>const</span>{' '}
              <span style={{ color: '#9cdcfe' }}>u</span>: unknown = 42;
              <br />
              <span style={{ color: '#569cd6' }}>const</span>{' '}
              <span style={{ color: '#9cdcfe' }}>s2</span>: string = u;{' '}
              <span style={{ color: '#ff6b6b' }}>
                {'// ❌ Error: Type "unknown" is not assignable to type "string"'}
              </span>
            </div>
            <br />

            <div style={{ color: '#82c91e' }}>
              {'// ✅ never → string 可以（空集是任何类型的子类型）'}
            </div>
            <div>
              <span style={{ color: '#569cd6' }}>function</span>{' '}
              <span style={{ color: '#dcdcaa' }}>f</span>():{' '}
              <span style={{ color: '#eb2f96' }}>never</span> {'{'}
              <span style={{ color: '#c586c0' }}>throw</span> ...
              {'}'}
              <br />
              <span style={{ color: '#569cd6' }}>const</span>{' '}
              <span style={{ color: '#9cdcfe' }}>s3</span>: string = f();{' '}
              <span style={{ color: '#808080' }}>{'// ✅ 编译通过（因为函数不会返回）'}</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ color: '#808080', marginBottom: 8 }}>
              {'// 场景：把 string 类型的变量赋值给 any/unknown/never 变量'}
            </div>

            <div style={{ color: '#82c91e' }}>
              {'// ✅ string → any 可以'}
            </div>
            <div>
              <span style={{ color: '#569cd6' }}>const</span>{' '}
              <span style={{ color: '#9cdcfe' }}>s</span>: string = 'hello';
              <br />
              <span style={{ color: '#569cd6' }}>const</span>{' '}
              <span style={{ color: '#9cdcfe' }}>a</span>: any = s;{' '}
              <span style={{ color: '#82c91e' }}>
                ✅
              </span>
            </div>
            <br />

            <div style={{ color: '#82c91e' }}>
              {'// ✅ string → unknown 也可以'}
            </div>
            <div>
              <span style={{ color: '#569cd6' }}>const</span>{' '}
              <span style={{ color: '#9cdcfe' }}>u</span>: unknown = s;{' '}
              <span style={{ color: '#82c91e' }}>
                ✅
              </span>
            </div>
            <br />

            <div style={{ color: '#ff6b6b' }}>
              {'// ❌ string → never 不可以'}
            </div>
            <div>
              <span style={{ color: '#569cd6' }}>const</span>{' '}
              <span style={{ color: '#9cdcfe' }}>n</span>:
              <span style={{ color: '#eb2f96' }}> never</span> = s;{' '}
              <span style={{ color: '#ff6b6b' }}>
                {'// ❌ Error: Type "string" is not assignable to type "never"'}
              </span>
            </div>
          </>
        )}
      </div>

      <Alert
        type="info"
        showIcon
        message="核心规则总结"
        description={
          <div>
            <p><strong>any</strong>：作为源头——可以赋给任何类型（放弃检查）；作为目标——可以接收任何类型。</p>
            <p><strong>unknown</strong>：作为源头——只能赋给 any 或 unknown（强制收窄）；作为目标——可以接收任何类型。</p>
            <p><strong>never</strong>：作为源头——可以赋给任何类型（空集特性）；作为目标——只能接收 never。</p>
          </div>
        }
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

/** 收窄操作对比 */
const NarrowingView: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'any' | 'unknown'>('unknown');

  return (
    <Card size="small" title="any vs unknown：操作前的收窄要求">
      <Radio.Group
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        optionType="button"
        style={{ marginBottom: 16 }}
      >
        <Radio.Button value="any">any（无需收窄）</Radio.Button>
        <Radio.Button value="unknown">unknown（必须收窄）</Radio.Button>
      </Radio.Group>

      <div
        style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: 16,
          borderRadius: 6,
          fontFamily: 'Consolas, monospace',
          fontSize: 13,
          lineHeight: 2,
        }}
      >
        {selectedType === 'any' ? (
          <>
            <div style={{ color: '#808080', marginBottom: 4 }}>
              {'// any 类型：编译器不检查，任何操作都可以直接调用'}
            </div>
            <div>
              <span style={{ color: '#569cd6' }}>const</span>{' '}
              <span style={{ color: '#9cdcfe' }}>data</span>: any = 42;
            </div>
            <div>
              data.
              <span style={{ color: '#dcdcaa' }}>toUpperCase</span>();{' '}
              <span style={{ color: '#82c91e' }}>
                {'// ✅ 编译通过（但运行时 42 没有 toUpperCase，会崩溃！）'}
              </span>
            </div>
            <div>
              data.
              <span style={{ color: '#dcdcaa' }}>nonExistentProp</span>;{' '}
              <span style={{ color: '#82c91e' }}>
                {'// ✅ 编译通过（但运行时是 undefined）'}
              </span>
            </div>
            <div style={{ color: '#ff6b6b', marginTop: 8 }}>
              {'// ⚠ any 的最大问题：你在编译阶段完全失去了类型系统的保护'}
            </div>
          </>
        ) : (
          <>
            <div style={{ color: '#808080', marginBottom: 4 }}>
              {'// unknown 类型：编译器强制你收窄类型后才能操作'}
            </div>
            <div>
              <span style={{ color: '#569cd6' }}>const</span>{' '}
              <span style={{ color: '#9cdcfe' }}>data</span>: unknown = "hello";
            </div>
            <div>
              data.
              <span style={{ color: '#dcdcaa' }}>toUpperCase</span>();{' '}
              <span style={{ color: '#ff6b6b' }}>
                {'// ❌ Error: Object is of type "unknown"'}
              </span>
            </div>
            <br />
            <div style={{ color: '#82c91e' }}>
              {'// ✅ 先收窄类型，再安全调用：'}
            </div>
            <div>
              <span style={{ color: '#c586c0' }}>if</span>
              {' ('}
              <span style={{ color: '#569cd6' }}>typeof</span>
              {' data === "string") {'}
            </div>
            <div style={{ paddingLeft: 16 }}>
              data.
              <span style={{ color: '#dcdcaa' }}>toUpperCase</span>();{' '}
              <span style={{ color: '#82c91e' }}>
                {'// ✅ 收窄后安全调用'}
              </span>
            </div>
            <div>{'}'}</div>
          </>
        )}
      </div>

      <Alert
        type={selectedType === 'any' ? 'warning' : 'success'}
        showIcon
        message={selectedType === 'any' ? 'any 的危害' : 'unknown 的安全性'}
        description={
          selectedType === 'any' ? (
            'any 让 TypeScript 退化为 JavaScript。一个 any 会像病毒一样传染：任何接触到 any 的表达式都会变成 any，从而失去类型保护。在严格模式（strict: true）下，应尽量避免使用 any，改用 unknown。'
          ) : (
            'unknown 是 any 的安全替代品。unknown 要求你在使用值之前必须先通过类型守卫收窄类型（typeof、instanceof、类型谓词等）。这迫使你在编码时考虑运行时的类型边界，写出更健壮的代码。'
          )
        }
        style={{ marginTop: 12 }}
      />
    </Card>
  );
};

export default SpecialTypesLiveDemo;
