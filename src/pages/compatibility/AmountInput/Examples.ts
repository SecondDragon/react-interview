/**
 * 金额输入框案例元数据
 */
export const AmountInputExamples = {
  title: "金额输入框的“千分位与光标跳变” (Input Masking)",
  reason: "1. 程序化赋值冲突：当你通过代码 `input.value = newValue` 强行修改输入框的值时，浏览器无法判断这是‘内容修正’还是‘完全替换’。为了安全，现代浏览器会自动将光标重置到字符串的最末尾。\n2. 索引偏移：千分位格式化会动态插入‘逗号’。即便你记住了旧的光标位置（如索引 3），但在新字符串中，由于多了一个逗号，索引 3 对应的数字已经发生了变化，导致光标虽然没跳到末尾，但位置也对不上。",
  phenomenon: "用户想在‘1,00|0’中间插入一个‘5’，结果输入后光标瞬间跳到了‘15,000|’的最右侧。用户不得不再次点击中间位置才能继续输入，这在需要输入长串金额的银行场景中是交互灾难。",
  bad: `
/* ❌ 错误做法：直接正则格式化并写回 State */
const handleAmountChange = (e) => {
  // 1. 去掉所有旧逗号
  const rawValue = e.target.value.replace(/,/g, '');
  // 2. 加上千分位格式化
  const formatted = formatToThousand(rawValue);
  // 3. 直接 setState 写回受控组件
  setAmount(formatted);
  // 浏览器检测到 value 被程序修改，立即将光标（Selection）重置到末尾
};
  `,
  good: `
/**
 * ✅ 工业级解决方案：基于“数字锚点”的偏移补偿算法
 * 原理：不要记住光标的“绝对索引”，而要记住光标左侧有多少个“真实数字”。
 */
const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const input = e.target;
  const oldValue = input.value;
  const oldStart = input.selectionStart || 0;

  // 1. 【核心】统计操作前光标左侧有多少个非逗号字符（即真实数字）
  const digitsBeforeCursor = oldValue.substring(0, oldStart).replace(/,/g, '').length;

  // 2. 执行业务逻辑：格式化
  const rawValue = oldValue.replace(/,/g, '');
  const formattedValue = formatToThousand(rawValue);
  
  // 3. 更新受控状态
  setAmount(formattedValue);

  // 4. 【关键】在浏览器渲染后的下一帧（DOM 已更新）修复光标
  requestAnimationFrame(() => {
    let newPos = 0;
    let digitCount = 0;
    
    // 5. 算法对齐：在新字符串中，数出同样数量的“真实数字”
    // 遇到数字就累加，遇到逗号就跳过
    for (let i = 0; i < formattedValue.length; i++) {
      if (digitCount === digitsBeforeCursor) break;
      if (/[0-9]/.test(formattedValue[i])) {
        digitCount++;
      }
      newPos++;
    }
    
    // 6. 将光标精准写回，用户完全感知不到任何跳变
    input.setSelectionRange(newPos, newPos);
  });
};
  `
};
