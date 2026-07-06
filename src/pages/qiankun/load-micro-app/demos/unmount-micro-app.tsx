// ✅ 手动卸载：精细控制卸载时机

import { loadMicroApp } from 'qiankun';
import { useState, useRef } from 'react';

function useManagedMicroApp(config: any) {
  const [status, setStatus] = useState<string>('none');
  const appRef = useRef<any>(null);

  const mount = () => {
    if (!appRef.current) {
      appRef.current = loadMicroApp(config);
    }
    setStatus('mounted');
  };

  const unmount = () => {
    if (appRef.current) {
      appRef.current.unmount();
      appRef.current = null;
    }
    setStatus('unmounted');
  };

  const update = (props: any) => {
    if (appRef.current) {
      appRef.current.update({ props });
    }
  };

  return { mount, unmount, update, status };
}
