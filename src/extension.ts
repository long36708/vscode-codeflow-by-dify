import * as vscode from 'vscode';
import { DifyCompletionProvider } from './completionProvider';
import { ConfigManager } from './configManager';
import { UiManager } from './uiManager';
import { SettingsPanel } from './settingsPanel';

export function activate(context: vscode.ExtensionContext) {
    console.log('Dify Code Completion extension is now active!');

    // 初始化配置管理器
    ConfigManager.initialize(context);
    
    // 初始化 UI 管理器（不创建状态栏，由下面统一管理）
    // UiManager.initialize();

    // 注册所有命令（优先注册，确保命令可用）
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
        SettingsPanel.createOrShow(context.extensionUri);
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

    const updateKeybindingCommand = vscode.commands.registerCommand('dify.updateKeybinding', async () => {
        const config = vscode.workspace.getConfiguration('dify.codeCompletion');
        const keybindingConfig = config.get<any>('triggerKeybinding', {
            key: 'ctrl+alt+space',
            mac: 'cmd+shift+space',
            when: 'editorTextFocus'
        });

        const message = `当前快捷键配置：
Windows/Linux: ${keybindingConfig.key}
Mac: ${keybindingConfig.mac}
触发条件: ${keybindingConfig.when}

要应用新的快捷键配置，请手动添加到 VS Code 的 keybindings.json 文件中：
{
    "command": "dify.triggerCompletion",
    "key": "${keybindingConfig.key}",
    "mac": "${keybindingConfig.mac}",
    "when": "${keybindingConfig.when}"
}`;

        const action = await vscode.window.showInformationMessage(
            message,
            '打开 keybindings.json',
            '复制配置'
        );

        if (action === '打开 keybindings.json') {
            await vscode.commands.executeCommand('workbench.action.openGlobalKeybindings');
        } else if (action === '复制配置') {
            const keybindingJson = JSON.stringify({
                command: 'dify.triggerCompletion',
                key: keybindingConfig.key,
                mac: keybindingConfig.mac,
                when: keybindingConfig.when
            }, null, 2);
            
            await vscode.env.clipboard.writeText(keybindingJson);
            UiManager.showInfo('快捷键配置已复制到剪贴板');
        }
    });

    // 立即将所有命令添加到订阅中
    context.subscriptions.push(
        triggerCompletionCommand, 
        openSettingsCommand, 
        testConnectionCommand, 
        updateKeybindingCommand
    );

    // 显示插件启动成功提示
    vscode.window.showInformationMessage(
        '🚀 Dify Code Completion 插件启动成功！',
        '查看设置',
        '测试连接'
    ).then(selection => {
        if (selection === '查看设置') {
            vscode.commands.executeCommand('dify.openSettings');
        } else if (selection === '测试连接') {
            vscode.commands.executeCommand('dify.testConnection');
        }
    });
    
    // 状态栏显示插件状态
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(sync~spin) Dify 初始化中...';
    statusBarItem.tooltip = 'Dify Code Completion 正在初始化';
    statusBarItem.command = 'dify.openSettings';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // 更新状态栏显示函数
    function updateStatusBar(status: 'ready' | 'working' | 'error' | 'disabled', message?: string) {
        switch (status) {
            case 'ready':
                statusBarItem.text = '$(check) Dify Ready';
                statusBarItem.tooltip = 'Dify Code Completion 就绪，点击打开设置';
                statusBarItem.backgroundColor = undefined;
                break;
            case 'working':
                statusBarItem.text = '$(sync~spin) Dify 工作中...';
                statusBarItem.tooltip = 'Dify 正在生成代码补全';
                statusBarItem.backgroundColor = undefined;
                break;
            case 'error':
                statusBarItem.text = '$(error) Dify 错误';
                statusBarItem.tooltip = message || 'Dify 连接错误，点击查看设置';
                statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
                break;
            case 'disabled':
                statusBarItem.text = '$(circle-slash) Dify 未配置';
                statusBarItem.tooltip = '请配置 API Key 和 Workflow ID';
                statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
                break;
        }
    }

    // 将状态更新函数传递给其他模块
    (global as any).updateDifyStatus = updateStatusBar;

    // 注册补全提供者
    const completionProvider = new DifyCompletionProvider();
    
    // 支持的语言
    const supportedLanguages = [
        'javascript', 'typescript', 'typescriptreact', 'javascriptreact',
        'vue', 'svelte', 'html', 'css', 'scss', 'sass', 'less',
        'json', 'jsonc', 'yaml', 'xml',
        'python', 'go', 'java', 'cpp', 'c', 'csharp',
        'php', 'ruby', 'rust', 'kotlin', 'swift',
        'sql', 'markdown', 'shellscript'
    ];
    
    // 存储补全提供者的订阅，便于管理
    let completionProviderDisposables: vscode.Disposable[] = [];
    
    // 注册补全提供者函数
    function registerCompletionProviders() {
        // 清除旧的补全提供者
        completionProviderDisposables.forEach(disposable => disposable.dispose());
        completionProviderDisposables = [];
        
        // 获取用户配置的触发字符
        const config = vscode.workspace.getConfiguration('dify.codeCompletion');
        const triggerCharacters = config.get<string[]>('triggerCharacters', ['.', ' ', '(', '=', '{', '\n']);
        
        // 处理特殊字符
        const processedTriggerCharacters = triggerCharacters.map(char => {
            switch (char) {
                case '\\n': return '\n';
                case '\\t': return '\t';
                case '\\s': return ' ';
                default: return char;
            }
        });
        
        supportedLanguages.forEach(language => {
            const disposable = vscode.languages.registerCompletionItemProvider(
                { scheme: 'file', language: language },
                completionProvider,
                ...processedTriggerCharacters
            );
            completionProviderDisposables.push(disposable);
            context.subscriptions.push(disposable);
        });
    }
    
    // 初始注册
    registerCompletionProviders();

    // 动态注册快捷键函数
    let currentKeybindingDisposable: vscode.Disposable | undefined;
    
    function registerKeybinding() {
        // 清除旧的快捷键绑定
        if (currentKeybindingDisposable) {
            currentKeybindingDisposable.dispose();
        }
        
        const config = vscode.workspace.getConfiguration('dify.codeCompletion');
        const keybindingConfig = config.get<any>('triggerKeybinding', {
            key: 'ctrl+alt+space',
            mac: 'cmd+shift+space',
            when: 'editorTextFocus'
        });
        
        // 注册动态快捷键（通过命令面板提示用户）
        UiManager.showInfo(`快捷键已设置为: ${process.platform === 'darwin' ? keybindingConfig.mac : keybindingConfig.key}`);
    }
    
    // 初始注册快捷键
    registerKeybinding();

    // 监听配置变化
    const configChangeListener = ConfigManager.onConfigurationChanged(async (event) => {
        if (event.affectsConfiguration('dify.codeCompletion.testConnection')) {
            const testConnectionConfig = vscode.workspace.getConfiguration('dify.codeCompletion');
            const shouldTest = testConnectionConfig.get<boolean>('testConnection', false);
            
            if (shouldTest) {
                // 重置配置值
                await ConfigManager.resetTestConnection();
                
                // 执行测试连接
                await vscode.commands.executeCommand('dify.testConnection');
            }
        }
        
        // 监听触发字符配置变化
        if (event.affectsConfiguration('dify.codeCompletion.triggerCharacters')) {
            // 只清除补全提供者相关的注册，保留命令注册
            const completionProviderDisposables = context.subscriptions.filter(disposable => 
                disposable && disposable.constructor.name === 'Disposable'
            );
            
            completionProviderDisposables.forEach(disposable => {
                disposable.dispose();
                const index = context.subscriptions.indexOf(disposable);
                if (index > -1) {
                    context.subscriptions.splice(index, 1);
                }
            });
            
            // 重新注册补全提供者
            registerCompletionProviders();
            
            UiManager.showInfo('触发字符配置已更新');
        }
        
        // 监听快捷键配置变化
        if (event.affectsConfiguration('dify.codeCompletion.triggerKeybinding')) {
            registerKeybinding();
            UiManager.showInfo('快捷键配置已更新，请重启 VS Code 使新快捷键生效');
        }
    });
    
    context.subscriptions.push(configChangeListener);

    // 检查初始配置并设置相应状态
    checkInitialConfiguration();
    
    // 根据配置状态设置初始状态栏显示
    const config = ConfigManager.getConfiguration();
    if (!config.apiKey || !config.workflowId) {
        updateStatusBar('disabled');
    } else {
        updateStatusBar('ready');
    }
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