# 🚀 VS Code 插件构建和发布指南

## 📋 准备工作

### 1. 安装必要工具

```bash
# 安装 VS Code 扩展打包工具
npm install -g vsce

# 验证安装
vsce --version
```

### 2. 检查项目状态

```bash
# 确保项目已编译
npm run compile

# 检查编译输出
ls -la out/

# 运行测试（如果有）
npm test
```

## 🔧 构建插件

### 1. 更新版本信息

编辑 `package.json`：

```json
{
  "name": "vscode-codeflow-by-dify",
  "displayName": "CodeFlow by Dify",
  "description": "基于 Dify API 的智能代码补全插件",
  "version": "1.0.0",
  "publisher": "your-publisher-name",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/vscode-codeflow-by-dify.git"
  },
  "bugs": {
    "url": "https://github.com/your-username/vscode-codeflow-by-dify/issues"
  },
  "homepage": "https://github.com/your-username/vscode-codeflow-by-dify#readme",
  "license": "MIT"
}
```

### 2. 添加图标和截图

```bash
# 创建媒体文件夹
mkdir -p media

# 添加插件图标 (128x128 PNG)
# 将图标文件放在 media/icon.png

# 在 package.json 中添加图标引用
"icon": "media/icon.png"
```

### 3. 完善 README.md

确保 README.md 包含：
- 功能介绍
- 安装说明
- 使用方法
- 配置指南
- 截图演示

### 4. 本地打包测试

```bash
# 检查打包内容
vsce ls

# 本地打包（生成 .vsix 文件）
vsce package

# 查看生成的文件
ls -la *.vsix
```

### 5. 本地安装测试

```bash
# 安装本地打包的插件
code --install-extension vscode-codeflow-by-dify-1.0.0.vsix

# 或在 VS Code 中：
# 1. Ctrl+Shift+P
# 2. 输入 "Extensions: Install from VSIX"
# 3. 选择 .vsix 文件
```

## 📦 发布到市场

### 方法一：发布到 VS Code Marketplace

#### 1. 创建发布者账号

1. 访问 [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage)
2. 使用 Microsoft 账号登录
3. 创建发布者（Publisher）

#### 2. 获取访问令牌

1. 访问 [Azure DevOps](https://dev.azure.com/)
2. 创建个人访问令牌（PAT）
3. 权限选择：`Marketplace > Manage`

#### 3. 登录 vsce

```bash
# 使用访问令牌登录
vsce login your-publisher-name

# 输入个人访问令牌
```

#### 4. 发布插件

```bash
# 发布到市场
vsce publish

# 或指定版本号发布
vsce publish 1.0.0

# 发布预发布版本
vsce publish --pre-release
```

### 方法二：发布到 Open VSX Registry

```bash
# 安装 ovsx 工具
npm install -g ovsx

# 登录 Open VSX
ovsx create-namespace your-namespace
ovsx login your-namespace -p your-access-token

# 发布到 Open VSX
ovsx publish vscode-codeflow-by-dify-1.0.0.vsix
```

## 🔄 版本管理

### 1. 语义化版本控制

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

```bash
# 自动增加版本号并发布
vsce publish patch   # 1.0.0 -> 1.0.1
vsce publish minor   # 1.0.0 -> 1.1.0
vsce publish major   # 1.0.0 -> 2.0.0
```

### 2. 更新 CHANGELOG.md

每次发布前更新 `CHANGELOG.md`：

```markdown
## [1.0.0] - 2025-08-21

### 新增
- 基于 Dify API 的智能代码补全
- 支持聊天应用和工作流应用
- 可视化设置面板
- 一键 API 连接测试

### 修复
- 修复聊天应用 API 兼容性问题
- 优化错误处理和用户反馈
```

## 📋 发布前检查清单

### ✅ 代码质量
- [ ] 代码已编译无错误
- [ ] 所有功能测试通过
- [ ] 错误处理完善
- [ ] 性能优化完成

### ✅ 文档完善
- [ ] README.md 详细完整
- [ ] CHANGELOG.md 已更新
- [ ] API 文档齐全
- [ ] 使用示例清晰

### ✅ 包配置
- [ ] package.json 信息完整
- [ ] 版本号正确
- [ ] 依赖项准确
- [ ] 图标和截图添加

### ✅ 测试验证
- [ ] 本地打包成功
- [ ] 本地安装测试
- [ ] 功能完整性验证
- [ ] 多平台兼容性测试

## 🚀 自动化发布

### 1. GitHub Actions 配置

创建 `.github/workflows/publish.yml`：

```yaml
name: Publish Extension

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Compile
        run: npm run compile
        
      - name: Package
        run: npx vsce package
        
      - name: Publish to VS Code Marketplace
        run: npx vsce publish
        env:
          VSCE_PAT: ${{ secrets.VSCE_PAT }}
          
      - name: Publish to Open VSX
        run: npx ovsx publish *.vsix
        env:
          OVSX_PAT: ${{ secrets.OVSX_PAT }}
```

### 2. 设置 GitHub Secrets

在 GitHub 仓库设置中添加：
- `VSCE_PAT`: VS Code Marketplace 访问令牌
- `OVSX_PAT`: Open VSX Registry 访问令牌

## 📊 发布后管理

### 1. 监控指标

- 下载量统计
- 用户评分反馈
- 问题报告处理
- 功能请求收集

### 2. 持续维护

```bash
# 定期更新依赖
npm update

# 修复 bug 并发布补丁
vsce publish patch

# 添加新功能
vsce publish minor
```

## 🎯 快速发布命令

```bash
# 完整发布流程
npm run compile && \
vsce package && \
vsce publish && \
echo "✅ 插件发布成功！"
```

## 📞 获取帮助

- [VS Code 扩展 API 文档](https://code.visualstudio.com/api)
- [vsce 工具文档](https://github.com/microsoft/vscode-vsce)
- [Marketplace 发布指南](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

---

**🎉 现在您可以将 Dify CodeFlow 插件发布到 VS Code Marketplace 了！**