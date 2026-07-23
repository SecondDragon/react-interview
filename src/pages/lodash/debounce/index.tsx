import { Tabs } from 'antd';
import SimpleContent from './simple.mdx';
import ComplexContent from './complex.mdx';
import CompleteContent from './complete.mdx';
import React, { useState } from 'react';
import { debounceVersions } from './data';

const DebouncePage: React.FC = () => {
  const [activeKey, setActiveKey] = useState('simple');

  const items = [
    {
      key: 'simple',
      label: debounceVersions[0].label,
      children: <SimpleContent />,
    },
    {
      key: 'complex',
      label: debounceVersions[1].label,
      children: <ComplexContent />,
    },
    {
      key: 'complete',
      label: debounceVersions[2].label,
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

export default DebouncePage;
