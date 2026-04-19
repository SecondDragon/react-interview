import type { FormSchemaItem } from './DynamicFormGenerator';

export const defaultSchema: FormSchemaItem[] = [
  {
    type: 'Input',
    name: 'username',
    label: '用户名',
    required: true,
  },
  {
    type: 'Select',
    name: 'userType',
    label: '用户类型',
    required: true,
    options: [
      { label: '个人用户', value: 'personal' },
      { label: '企业用户', value: 'enterprise' },
    ],
  },
  {
    type: 'Input',
    name: 'taxId',
    label: '企业税号',
    required: true,
    visibleOn: {
      field: 'userType',
      value: 'enterprise',
    },
    message: '选择企业用户时，必须填写企业税号',
  },
  {
    type: 'DatePicker',
    name: 'registerDate',
    label: '注册日期',
    required: true,
  },
];

export const defaultCode = `// 示例代码归属于 @src/pages/components-encapsulation/DynamicForm 组件
import React from 'react';
import { Form, Button } from 'antd';
import DynamicFormGenerator, { FormSchemaItem } from './DynamicFormGenerator';

// 1. 定义 JSON Schema
const schema: FormSchemaItem[] = [
  {
    type: 'Input',
    name: 'username',
    label: '用户名',
    required: true,
  },
  {
    type: 'Select',
    name: 'userType',
    label: '用户类型',
    required: true,
    options: [
      { label: '个人用户', value: 'personal' },
      { label: '企业用户', value: 'enterprise' },
    ],
  },
  // 联动项配置
  {
    type: 'Input',
    name: 'taxId',
    label: '企业税号',
    required: true,
    visibleOn: { // 当 userType 的值为 enterprise 时显示
      field: 'userType',
      value: 'enterprise',
    },
  }
];

// 2. 在业务组件中使用
const App = () => {
  const [form] = Form.useForm();

  return (
    <>
      <DynamicFormGenerator schema={schema} form={form} />
      <Button onClick={() => form.submit()}>提交</Button>
    </>
  );
};
`;
