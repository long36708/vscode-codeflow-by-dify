import * as vscode from 'vscode';

export interface DifyConfig {
    apiKey: string;
    workflowId: string;
    baseUrl: string;
    autoTrigger: boolean;
    triggerDelay: number;
    contextLines: number;
    languages: Record<string, string>;
    enabled: boolean;
}

export class ConfigManager {
    private static context: vscode.ExtensionContext;

    public static initialize(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public static getConfiguration(): DifyConfig {
        const config = vscode.workspace.getConfiguration('dify.codeCompletion');
        
        return {
            apiKey: config.get<string>('apiKey', ''),
            workflowId: config.get<string>('workflowId', ''),
            baseUrl: config.get<string>('baseUrl', 'https://api.dify.ai/v1'),
            autoTrigger: config.get<boolean>('autoTrigger', true),
            triggerDelay: config.get<number>('triggerDelay', 500),
            contextLines: config.get<number>('contextLines', 10),
            languages: config.get<Record<string, string>>('languages', {
                'javascript': 'javascript',
                'typescript': 'typescript',
                'typescriptreact': 'typescript',
                'javascriptreact': 'javascript',
                'vue': 'vue',
                'svelte': 'javascript',
                'html': 'html',
                'css': 'css',
                'scss': 'css',
                'sass': 'css',
                'less': 'css',
                'json': 'json',
                'jsonc': 'json',
                'yaml': 'yaml',
                'xml': 'xml',
                'python': 'python',
                'go': 'go',
                'java': 'java',
                'cpp': 'cpp',
                'c': 'c',
                'csharp': 'csharp',
                'php': 'php',
                'ruby': 'ruby',
                'rust': 'rust',
                'kotlin': 'kotlin',
                'swift': 'swift',
                'sql': 'sql',
                'markdown': 'markdown',
                'shellscript': 'bash'
            }),
            enabled: config.get<boolean>('enabled', true)
        };
    }

    public static async updateConfiguration(key: keyof DifyConfig, value: any): Promise<void> {
        const config = vscode.workspace.getConfiguration('dify.codeCompletion');
        await config.update(key, value, vscode.ConfigurationTarget.Global);
    }

    public static isLanguageSupported(languageId: string): boolean {
        const config = this.getConfiguration();
        return languageId in config.languages;
    }

    public static getDifyLanguageCode(languageId: string): string {
        const config = this.getConfiguration();
        return config.languages[languageId] || languageId;
    }

    public static onConfigurationChanged(callback: (event: vscode.ConfigurationChangeEvent) => void): vscode.Disposable {
        return vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('dify.codeCompletion')) {
                callback(event);
            }
        });
    }

    public static async resetTestConnection(): Promise<void> {
        const config = vscode.workspace.getConfiguration('dify.codeCompletion');
        await config.update('testConnection', false, vscode.ConfigurationTarget.Global);
    }
}