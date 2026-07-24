// ❌ 反面教材：ETag 只基于文件路径生成，内容变化后 ETag 不变
const express = require('express');
const app = express();

app.get('/api/config', (req, res) => {
  // 无论内容怎么变，ETag 始终是 "config"
  res.setHeader('ETag', '"config"');
  res.json({ version: '1.0.0' });
});
