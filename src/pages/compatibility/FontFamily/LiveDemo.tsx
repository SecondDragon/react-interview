import React, { useState } from 'react';
import { Radio, Input, Typography } from 'antd';
import { fontOptions, defaultDemoText } from './data';

const { Title } = Typography;
const { TextArea } = Input;

/**
 * 字体栈切换 Live Demo
 */
const FontFamilyLiveDemo: React.FC = () => {
  const [currentFontStack, setCurrentFontStack] = useState('best-practice');
  const currentOption = fontOptions.find((opt) => opt.value === currentFontStack) || fontOptions[2];

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Radio.Group
          value={currentFontStack}
          onChange={(e) => setCurrentFontStack(e.target.value)}
          buttonStyle="solid"
        >
          {fontOptions.map((opt) => (
            <Radio.Button key={opt.value} value={opt.value}>
              {opt.label}
            </Radio.Button>
          ))}
        </Radio.Group>
      </div>
      <div
        style={{
          padding: '20px',
          background: '#fff',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          fontFamily: currentOption.stack,
        }}
      >
        <Title level={4}>中西文排版对比测试：Hello Font! 12345</Title>
        <TextArea
          defaultValue={defaultDemoText}
          variant="borderless"
          style={{ fontFamily: 'inherit', fontSize: '16px', color: '#1890ff' }}
        />
      </div>
    </div>
  );
};

export default FontFamilyLiveDemo;
