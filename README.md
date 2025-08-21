# CodeFlow by Dify - VS Code 智能代码补全插件

基于 Dify API 的智能代码补全插件，为您的编程工作流提供 AI 驱动的代码建议。

## 功能特性

- 🤖 **AI 驱动补全**: 利用 Dify 工作流提供智能代码补全
- 🌍 **多语言支持**: 支持 JavaScript、TypeScript、Python、Go、Java、C/C++ 等
- ⚡ **实时补全**: 自动触发或手动触发代码补全
- 🎯 **上下文感知**: 基于当前代码上下文生成精准建议
- ⚙️ **灵活配置**: 可自定义 API 设置、触发延迟、上下文范围等
- 🔒 **安全私密**: API 密钥安全存储，仅发送必要的代码上下文

## 安装

1. 在 VS Code 扩展市场搜索 "CodeFlow by Dify"
2. 点击安装
3. 重启 VS Code

## 配置

### 1. 获取 Dify API 密钥

1. 登录 [Dify 控制台](https://dify.ai)
2. 进入 **API 管理** 页面
3. 创建新的 API 密钥

### 2. 创建代码补全工作流

在 Dify 中创建一个工作流，包含以下输入变量：
- `language`: 编程语言
- `code_before_cursor`: 光标前的代码
- `line_number`: 行号
- `column_number`: 列号

工作流应输出：
- `completion`: 代码补全建议

### 3. 配置插件

#### 方法一：可视化设置面板（推荐）
1. 按 `Ctrl+Shift+P` 打开命令面板
2. 输入 "Dify: Open Settings" 并回车
3. 在设置面板中配置：
   - **API Key**: 您的 Dify API 密钥
   - **Workflow ID**: 代码补全工作流的 ID
   - **Base URL**: Dify API 基础 URL（默认为官方 API）
4. 点击 **"测试连接"** 按钮验证配置
5. 点击 **"保存配置"** 保存设置

#### 方法二：VS Code 设置
1. 打开 VS Code 设置 (`Ctrl+,`)
2. 搜索 "Dify"
3. 配置相应选项

## 使用方法

### 自动补全

插件会在您输入代码时自动触发补全建议。您可以在设置中调整：
- 是否启用自动触发
- 触发延迟时间
- 上下文行数

### 手动补全

使用快捷键 `Ctrl+Alt+Space` (Windows/Linux) 或 `Cmd+Alt+Space` (macOS) 手动触发补全。

### 命令面板

- `Dify: Trigger Code Completion` - 手动触发补全
- `Dify: Open Settings` - 打开设置
- `Dify: Test API Connection` - 测试 API 连接

## 配置选项

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `dify.codeCompletion.apiKey` | Dify API 密钥 | "" |
| `dify.codeCompletion.workflowId` | 工作流 ID | "" |
| `dify.codeCompletion.baseUrl` | API 基础 URL | "https://api.dify.ai/v1" |
| `dify.codeCompletion.autoTrigger` | 启用自动触发 | true |
| `dify.codeCompletion.triggerDelay` | 触发延迟(ms) | 500 |
| `dify.codeCompletion.contextLines` | 上下文行数 | 10 |
| `dify.codeCompletion.enabled` | 启用插件 | true |

## 支持的语言

- JavaScript (.js)
- TypeScript (.ts)
- Python (.py)
- Go (.go)
- Java (.java)
- C++ (.cpp, .cc, .cxx)
- C (.c)

## 故障排除

### 补全不工作

1. 检查 API Key 和 Workflow ID 是否正确配置
2. 使用 `Dify: Test API Connection` 命令测试连接
3. 确保当前文件语言被支持
4. 检查插件是否已启用

### API 错误

- 检查网络连接
- 验证 Dify API 密钥是否有效
- 确认工作流 ID 正确且可访问

### 性能问题

- 调整触发延迟时间
- 减少上下文行数
- 禁用自动触发，仅使用手动触发

## 隐私说明

- 插件仅发送光标附近的代码上下文到 Dify API
- 不会上传完整文件或敏感信息
- API 密钥安全存储在 VS Code 的加密存储中
- 您可以随时在设置中禁用插件

## 开发

### 本地开发

```bash
# 克隆仓库
git clone <repository-url>
cd vscode-codeflow-by-dify

# 安装依赖
npm install

# 编译
npm run compile

# 在 VS Code 中按 F5 启动调试
```

### 打包

```bash
npm install -g vsce
vsce package
```

## 许可证

MIT License

## 支持

如有问题或建议，请在 GitHub 仓库中提交 Issue。

---

**享受 AI 驱动的编程体验！** 🚀