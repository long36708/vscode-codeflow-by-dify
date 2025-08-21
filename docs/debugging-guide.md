# VS Code 插件调试指南

## 🐛 调试方法

### 1. 启动调试会话

#### 方法一：快捷键
- 按 `F5` 启动调试
- 会打开新的 VS Code 窗口（扩展开发主机）

#### 方法二：命令面板
1. `Ctrl+Shift+P` 打开命令面板
2. 输入 "Debug: Start Debugging"
3. 选择 "Run Extension"

#### 方法三：调试面板
1. 点击左侧 **运行和调试** 图标
2. 选择 "Run Extension" 配置
3. 点击绿色播放按钮

### 2. 设置断点

在源代码中设置断点：

```typescript
// src/extension.ts
export function activate(context: vscode.ExtensionContext) {
    console.log('插件激活'); // 在这里设置断点
    
    // 点击行号左侧设置红色断点
    ConfigManager.initialize(context); // 断点位置
}
```

### 3. 调试步骤

#### 3.1 准备工作
```bash
# 确保依赖已安装
npm install

# 编译 TypeScript
npm run compile

# 检查编译结果
ls out/
```

#### 3.2 启动调试
1. **主窗口**：当前开发项目
2. **调试窗口**：新打开的 VS Code 实例（插件已加载）

#### 3.3 测试插件功能

在调试窗口中：

1. **打开测试文件**
```bash
# 创建测试文件
echo "function test() {" > test.js
echo "  return" >> test.js
```

2. **配置插件**
- `Ctrl+,` 打开设置
- 搜索 "Dify"
- 配置 API Key 和 Workflow ID

3. **测试补全**
- 在 `return` 后输入空格
- 或按 `Ctrl+Alt+Space` 手动触发
- 观察控制台输出和断点

### 4. 查看调试信息

#### 4.1 开发者控制台
在调试窗口中：
- `Ctrl+Shift+I` 打开开发者工具
- 查看 Console 标签页的日志

#### 4.2 输出面板
- `Ctrl+Shift+U` 打开输出面板
- 选择 "Log (Extension Host)" 查看插件日志

#### 4.3 调试控制台
在主开发窗口中：
- 查看 **调试控制台** 面板
- 可以执行调试命令

### 5. 常用调试技巧

#### 5.1 添加日志
```typescript
// 在关键位置添加日志
console.log('触发补全:', context);
console.error('API 调用失败:', error);

// 使用 VS Code 输出通道
const outputChannel = vscode.window.createOutputChannel('Dify Debug');
outputChannel.appendLine('调试信息: ' + JSON.stringify(data));
outputChannel.show();
```

#### 5.2 条件断点
- 右键断点 → "编辑断点"
- 设置条件：`context.triggerKind === 1`

#### 5.3 监视变量
在调试面板的 **监视** 区域添加：
- `config.apiKey`
- `context.language`
- `completion`

### 6. 测试场景

#### 6.1 基本功能测试
```javascript
// test.js - 在调试窗口中创建
function calculateSum(a, b) {
  return // 光标在这里，测试补全
}
```

#### 6.2 配置测试
```bash
# 测试命令
Ctrl+Shift+P → "Dify: Test API Connection"
Ctrl+Shift+P → "Dify: Open Settings"
```

#### 6.3 错误场景测试
- 无效的 API Key
- 网络连接问题
- 工作流 ID 错误

### 7. 性能调试

#### 7.1 时间测量
```typescript
const start = Date.now();
const result = await client.getCompletion(context);
const duration = Date.now() - start;
console.log(`API 调用耗时: ${duration}ms`);
```

#### 7.2 内存监控
```typescript
// 监控缓存大小
console.log('缓存条目数:', this.cache.size);
```

### 8. 常见问题排查

#### 8.1 插件未激活
- 检查 `activationEvents` 配置
- 确认文件语言类型正确

#### 8.2 补全不触发
- 检查 `shouldTriggerCompletion` 逻辑
- 验证语言支持配置

#### 8.3 API 调用失败
- 检查网络连接
- 验证 API Key 和 Workflow ID
- 查看详细错误信息

### 9. 高级调试

#### 9.1 网络请求调试
```typescript
// 在 difyClient.ts 中添加详细日志
console.log('请求 URL:', this.workflowUrl);
console.log('请求头:', headers);
console.log('请求体:', JSON.stringify(body, null, 2));
```

#### 9.2 VS Code API 调试
```typescript
// 监听配置变化
vscode.workspace.onDidChangeConfiguration(event => {
  console.log('配置变更:', event.affectsConfiguration('dify.codeCompletion'));
});
```

### 10. 打包测试

#### 10.1 本地打包
```bash
# 安装打包工具
npm install -g vsce

# 打包插件
vsce package

# 安装测试
code --install-extension vscode-codeflow-by-dify-0.0.1.vsix
```

#### 10.2 发布前检查
```bash
# 检查打包内容
vsce ls

# 验证 package.json
vsce show
```

---

## 🚀 快速开始调试

1. **克隆项目** → **npm install** → **npm run compile**
2. **按 F5** 启动调试
3. **在新窗口中打开测试文件**
4. **配置 Dify API** 设置
5. **测试代码补全功能**

调试愉快！🎉