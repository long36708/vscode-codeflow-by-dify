import * as vscode from 'vscode';
import { DifyCompletionProvider } from './completionProvider';
import { ConfigManager } from './configManager';
import { UiManager } from './uiManager';

export function activate(context: vscode.ExtensionContext) {
    console.log('Dify Code Completion extension is now active!');

    // 初始化配置管理器
    ConfigManager.initialize(context);
    
    // 初始化 UI 管理器
    UiManager.initialize();

    // 注册补全提供者
    const completionProvider = new DifyCompletionProvider();
    
    // 支持的语言
    const supportedLanguages = ['javascript', 'typescript', 'python', 'go', 'java', 'cpp', 'c'];
    
    supportedLanguages.forEach(language => {
        const disposable = vscode.languages.registerCompletionItemProvider(
            language,
            completionProvider,
            '.' // 触发字符
        );
        context.subscriptions.push(disposable);
    });

    // 注册命令
    const triggerCompletionCommand = vscode.commands.registerCommand('dify.triggerCompletion', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            UiManager.showWarning('没有活动的编辑器');
            return;
        }

        // 手动触发补全
        await vscode.commands.executeCommand('editor.action.triggerSuggest');
    });

    const openSettingsCommand = vscode.commands.registerCommand('dify.openSettings', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'dify.codeCompletion');
    });

    const testConnectionCommand = vscode.commands.registerCommand('dify.testConnection', async () => {
        const config = ConfigManager.getConfiguration();
        if (!config.apiKey || !config.workflowId) {
            UiManager.showError('请先配置 API Key 和 Workflow ID');
            return;
        }

        UiManager.showInfo('正在测试连接...');
        
        try {
            const { DifyClient } = await import('./difyClient');
            const client = new DifyClient(config.apiKey, config.workflowId, config.baseUrl);
            
            // 测试连接
            const testResult = await client.testConnection();
            if (testResult) {
                UiManager.showInfo('✅ Dify API 连接成功！');
            } else {
                UiManager.showError('❌ Dify API 连接失败');
            }
        } catch (error) {
            UiManager.showError(`连接测试失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    });

    context.subscriptions.push(triggerCompletionCommand, openSettingsCommand, testConnectionCommand);

    // 检查初始配置
    checkInitialConfiguration();

    UiManager.showStatusReady();
}

function checkInitialConfiguration() {
    const config = ConfigManager.getConfiguration();
    
    if (!config.apiKey || !config.workflowId) {
        vscode.window.showInformationMessage(
            '欢迎使用 Dify Code Completion！请先配置 API Key 和 Workflow ID。',
            '打开设置'
        ).then(selection => {
            if (selection === '打开设置') {
                vscode.commands.executeCommand('dify.openSettings');
            }
        });
    }
}

export function deactivate() {
    UiManager.dispose();
}