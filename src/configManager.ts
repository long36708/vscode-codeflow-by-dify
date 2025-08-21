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
                'python': 'python',
                'go': 'go',
                'java': 'java',
                'cpp': 'cpp',
                'c': 'c'
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

    public static onConfigurationChanged(callback: () => void): vscode.Disposable {
        return vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('dify.codeCompletion')) {
                callback();
            }
        });
    }
}