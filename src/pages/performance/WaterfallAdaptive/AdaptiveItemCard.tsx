import React from 'react';
import { Tag, Avatar, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { WaterfallItem, Position } from './useAdaptiveWaterfall';

const AdaptiveItemCard: React.FC<{
  itemWidth: number;
  slotIdx: number;
  item: WaterfallItem;
  pos: Position;
  dataIdx: number;
  onImageHeightReport?: (dataIdx: number, height: number) => void;
}> = ({ itemWidth, slotIdx, item, pos, dataIdx, onImageHeightReport }) => {
  return (
    <div
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
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #eee',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 4, right: 4, zIndex: 10 }}>
        <Tag color="orange" style={{ fontSize: 10, margin: 0 }}>
          插槽 #{slotIdx}
        </Tag>
      </div>

      <Space align="start" style={{ width: '100%', marginBottom: 8 }}>
        <Avatar
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${dataIdx}`}
          icon={<UserOutlined />}
          size="small"
        />
        <div style={{ fontWeight: 'bold', fontSize: 14, color: '#222', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: itemWidth - 70 }}>
          {item.title}
        </div>
      </Space>

      {item.image && (
        <div
          style={{
            width: '100%',
            height: pos.imageHeight,
            backgroundColor: item.color || '#f0f0f0',
            borderRadius: 8,
            marginBottom: 8,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <img
            src={item.image}
            alt="feed"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                onImageHeightReport?.(dataIdx, (img.naturalHeight / img.naturalWidth) * itemWidth);
              }
            }}
          />
        </div>
      )}

      <div
        style={{
          fontSize: 12,
          color: '#444',
          lineHeight: 1.5,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          flex: 1,
        }}
      >
        {item.content}
      </div>

      {item.tags && item.tags.length > 0 && (
        <Space size="small" wrap style={{ marginTop: 8 }}>
          {item.tags.map((tag) => (
            <Tag key={tag} style={{ fontSize: 10, margin: 0 }}>
              {tag}
            </Tag>
          ))}
        </Space>
      )}

      <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
        #{dataIdx}
      </div>
    </div>
  );
};

export default AdaptiveItemCard;
