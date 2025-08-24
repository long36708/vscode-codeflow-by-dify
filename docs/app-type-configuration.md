# Dify 应用类型配置指南

## 概述

Dify Code Completion 插件现在支持配置不同的应用类型，让您可以根据实际使用的 Dify 应用来优化代码补全体验。

## 配置选项

### 1. 应用类型 (appType)

选择您在 Dify 平台创建的应用类型：

- **聊天助手应用 (chatbot)** - 默认选项
  - 适合：对话式的代码补全和解释
  - 特点：更自然的交互，适合代码问答和简单补全
  - 推荐场景：日常编码、代码解释、简单函数补全

- **工作流应用 (workflow)**
  - 适合：复杂的代码生成逻辑
  - 特点：可以定制复杂的处理流程
  - 推荐场景：复杂算法生成、多步骤代码构建

- **自动选择 (auto)**
  - 智能选择最合适的应用类型
  - 根据首选应用类型进行尝试

### 2. 降级策略 (fallbackEnabled)

- **启用 (true)** - 默认选项
  - 当主应用类型失败时，自动尝试其他应用类型
  - 提高成功率，确保代码补全的可用性

- **禁用 (false)**
  - 只使用指定的应用类型
  - 适合明确知道应用类型且不希望降级的场景

### 3. 首选应用类型 (preferredAppType)

在自动模式下的首选应用类型：

- **聊天助手应用 (chatbot)** - 默认选项
- **工作流应用 (workflow)**

## 配置建议

### 新用户推荐配置
```json
{
  "appType": "chatbot",
  "fallbackEnabled": true,
  "preferredAppType": "chatbot"
}
```

### 高级用户配置
如果您有专门的工作流应用：
```json
{
  "appType": "workflow",
  "fallbackEnabled": false,
  "preferredAppType": "workflow"
}
```

### 混合使用配置
如果您同时有聊天和工作流应用：
```json
{
  "appType": "auto",
  "fallbackEnabled": true,
  "preferredAppType": "chatbot"
}
```

## 如何配置

1. 打开 VS Code 设置 (Ctrl/Cmd + ,)
2. 搜索 "Dify"
3. 找到 "Dify Code Completion" 部分
4. 根据您的需求调整以下设置：
   - **App Type**: 选择应用类型
   - **Fallback Enabled**: 是否启用降级
   - **Preferred App Type**: 首选应用类型

## 常见问题

**Q: 我应该选择哪种应用类型？**
A: 如果您刚开始使用，建议选择"聊天助手应用"。如果您有专门配置的工作流，可以选择"工作流应用"。

**Q: 什么时候需要禁用降级策略？**
A: 当您明确只想使用特定类型的应用，且不希望在失败时尝试其他类型时。

**Q: 自动模式和手动选择有什么区别？**
A: 自动模式会根据首选应用类型进行智能选择，并在失败时尝试其他类型。手动选择只使用指定的应用类型。

## 测试配置

配置完成后，可以使用以下方式测试：

1. 使用命令面板 (Ctrl/Cmd + Shift + P)
2. 运行 "测试 Dify 连接" 命令
3. 查看连接是否成功

如果连接失败，请检查：
- API Key 是否正确
- 应用 ID 是否正确
- 应用类型配置是否与实际应用匹配