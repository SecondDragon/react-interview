// 🟢 最佳实践：严格类型 + 类型收窄 + 字面量类型

// 使用 unknown 替代 any
function processDataSafe(data: unknown) {
  if (typeof data === 'string') {
    return data.toUpperCase(); // 类型收窄后安全调用
  }
  return String(data);
}

// 明确区分可变和不可变类型
let value: string = 'hello';
// value = 42; // ❌ 编译错误：不能将 number 赋给 string

// 联合类型必须收窄
function getLengthSafe(x: string | number): number {
  if (typeof x === 'string') {
    return x.length; // ✅ 已收窄为 string
  }
  return x.toString().length; // ✅ 已收窄为 number
}

// 使用 Record 或索引签名
interface StringMap {
  [key: string]: string;
}
const obj: StringMap = {};
const key: string = 'name';
obj[key] = 'test'; // ✅ 类型安全

// 使用 const enum 避免运行时开销
const enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT',
}

// 使用字面量联合类型限制参数
type DirectionLiteral = 'up' | 'down' | 'left' | 'right';

function moveSafe(direction: DirectionLiteral) {
  console.log(`Moving ${direction}`);
}
// moveSafe('diagonal'); // ❌ 编译错误：不能赋给 DirectionLiteral

// 元组精确描述数据结构
type Person = readonly [string, number, boolean];
const tom: Person = ['Tom', 25, true]; // ✅ 精确类型
