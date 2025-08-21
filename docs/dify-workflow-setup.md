# Dify 工作流配置指南

本文档将指导您在 Dify 平台上创建用于代码补全的工作流。

## 1. 创建工作流

1. 登录 [Dify 控制台](https://dify.ai)
2. 点击 **创建应用** → **工作流**
3. 选择 **从空白开始**

## 2. 配置输入变量

在工作流中添加以下输入变量：

### 必需变量

| 变量名 | 类型 | 描述 | 示例 |
|--------|------|------|------|
| `language` | Text | 编程语言 | "javascript" |
| `code_before_cursor` | Text | 光标前的代码 | "function add(a, b) {\n  return" |
| `line_number` | Number | 当前行号 | 2 |
| `column_number` | Number | 当前列号 | 9 |

### 可选变量

| 变量名 | 类型 | 描述 | 示例 |
|--------|------|------|------|
| `code_after_cursor` | Text | 光标后的代码 | ";\n}" |
| `file_path` | Text | 文件路径 | "src/utils.js" |
| `project_context` | Text | 项目上下文 | "my-project" |

## 3. 配置 LLM 节点

### 3.1 添加 LLM 节点

1. 在工作流画布中添加 **LLM** 节点
2. 选择合适的模型（推荐 GPT-4 或 Claude）

### 3.2 配置系统提示词

```
你是一个专业的代码补全助手。根据用户提供的代码上下文，生成合适的代码补全建议。

要求：
1. 只返回需要补全的代码部分，不要包含已有的代码
2. 确保代码语法正确且符合最佳实践
3. 考虑代码的上下文和语言特性
4. 保持代码风格一致
5. 如果无法确定补全内容，返回空字符串

支持的语言：JavaScript, TypeScript, Python, Go, Java, C, C++
```

### 3.3 配置用户提示词

```
请为以下代码提供补全建议：

编程语言: {{#language#}}
当前位置: 第 {{#line_number#}} 行，第 {{#column_number#}} 列
文件路径: {{#file_path#}}

光标前的代码:
```{{#language#}}
{{#code_before_cursor#}}
```

{{#code_after_cursor#}}光标后的代码:
```{{#language#}}
{{#code_after_cursor#}}
```{{/code_after_cursor#}}

请只返回需要补全的代码部分：
```

## 4. 配置输出变量

### 4.1 添加输出节点

1. 添加 **End** 节点
2. 配置输出变量

### 4.2 输出变量配置

| 变量名 | 类型 | 来源 | 描述 |
|--------|------|------|------|
| `completion` | Text | LLM 节点输出 | 代码补全建议 |

## 5. 工作流示例

```
[Start] → [LLM] → [End]
   ↓        ↓       ↓
 输入变量  → 处理 → completion
```

## 6. 测试工作流

### 6.1 测试用例 1 - JavaScript 函数

**输入：**
```json
{
  "language": "javascript",
  "code_before_cursor": "function calculateSum(a, b) {\n  return",
  "line_number": 2,
  "column_number": 9
}
```

**期望输出：**
```json
{
  "completion": " a + b;"
}
```

### 6.2 测试用例 2 - Python 类

**输入：**
```json
{
  "language": "python",
  "code_before_cursor": "class Calculator:\n    def __init__(self):\n        self.",
  "line_number": 3,
  "column_number": 13
}
```

**期望输出：**
```json
{
  "completion": "result = 0"
}
```

## 7. 发布工作流

1. 测试通过后，点击 **发布**
2. 复制工作流 ID
3. 在 VS Code 插件设置中配置此 ID

## 8. 高级配置

### 8.1 多候选建议

如需支持多个补全建议，可以修改提示词：

```
请提供 3 个不同的代码补全建议，用 JSON 数组格式返回：
["建议1", "建议2", "建议3"]
```

对应的输出变量：
- `suggestions` (Array): 多个补全建议

### 8.2 上下文增强

可以添加更多上下文信息：

- 项目依赖信息
- 代码风格配置
- 函数签名提示
- 错误检查

### 8.3 缓存优化

在工作流中添加缓存逻辑，避免重复计算相同的补全请求。

## 9. 故障排除

### 常见问题

1. **工作流超时**
   - 检查 LLM 模型响应时间
   - 优化提示词长度
   - 设置合适的超时时间

2. **补全质量差**
   - 调整系统提示词
   - 增加更多上下文信息
   - 尝试不同的 LLM 模型

3. **API 调用失败**
   - 检查工作流发布状态
   - 验证 API 密钥权限
   - 确认输入格式正确

### 调试技巧

1. 在工作流中添加日志节点
2. 使用 Dify 的调试功能
3. 检查输入输出格式
4. 监控 API 调用日志

---

配置完成后，您的 VS Code 插件就可以使用这个工作流进行智能代码补全了！