import { useRef } from 'react';

const POOL_SIZE = 80;

interface UseMessagePoolReturn {
  getSlotIndex: (messageIndex: number) => number;
  getSlotKey: (slotIndex: number) => string;
}

export function useMessagePool(): UseMessagePoolReturn {
  const poolRef = useRef({
    size: POOL_SIZE,
  });

  const getSlotIndex = (messageIndex: number): number => {
    return messageIndex % poolRef.current.size;
  };

  const getSlotKey = (slotIndex: number): string => {
    return `slot-${slotIndex}`;
  };

  return {
    getSlotIndex,
    getSlotKey,
  };
}
