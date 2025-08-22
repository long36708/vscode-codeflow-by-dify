# Dify Code Completion 用户配置指南

本文档详细介绍如何配置 Dify Code Completion 扩展的各项功能，包括触发字符和快捷键的自定义配置。

## 目录

- [基础配置](#基础配置)
- [触发字符配置](#触发字符配置)
- [快捷键配置](#快捷键配置)
- [其他配置选项](#其他配置选项)
- [配置示例](#配置示例)
- [常见问题](#常见问题)

## 基础配置

### 必需配置

在使用扩展之前，请确保配置以下必需项：

1. **API Key** (`dify.codeCompletion.apiKey`)
   - 您的 Dify API 密钥
   - 获取方式：登录 Dify 控制台 → API 管理 → 创建密钥

2. **Workflow ID** (`dify.codeCompletion.workflowId`)
   - 用于代码补全的 Dify 工作流 ID

3. **Base URL** (`dify.codeCompletion.baseUrl`)
   - Dify API 基础 URL
   - 默认值：`https://api.dify.ai/v1`
   - 私有部署时可修改此项

## 触发字符配置

### 配置项说明

**配置名称**: `dify.codeCompletion.triggerCharacters`
**类型**: 字符串数组
**默认值**: `[".", " ", "(", "=", "{", "\n"]`

### 配置方式

#### 方法一：通过 VS Code 设置界面

1. 打开 VS Code 设置 (`Cmd+,` 或 `Ctrl+,`)
2. 搜索 "dify trigger"
3. 找到 "Trigger Characters" 配置项
4. 点击 "编辑 settings.json" 或直接在界面中修改数组

#### 方法二：通过 settings.json

```json
{
  "dify.codeCompletion.triggerCharacters": [
    ".",      // 点号
    " ",      // 空格
    "(",      // 左括号
    "=",      // 等号
    "{",      // 左大括号
    "\n",     // 换行符
    "->",     // 箭头操作符
    "::",     // 作用域解析符
    "."       // 自定义字符
  ]
}
```

### 特殊字符支持

扩展支持以下特殊字符的转义：

- `\n` → 换行符
- `\t` → 制表符
- `\s` → 空格符

### 实时更新

修改触发字符配置后，扩展会自动重新注册补全提供者，无需重启 VS Code。

## 快捷键配置

### 配置项说明

**配置名称**: `dify.codeCompletion.triggerKeybinding`
**类型**: 对象
**默认值**:
```json
{
  "key": "ctrl+alt+space",
  "mac": "cmd+shift+space",
  "when": "editorTextFocus"
}
```

### 配置属性

- **`key`**: Windows/Linux 系统的快捷键
- **`mac`**: macOS 系统的快捷键
- **`when`**: 快捷键生效的条件

### 配置方式

#### 方法一：通过 VS Code 设置

```json
{
  "dify.codeCompletion.triggerKeybinding": {
    "key": "ctrl+alt+i",
    "mac": "cmd+option+i",
    "when": "editorTextFocus"
  }
}
```

#### 方法二：通过命令面板

1. 按 `Cmd+Shift+P` (Mac) 或 `Ctrl+Shift+P` (Windows/Linux) 打开命令面板
2. 搜索并运行 "Dify: Update Keybinding Configuration"
3. 选择操作：
   - **打开 keybindings.json**: 直接编辑 VS Code 全局快捷键文件
   - **复制配置**: 将配置复制到剪贴板，手动粘贴到 keybindings.json

#### 方法三：手动编辑 keybindings.json

1. 按 `Cmd+Shift+P` 打开命令面板
2. 运行 "Preferences: Open Keyboard Shortcuts (JSON)"
3. 添加以下配置：

```json
[
  {
    "command": "dify.triggerCompletion",
    "key": "ctrl+alt+space",
    "mac": "cmd+shift+space",
    "when": "editorTextFocus"
  }
]
```

### 快捷键格式说明

VS Code 支持的快捷键格式：

- **修饰键**: `ctrl`, `cmd`, `alt`, `shift`, `option`
- **功能键**: `f1`-`f12`, `escape`, `tab`, `enter`, `space`
- **字母数字**: `a`-`z`, `0`-`9`
- **符号**: `-`, `=`, `[`, `]`, `;`, `'`, `,`, `.`, `/`, `\`

**组合示例**:
- `ctrl+alt+space`
- `cmd+shift+i`
- `ctrl+k ctrl+c` (连续按键)

### 触发条件 (when)

常用的 `when` 条件：

- `editorTextFocus`: 编辑器获得焦点
- `editorHasSelection`: 编辑器有选中文本
- `!editorReadonly`: 编辑器不是只读模式
- `resourceExtname == .js`: 当前文件是 JavaScript 文件

## 其他配置选项

### 自动触发配置

```json
{
  "dify.codeCompletion.autoTrigger": true,
  "dify.codeCompletion.triggerDelay": 500
}
```

- **`autoTrigger`**: 启用输入时自动触发补全
- **`triggerDelay`**: 自动补全触发延迟（毫秒，范围：100-5000）

### 上下文配置

```json
{
  "dify.codeCompletion.contextLines": 10
}
```

- **`contextLines`**: 作为上下文的光标前行数（范围：5-50）

### 语言支持配置

```json
{
  "dify.codeCompletion.languages": {
    "javascript": "javascript",
    "typescript": "typescript",
    "python": "python",
    "go": "go",
    "java": "java",
    "cpp": "cpp",
    "c": "c"
  }
}
```

### 扩展开关

```json
{
  "dify.codeCompletion.enabled": true
}
```

## 配置示例

### 完整配置示例

```json
{
  "dify.codeCompletion.apiKey": "your-api-key-here",
  "dify.codeCompletion.workflowId": "your-workflow-id-here",
  "dify.codeCompletion.baseUrl": "https://api.dify.ai/v1",
  "dify.codeCompletion.autoTrigger": true,
  "dify.codeCompletion.triggerDelay": 300,
  "dify.codeCompletion.contextLines": 15,
  "dify.codeCompletion.enabled": true,
  "dify.codeCompletion.triggerCharacters": [
    ".", " ", "(", "=", "{", "\n", "->", "::", "."
  ],
  "dify.codeCompletion.triggerKeybinding": {
    "key": "ctrl+alt+i",
    "mac": "cmd+option+i",
    "when": "editorTextFocus && !editorReadonly"
  }
}
```

### 针对特定语言的配置

```json
{
  "dify.codeCompletion.triggerCharacters": [
    ".",      // 对象属性访问
    "->",     // C++ 指针访问
    "::",     // C++ 作用域解析
    "(",      // 函数调用
    " ",      // 空格触发
    "\n"      // 换行触发
  ]
}
```

### 高级快捷键配置

```json
{
  "dify.codeCompletion.triggerKeybinding": {
    "key": "ctrl+k ctrl+i",
    "mac": "cmd+k cmd+i",
    "when": "editorTextFocus && resourceExtname =~ /\\.(js|ts|py|go)$/"
  }
}
```

## 常见问题

### Q: 修改配置后不生效怎么办？

**A**: 
1. 检查配置语法是否正确
2. 触发字符配置会自动生效，快捷键配置可能需要重启 VS Code
3. 使用 "Dify: Update Keybinding Configuration" 命令检查快捷键配置

### Q: 如何禁用某些触发字符？

**A**: 从 `triggerCharacters` 数组中移除不需要的字符即可。

### Q: 快捷键冲突怎么办？

**A**: 
1. 检查是否与其他扩展或 VS Code 内置快捷键冲突
2. 修改为其他组合键
3. 使用更具体的 `when` 条件

### Q: 如何重置为默认配置？

**A**: 删除 settings.json 中的相关配置项，扩展会使用默认值。

### Q: 支持哪些编程语言？

**A**: 目前支持：JavaScript、TypeScript、Python、Go、Java、C++、C

## 技术支持

如果遇到配置问题，请：

1. 检查 VS Code 开发者控制台的错误信息
2. 使用 "Dify: Test API Connection" 命令测试连接
3. 查看扩展的输出面板获取详细日志
4. 在项目 GitHub 仓库提交 Issue

---

**更新日期**: 2025年8月22日
**扩展版本**: 1.0.0