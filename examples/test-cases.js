// 测试用例：JavaScript 代码补全示例

// 1. 函数补全
function calculateSum(a, b) {
  return // 期望补全: a + b;
}

// 2. 对象方法补全
const user = {
  name: 'John',
  age: 30,
  greet: function() {
    return // 期望补全: `Hello, my name is ${this.name}`;
  }
}

// 3. 异步函数补全
async function fetchData(url) {
  try {
    const response = await // 期望补全: fetch(url);
  } catch (error) {
    console. // 期望补全: error('Failed to fetch data:', error);
  }
}

// 4. 数组操作补全
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map( // 期望补全: (num) => num * 2);

// 5. 条件语句补全
function checkAge(age) {
  if (age >= 18) {
    return // 期望补全: 'adult';
  } else {
    return // 期望补全: 'minor';
  }
}

// 6. 类定义补全
class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  
  getArea() {
    return // 期望补全: this.width * this.height;
  }
}

// 7. 模块导入补全
import { // 期望补全: useState, useEffect } from 'react';

// 8. 错误处理补全
function divide(a, b) {
  if (b === 0) {
    throw new // 期望补全: Error('Division by zero is not allowed');
  }
  return a / b;
}