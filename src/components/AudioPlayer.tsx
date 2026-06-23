import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Flex, Slider, Typography } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface AudioPlayerProps {
  src: string;
}

/** 将秒数格式化为 mm:ss */
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 创建 / 切换音频对象
  useEffect(() => {
    // 重置所有状态
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setLoading(true);
    setError(false);

    const audio = new Audio(src);
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoading(false);
    };
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onError = () => {
      setError(true);
      setLoading(false);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audioRef.current = null;
    };
  }, [src]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || loading) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
      setError(false);
    } catch {
      // 浏览器 autoplay 策略拦截
      setIsPlaying(false);
    }
  }, [isPlaying, loading]);

  const handleSliderChange = useCallback((value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  }, []);

  const tooltipFormatter = useCallback((val?: number) => formatTime(val ?? 0), []);

  return (
    <PlayerWrapper align="center" gap={8}>
      {loading ? (
        <LoadingIcon spin />
      ) : error ? (
        <ErrorText type="danger">加载失败</ErrorText>
      ) : isPlaying ? (
        <PauseIcon onClick={togglePlay} />
      ) : (
        <PlayIcon onClick={togglePlay} />
      )}

      <Slider
        min={0}
        max={duration || 100}
        value={currentTime}
        onChange={handleSliderChange}
        disabled={loading || error}
        style={{ flex: 1, margin: '0 4px' }}
        tooltip={{ formatter: tooltipFormatter }}
      />

      <TimeText>
        {formatTime(currentTime)} / {formatTime(duration)}
      </TimeText>
    </PlayerWrapper>
  );
};

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
  &:hover {
    color: #2563eb;
    transform: scale(1.1);
  }
`;

const PauseIcon = styled(PauseCircleOutlined)`
  font-size: 1.25rem;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    color: #2563eb;
    transform: scale(1.1);
  }
`;

const LoadingIcon = styled(LoadingOutlined)`
  font-size: 1.25rem;
  color: #9ca3af;
`;

const ErrorText = styled(Text)`
  font-size: 0.8rem;
  min-width: 56px;
`;

const TimeText = styled(Text)`
  font-size: 0.75rem;
  color: #6b7280;
  min-width: 85px;
  text-align: right;
  font-variant-numeric: tabular-nums;
`;
