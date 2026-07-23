// 🔴 反面教材：滥用 any 和错误使用类型
// 文件名仅供 ?raw 提取，不参与编译

function processData(data: any) {
  // any 放弃了所有类型检查
  return data.toUpperCase(); // 运行时可能报错！
}

// 用 any 声明变量，完全失去类型保护
let value: any = 'hello';
value = 42; // 不报错
value.toUpperCase(); // 编译不报错，运行时崩溃！

// 错误的联合类型使用
function getLength(x: string | number) {
  // ❌ 没有类型收窄就调用特有方法
  return x.length; // 编译错误：number 没有 length
}

// 使用原始类型作为对象键名
const obj = {};
const key = 123;
obj[key] = 'test'; // 隐式 any 错误

// 错误的枚举使用
enum Color {
  Red,
  Green,
  Blue,
}
// 不应该用数字访问枚举值
const name = Color[0]; // 不语义化

// 缺少字面量类型约束
function move(direction: string) {
  // 可以传入任意字符串，不安全
  console.log(`Moving ${direction}`);
}
move('diagonal'); // 编译通过，但逻辑错误
