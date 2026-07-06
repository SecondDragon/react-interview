import { useMemo } from 'react';
import type { ItemPosition } from './useSizeMeasurer';

interface ChunkMapConfig {
  chunkSize: number;
  overscan: number;
}

export function useChunkMap(positions: ItemPosition[], config: ChunkMapConfig) {
  const { chunkSize, overscan } = config;

  const chunksMap = useMemo(() => {
    const map = new Map<number, Set<number>>();

    positions.forEach((pos, idx) => {
      const startChunk = Math.floor(pos.top / chunkSize);
      const endChunk = Math.floor(pos.bottom / chunkSize);

      for (let c = startChunk; c <= endChunk; c++) {
        if (!map.has(c)) {
          map.set(c, new Set());
        }
        map.get(c)!.add(idx);
      }
    });

    return map;
  }, [positions, chunkSize]);

  const getVisibleIndices = (
    scrollTop: number,
    viewportHeight: number
  ): number[] => {
    if (viewportHeight === 0) return [];

    const startChunk = Math.floor((scrollTop - overscan) / chunkSize);
    const endChunk = Math.floor(
      (scrollTop + viewportHeight + overscan) / chunkSize
    );

    const indicesSet = new Set<number>();
    for (let c = startChunk; c <= endChunk; c++) {
      const chunk = chunksMap.get(c);
      if (chunk) {
        chunk.forEach((idx) => indicesSet.add(idx));
      }
    }

    return Array.from(indicesSet).sort((a, b) => a - b);
  };

  return { getVisibleIndices };
}
