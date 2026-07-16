import React, { useState } from 'react';
import { Card, Tabs, Tag, Typography, Space, Alert, Steps, Descriptions, Collapse } from 'antd';
import {
  CodeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RocketOutlined,
  BuildOutlined,
  FolderOutlined,
} from '@ant-design/icons';

const { Text, Title, Paragraph } = Typography;

const COMPONENT_SOURCE = `import React from 'react';

interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  disabled = false,
  onClick,
}) => {
  const baseStyle: React.CSSProperties = {
    padding: '8px 20px',
    borderRadius: 6,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 14,
    fontWeight: 500,
    opacity: disabled ? 0.5 : 1,
  };

  const variantStyle: React.CSSProperties =
    variant === 'primary'
      ? { background: '#1677ff', color: '#fff' }
      : { background: '#f5f5f5', color: '#333', border: '1px solid #d9d9d9' };

  return (
    <button
      style={{ ...baseStyle, ...variantStyle }}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default Button;
export type { ButtonProps };`;

const GOOD_PACKAGE_JSON = {
  name: '@my-scope/react-button',
  version: '1.0.0',
  main: './dist/index.js',
  module: './dist/index.mjs',
  types: './dist/index.d.ts',
  exports: {
    '.': {
      import: './dist/index.mjs',
      require: './dist/index.js',
      types: './dist/index.d.ts',
    },
  },
  files: ['dist'],
  sideEffects: false,
  peerDependencies: { react: '^18.0.0' },
  scripts: {
    build: 'tsup src/index.ts --format esm,cjs --dts --clean',
    prepublishOnly: 'npm run build',
  },
  devDependencies: { tsup: '^8.0.0', typescript: '^5.0.0' },
};

const BAD_PACKAGE_JSON = {
  name: 'react-button',
  version: '1.0.0',
  main: 'src/index.ts',
  types: 'src/index.ts',
  files: ['src', 'dist'],
  dependencies: { react: '^18.0.0' },
  scripts: { build: 'tsc' },
  devDependencies: { typescript: '^5.0.0' },
};

const PACKAGE_STRUCTURE = [
  { name: 'my-react-button/', type: 'folder', children: [
    { name: 'package.json', type: 'file' },
    { name: 'tsconfig.json', type: 'file' },
    { name: 'README.md', type: 'file' },
    { name: 'src/', type: 'folder', children: [
      { name: 'index.ts', type: 'file' },
      { name: 'Button.tsx', type: 'file' },
    ]},
    { name: 'dist/', type: 'folder', children: [
      { name: 'index.js', type: 'file' },
      { name: 'index.mjs', type: 'file' },
      { name: 'index.d.ts', type: 'file' },
    ]},
  ]},
];

const TreeView: React.FC<{ items: typeof PACKAGE_STRUCTURE; depth?: number }> = ({ items, depth = 0 }) => {
  return (
    <div style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 2 }}>
      {items.map((item, i) => (
        <div key={i}>
          <span style={{ paddingLeft: depth * 20 }}>
            {item.type === 'folder' ? '📁 ' : '📄 '}
            <span style={{ color: item.type === 'folder' ? '#1677ff' : '#333' }}>{item.name}</span>
          </span>
          {item.children && <TreeView items={item.children} depth={depth + 1} />}
        </div>
      ))}
    </div>
  );
};

const StatusDot: React.FC<{ ok: boolean; label: string }> = ({ ok, label }) => (
  <Space>
    {ok ? (
      <CheckCircleOutlined style={{ color: '#52c41a' }} />
    ) : (
      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
    )}
    <Text type={ok ? undefined : 'danger'}>{label}</Text>
  </Space>
);

const GoodConfigPreview: React.FC = () => (
  <div>
    <Paragraph>
      下方展示了一个<Text strong>生产级</Text>的 npm 组件包配置。注意各项字段的配合使使用者无论何种环境都能正确导入。
    </Paragraph>
    <Collapse
      items={[
        {
          key: 'config',
          label: (
            <Space>
              <CodeOutlined />
              查看完整 package.json
            </Space>
          ),
          children: (
            <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: 13 }}>
              {JSON.stringify(GOOD_PACKAGE_JSON, null, 2)}
            </pre>
          ),
        },
      ]}
      style={{ marginBottom: 16 }}
    />
    <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
      <Descriptions.Item label="使用 import 导入时">
        <Tag color="green">dist/index.mjs</Tag>
        <Text type="secondary">（exports["."].import）</Text>
      </Descriptions.Item>
      <Descriptions.Item label="使用 require 导入时">
        <Tag color="blue">dist/index.js</Tag>
        <Text type="secondary">（exports["."].require）</Text>
      </Descriptions.Item>
      <Descriptions.Item label="TypeScript 类型推导">
        <Tag color="purple">dist/index.d.ts</Tag>
        <Text type="secondary">（exports["."].types）</Text>
      </Descriptions.Item>
      <Descriptions.Item label="Tree Shaking">
        <Tag color="cyan">sideEffects: false</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="发布白名单">
        <Tag>files: ["dist"]</Tag>
        <Text type="secondary">仅上传 dist/，不包含源码和测试</Text>
      </Descriptions.Item>
    </Descriptions>
  </div>
);

const BadConfigPreview: React.FC = () => (
  <div>
    <Alert
      type="error"
      showIcon
      message="常见错误配置"
      description="以下配置在实际项目中经常出现，会导致各种问题。"
      style={{ marginBottom: 16 }}
    />
    <Collapse
      items={[
        {
          key: 'config',
          label: (
            <Space>
              <CodeOutlined />
              查看有问题的 package.json
            </Space>
          ),
          children: (
            <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: 13 }}>
              {JSON.stringify(BAD_PACKAGE_JSON, null, 2)}
            </pre>
          ),
        },
      ]}
      style={{ marginBottom: 16 }}
    />
    <Space direction="vertical" style={{ width: '100%' }}>
      <StatusDot ok={false} label="main 指向 src/index.ts，使用者无法直接使用源码" />
      <StatusDot ok={false} label="未配置 module 字段，打包工具无法识别 ESM 入口" />
      <StatusDot ok={false} label="React 放在 dependencies 中，导致双实例问题" />
      <StatusDot ok={false} label="files 包含 src，发布包体积过大" />
      <StatusDot ok={false} label="build 仅用 tsc，无 bundle 单一文件输出" />
      <StatusDot ok={false} label="无 sideEffects 标记，影响 tree-shaking" />
    </Space>
  </div>
);

const StepsGuide: React.FC = () => {
  const [current, setCurrent] = useState(0);

  const steps = [
    {
      title: '编写组件',
      description: '在 src/ 中编写 React 组件源码，导出 TypeScript 类型',
      icon: <CodeOutlined />,
    },
    {
      title: '配置构建',
      description: '安装 tsup，配置 package.json 的入口字段',
      icon: <BuildOutlined />,
    },
    {
      title: '构建产物',
      description: '执行 npm run build，生成 dist/ 目录',
      icon: <FolderOutlined />,
    },
    {
      title: '发布上线',
      description: '执行 npm publish，发布到 npm registry',
      icon: <RocketOutlined />,
    },
  ];

  return (
    <div>
      <Steps
        current={current}
        direction="vertical"
        size="small"
        items={steps.map((s) => ({
          title: s.title,
          description: s.description,
          icon: s.icon,
        }))}
        onChange={(c) => setCurrent(c)}
        style={{ marginBottom: 16 }}
      />
      {current === 0 && (
        <Card size="small" title="组件源码" extra={<Text type="secondary">src/Button.tsx</Text>}>
          <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: 13, maxHeight: 240 }}>
            {COMPONENT_SOURCE}
          </pre>
        </Card>
      )}
      {current === 1 && (
        <Card size="small" title="构建配置">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>安装依赖：</Text>
            <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 8, fontSize: 13 }}>npm install -D tsup typescript</pre>
            <Text>构建脚本：</Text>
            <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 8, fontSize: 13 }}>tsup src/index.ts --format esm,cjs --dts --clean</pre>
          </Space>
        </Card>
      )}
      {current === 2 && (
        <Card size="small" title="构建产物" extra={<Text type="secondary">dist/</Text>}>
          <TreeView items={[{ name: 'dist/', type: 'folder', children: [
            { name: 'index.js', type: 'file' },
            { name: 'index.mjs', type: 'file' },
            { name: 'index.d.ts', type: 'file' },
          ]}]} />
        </Card>
      )}
      {current === 3 && (
        <Card size="small" title="发布命令">
          <Space direction="vertical" style={{ width: '100%' }}>
            <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 16, borderRadius: 8, fontSize: 13 }}>
              {`# 1. 登录
npm login

# 2. 更新版本号
npm version patch

# 3. 发布（自动执行 prepublishOnly → build → publish）
npm publish`}
            </pre>
            <Alert
              type="info"
              showIcon
              message="私有作用域包需要额外参数"
              description="作用域包（@scope/name）默认是私有的，public 包需要 --access public"
            />
          </Space>
        </Card>
      )}
    </div>
  );
};

const LiveDemo: React.FC = () => {
  const [tab, setTab] = useState('compare');

  return (
    <Card
      title={
        <Space>
          <RocketOutlined />
          <span>互动演示：npm 包封装实践</span>
        </Space>
      }
      style={{ marginTop: 24, marginBottom: 24 }}
    >
      <Tabs activeKey={tab} onChange={setTab} items={[
        {
          key: 'compare',
          label: '配置对比',
          children: (
            <div>
              <Paragraph>
                点击下方切换查看<Text strong>正确</Text>与<Text strong>错误</Text>的 package.json 配置对比。
              </Paragraph>
              <Tabs items={[
                {
                  key: 'good',
                  label: <Tag color="success">✅ 最佳实践</Tag>,
                  children: <GoodConfigPreview />,
                },
                {
                  key: 'bad',
                  label: <Tag color="error">❌ 反面教材</Tag>,
                  children: <BadConfigPreview />,
                },
              ]} />
            </div>
          ),
        },
        {
          key: 'steps',
          label: '操作步骤',
          children: <StepsGuide />,
        },
        {
          key: 'structure',
          label: '目录结构',
          children: (
            <div>
              <Paragraph>
                一个典型的 React 组件 npm 包的目录结构如下。注意<Text strong> src/ </Text>
                和<Text strong> dist/ </Text>的分离。
              </Paragraph>
              <div style={{
                background: '#f6f8fa',
                border: '1px solid #d0d7de',
                borderRadius: 8,
                padding: '16px 24px',
              }}>
                <TreeView items={PACKAGE_STRUCTURE} />
              </div>
              <Alert
                type="info"
                showIcon
                message="关键原则"
                description="src/ 是源码（开发者编写），dist/ 是构建产物（使用者引用）。npm publish 只发布 dist/ + package.json + README，不包含 src/。"
                style={{ marginTop: 16 }}
              />
            </div>
          ),
        },
      ]} />
    </Card>
  );
};

export default LiveDemo;
