// ✅ 最佳实践：ETag 基于响应体内容哈希生成
const crypto = require('crypto');
const express = require('express');
const app = express();

function generateETag(body) {
  return '"' + crypto.createHash('md5').update(body).digest('hex') + '"';
}

app.get('/api/config', (req, res) => {
  const body = JSON.stringify({ version: '1.0.0' });
  const etag = generateETag(body);

  if (req.headers['if-none-match'] === etag) {
    res.status(304).end();
    return;
  }

  res.setHeader('ETag', etag);
  res.send(body);
});
