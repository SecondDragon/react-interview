import { Tabs } from 'antd';
import SimpleContent from './simple.mdx';
import ComplexContent from './complex.mdx';
import CompleteContent from './complete.mdx';
import React, { useState } from 'react';
import { throttleVersions } from './data';

const ThrottlePage: React.FC = () => {
  const [activeKey, setActiveKey] = useState('simple');

  const items = [
    {
      key: 'simple',
      label: throttleVersions[0].label,
      children: <SimpleContent />,
    },
    {
      key: 'complex',
      label: throttleVersions[1].label,
      children: <ComplexContent />,
    },
    {
      key: 'complete',
      label: throttleVersions[2].label,
      children: <CompleteContent />,
    },
  ];

  return (
    <div>
      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        items={items}
        type="card"
        style={{ marginBottom: '24px' }}
      />
    </div>
  );
};

export default ThrottlePage;
