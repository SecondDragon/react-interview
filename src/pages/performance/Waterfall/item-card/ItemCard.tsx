import React from 'react';
import { Tag } from 'antd';
import { type WaterfallItem } from '../useProWaterfall.ts';
import { type Position } from '../useWaterfall.ts';

const ItemCard: React.FC<{
  itemWidth: number;
  slotIdx: number;
  item: WaterfallItem;
  pos: Position;
  dataIdx: number;
  key: string;
}> = ({ itemWidth, slotIdx, item, pos, dataIdx, key }) => {
  return (
    <div
      key={`${key}`} // 【关键】：Key 是槽位索引，保持 DOM 节点物理上的长生不老
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: itemWidth,
        height: pos.itemHeight,
        transform: `translate3d(${pos.left}px, ${pos.top}px, 0)`,
        willChange: 'transform',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        boxSizing: 'border-box',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        // 移除 transition 以防止节点复用时的“瞬移抖动”
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #eee',
      }}
    >
      {/* 槽位编号指示器：展示复用效果 */}
      <div style={{ position: 'absolute', top: 4, right: 4, zIndex: 10 }}>
        <Tag color="orange" style={{ fontSize: 10, margin: 0 }}>
          插槽 #{slotIdx}
        </Tag>
      </div>

      <div
        style={{
          width: '100%',
          height: pos.scaledImgHeight,
          backgroundColor: item.color,
          borderRadius: 8,
          marginBottom: 10,
          overflow: 'hidden',
        }}
      >
        <img
          src={item.imgUrl}
          alt={'/'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div style={{ fontWeight: 'bold', fontSize: 14, color: '#222' }}>{item.title}</div>
      <div style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>
        数据源索引: <b style={{ color: '#52c41a' }}>#{dataIdx}</b>
      </div>
    </div>
  );
};
export default ItemCard;
