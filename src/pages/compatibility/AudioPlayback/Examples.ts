/**
 * AudioPlayback 示例代码
 * 用于展示原生 Audio 与自定义 AudioPlayer 的对比
 */

export const AudioPlaybackExamples = {
  bad: `// 反面教材：使用原生 controls，样式难以统一且交互受限
<audio 
  controls 
  src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
  style={{ width: '100%' }}
/>`,

  good: `// 最佳实践：封装自定义 AudioPlayer 组件
import { AudioPlayer } from '../phone-work-bench/call-center/AudioPlayer';

const Demo = () => (
  <AudioPlayer src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" />
);`,
};
