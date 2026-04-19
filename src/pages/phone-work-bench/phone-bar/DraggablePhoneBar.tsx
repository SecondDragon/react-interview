import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PhoneBar } from './phone-bar';
import { usePhoneStore } from './usePhoneStore';

const DraggablePhoneBar: React.FC = () => {
  const { position, setPosition } = usePhoneStore();
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 使用 ref 记录拖拽状态和位置，避免高频触发 re-render
  const dragInfo = useRef({
    startX: 0,
    startY: 0,
    startPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 },
    rafId: 0
  });

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;

    // 交互元素检查
    const target = e.target as HTMLElement;
    const isInteractive = (el: HTMLElement | null): boolean => {
      if (!el) return false;
      const tagName = el.tagName.toLowerCase();
      const isAntdInteractive = el.closest('.ant-btn, .ant-select, .ant-input, .ant-checkbox, .ant-radio, .ant-switch, .ant-modal');
      if (tagName === 'button' || tagName === 'input' || tagName === 'select' || tagName === 'textarea' || isAntdInteractive) {
        return true;
      }
      return isInteractive(el.parentElement);
    };

    if (isInteractive(target)) return;

    // 获取当前真实位置
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // 记录初始点击位置和组件位置
    dragInfo.current.startX = e.pageX;
    dragInfo.current.startY = e.pageY;
    dragInfo.current.startPos = { x: rect.left, y: rect.top };
    dragInfo.current.currentPos = { x: rect.left, y: rect.top };

    setIsDragging(true);
    e.preventDefault(); // 阻止默认行为（如文字选中）
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    // 计算新位置
    const deltaX = e.pageX - dragInfo.current.startX;
    const deltaY = e.pageY - dragInfo.current.startY;

    let nextX = dragInfo.current.startPos.x + deltaX;
    let nextY = dragInfo.current.startPos.y + deltaY;

    // 边界检查
    const el = containerRef.current;
    if (el) {
      const { innerWidth, innerHeight } = window;
      const { offsetWidth, offsetHeight } = el;

      // 限制在视口内
      nextX = Math.max(0, Math.min(nextX, innerWidth - offsetWidth));
      nextY = Math.max(0, Math.min(nextY, innerHeight - offsetHeight));
    }

    dragInfo.current.currentPos = { x: nextX, y: nextY };

    // 使用 requestAnimationFrame 优化性能
    cancelAnimationFrame(dragInfo.current.rafId);
    dragInfo.current.rafId = requestAnimationFrame(() => {
      setPosition(dragInfo.current.currentPos);
    });
  }, [isDragging, setPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    cancelAnimationFrame(dragInfo.current.rafId);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      cancelAnimationFrame(dragInfo.current.rafId);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 样式处理
  const isInitial = position.x === 0 && position.y === 0;

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 1000,
    cursor: isDragging ? 'move' : 'default',
    // 拖拽时不使用 transition 保证跟手感，不拖拽时保留微弱 transition 增加平滑度
    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
    willChange: 'transform', // 开启硬件加速

    ...(isInitial ? {
      top: '0px',
      left: '50%',
      transform: 'translateX(-50%)',
    } : {
      top: 0,
      left: 0,
      transform: `translate3d(${position.x}px, ${position.y}px, 0)`, // 使用 translate3d 性能更好
    })
  };

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      onMouseDown={onMouseDown}
    >
      <PhoneBar />
    </div>
  );
};

export default DraggablePhoneBar;
