'use client';

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Flex, Slider, Typography } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const PlayerWrapper = styled(Flex)`
  margin-top: 0.75rem;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const PlayIcon = styled(PlayCircleOutlined)`
  font-size: 1.25rem;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { color: #2563eb; transform: scale(1.1); }
`;

const PauseIcon = styled(PauseCircleOutlined)`
  font-size: 1.25rem;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { color: #2563eb; transform: scale(1.1); }
`;

const TimeText = styled(Text)`
  font-size: 0.75rem;
  color: #6b7280;
  min-width: 85px;
  text-align: right;
  font-variant-numeric: tabular-nums;
`;

interface AudioPlayerProps {
  src?: string;
  id?: string;
  activeId?: string | null;
  onPlay?: (id: string) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, id, activeId, onPlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 监听外部 activeId 变化，实现互斥播放
  useEffect(() => {
    if (activeId !== undefined && activeId !== id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  }, [activeId, id, isPlaying]);

  // 格式化时间函数
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!src) return;
    
    const audio = new Audio(src);
    audioRef.current = audio;

    const onLoadedMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audioRef.current = null;
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // 开始播放时，如果提供了 id，则触发 onPlay
      if (id && onPlay) {
        onPlay(id);
      }
      audioRef.current.play().catch(err => console.error('播放失败:', err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (value: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  return (
    <PlayerWrapper align="center" gap={8} onClick={(e) => e.stopPropagation()}>
      {isPlaying ? (
        <PauseIcon onClick={togglePlay} />
      ) : (
        <PlayIcon onClick={togglePlay} />
      )}
      <Slider
        min={0}
        max={duration || 100}
        value={currentTime}
        onChange={handleSliderChange}
        style={{ flex: 1, margin: '0 4px' }}
        tooltip={{ formatter: (val) => formatTime(val || 0) }}
      />
      <TimeText>
        {formatTime(currentTime)} / {formatTime(duration)}
      </TimeText>
    </PlayerWrapper>
  );
};
