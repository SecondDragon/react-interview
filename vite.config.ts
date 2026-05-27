import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * 模拟 SSE 端点：逐字符/逐词推送，模拟真实大模型流式输出
 *
 * 关键行为：
 * 1. 把每张卡片的完整内容拆成 1-3 个字符的小片段
 * 2. 打乱所有片段的顺序，模拟服务端并发输出多张卡片
 * 3. 以 30-80ms 的间隔高速推送，模拟真实流式体验
 */
function mockSSEPlugin(): Plugin {
  return {
    name: 'mock-sse',
    configureServer(server) {
      server.middlewares.use('/api/sse', (req, res) => {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        });

        // 4 张卡片的完整内容
        const fullMessages: Record<string, string> = {
          Apple: '**苹果公司**（Apple Inc.）是一家美国科技公司，总部位于加州库比蒂诺。主要产品包括 iPhone、iPad、Mac 等。',
          Microsoft: '**微软**（Microsoft）是全球最大的软件公司之一。旗下产品有 Windows 操作系统、Office 办公套件、Azure 云服务。',
          Tesla: '**特斯拉**（Tesla）是一家电动汽车及清洁能源公司。Model 3 是全球最畅销的电动车之一。',
          NVIDIA: '**英伟达**（NVIDIA）是全球 GPU 领导者，其 GPU 被广泛应用于 AI 训练与推理中。',
        };

        // 把每条内容拆成 1-3 个字符的小片段
        const tables = Object.keys(fullMessages);
        const fragments: { table: string; content: string; type: 'answer' }[] = [];

        for (const table of tables) {
          const text = fullMessages[table];
          let pos = 0;
          while (pos < text.length) {
            const len = 1 + Math.floor(Math.random() * 3);
            fragments.push({
              table,
              content: text.slice(pos, pos + len),
              type: 'answer',
            });
            pos += len;
          }
        }

        // 打乱顺序：模拟服务端并发输出多张卡片
        for (let i = fragments.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [fragments[i], fragments[j]] = [fragments[j], fragments[i]];
        }

        // 末尾加上 final 消息
        const finalMessage = {
          ids: [
            { table: 'Apple', id: 'AAPL' },
            { table: 'Microsoft', id: 'MSFT' },
            { table: 'Tesla', id: 'TSLA' },
            { table: 'NVIDIA', id: 'NVDA' },
          ],
          type: 'final' as const,
        };

        let index = 0;
        const sendNext = () => {
          if (index >= fragments.length) {
            res.write(`data: ${JSON.stringify(finalMessage)}\n\n`);
            res.end();
            return;
          }

          const data = JSON.stringify(fragments[index]);
          res.write(`data: ${data}\n\n`);
          index++;
          setTimeout(sendNext, 30 + Math.random() * 50);
        };
        sendNext();
        req.on('close', () => { index = fragments.length + 1; });
      });
    },
  };
}

// https://vite.dev/config/
// @ts-ignore
export default defineConfig({
  resolve: {
    alias: {
      // 将 '@' 指向 src 目录
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    mockSSEPlugin(),
  ],
  server: {
    port: 9900,
    strictPort: false, // 端口被占用时自动累加
    allowedHosts: true, // 设为 true 表示允许任何 Host 域名访问
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err)
          })
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
