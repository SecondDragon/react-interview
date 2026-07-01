import React, { useRef, useState } from 'react';
import {
  Card,
  Typography,
  Alert,
  Table,
  Divider,
  Tag,
  Collapse,
  Steps,
  Badge,
  List,
  Input,
} from 'antd';
import { IMEInputExamples } from './Examples';
import CodeDiff from '@/components/CodeDiff';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

/**
 * 互动演示：IME 锁效果对比
 */
const IMEDemo = () => {
  const [standardVal, setStandardVal] = useState('');
  const [imeLockedVal, setImeLockedVal] = useState('');
  const isComposing = useRef(false);

  const handleStandardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStandardVal(e.target.value);
  };

  const handleImeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isComposing.current) {
      setImeLockedVal(e.target.value);
    }
  };

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = (e: any) => {
    isComposing.current = false;
    // 保底触发：处理 Chromium 内核 Input 先于 End 的情况
    setImeLockedVal(e.target.value);
  };

  return (
    <Card title="⌨️ 互动演示：尝试输入中文拼音" size="small">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <Text strong>1. 普通 Input (无锁):</Text>
          <Input
            placeholder="输入拼音试试..."
            onChange={handleStandardInput}
            style={{ marginTop: '8px' }}
          />
          <div style={{ marginTop: '8px' }}>
            实时值: <Tag color="red">{standardVal || '(空)'}</Tag>
          </div>
          <Text type="secondary" size="small">
            现象：拼音字母也会被实时记录
          </Text>
        </div>
        <div>
          <Text strong>2. IME 锁定 Input:</Text>
          <Input
            placeholder="输入拼音试试..."
            onInput={handleImeInput}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            style={{ marginTop: '8px' }}
          />
          <div style={{ marginTop: '8px' }}>
            确定值: <Tag color="green">{imeLockedVal || '(空)'}</Tag>
          </div>
          <Text type="secondary" size="small">
            现象：只有汉字上屏后才更新
          </Text>
        </div>
      </div>
    </Card>
  );
};

/**
 * IME 兼容性重构页面
 */
const IMEInput: React.FC = () => {
  const kernelDataSource = [
    {
      key: '1',
      kernel: 'Chromium / Blink / WebKit (Chrome, Edge, Safari)',
      sequence: 'input → compositionend（现代内核的主流实现）',
      behavior: 'input 代表 DOM 内容已变化，compositionend 代表输入法会话关闭，二者职责不同',
    },
    {
      key: '2',
      kernel: 'Gecko (Firefox)',
      sequence: 'compositionend → input（典型情况）',
      behavior: '规范未强制顺序，不同平台/输入法组合可能出现差异',
    },
  ];

  const columns = [
    { title: '内核', dataIndex: 'kernel', key: 'kernel' },
    { title: '时序', dataIndex: 'sequence', key: 'sequence' },
    { title: '特征', dataIndex: 'behavior', key: 'behavior' },
  ];

  const envDataSource = [
    {
      key: '1',
      env: 'Blink v120+ (Windows TSF)',
      ime: '微软拼音 / 空格上屏',
      sequence: 'input → compositionend（不补发 input）',
      naiveResult: '最后一个 input 被锁拦截，end 后无后续事件 → 汉字丢失',
      naiveTag: 'error',
      proResult: 'end 中主动补偿触发 doSearch，正常上屏',
      proTag: 'success',
    },
    {
      key: '2',
      env: 'Blink v120+ (Windows TSF)',
      ime: '微软拼音 / 数字选字',
      sequence: 'compositionend → input',
      naiveResult: '解锁后 input 正常触发 → 表面正常（侥幸）',
      naiveTag: 'warning',
      proResult: 'end + input 双触发，AbortController 去重',
      proTag: 'success',
    },
    {
      key: '3',
      env: 'Blink v100 (统信 UOS)',
      ime: '自带输入法 / 任意上屏',
      sequence: 'input(碎片) → compositionend（value 仍为拼音）',
      naiveResult: '锁拦截碎片，end 后无 input；若执行则拿到拼音 → 数据污染',
      naiveTag: 'error',
      proResult: 'end 中补偿触发，value 正确则正常（信创内核缺陷无法完全规避）',
      proTag: 'warning',
    },
    {
      key: '4',
      env: 'Blink v90 (麒麟 OS)',
      ime: 'Fcitx / 空格上屏',
      sequence: 'compositionend 不触发',
      naiveResult: 'isComposing 永远为 true，所有 input 被拦截 → 完全卡死',
      naiveTag: 'error',
      proResult: '同样无法解锁；需配合 beforeinput 或定时检测兜底',
      proTag: 'warning',
    },
    {
      key: '5',
      env: 'WebKit (macOS InputMethodKit)',
      ime: '原生拼音 / 选字上屏',
      sequence: 'input → compositionend',
      naiveResult: '最后一个 input 被拦截，end 后不补发 → 汉字丢失',
      naiveTag: 'error',
      proResult: 'end 中补偿触发，正常上屏',
      proTag: 'success',
    },
    {
      key: '6',
      env: 'Gecko (Linux IBus)',
      ime: 'Rime / 任意上屏',
      sequence: 'compositionend → input',
      naiveResult: '解锁后 input 触发 → 正常（侥幸）',
      naiveTag: 'warning',
      proResult: '双触发，通过请求 ID + AbortController 去重',
      proTag: 'success',
    },
    {
      key: '7',
      env: '微信内置浏览器 XWeb',
      ime: '微信键盘 / 选字',
      sequence: 'compositionend 触发多次',
      naiveResult: '解锁后无 input，end 多次触发 → 重复搜索',
      naiveTag: 'error',
      proResult: '多次补偿触发，AbortController 物理取消前序请求',
      proTag: 'success',
    },
    {
      key: '8',
      env: 'Blink v120+ (macOS)',
      ime: '搜狗输入法 / 数字选字',
      sequence: 'input → compositionend → 补发 input',
      naiveResult: '解锁后补发 input 触发 → 正常（运气）',
      naiveTag: 'warning',
      proResult: 'end 补偿 + 补发 input，双触发去重',
      proTag: 'success',
    },
  ];

  const envColumns = [
    { title: '运行环境', dataIndex: 'env', key: 'env', width: '18%' },
    { title: '输入法 / 上屏方式', dataIndex: 'ime', key: 'ime', width: '15%' },
    { title: '实际事件时序', dataIndex: 'sequence', key: 'sequence', width: '20%' },
    {
      title: '只解锁不补偿',
      dataIndex: 'naiveResult',
      key: 'naiveResult',
      width: '22%',
      render: (_: any, record: any) => <Tag color={record.naiveTag}>{record.naiveResult}</Tag>,
    },
    {
      title: '工业级完整实现',
      dataIndex: 'proResult',
      key: 'proResult',
      width: '25%',
      render: (_: any, record: any) => <Tag color={record.proTag}>{record.proResult}</Tag>,
    },
  ];

  return (
    <div>
      <Title level={2}>中文输入法 (IME) 组合输入兼容性</Title>

      {/* 一、 Bug 出现的现象 */}
      <Card title="一、 Bug 出现的现象" style={{ marginBottom: '24px' }}>
        <Paragraph>
          当用户使用中文输入法（IME）输入拼音时，浏览器会频繁触发 <Text code>input</Text>{' '}
          事件，导致“拼音碎片”进入业务逻辑。
        </Paragraph>
        <ul>
          <li>
            <Text strong>数据污染：</Text>搜索框会拿着拼音去请求接口，造成无效流量和后端压力。
          </li>
          <li>
            <Text strong>光标跳变：</Text>在 React 受控模式下， setState 会强制重刷
            DOM，导致正在输入的拼音被截断或光标跳到末尾。
          </li>
        </ul>
      </Card>

      {/* 二、 Bug 出现的底层原因 */}
      <Card title="二、 Bug 出现的底层原因" style={{ marginBottom: '24px' }}>
        <Paragraph>
          <Text strong>现代规范的设计：</Text>
          W3C UI Events 规范对 <Text code>compositionend</Text> 和最后一次 <Text code>input</Text>{' '}
          的触发顺序不再做强制规定，因为二者的语义本来就不同：
          <Text code>input</Text> 事件代表 DOM 元素内容发生改变，
          <Text code>compositionend</Text> 则代表<strong>输入法会话（IME Session）的关闭</strong>。
          当用户按空格或数字键选词上屏时，内容先落地，所以 Chromium / Blink / 现代 WebKit 中通常先触发{' '}
          <Text code>input</Text>，再触发 <Text code>compositionend</Text>。
        </Paragraph>
        <Paragraph>
          <Text strong>事件时序不是按内核一刀切：</Text>
          它由 Chromium 版本 × 操作系统 IME 管道（TSF / InputMethodKit / IBus / Fcitx）× 输入法框架 × 上屏方式共同决定。
          因此同样基于 Chromium，Windows 与 Linux、空格上屏与数字选字都可能产生差异。
        </Paragraph>
        <Table
          dataSource={kernelDataSource}
          columns={columns}
          pagination={false}
          size="small"
          bordered
        />
      </Card>

      {/* 三、 Bug 如何解决 */}
      <Card title="三、 Bug 如何解决" style={{ marginBottom: '24px' }}>
        <Paragraph>
          现代浏览器优先推荐方案 A：直接监听 <Text code>input</Text> 并判断{' '}
          <Text code>!e.nativeEvent.isComposing</Text>，只有在非合成阶段才执行业务逻辑。对于必须兼容 IE
          兼容模式或部分老旧国产内核的场景，使用方案 B：<Text code>compositionstart</Text> /{' '}
          <Text code>compositionend</Text> 标志位锁 + End 中手动补偿触发。
        </Paragraph>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
            gap: '20px',
          }}
        >
          <CodeDiff
            oldValue={IMEInputExamples.cursorJumping.bad}
            newValue={IMEInputExamples.ultimatePlan}
            leftTitle="❌ 反面教材"
            rightTitle="✅ 最佳实践"
            type="error"
            hideDiffMarkers={true}
          />
        </div>
        <CodeDiff
          code={IMEInputExamples.isComposingPlan}
          type="success"
          title="✅ 方案 A：原生 isComposing 属性（现代浏览器首选）"
        />
        <CodeDiff
          code={IMEInputExamples.debounceBad}
          type="error"
          title="❌ 误区 A：防抖（Debounce）"
        />
        <CodeDiff
          code={IMEInputExamples.isComposingBad}
          type="error"
          title="❌ 误区 B：依赖 isComposing 属性但不兜底"
        />
        <CodeDiff
          code={IMEInputExamples.naiveLockBad}
          type="error"
          title="❌ 误区 C：只解锁不补偿"
        />
        <Divider />
        <Alert
          title="为什么防抖（Debounce）无法解决拼音碎片？"
          description={
            <div>
              <Paragraph>
                防抖的本质是<strong>"停止输入后N毫秒才执行"</strong>
                ，但它无法区分输入内容是否处于IME合成阶段。
              </Paragraph>
              <ul>
                <li>
                  用户输入长拼音（如 <Text code>"zhuang"</Text>
                  ）时，中间会有自然停顿思考选字，此时防抖到期触发，携带的仍是未确定的拼音碎片。
                </li>
                <li>
                  防抖时间太短（如 300ms）→ 长拼音中间停顿导致碎片漏出；防抖时间太长（如 800ms）→
                  汉字上屏后需等待过久才响应，体感卡顿。
                </li>
                <li>
                  核心矛盾：防抖只关心"多久没输入"，不关心输入是否处于<strong>合成状态</strong>
                  ，因此永远无法从根本上拦截拼音进入业务逻辑。
                </li>
              </ul>
            </div>
          }
          type="warning"
          showIcon
          style={{ marginTop: '16px' }}
        />
        <Alert
          message="为什么依赖 isComposing 属性需要兜底？"
          description={
            <div>
              <Paragraph>
                <Text code>e.nativeEvent.isComposing</Text>{' '}
                是现代浏览器（Chrome、Firefox、Safari、Edge 以及国产浏览器极速模式）原生支持的属性，
                在主流场景下可以直接判断输入是否处于 IME 合成阶段。但它在以下场景不可靠：
              </Paragraph>
              <ul>
                <li>
                  <Text strong>IE 兼容模式：</Text>360安全浏览器、QQ浏览器、搜狗浏览器等国产双核浏览器在兼容模式下，
                  <Text code>InputEvent</Text> 实现可能不完整，<Text code>isComposing</Text> 可能缺失或始终返回 false。
                </li>
                <li>
                  <Text strong>老旧或定制内核：</Text>统信 UOS、麒麟 OS 早期版本、微信 XWeb 等部分环境基于旧版 Chromium 或定制 WebKit，
                  对 <Text code>InputEvent</Text> 的规范实现存在偏差，<Text code>isComposing</Text> 可能无法正确反映合成状态。
                </li>
                <li>
                  <Text strong>Polyfill 或事件封装：</Text>如果项目中存在自定义事件系统或旧版 React 合成事件封装，
                  事件对象可能不是真正的 <Text code>InputEvent</Text>，导致该属性不可用。
                </li>
              </ul>
              <Paragraph>
                <Text strong>结论：</Text>现代浏览器中优先使用 <Text code>isComposing</Text>；
                但在需要兼容 IE 兼容模式或老旧国产内核时，必须配合{' '}
                <Text code>compositionstart</Text> / <Text code>compositionend</Text> 标志位锁作为兜底。
              </Paragraph>
            </div>
          }
          type="warning"
          showIcon
          style={{ marginTop: '16px' }}
        />
        <Alert
          message={`为什么"只解锁不补偿"的方案在部分浏览器环境下不可靠？`}
          description={
            <div>
              <Paragraph>
                这个方案看起来和完整实现几乎一样：都有锁，都监听{' '}
                <Text code>compositionstart</Text> / <Text code>compositionend</Text> /{' '}
                <Text code>input</Text>。唯一的区别是：
                <strong>
                  它在 <Text code>compositionend</Text> 中只解锁，不主动调用业务逻辑
                </strong>
                ，而是依赖浏览器在解锁后自动再发一次 <Text code>input</Text>。
              </Paragraph>
              <Paragraph strong>不同内核的时序差异决定了它的风险：</Paragraph>
              <ul>
                <li>
                  <Text strong>Chromium / Blink / WebKit（Chrome、Safari、Edge、国产浏览器极速模式）：</Text>
                  典型时序是 <Text code>input → compositionend</Text>
                  。用户按下空格或数字键选字时，最后一个 <Text code>input</Text> 事件到来时{' '}
                  <Text code>isComposing</Text> 还是 <Text code>true</Text>，被锁拦截；随后{' '}
                  <Text code>compositionend</Text> 触发，锁打开，但浏览器
                  <strong>
                    通常不会再补发一次 <Text code>input</Text>
                  </strong>
                  。导致<strong>最后一个汉字可能无法触发搜索</strong>。
                </li>
                <li>
                  <Text strong>Gecko（Firefox）：</Text>
                  典型时序是 <Text code>compositionend → input</Text>。<Text code>compositionend</Text>{' '}
                  先解锁，然后 <Text code>input</Text> 正常触发。这个方案在 Firefox
                  下通常能工作——但这只是统计规律，不是规范保证。
                </li>
                <li>
                  <Text strong>老旧内核 / 国产定制环境（统信 UOS、麒麟 OS、微信 XWeb 等）：</Text>
                  这些环境可能基于老旧 Chromium 或深度定制的 WebKit，对{' '}
                  <Text code>composition</Text> 事件的实现存在偏差：有的{' '}
                  <Text code>compositionend</Text> 不触发；有的触发时{' '}
                  <Text code>e.target.value</Text> 尚未更新；有的触发多次；有的触发后
                  <strong>
                    不补发任何 <Text code>input</Text>
                  </strong>
                  。依赖"解锁后等 input"在这些环境下是不可靠的赌博。
                </li>
              </ul>
              <Paragraph strong>完整实现为什么能覆盖绝大多数主流内核？</Paragraph>
              <ul>
                <li>
                  <strong>不赌浏览器的人品：</strong>在 <Text code>compositionend</Text> 中
                  <strong>主动补偿触发一次</strong> <Text code>doSearch(e.target.value)</Text>
                  ，而不是被动等待浏览器发 <Text code>input</Text>。
                </li>
                <li>
                  <strong>Firefox 双触发去重：</strong>Firefox 下可能触发两次（
                  <Text code>compositionend</Text> 中一次 + 后续的 <Text code>input</Text>{' '}
                  中一次）。通过 <Text code>AbortController</Text> 和请求 ID 进行物理取消 +
                  逻辑校验，确保只有最后一次生效。
                </li>
                <li>
                  <strong>Chromium 不丢失：</strong>最后一个 <Text code>input</Text> 被锁拦截，但{' '}
                  <Text code>compositionend</Text> 中补偿触发，抹平时序差异。
                </li>
                <li>
                  <strong>特殊环境兜底：</strong>只要 <Text code>compositionend</Text>{' '}
                  触发（哪怕时序混乱、哪怕只触发一次），业务逻辑就会被执行，不会因为浏览器漏发{' '}
                  <Text code>input</Text> 而完全失效。若 <Text code>compositionend</Text>{' '}
                  本身不触发，则需要额外兜底策略。
                </li>
              </ul>
            </div>
          }
          type="error"
          showIcon
          style={{ marginTop: '16px' }}
        />

        <Divider style={{ marginTop: '24px' }} />
        <Title level={4}>环境兼容性矩阵：同样的代码，为什么在不同机器上表现不同？</Title>
        <Paragraph type="secondary">
          以下四个变量任意组合都会导致 IME 事件时序差异：<Text code>Chromium 版本</Text>（Blink
          引擎迭代）× <Text code>操作系统 IME 管道</Text>（TSF / InputMethodKit / IBus / Fcitx）×{' '}
          <Text code>输入法框架</Text>（微软拼音 / 搜狗 / Rime / 微信键盘）×{' '}
          <Text code>上屏方式</Text>（空格 / 数字选字）。 你的本地环境只是这张巨大矩阵中的一个格子。
        </Paragraph>
        <Table
          dataSource={envDataSource}
          columns={envColumns}
          pagination={false}
          size="small"
          bordered
          scroll={{ x: 'max-content' }}
          style={{ marginTop: '16px' }}
        />
        <Alert
          message="极端情况说明"
          description="对于 compositionend 完全不触发的极端环境（如部分麒麟 OS + Fcitx 组合），任何依赖 composition 事件的方案都需要额外的兜底策略（如监听 beforeinput 事件、使用非受控组件 + 定时检测、或退化到手动触发按钮搜索）。工业级方案的优势在于：它覆盖了 90% 以上的时序混乱场景（时序颠倒、多次触发、value 延迟），而不是解决浏览器引擎本身完全缺失事件的极端缺陷。"
          type="info"
          showIcon
          style={{ marginTop: '16px' }}
        />
      </Card>

      {/* 四、 为什么要这样解决 且互动演示 */}
      <Card
        title={
          <span>
            四、 为什么要这样解决 且互动演示 <Tag color="blue">Live Demo</Tag>
          </span>
        }
        style={{ marginBottom: '24px' }}
      >
        <Paragraph>
          现代浏览器首选方案 A：监听 <Text code>input</Text> 并判断{' '}
          <Text code>!e.nativeEvent.isComposing</Text>，可直接在内容落地的瞬间执行业务逻辑，无需维护 Ref
          状态。Live Demo 为了演示“锁”的物理拦截效果，仍采用方案 B（标志位锁），这样读者可以直观看到拼音碎片如何被阻止进入业务值。
        </Paragraph>
        <Paragraph>
          方案 B 的价值在于兼容 IE 兼容模式、老旧国产内核等 <Text code>isComposing</Text>{' '}
          不可靠的环境，同时通过 <Text code>compositionend</Text> 中的补偿触发避免 Blink / WebKit
          中最后一字丢失的问题。
        </Paragraph>
        <Divider />
        <IMEDemo />
      </Card>

      {/* 五、 Bug 能解决的核心原理 */}
      <Card title="五、 Bug 能解决的核心原理" style={{ background: '#f0f5ff' }}>
        <ul>
          <li>
            <Text strong>input 与 compositionend 的语义差异：</Text>
            <Text code>input</Text> 表示 DOM 内容已改变，
            <Text code>compositionend</Text> 表示输入法会话关闭。在 Chromium / Blink / 现代 WebKit
            中，选词上屏时通常是内容先落地（input），输入法再通知结束（compositionend）。
          </li>
          <li>
            <Text strong>isComposing 原生属性（方案 A）：</Text>
            现代浏览器的 <Text code>InputEvent</Text> 直接提供{' '}
            <Text code>isComposing</Text> 标志，可以最优雅地区分“合成中”和“已确定”。
          </li>
          <li>
            <Text strong>isComposing 标志位锁（方案 B）：</Text>
            通过 <Text code>compositionstart</Text> 将锁闭合，在此期间的所有 <Text code>input</Text>{' '}
            事件被拦截；在 <Text code>compositionend</Text> 中解锁并主动补偿触发一次业务逻辑，覆盖{' '}
            <Text code>isComposing</Text> 不可靠的环境。
          </li>
          <li>
            <Text strong>时序对齐（保底触发）：</Text>
            在 <Text code>compositionend</Text> 中手动调用业务逻辑，可以抹平 Chromium / Blink 中{' '}
            <Text code>input</Text> 先于 <Text code>compositionend</Text> 导致的“最后一字可能丢失”问题。
          </li>
          <li>
            <Text strong>AbortController 竞态控制：</Text>
            结合网络层的取消机制，确保只有最后一次确定的输入（而非中间过程）能生效，解决回包乱序和多次触发问题。
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default IMEInput;
