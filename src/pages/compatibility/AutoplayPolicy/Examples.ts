/**
 * 自动播放限制案例元数据
 */
export const AutoplayExamples = {
  title: "多端媒体自动播放限制",
  reason: "现代系统严禁无交互自动播放有声媒体。",
  phenomenon: "背景音乐不响，控制台抛出 NotAllowedError。",
  bad: "audioRef.current.play();",
  good: `audioRef.current.muted = true;
audioRef.current.play().catch(err => {
  // 引导用户点击解锁
});`
};
