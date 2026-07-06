import { useEffect } from 'react';

interface PrefetchRoute {
  idlePrefetch?: boolean;
  importFn?: () => Promise<unknown>;
  children?: PrefetchRoute[];
}

interface IdlePrefetchProps {
  routes: PrefetchRoute[];
  timeout?: number;
}

function collectImporters(routes: PrefetchRoute[]): (() => Promise<unknown>)[] {
  const importers: (() => Promise<unknown>)[] = [];
  const walk = (list: PrefetchRoute[]) => {
    for (const route of list) {
      if (route.idlePrefetch && route.importFn) {
        importers.push(route.importFn);
      }
      if (route.children) {
        walk(route.children);
      }
    }
  };
  walk(routes);
  return importers;
}

export default function IdlePrefetch({ routes, timeout = 3000 }: IdlePrefetchProps) {
  const importers = collectImporters(routes);

  useEffect(() => {
    if (importers.length === 0) return;

    const requestIdle = window.requestIdleCallback || ((cb: IdleRequestCallback) => {
      const id = setTimeout(() => cb({ didTimeout: true, timeRemaining: () => 0 }), 1);
      return id as unknown as number;
    });
    const cancelIdle = window.cancelIdleCallback || clearTimeout;

    const idleId = requestIdle(
      () => {
        importers.forEach((importer) => {
          importer().catch(() => {
            // 预取失败无需处理，用户导航时仍会正常发起请求
          });
        });
      },
      { timeout }
    );

    return () => cancelIdle(idleId);
  }, [importers, timeout]);

  return null;
}
