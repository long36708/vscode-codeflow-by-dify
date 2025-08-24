import * as vscode from 'vscode';
import { ConfigManager } from './configManager';
import { DifyClient } from './difyClient';
import { UiManager } from './uiManager';

export class SettingsPanel {
    public static currentPanel: SettingsPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (SettingsPanel.currentPanel) {
            SettingsPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'difySettings',
            'Dify 设置面板',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
            }
        );

        SettingsPanel.currentPanel = new SettingsPanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._update();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // 处理来自 webview 的消息
        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'testConnection':
                        await this.handleTestConnection(message.config);
                        break;
                    case 'saveConfig':
                        await this.handleSaveConfig(message.config);
                        break;
                    case 'getConfig':
                        await this.sendCurrentConfig();
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    private async handleTestConnection(config: any) {
        try {
            this._panel.webview.postMessage({
                command: 'testResult',
                status: 'testing',
                message: '正在测试连接...'
            });

            const client = new DifyClient(config.apiKey, config.baseUrl);
            const result = await client.testConnection(
                config.appType, 
                config.fallbackEnabled, 
                config.preferredAppType
            );

            this._panel.webview.postMessage({
                command: 'testResult',
                status: result ? 'success' : 'error',
                message: result ? '✅ 连接成功！' : '❌ 连接失败，请检查配置'
            });

        } catch (error) {
            this._panel.webview.postMessage({
                command: 'testResult',
                status: 'error',
                message: `❌ 连接失败: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }

    private async handleSaveConfig(config: any) {
        try {
            await ConfigManager.updateConfiguration('apiKey', config.apiKey);
            await ConfigManager.updateConfiguration('baseUrl', config.baseUrl);
            await ConfigManager.updateConfiguration('autoTrigger', config.autoTrigger);
            await ConfigManager.updateConfiguration('triggerDelay', config.triggerDelay);
            await ConfigManager.updateConfiguration('contextLines', config.contextLines);
            await ConfigManager.updateConfiguration('enabled', config.enabled);

            this._panel.webview.postMessage({
                command: 'saveResult',
                status: 'success',
                message: '✅ 配置已保存'
            });

            UiManager.showInfo('配置已保存');
        } catch (error) {
            this._panel.webview.postMessage({
                command: 'saveResult',
                status: 'error',
                message: `❌ 保存失败: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }

    private async sendCurrentConfig() {
        const config = ConfigManager.getConfiguration();
        this._panel.webview.postMessage({
            command: 'currentConfig',
            config: config
        });
    }

    private _update() {
        this._panel.webview.html = this._getHtmlForWebview();
    }

    private _getHtmlForWebview() {
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dify 设置面板</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            background-color: var(--vscode-panel-background);
        }
        .section h2 {
            margin-top: 0;
            color: var(--vscode-textLink-foreground);
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 10px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input, select, textarea {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            font-family: inherit;
            font-size: inherit;
        }
        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
        }
        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .checkbox-group input[type="checkbox"] {
            width: auto;
        }
        .button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-family: inherit;
            font-size: inherit;
            margin-right: 10px;
        }
        .button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .button.secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        .button.secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        .status-message {
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            display: none;
        }
        .status-success {
            background-color: var(--vscode-testing-iconPassed);
            color: var(--vscode-editor-background);
        }
        .status-error {
            background-color: var(--vscode-testing-iconFailed);
            color: var(--vscode-editor-background);
        }
        .status-testing {
            background-color: var(--vscode-testing-iconQueued);
            color: var(--vscode-editor-background);
        }
        .help-text {
            font-size: 0.9em;
            color: var(--vscode-descriptionForeground);
            margin-top: 5px;
        }
        .test-section {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border-left: 4px solid var(--vscode-textLink-foreground);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Dify Code Completion 设置</h1>
        
        <div class="section">
            <h2>🔑 API 配置</h2>
            <div class="form-group">
                <label for="apiKey">API Key *</label>
                <input type="password" id="apiKey" placeholder="输入您的 Dify API Key">
                <div class="help-text">
                    获取方式：登录 Dify 控制台 → API 管理 → 创建密钥
                </div>
            </div>
            
            <div class="form-group">
                <label for="workflowId">Workflow ID *</label>
                <input type="text" id="workflowId" placeholder="输入工作流 ID">
                <div class="help-text">
                    用于代码补全的 Dify 工作流 ID
                </div>
            </div>
            
            <div class="form-group">
                <label for="baseUrl">API 基础 URL</label>
                <input type="text" id="baseUrl" value="https://api.dify.ai/v1">
                <div class="help-text">
                    私有部署时可修改此 URL
                </div>
            </div>
        </div>

        <div class="section test-section">
            <h2>🧪 连接测试</h2>
            <p>配置完成后，点击下方按钮测试 API 连接：</p>
            <button class="button" onclick="testConnection()">测试连接</button>
            <div id="testResult" class="status-message"></div>
        </div>

        <div class="section">
            <h2>⚙️ 补全设置</h2>
            
            <div class="form-group checkbox-group">
                <input type="checkbox" id="enabled">
                <label for="enabled">启用插件</label>
            </div>
            
            <div class="form-group checkbox-group">
                <input type="checkbox" id="autoTrigger">
                <label for="autoTrigger">启用自动触发补全</label>
            </div>
            
            <div class="form-group">
                <label for="triggerDelay">触发延迟 (毫秒)</label>
                <input type="number" id="triggerDelay" min="100" max="5000" value="500">
                <div class="help-text">
                    输入后多长时间触发自动补全
                </div>
            </div>
            
            <div class="form-group">
                <label for="contextLines">上下文行数</label>
                <input type="number" id="contextLines" min="5" max="50" value="10">
                <div class="help-text">
                    发送给 AI 的光标前代码行数
                </div>
            </div>
        </div>

        <div class="section">
            <h2>💾 保存设置</h2>
            <button class="button" onclick="saveConfig()">保存配置</button>
            <button class="button secondary" onclick="loadConfig()">重新加载</button>
            <div id="saveResult" class="status-message"></div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        // 页面加载时获取当前配置
        window.addEventListener('load', () => {
            loadConfig();
        });

        // 监听来自扩展的消息
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'currentConfig':
                    populateForm(message.config);
                    break;
                case 'testResult':
                    showTestResult(message.status, message.message);
                    break;
                case 'saveResult':
                    showSaveResult(message.status, message.message);
                    break;
            }
        });

        function loadConfig() {
            vscode.postMessage({ command: 'getConfig' });
        }

        function populateForm(config) {
            document.getElementById('apiKey').value = config.apiKey || '';
            document.getElementById('workflowId').value = config.workflowId || '';
            document.getElementById('baseUrl').value = config.baseUrl || 'https://api.dify.ai/v1';
            document.getElementById('enabled').checked = config.enabled !== false;
            document.getElementById('autoTrigger').checked = config.autoTrigger !== false;
            document.getElementById('triggerDelay').value = config.triggerDelay || 500;
            document.getElementById('contextLines').value = config.contextLines || 10;
        }

        function getFormData() {
            return {
                apiKey: document.getElementById('apiKey').value.trim(),
                workflowId: document.getElementById('workflowId').value.trim(),
                baseUrl: document.getElementById('baseUrl').value.trim(),
                enabled: document.getElementById('enabled').checked,
                autoTrigger: document.getElementById('autoTrigger').checked,
                triggerDelay: parseInt(document.getElementById('triggerDelay').value),
                contextLines: parseInt(document.getElementById('contextLines').value)
            };
        }

        function testConnection() {
            const config = getFormData();
            
            if (!config.apiKey || !config.workflowId) {
                showTestResult('error', '❌ 请先填写 API Key 和 Workflow ID');
                return;
            }
            
            vscode.postMessage({
                command: 'testConnection',
                config: config
            });
        }

        function saveConfig() {
            const config = getFormData();
            
            vscode.postMessage({
                command: 'saveConfig',
                config: config
            });
        }

        function showTestResult(status, message) {
            const element = document.getElementById('testResult');
            element.textContent = message;
            element.className = 'status-message status-' + status;
            element.style.display = 'block';
            
            // 3秒后自动隐藏成功消息
            if (status === 'success') {
                setTimeout(() => {
                    element.style.display = 'none';
                }, 3000);
            }
        }

        function showSaveResult(status, message) {
            const element = document.getElementById('saveResult');
            element.textContent = message;
            element.className = 'status-message status-' + status;
            element.style.display = 'block';
            
            // 3秒后自动隐藏
            setTimeout(() => {
                element.style.display = 'none';
            }, 3000);
        }
    </script>
</body>
</html>`;
    }

    public dispose() {
        SettingsPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}