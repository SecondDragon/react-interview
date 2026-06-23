/**
 * 大数据量 JSON 解析优化 - 示例代码与文案
 * 存放该页面相关的全部示例代码，附带注释说明代码用途
 */

// ============================================
// 一、现象描述相关文案
// ============================================
export const BigJsonParseExamples = {
  /**
   * 一、现象描述
   */
  phenomenon: `
在银行数据资产管理系统的"资产明细查询"页面，当用户选择"全量导出"或"跨年度查询"时，后端返回的 JSON 数据量可能达到 **5MB ~ 50MB**，包含数十万条资产记录。

**具体表现：**

1. **页面假死**：点击查询按钮后，页面完全无响应，按钮保持按下状态，无法滚动、无法交互，持续 2~10 秒不等。
2. **输入延迟**：如果在解析期间尝试在搜索框输入，字符会在解析完成后"喷涌而出"。
3. **Lighthouse 长任务警告**：Performance 面板中出现红色长任务标记（Long Task > 50ms），严重时单次 JSON.parse 占用主线程 3000ms+。
4. **移动端崩溃**：在柜员平板（内存 2~4GB）上，大 JSON 解析可能导致页面直接崩溃刷新（Out of Memory）。
5. **动画卡顿**：页面中的加载动画（如 Spin 旋转）在解析期间完全冻结，用户体验极差。

**不同平台差异：**
- **Chrome/Edge**：解析 10MB JSON 约 200~500ms，会阻塞但通常不崩溃。
- **Safari (iOS)**：解析速度较慢，且对内存更敏感，超过 20MB 容易触发页面重载。
- **老旧 IE/EdgeHTML**：不支持流式解析，只能硬抗阻塞，且性能最差。
`,

  /**
   * 二、底层原因
   */
  rootCause: `
**1. JSON.parse 是单线程同步操作**

JSON.parse 是 ECMAScript 规范定义的同步 API，它必须在**主线程**上一次性完成整个字符串到 JavaScript 对象的转换。这个过程包括：
- 词法分析（Lexical Analysis）：逐字符扫描 JSON 字符串
- 语法分析（Parsing）：构建 AST（抽象语法树）
- 对象实例化：递归创建 JavaScript 对象、数组、字符串

这三个阶段完全占用主线程，期间浏览器无法处理用户输入、渲染动画或执行其他 JavaScript。

**2. V8 引擎的内存分配机制**

在解析过程中，V8 需要为每一个 JSON 属性、数组元素分配堆内存。对于 10MB 的 JSON：
- 原始字符串本身占用 ~10MB
- 解析后的对象树通常占用 **3~5 倍** 的内存（30~50MB）
- 如果 JSON 嵌套层级很深，递归解析会消耗大量**调用栈空间**

**3. 银行场景的特殊性**

银行数据通常具有以下特征，加剧了问题：
- **字段冗余**：每条记录包含大量元数据（创建时间、操作人、审批链等）
- **嵌套深**：资产对象 -> 分类 -> 子分类 -> 明细 -> 历史记录
- **大数组**：一个 items 数组可能包含 10 万条记录
- **大字符串**：Base64 编码的合同扫描件、JSON 内嵌的 XML 报文

**4. 为什么不能用 Web Worker？**

Web Worker 可以解析 JSON 而不阻塞主线程，但有一个致命问题：
- Worker 解析后的对象必须通过 structuredClone 传回主线程
- 对于大对象，structuredClone 本身也是一个昂贵的序列化/反序列化过程
- 最终主线程还是会收到一个巨大的对象，占用大量内存
`,

  /**
   * 三、反面教材代码
   */
  badCode: `// 反面教材：直接同步解析大 JSON
async function fetchAssetData() {
  const response = await fetch('/api/assets/all');
  const jsonText = await response.text(); // 拿到 20MB 的字符串
  
  // 致命问题：JSON.parse 阻塞主线程 3~5 秒
  const data = JSON.parse(jsonText);
  
  // 这行代码在 parse 完成前永远不会执行
  renderTable(data.items);
}

// 更糟糕的写法：在 React 中直接 setState 大对象
function AssetPage() {
  const [data, setData] = useState([]);
  
  const handleQuery = async () => {
    const res = await fetch('/api/assets/all');
    const jsonText = await res.text();
    const parsed = JSON.parse(jsonText); // 阻塞！
    setData(parsed.items); // 再次触发大量重渲染
  };
  
  return <Table dataSource={data} />;
}`,

  /**
   * 三、最佳实践代码 - 方案一：分片解析（基于 JSON.parse + 分批处理）
   */
  goodCodeChunked: `// 方案一：分片解析 + 渐进渲染
// 核心思路：不一次性解析整个 JSON，而是按批次逐步处理

class ChunkedJsonParser {
  private buffer: string = '';
  private decoder = new TextDecoder();
  
  // 使用 ReadableStream 逐块读取响应
  async parseStream(response: Response, onChunk: (items: any[]) => void) {
    const reader = response.body!.getReader();
    let jsonBuffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // 将二进制块解码为文本
      jsonBuffer += this.decoder.decode(value, { stream: true });
      
      // 尝试从缓冲区提取完整的对象
      const items = this.extractItems(jsonBuffer);
      if (items.length > 0) {
        onChunk(items); // 立即渲染这一批
        // 清空已处理的部分，保留未完成的片段
        jsonBuffer = this.keepRemainder(jsonBuffer);
      }
      
      // 让出主线程，允许 UI 更新
      await this.yieldToMainThread();
    }
  }
  
  // 使用 requestIdleCallback / setTimeout 让出主线程
  private yieldToMainThread(): Promise<void> {
    return new Promise(resolve => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => resolve(), { timeout: 16 });
      } else {
        setTimeout(resolve, 0);
      }
    });
  }
  
  private extractItems(buffer: string): any[] {
    // 简化的提取逻辑：假设 JSON 结构为 { "items": [ {...}, {...} ] }
    // 实际实现需要更健壮的流式 JSON 解析器
    // 这里展示核心思路...
    return [];
  }
  
  private keepRemainder(buffer: string): string {
    return buffer;
  }
}

// 使用示例
async function loadAssetsProgressive() {
  const response = await fetch('/api/assets/all');
  const parser = new ChunkedJsonParser();
  const allItems: any[] = [];
  
  await parser.parseStream(response, (chunk) => {
    allItems.push(...chunk);
    // 每收到一批就更新 UI，用户可以看到数据逐渐填充
    appendToTable(chunk);
  });
}`,

  /**
   * 三、最佳实践代码 - 方案二：Web Worker 异步解析
   */
  goodCodeWorker: `// 方案二：Web Worker 异步解析 + 分批回传
// worker.ts
self.onmessage = async (e) => {
  const { jsonText, chunkSize } = e.data;
  
  // 在 Worker 中解析，不阻塞主线程
  const data = JSON.parse(jsonText);
  const items = data.items || [];
  
  // 分批回传，避免 structuredClone 大对象的开销
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    self.postMessage({
      type: 'chunk',
      data: chunk,
      progress: Math.round((i / items.length) * 100)
    });
  }
  
  self.postMessage({ type: 'done' });
};

// 主线程
// BigJsonWorker.ts
class BigJsonWorker {
  private worker: Worker;
  
  constructor() {
    this.worker = new Worker(new URL('./jsonWorker.ts', import.meta.url));
  }
  
  parse(jsonText: string, onChunk: (chunk: any[], progress: number) => void): Promise<void> {
    return new Promise((resolve) => {
      this.worker.onmessage = (e) => {
        if (e.data.type === 'chunk') {
          onChunk(e.data.data, e.data.progress);
        } else if (e.data.type === 'done') {
          resolve();
        }
      };
      
      // 只传字符串给 Worker，解析在 Worker 内完成
      this.worker.postMessage({ jsonText, chunkSize: 1000 });
    });
  }
  
  terminate() {
    this.worker.terminate();
  }
}

// 使用
const worker = new BigJsonWorker();
await worker.parse(jsonText, (chunk, progress) => {
  appendToTable(chunk);
  updateProgressBar(progress);
});`,

  /**
   * 三、最佳实践代码 - 方案三：流式 JSON 解析（oboe.js / stream-json 思路）
   */
  goodCodeStreaming: `// 方案三：真正的流式 JSON 解析（推荐用于超大数据）
// 使用 @streamparser/json-whatwg（浏览器可用）或类似库

import { JSONParser } from '@streamparser/json-whatwg';

async function streamParseJSON(response: Response, onItem: (item: any) => void) {
  const parser = new JSONParser({ 
    stringBufferSize: undefined,
    paths: ['$.items.*'] // 只解析 items 数组下的每个元素
  });
  
  // 连接 ReadableStream 到解析器
  const reader = response.body!.getReader();
  
  parser.onValue = ({ value, key, parent, stack }) => {
    // 当解析到一个完整的 items[n] 对象时触发
    if (stack.length === 2 && stack[0] === 'items') {
      onItem(value);
    }
  };
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      parser.end();
      break;
    }
    
    // 将 Uint8Array 写入解析器
    parser.write(value);
    
    // 每处理 64KB 让出一次主线程
    await yieldToMainThread();
  }
}

// 使用
async function loadAssetsStreaming() {
  const response = await fetch('/api/assets/all');
  const items: any[] = [];
  
  await streamParseJSON(response, (item) => {
    items.push(item);
    
    // 每积累 500 条渲染一次
    if (items.length % 500 === 0) {
      appendToTable([item]);
    }
  });
}`,

  /**
   * 三、最佳实践代码 - 方案四：服务端分页（根本解决）
   */
  goodCodePagination: `// 方案四：服务端分页 + 虚拟滚动（根本解决之道）
// 与其前端解析 50MB JSON，不如让后端分页返回

interface PaginationParams {
  page: number;
  pageSize: number;
  filters: Record<string, any>;
}

async function fetchAssetPage(params: PaginationParams) {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    ...params.filters
  });
  
  // 每次只返回 100~500 条，JSON 大小控制在 200KB 以内
  const response = await fetch(\`/api/assets?\${query}\`);
  const result = await response.json(); // 小 JSON，解析 < 10ms
  
  return {
    items: result.data,
    total: result.total,
    hasMore: result.hasMore
  };
}

// 结合虚拟滚动使用（如 react-window / tanstack-virtual）
// 用户滚动到哪里，就加载哪一页的数据
// 首屏只需要解析 20~50 条记录，几乎零阻塞`,

  /**
   * 四、权衡分析文案
   */
  rationale: `
**四种方案的权衡对比：**

| 方案 | 首屏时间 | 内存占用 | 实现复杂度 | 适用场景 |
|------|---------|---------|-----------|---------|
| 分片解析 | 快（渐进显示） | 中（逐步累积） | 中 | 5~20MB JSON，需要快速反馈 |
| Web Worker | 中（等全部解析完） | 高（双份内存） | 低 | 解析逻辑简单，不想改动后端 |
| 流式解析 | 最快（逐条显示） | 低（不存完整对象） | 高 | 20MB+ 超大数据，极致性能要求 |
| 服务端分页 | 最快 | 最低 | 低 | **首选方案**，大多数场景适用 |

**银行场景推荐策略：**

1. **优先推服务端分页**：与后端协商，将"全量返回"改为"游标分页"。这是从根本上解决问题的方案。
2. **必须全量时选流式解析**：如"全量对账导出"等确实需要全部数据的场景，使用流式解析器（如 @streamparser/json）。
3. **Worker 作为兜底**：当无法改动后端且数据量在 10MB 以内时，使用 Web Worker 至少保证 UI 不卡死。
4. **避免前端做聚合计算**：大 JSON 解析后，不要在主线程做 reduce、sort、groupBy 等操作，这些同样会阻塞。
`,

  /**
   * 五、核心原理文案
   */
  corePrinciple: `
**1. 浏览器事件循环与长任务**

浏览器的主线程采用**单线程事件循环**模型。每个任务（Task）必须执行完成后，才能处理下一个任务。

JSON.parse 是一个**不可中断的宏任务**。即使解析 50MB 的数据需要 3 秒，浏览器也必须等它完成后才能：
- 处理用户的 click/input 事件
- 执行 requestAnimationFrame 回调（动画更新）
- 执行垃圾回收（GC）

这就是页面"假死"的根本原因。

**2. V8 解析 JSON 的内部机制**

V8 引擎解析 JSON 分为两个阶段：

**阶段一：Scanning（扫描）**
- 使用一个有限状态机（FSM）逐字符扫描 JSON 字符串
- 识别 token：{ } [ ] : , " string number true false null
- 这个阶段的时间复杂度是 O(n)，n 为字符串长度

**阶段二：Parsing（构建对象）**
- 递归下降解析器根据 token 构建 JavaScript 对象
- 每遇到一个 { 就创建一个对象，每遇到一个 [ 就创建一个数组
- 对于嵌套层级为 d 的 JSON，递归深度为 d
- 这个阶段的时间复杂度也是 O(n)，但常数因子更大（涉及内存分配）

**3. 流式解析的原理**

流式解析器（Streaming Parser）的核心思想是：**不等待完整的 JSON 字符串，而是边读边解析**。

以 @streamparser/json 为例：
- 维护一个状态栈（State Stack），记录当前解析到 JSON 的哪个层级
- 每收到一块二进制数据，就驱动状态机前进
- 当状态机识别到一个"完整的值"（如一个完整的对象）时，立即触发回调
- 不需要保存完整的 JSON 字符串，内存占用仅为当前解析路径上的对象

**4. 为什么 requestIdleCallback 能缓解问题？**

requestIdleCallback 允许开发者在浏览器的"空闲时段"执行低优先级任务。它的工作原理：
- 浏览器每帧（16.67ms @ 60fps）渲染完成后，检查剩余时间
- 如果有剩余时间，取出 requestIdleCallback 队列中的回调执行
- 通过在每个数据块处理后调用 yieldToMainThread，我们将一个长任务拆成多个短任务
- 每个短任务之间，浏览器有机会处理用户输入和渲染

**优缺点清单：**

| 方面 | 优点 | 缺点 |
|------|------|------|
| 分片解析 | 实现相对简单；渐进式用户体验 | 需要后端配合返回流式数据；前端状态管理复杂 |
| Web Worker | 零学习成本；完全解耦解析逻辑 | 双份内存；大数据回传仍有开销；无法直接操作 DOM |
| 流式解析 | 内存占用最低；响应最快 | 引入第三方依赖；需要理解流式 API；错误处理复杂 |
| 服务端分页 | 最优雅；内存和性能双赢 | 需要后端改造；不适合"全量导出"类需求 |
`,
};

// ============================================
// 辅助函数：生成模拟的大 JSON 数据
// ============================================

/**
 * 生成指定条数的模拟资产数据 JSON 字符串
 * 用于 Demo 中演示 JSON.parse 的阻塞效果
 */
export function generateBigJSON(itemCount: number): string {
  const items = [];
  const statuses = ['正常', '冻结', '核销', '转让', '质押'];
  const types = ['贷款', '债券', '票据', '存款', '理财'];

  for (let i = 0; i < itemCount; i++) {
    items.push({
      id: 'ASSET_' + String(i).padStart(10, '0'),
      name: '资产项目_' + i + '_' + Math.random().toString(36).substring(2, 8),
      type: types[Math.floor(Math.random() * types.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      amount: Math.round(Math.random() * 1000000000) / 100,
      currency: 'CNY',
      ownerDept: '部门_' + Math.floor(Math.random() * 50),
      ownerUser: '用户_' + Math.floor(Math.random() * 200),
      createTime: new Date(Date.now() - Math.random() * 365 * 24 * 3600 * 1000).toISOString(),
      updateTime: new Date(Date.now() - Math.random() * 30 * 24 * 3600 * 1000).toISOString(),
      // 模拟一些冗余字段，增加 JSON 体积
      metadata: {
        source: '核心系统',
        batchNo: 'BATCH_' + Math.floor(Math.random() * 10000),
        auditChain: [
          { operator: '张三', action: '录入', time: '2024-01-01T10:00:00Z' },
          { operator: '李四', action: '复核', time: '2024-01-02T14:30:00Z' },
        ],
        tags: ['重要', '年度审计', '监管报送'],
        extraInfo: {
          collateralType: '房产抵押',
          collateralValue: Math.round(Math.random() * 50000000),
          region: ['北京', '上海', '深圳', '广州'][Math.floor(Math.random() * 4)],
        },
      },
      // 模拟大字符串字段（如合同摘要）
      contractSummary: '本合同由甲方（贷款人）与乙方（借款人）于'.repeat(10),
    });
  }

  return JSON.stringify({
    code: 200,
    message: 'success',
    data: {
      total: itemCount,
      items: items,
      summary: {
        totalAmount: items.reduce((sum, item) => sum + item.amount, 0),
        countByStatus: {},
        reportTime: new Date().toISOString(),
      },
    },
  });
}

/**
 * 使用 Web Worker 进行异步 JSON 解析
 * 返回一个可以终止的解析任务
 */
export function parseJSONInWorker(
  jsonText: string,
  onProgress: (progress: number) => void
): { promise: Promise<any>; terminate: () => void } {
  const workerCode = `
    self.onmessage = function(e) {
      const jsonText = e.data;
      try {
        const data = JSON.parse(jsonText);
        self.postMessage({ type: 'success', data: data });
      } catch (err) {
        self.postMessage({ type: 'error', error: err.message });
      }
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const worker = new Worker(URL.createObjectURL(blob));

  const promise = new Promise<any>((resolve, reject) => {
    worker.onmessage = (e) => {
      if (e.data.type === 'success') {
        resolve(e.data.data);
      } else {
        reject(new Error(e.data.error));
      }
      worker.terminate();
    };

    worker.onerror = (err) => {
      reject(err);
      worker.terminate();
    };

    // 模拟进度（Worker 本身不支持真正的进度，这里用定时器模拟）
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 90) onProgress(progress);
      else clearInterval(interval);
    }, 50);

    worker.postMessage(jsonText);
  });

  return {
    promise,
    terminate: () => worker.terminate(),
  };
}

/**
 * 分片解析：将大 JSON 的 items 数组分批解析
 * 这是一个简化的演示实现
 */
export async function parseJSONInChunks(
  jsonText: string,
  chunkSize: number,
  onChunk: (items: any[], progress: number) => void
): Promise<any> {
  // 先解析外层结构（通常很小）
  const wrapperMatch = jsonText.match(/^(\{[\s\S]*?"items"\s*:\s*)(\[)/);
  if (!wrapperMatch) {
    // 回退到普通解析
    const data = JSON.parse(jsonText);
    onChunk(data.data?.items || [], 100);
    return data;
  }

  // 提取 items 数组部分（简化处理，实际应该用真正的流式解析器）
  const itemsMatch = jsonText.match(/"items"\s*:\s*(\[[\s\S]*?\])\s*[,}]/);
  if (!itemsMatch) {
    const data = JSON.parse(jsonText);
    onChunk(data.data?.items || [], 100);
    return data;
  }

  // 这里简化演示：实际应该逐字符扫描提取对象
  // 为了 Demo 效果，我们直接 parse 然后分批回调
  const data = JSON.parse(jsonText);
  const items = data.data?.items || [];

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const progress = Math.round((i / items.length) * 100);
    onChunk(chunk, progress);

    // 让出主线程
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return data;
}
