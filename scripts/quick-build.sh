#!/bin/bash

# 快速构建脚本

echo "⚡ 快速构建 CodeFlow by Dify 插件..."

# 编译
npm run compile && \

# 打包
npx vsce package && \

echo "✅ 构建完成！生成的文件:" && \
ls -la *.vsix && \

echo "" && \
echo "🚀 下一步操作:" && \
echo "1. 本地测试: code --install-extension *.vsix" && \
echo "2. 发布市场: npx vsce publish" && \
echo "3. 查看内容: npx vsce ls"