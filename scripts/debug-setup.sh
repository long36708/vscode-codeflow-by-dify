#!/bin/bash

# VS Code 插件调试设置脚本

echo "🚀 开始设置 Dify VS Code 插件调试环境..."

# 1. 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
node --version
npm --version

# 2. 安装依赖
echo "📦 安装项目依赖..."
npm install

# 3. 编译 TypeScript
echo "🔨 编译 TypeScript 代码..."
npm run compile

# 4. 检查编译结果
echo "✅ 检查编译结果..."
if [ -d "out" ]; then
    echo "编译成功！生成的文件："
    ls -la out/
else
    echo "❌ 编译失败，请检查错误信息"
    exit 1
fi

# 5. 创建测试文件
echo "📝 创建测试文件..."
mkdir -p test-workspace

cat > test-workspace/test.js << 'EOF'
// JavaScript 测试文件
function calculateSum(a, b) {
  return // 在这里测试代码补全
}

const user = {
  name: 'John',
  greet: function() {
    return // 测试对象方法补全
  }
}

// 异步函数测试
async function fetchData() {
  const response = await // 测试异步补全
}
EOF

cat > test-workspace/test.py << 'EOF'
# Python 测试文件
def fibonacci(n):
    if n <= 1:
        return # 测试 Python 补全
    else:
        return # 测试递归补全

class Calculator:
    def __init__(self):
        self. # 测试类属性补全
EOF

echo "✨ 调试环境设置完成！"
echo ""
echo "🐛 开始调试："
echo "1. 在 VS Code 中打开此项目"
echo "2. 按 F5 启动调试"
echo "3. 在新窗口中打开 test-workspace/ 中的测试文件"
echo "4. 配置 Dify API 设置（Ctrl+, 搜索 Dify）"
echo "5. 测试代码补全功能"
echo ""
echo "📚 更多调试信息请查看 docs/debugging-guide.md"