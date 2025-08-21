#!/bin/bash

# VS Code 插件发布脚本

echo "🚀 开始构建和发布 CodeFlow by Dify 插件..."
echo ""

# 1. 检查环境
echo "📋 检查发布环境..."

# 检查 vsce 是否安装
if ! command -v vsce &> /dev/null; then
    echo "❌ vsce 未安装，正在安装..."
    npm install -g vsce
fi

# 检查 Node.js 版本
echo "Node.js 版本: $(node --version)"
echo "npm 版本: $(npm --version)"
echo "vsce 版本: $(vsce --version)"
echo ""

# 2. 清理和编译
echo "🔨 清理和编译项目..."
rm -rf out/
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ 编译失败！"
    exit 1
fi

echo "✅ 编译成功"
echo ""

# 3. 检查必要文件
echo "📁 检查必要文件..."

required_files=("README.md" "CHANGELOG.md" "package.json" "out/extension.js")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 缺少必要文件: $file"
        exit 1
    fi
done

echo "✅ 所有必要文件存在"
echo ""

# 4. 检查 package.json 配置
echo "🔍 检查 package.json 配置..."

# 检查发布者信息
publisher=$(node -p "require('./package.json').publisher" 2>/dev/null)
if [ "$publisher" = "your-publisher-name" ] || [ "$publisher" = "undefined" ]; then
    echo "⚠️  警告: 请在 package.json 中设置正确的 publisher 名称"
    echo "   当前值: $publisher"
    read -p "   是否继续？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ package.json 配置检查完成"
echo ""

# 5. 预览打包内容
echo "👀 预览打包内容..."
vsce ls

echo ""
read -p "📦 是否继续打包？(Y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo "❌ 用户取消打包"
    exit 1
fi

# 6. 打包插件
echo "📦 正在打包插件..."
vsce package

if [ $? -ne 0 ]; then
    echo "❌ 打包失败！"
    exit 1
fi

# 获取生成的 .vsix 文件名
vsix_file=$(ls -t *.vsix | head -n1)
echo "✅ 打包成功: $vsix_file"
echo ""

# 7. 询问是否发布
echo "🚀 发布选项:"
echo "1. 仅本地打包 (已完成)"
echo "2. 发布到 VS Code Marketplace"
echo "3. 本地安装测试"
echo "4. 退出"
echo ""

read -p "请选择操作 (1-4): " -n 1 -r
echo ""

case $REPLY in
    2)
        echo "🌐 发布到 VS Code Marketplace..."
        
        # 检查是否已登录
        if ! vsce verify-pat 2>/dev/null; then
            echo "🔑 需要登录到 VS Code Marketplace"
            read -p "请输入您的发布者名称: " publisher_name
            vsce login "$publisher_name"
        fi
        
        echo "正在发布..."
        vsce publish
        
        if [ $? -eq 0 ]; then
            echo "🎉 发布成功！"
            echo "📊 您可以在以下地址查看插件:"
            echo "   https://marketplace.visualstudio.com/items?itemName=$publisher.vscode-codeflow-by-dify"
        else
            echo "❌ 发布失败！"
            exit 1
        fi
        ;;
    3)
        echo "🔧 本地安装测试..."
        code --install-extension "$vsix_file"
        
        if [ $? -eq 0 ]; then
            echo "✅ 本地安装成功！"
            echo "💡 请重启 VS Code 以使用插件"
        else
            echo "❌ 本地安装失败！"
        fi
        ;;
    4)
        echo "👋 退出发布流程"
        exit 0
        ;;
    *)
        echo "✅ 仅本地打包完成"
        echo "📁 生成的文件: $vsix_file"
        echo "💡 您可以手动安装: code --install-extension $vsix_file"
        ;;
esac

echo ""
echo "🎉 发布流程完成！"