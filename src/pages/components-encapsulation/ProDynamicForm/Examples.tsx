import React from 'react';
import type { ProSchemaItem } from './ProFormGenerator';
import { widgetRegistry } from './ProFormGenerator';
import { Tag, Typography } from 'antd';
import { div } from 'big.js';

const { Text } = Typography;

// --------------------------------------------------------------------------
// 🔥 核心演示：业务方主动向注册中心注入自定义组件
// 哪怕是一个普通的第三方组件，或者是你们公司自己封装的极度复杂的组件，
// 都不需要修改底层 ProFormGenerator 引擎的任何代码，直接在这里“登记户口”即可！
// --------------------------------------------------------------------------

// 1. 自定义组件 A：角色选择标签 (CustomRolePicker)
// eslint-disable-next-line react-refresh/only-export-components
const MyCustomRolePicker: React.FC<{
  value?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  const roles = [
    { label: '超级管理员', value: 'admin', color: 'red' },
    { label: '内容运营', value: 'editor', color: 'orange' },
    { label: '核心研发', value: 'dev', color: 'blue' },
    { label: '交互设计', value: 'design', color: 'magenta' },
  ];

  return (
    <div style={{ display: 'flex', gap: '8px', opacity: disabled ? 0.5 : 1 }}>
      {roles.map((role) => (
        <Tag.CheckableTag
          key={role.value}
          checked={value === role.value}
          onChange={() => !disabled && onChange?.(role.value)}
          style={{
            border: '1px solid #d9d9d9',
            padding: '4px 12px',
            backgroundColor: value === role.value ? '' : '#fafafa',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {role.label}
        </Tag.CheckableTag>
      ))}
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const MyCustomRolePicker = (value?: string, onChange?: (val: string) => void,disabled?: boolean) => {
//   const roles = [
//     { label: '超级管理员', value: 'admin', color: 'red' },
//     { label: '内容运营', value: 'editor', color: 'orange' },
//     { label: '核心研发', value: 'dev', color: 'blue' },
//     { label: '交互设计', value: 'design', color: 'magenta' },
//   ];
//
//     return (<div>
//
//
//     </div>);
// };

// 2. 自定义组件 B：星级评分 (StarRating)
// 遵守 Antd 契约：必须有 value 和 onChange 两个 Props
// eslint-disable-next-line react-refresh/only-export-components
const MyStarRating: React.FC<{
  value?: number;
  onChange?: (v: number) => void;
  max?: number;
  disabled?: boolean;
}> = ({ value = 0, onChange, max = 5, disabled }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ fontSize: '24px', cursor: disabled ? 'not-allowed' : 'pointer' }}>
        {[...Array(max)].map((_, i) => (
          <span
            key={i}
            onClick={() => !disabled && onChange?.(i + 1)}
            style={{
              color: i < value ? '#fadb14' : '#f0f0f0',
              transition: 'all 0.2s',
              marginRight: '4px',
              userSelect: 'none',
            }}
          >
            ★
          </span>
        ))}
      </div>
      <Text type="secondary">{value > 0 ? `${value} 分` : '未评分'}</Text>
    </div>
  );
};

// 将我们的自定义组件注册到全局“字典”中
widgetRegistry['CustomRolePicker'] = MyCustomRolePicker;
widgetRegistry['StarRating'] = MyStarRating;

// --------------------------------------------------------------------------
// 业务 Schema 定义
// --------------------------------------------------------------------------
export const bestPracticeSchema: ProSchemaItem[] = [
  {
    widget: 'Input',
    name: 'username',
    label: '用户名',
    rules: [{ required: true, message: '请输入用户名' }],
    props: { placeholder: '请输入你的名称' },
  },
  {
    // 🔥 这里直接使用刚刚注册的名字，底层的引擎就会去自动拉取那个 React 函数组件渲染！
    widget: 'CustomRolePicker',
    name: 'systemRole',
    label: '系统权限角色 (演示外部注册机制)',
    rules: [{ required: true, message: '角色不能为空' }],
  },
  {
    widget: 'StarRating',
    name: 'satisfaction',
    label: '服务满意度体验 (演示 Props 透传)',
    props: { max: 10},
    hidden: (values) => values.userType !== 'enterprise',
    rules: [{ required: true, message: '请打分' }],
  },
  {
    widget: 'Select',
    name: 'userType',
    label: '用户类型',
    rules: [{ required: true, message: '请选择用户类型' }],
    props: {
      placeholder: '请选择',
      options: [
        { label: '普通用户 (个人)', value: 'personal' },
        { label: '企业用户 (含政府)', value: 'enterprise' },
        { label: 'VIP 客户', value: 'vip' },
      ],
    },
  },
  {
    widget: 'Input',
    name: 'taxId',
    label: '企业税号',
    rules: [{ required: true, message: '企业用户必须填写税号' }],
    // 回归纯前端最佳实践：直接使用 JS 函数，享受完美的 TS 类型推导和极速执行
    hidden: (values) => values.userType !== 'enterprise',
    // 性能优化：声明依赖项。只有在 userType 改变时，才重新运行函数
    dependencies: ['userType'],
    props: { placeholder: '请输入统一社会信用代码' },
  },
  {
    widget: 'TextArea',
    name: 'vipRemarks',
    label: 'VIP 专属需求备注',
    hidden: (values) => values.userType !== 'vip',
    dependencies: ['userType'],
    props: { placeholder: 'VIP 客户可以填写您的专属服务需求...', rows: 4 },
  },
  {
    widget: 'Select',
    name: 'contractType',
    label: '合同模板类型',
    // 这里演示 disabled 属性的动态函数计算
    disabled: (values) => !values.userType || values.userType === 'personal',
    dependencies: ['userType'],
    props: {
      placeholder: '仅限企业和VIP可选',
      options: [
        { label: '标准版服务协议', value: 'standard' },
        { label: '定制版服务协议', value: 'custom' },
      ],
    },
  },
];

export const bestPracticeCode = `// 示例代码归属于 @src/pages/components-encapsulation/ProDynamicForm 组件
import React from 'react';
import { Form, Button } from 'antd';
import ProFormGenerator, { ProSchemaItem } from './ProFormGenerator';

// 1. 定义遵守纯前端最佳实践的 Schema
// 支持 Widget 注册、原生 JS 函数处理联动
const schema: ProSchemaItem[] = [
  {
    widget: 'Select', // 使用全局注册表映射
    name: 'userType',
    label: '用户类型',
    props: { options: [{ label: '个人', value: '1' }, { label: '企业', value: '2' }] }
  },
  {
    widget: 'Input',
    name: 'taxId',
    label: '税号',
    // 采用原生 JS 纯函数处理联动，支持任意复杂度的前端逻辑，对 TS 极度友好
    hidden: (values) => values.userType !== "2",
    // 精细化依赖声明，大幅度优化渲染性能
    dependencies: ['userType']
  }
];

const App = () => {
  const [form] = Form.useForm();
  return (
    <>
      <ProFormGenerator schema={schema} form={form} />
      <Button onClick={() => form.submit()}>提交</Button>
    </>
  );
};
`;
