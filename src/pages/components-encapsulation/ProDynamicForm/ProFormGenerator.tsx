import React, { memo } from 'react';
import { Form, Input, Select, DatePicker, InputNumber } from 'antd';
import type { FormInstance, Rule } from 'antd/es/form';

// 1. 组件注册中心 (Widget Registry)
// 保持注册机制不变，这依然是高扩展性的核心
// eslint-disable-next-line react-refresh/only-export-components, @typescript-eslint/no-explicit-any
export const widgetRegistry: Record<string, React.FC<any>> = {
  Input,
  Select,
  DatePicker,
  InputNumber,
  TextArea: Input.TextArea,
};

// 2. 增强的 Schema 协议定义 (使用函数替代字符串表达式)
export interface ProSchemaItem {
  widget: string;             // 映射到注册中心的组件名
  name: string;               // 字段名
  label: string;              // 标题
  props?: Record<string, any>;// 组件的透传属性
  rules?: Rule[];             // 校验规则
  // 最佳实践演进：对于纯前端维护的 Schema，直接使用纯函数，享受完美的 TS 类型推导和极速的执行性能
  hidden?: boolean | ((values: any) => boolean);  
  disabled?: boolean | ((values: any) => boolean);
  // 性能优化：声明该节点依赖哪些字段，仅当依赖字段变更时才触发重新求值和渲染
  dependencies?: string[];    
}

export interface ProFormGeneratorProps {
  schema: ProSchemaItem[];
  form: FormInstance;
  onFinish?: (values: any) => void;
  initialValues?: any;
}

// 渲染单个表单项的内部组件
const FormItemRender: React.FC<{ item: ProSchemaItem }> = ({ item }) => {
  const Widget = widgetRegistry[item.widget];
  
  if (!Widget) {
    return <div style={{ color: 'red' }}>未找到已注册的组件：{item.widget}</div>;
  }

  const isDynamic = typeof item.hidden === 'function' || typeof item.disabled === 'function';

  // 如果包含函数，说明这是个动态联动节点
  if (isDynamic) {
    return (
      <Form.Item
        noStyle
        // 性能核心：利用 shouldUpdate 与 dependencies 精确控制该联动节点是否需要重新渲染
        shouldUpdate={(prevValues, currentValues) => {
          if (!item.dependencies || item.dependencies.length === 0) return true;
          // 只有当声明的依赖项发生值变化时，才触发当前项的 re-render
          return item.dependencies.some(dep => prevValues[dep] !== currentValues[dep]);
        }}
      >
        {({ getFieldsValue }) => {
          const values = getFieldsValue();
          
          // 直接执行函数计算布尔值，极致的性能与调试体验
          const isHidden = typeof item.hidden === 'function' ? item.hidden(values) : item.hidden;
          const isDisabled = typeof item.disabled === 'function' ? item.disabled(values) : item.disabled;

          if (isHidden) return null;

          return (
            <Form.Item name={item.name} label={item.label} rules={item.rules}>
              <Widget {...item.props} disabled={isDisabled} />
            </Form.Item>
          );
        }}
      </Form.Item>
    );
  }

  // 纯静态节点的渲染逻辑，直接返回，避免 shouldUpdate 开销
  if (item.hidden === true) return null;

  return (
    <Form.Item name={item.name} label={item.label} rules={item.rules}>
      <Widget {...item.props} disabled={item.disabled as boolean} />
    </Form.Item>
  );
};

// 使用 memo 避免由于父组件无关更新导致的额外渲染
const ProFormGenerator: React.FC<ProFormGeneratorProps> = memo(({ schema, form, onFinish, initialValues }) => {
  return (
    <Form form={form} layout="vertical" onFinish={onFinish} initialValues={initialValues}>
      {schema.map((item) => (
        <FormItemRender key={item.name} item={item} />
      ))}
    </Form>
  );
});

export default ProFormGenerator;
