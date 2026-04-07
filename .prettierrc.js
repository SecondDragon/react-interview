module.exports = {
  printWidth: 100, // 一行的字符数，如果超过会进行换行
  tabWidth: 2, // 一个tab代表几个空格数，默认为2
  useTabs: false, // 是否使用tab进行缩进，默认为false，表示用空格进行缩减
  semi: true, // 行位是否使用分号，默认为true
  singleQuote: true, // 字符串是否使用单引号，默认为false，使用双引号
  quoteProps: 'as-needed', // 给对象里的属性名是否要加上引号，默认为as-needed，即根据需要决定，如果不加引号会报错则加，否则不加
  jsxSingleQuote: false, // 在jsx里是否使用单引号
  trailingComma: 'es5', // 是否使用尾逗号，有三个可选值"<none|es5|all>"
  bracketSpacing: true, // 对象大括号直接是否有空格，默认为true，效果：{ foo: bar }
  bracketSameLine: false, // jsx标签的闭合符号'>'是否在最后一行的末尾（默认为false，表示闭合符号单独占一行）
  arrowParens: 'always', // 箭头函数参数无论有几个都强制使用圆括号（默认为always，如果选择avoid则单一参数时不使用括号）
  endOfLine: 'lf', // 结尾换行符类型
};
