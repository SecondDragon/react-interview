import React, { memo } from 'react';
import { Form, Input, Select, DatePicker, InputNumber } from 'antd';
import type { FormInstance } from 'antd';

export type ComponentType = 'Input' | 'Select' | 'DatePicker' | 'InputNumber';

// JSON Schema 的数据结构定义
export interface FormSchemaItem {
  type: ComponentType;
  name: string;
  label: string;
  required?: boolean;
  message?: string;
  props?: Record<string, any>;
  options?: { label: string; value: any }[];
  visibleOn?: {
    field: string;
    value: any;
  };
}

export interface DynamicFormGeneratorProps {
  schema: FormSchemaItem[];
  form: FormInstance;
  onFinish?: (values: any) => void;
  initialValues?: any;
}

// 核心渲染函数，根据 type 渲染对应的 UI 组件
const renderComponent = (item: FormSchemaItem) => {
  switch (item.type) {
    case 'Input':
      return <Input placeholder={`请输入${item.label}`} {...item.props} />;
    case 'Select':
      return <Select placeholder={`请选择${item.label}`} options={item.options} {...item.props} />;
    case 'DatePicker':
      return <DatePicker style={{ width: '100%' }} {...item.props} />;
    case 'InputNumber':
      return <InputNumber style={{ width: '100%' }} {...item.props} />;
    default:
      return null;
  }
};

// 使用 memo 避免由于父组件无关更新导致的额外渲染
const DynamicFormGenerator: React.FC<DynamicFormGeneratorProps> = memo(
  ({ schema, form, onFinish, initialValues }) => {
    return (
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={initialValues}>
        {schema.map((item) => {
          // 处理动态联动逻辑
          if (item.visibleOn) {
            return (
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues[item.visibleOn!.field] !== currentValues[item.visibleOn!.field]
                }
                key={item.name}
              >
                {({ getFieldValue }) => {
                  // 如果当前依赖字段的值不等于所要求的值，则不渲染当前 Item
                  const isVisible = getFieldValue(item.visibleOn!.field) === item.visibleOn!.value;
                  if (!isVisible) return null;

                  return (
                    <Form.Item
                      name={item.name}
                      label={item.label}
                      rules={[
                        {
                          required: item.required,
                          message: item.message || `${item.label}是必填项`,
                        },
                      ]}
                    >
                      {renderComponent(item)}
                    </Form.Item>
                  );
                }}
              </Form.Item>
            );
          }

          // 默认无联动的普通渲染
          return (
            <Form.Item
              key={item.name}
              name={item.name}
              label={item.label}
              rules={[
                { required: item.required, message: item.message || `${item.label}是必填项` },
              ]}
            >
              {renderComponent(item)}
            </Form.Item>
          );
        })}
      </Form>
    );
  }
);

export default DynamicFormGenerator;
