import React from 'react';
import { Table } from 'antd';
import CodeDiff from '@/components/CodeDiff';
import { globalStateApiTable } from './data';
import initGlobalState from './demos/init-global-state.tsx?raw';
import onGlobalStateChange from './demos/on-global-state-change.tsx?raw';
import setGlobalState from './demos/set-global-state.tsx?raw';
import offGlobalStateChange from './demos/off-global-state-change.tsx?raw';

const GlobalStateSection: React.FC = () => {
  return (
    <section>
      <CodeDiff oldValue={initGlobalState} newValue={initGlobalState} leftTitle="" rightTitle="✅ initGlobalState 基本用法" type="error" hideDiffMarkers={true} />

      <CodeDiff oldValue={onGlobalStateChange} newValue={onGlobalStateChange} leftTitle="" rightTitle="✅ onGlobalStateChange 订阅" type="error" hideDiffMarkers={true} />

      <CodeDiff oldValue={setGlobalState} newValue={setGlobalState} leftTitle="" rightTitle="✅ setGlobalState 修改" type="error" hideDiffMarkers={true} />

      <CodeDiff oldValue={offGlobalStateChange} newValue={offGlobalStateChange} leftTitle="" rightTitle="✅ offGlobalStateChange 取消订阅" type="error" hideDiffMarkers={true} />
    </section>
  );
};

export default GlobalStateSection;
