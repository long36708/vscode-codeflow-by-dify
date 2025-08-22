import * as vscode from 'vscode';

export class UiManager {
    // 移除状态栏管理，由 extension.ts 统一管理
    public static initialize() {
        // 不再创建状态栏项，由 extension.ts 统一管理
    }

    public static showStatusReady() {
        // 使用全局状态更新函数
        if ((global as any).updateDifyStatus) {
            (global as any).updateDifyStatus('ready');
        }
    }

    public static showStatusLoading() {
        // 使用全局状态更新函数
        if ((global as any).updateDifyStatus) {
            (global as any).updateDifyStatus('working');
        }
    }

    public static showStatusError(message?: string) {
        // 使用全局状态更新函数
        if ((global as any).updateDifyStatus) {
            (global as any).updateDifyStatus('error', message);
        }
    }

    public static showStatusDisabled() {
        // 使用全局状态更新函数
        if ((global as any).updateDifyStatus) {
            (global as any).updateDifyStatus('disabled');
        }
    }

    public static showInfo(message: string) {
        vscode.window.showInformationMessage(`Dify: ${message}`);
    }

    public static showWarning(message: string) {
        vscode.window.showWarningMessage(`Dify: ${message}`);
    }

    public static showError(message: string) {
        vscode.window.showErrorMessage(`Dify: ${message}`);
    }

    public static async showInputBox(options: vscode.InputBoxOptions): Promise<string | undefined> {
        return await vscode.window.showInputBox(options);
    }

    public static async showQuickPick<T extends vscode.QuickPickItem>(
        items: T[],
        options?: vscode.QuickPickOptions
    ): Promise<T | undefined> {
        return await vscode.window.showQuickPick(items, options);
    }

    public static dispose() {
        // 状态栏现在由 extension.ts 管理，这里不需要处理
    }
}