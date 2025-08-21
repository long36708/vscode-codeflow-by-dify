import * as vscode from 'vscode';

export class UiManager {
    private static statusBarItem: vscode.StatusBarItem;

    public static initialize() {
        // 创建状态栏项
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'dify.openSettings';
        this.statusBarItem.show();
        this.showStatusReady();
    }

    public static showStatusReady() {
        this.statusBarItem.text = '$(check) Dify: Ready';
        this.statusBarItem.tooltip = 'Dify Code Completion is ready. Click to open settings.';
        this.statusBarItem.backgroundColor = undefined;
    }

    public static showStatusLoading() {
        this.statusBarItem.text = '$(loading~spin) Dify: Loading...';
        this.statusBarItem.tooltip = 'Dify is generating code completion...';
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    }

    public static showStatusError() {
        this.statusBarItem.text = '$(error) Dify: Error';
        this.statusBarItem.tooltip = 'Dify API error. Click to open settings.';
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    }

    public static showStatusDisabled() {
        this.statusBarItem.text = '$(circle-slash) Dify: Disabled';
        this.statusBarItem.tooltip = 'Dify Code Completion is disabled. Click to open settings.';
        this.statusBarItem.backgroundColor = undefined;
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
        if (this.statusBarItem) {
            this.statusBarItem.dispose();
        }
    }
}