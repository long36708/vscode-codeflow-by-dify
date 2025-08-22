# VS Code 扩展调试指南

本文档详细介绍如何在调试 Dify Code Completion 扩展时禁用其他插件，以避免插件冲突和提高调试效率。

## 目录

- [调试环境配置](#调试环境配置)
- [禁用其他插件的方法](#禁用其他插件的方法)
- [launch.json 配置](#launchjson-配置)
- [调试最佳实践](#调试最佳实践)
- [常见问题排查](#常见问题排查)

## 调试环境配置

### 方法一：使用 launch.json 配置（推荐）

在项目根目录创建或修改 `.vscode/launch.json` 文件：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension (Clean Environment)",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--disable-extensions"
      ],
      "outFiles": [
        "${workspaceFolder}/out/**/*.js"
      ],
      "preLaunchTask": "${workspaceFolder}/npm: compile"
    },
    {
      "name": "Run Extension (Minimal Extensions)",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--disable-extension=ms-vscode.vscode-typescript-next",
        "--disable-extension=ms-python.python",
        "--disable-extension=golang.go"
      ],
      "outFiles": [
        "${workspaceFolder}/out/**/*.js"
      ],
      "preLaunchTask": "${workspaceFolder}/npm: compile"
    },
    {
      "name": "Run Extension (Full Environment)",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}"
      ],
      "outFiles": [
        "${workspaceFolder}/out/**/*.js"
      ],
      "preLaunchTask": "${workspaceFolder}/npm: compile"
    }
  ]
}
```

### 方法二：使用 VS Code 配置文件

创建 `.vscode/settings.json` 文件来配置调试环境：

```json
{
  "extensions.autoCheckUpdates": false,
  "extensions.autoUpdate": false,
  "extensions.ignoreRecommendations": true,
  "debug.allowBreakpointsEverywhere": true,
  "typescript.preferences.includePackageJsonAutoImports": "off"
}
```

## 禁用其他插件的方法

### 1. 完全禁用所有插件

使用 `--disable-extensions` 参数：

```json
{
  "name": "Debug Extension (No Other Extensions)",
  "type": "extensionHost",
  "request": "launch",
  "args": [
    "--extensionDevelopmentPath=${workspaceFolder}",
    "--disable-extensions"
  ]
}
```

### 2. 选择性禁用特定插件

使用 `--disable-extension` 参数禁用特定插件：

```json
{
  "args": [
    "--extensionDevelopmentPath=${workspaceFolder}",
    "--disable-extension=ms-vscode.vscode-typescript-next",
    "--disable-extension=ms-python.python",
    "--disable-extension=golang.go",
    "--disable-extension=ms-vscode.cpptools",
    "--disable-extension=bradlc.vscode-tailwindcss"
  ]
}
```

### 3. 仅启用必要插件

使用 `--enable-proposed-api` 和选择性启用：

```json
{
  "args": [
    "--extensionDevelopmentPath=${workspaceFolder}",
    "--disable-extensions",
    "--enable-proposed-api=${workspaceFolder}"
  ]
}
```

### 4. 使用临时用户数据目录

创建隔离的调试环境：

```json
{
  "name": "Debug Extension (Isolated)",
  "type": "extensionHost",
  "request": "launch",
  "args": [
    "--extensionDevelopmentPath=${workspaceFolder}",
    "--user-data-dir=${workspaceFolder}/.vscode-debug"
  ]
}
```

## launch.json 完整配置

创建 `.vscode/launch.json` 文件：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "🚀 Debug Extension (Clean)",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--disable-extensions",
        "--new-window"
      ],
      "outFiles": [
        "${workspaceFolder}/out/**/*.js"
      ],
      "preLaunchTask": "npm: compile",
      "skipFiles": [
        "<node_internals>/**"
      ],
      "smartStep": true,
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "🔧 Debug Extension (Minimal)",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--disable-extension=ms-vscode.vscode-typescript-next",
        "--disable-extension=ms-python.python",
        "--disable-extension=golang.go",
        "--disable-extension=ms-vscode.cpptools",
        "--disable-extension=ms-vscode.vscode-json",
        "--new-window"
      ],
      "outFiles": [
        "${workspaceFolder}/out/**/*.js"
      ],
      "preLaunchTask": "npm: compile"
    },
    {
      "name": "🌐 Debug Extension (Full)",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--new-window"
      ],
      "outFiles": [
        "${workspaceFolder}/out/**/*.js"
      ],
      "preLaunchTask": "npm: compile"
    },
    {
      "name": "🔒 Debug Extension (Isolated)",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--user-data-dir=${workspaceFolder}/.vscode-debug",
        "--disable-extensions",
        "--new-window"
      ],
      "outFiles": [
        "${workspaceFolder}/out/**/*.js"
      ],
      "preLaunchTask": "npm: compile"
    }
  ]
}
```

## tasks.json 配置

创建 `.vscode/tasks.json` 文件来支持编译任务：

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "compile",
      "group": "build",
      "presentation": {
        "panel": "shared",
        "reveal": "silent",
        "clear": true
      },
      "problemMatcher": [
        "$tsc"
      ]
    },
    {
      "type": "npm",
      "script": "watch",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "panel": "dedicated",
        "reveal": "never"
      },
      "isBackground": true,
      "problemMatcher": [
        "$tsc-watch"
      ]
    }
  ]
}
```

## 调试最佳实践

### 1. 调试步骤

1. **编译扩展**：
   ```bash
   npm run compile
   # 或者使用监听模式
   npm run watch
   ```

2. **选择调试配置**：
   - 按 `F5` 或 `Cmd+Shift+D` 打开调试面板
   - 选择合适的调试配置（推荐使用 "Clean" 模式）

3. **设置断点**：
   - 在 `src/extension.ts` 的 `activate` 函数中设置断点
   - 在 `src/completionProvider.ts` 的关键方法中设置断点

4. **启动调试**：
   - 按 `F5` 启动调试
   - 新的 VS Code 窗口会打开，这是扩展宿主环境

### 2. 调试技巧

#### 查看扩展日志
```typescript
// 在代码中添加调试日志
console.log('Extension activated');
console.log('Configuration:', ConfigManager.getConfiguration());
```

#### 使用开发者工具
- 在扩展宿主窗口中按 `Cmd+Shift+I` 打开开发者工具
- 查看 Console 面板的日志输出
- 使用 Network 面板监控 API 请求

#### 测试特定功能
```typescript
// 在 activate 函数中添加测试代码
vscode.commands.executeCommand('dify.testConnection');
```

### 3. 性能调试

启用性能分析：

```json
{
  "name": "Debug Extension (Performance)",
  "type": "extensionHost",
  "request": "launch",
  "args": [
    "--extensionDevelopmentPath=${workspaceFolder}",
    "--disable-extensions",
    "--inspect-extensions=9229"
  ],
  "outFiles": [
    "${workspaceFolder}/out/**/*.js"
  ]
}
```

## 常见问题排查

### Q: 调试时扩展无法加载

**解决方案**:
1. 确保已运行 `npm run compile`
2. 检查 `out` 目录是否存在编译后的文件
3. 查看调试控制台的错误信息

### Q: 其他扩展仍然在运行

**解决方案**:
1. 确认使用了 `--disable-extensions` 参数
2. 检查 launch.json 配置是否正确
3. 尝试使用隔离的用户数据目录

### Q: 断点不生效

**解决方案**:
1. 确保 `outFiles` 路径正确
2. 检查 TypeScript 编译配置
3. 使用 `skipFiles` 排除不需要的文件

### Q: API 请求失败

**解决方案**:
1. 检查网络连接
2. 验证 API Key 和 Workflow ID
3. 查看开发者工具的 Network 面板

## 调试脚本

创建 `scripts/debug.sh` 脚本：

```bash
#!/bin/bash

echo "🔧 准备调试环境..."

# 清理旧的编译文件
rm -rf out/

# 编译 TypeScript
echo "📦 编译 TypeScript..."
npm run compile

# 检查编译结果
if [ $? -eq 0 ]; then
    echo "✅ 编译成功"
    echo "🚀 启动调试..."
    echo "请在 VS Code 中按 F5 开始调试"
else
    echo "❌ 编译失败"
    exit 1
fi
```

使用方法：
```bash
chmod +x scripts/debug.sh
./scripts/debug.sh
```

## 环境变量配置

在调试时设置环境变量：

```json
{
  "env": {
    "NODE_ENV": "development",
    "DEBUG": "dify:*",
    "VSCODE_DEBUG": "true"
  }
}
```

在代码中使用：
```typescript
if (process.env.NODE_ENV === 'development') {
    console.log('Debug mode enabled');
}
```

---

**更新日期**: 2025年8月22日
**适用版本**: VS Code 1.74.0+