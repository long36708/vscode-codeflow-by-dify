import * as vscode from 'vscode';
import { ConfigManager } from './configManager';

export interface CodeContext {
    language: string;
    code_before_cursor: string;
    code_after_cursor?: string;
    line_number: number;
    column_number: number;
    file_path?: string;
    project_context?: string;
}

export class ContextBuilder {
    public static buildContext(
        document: vscode.TextDocument,
        position: vscode.Position
    ): CodeContext {
        const config = ConfigManager.getConfiguration();
        const line = position.line;
        const char = position.character;

        // 获取光标前的代码（限制行数）
        const startLine = Math.max(0, line - config.contextLines);
        const start = new vscode.Position(startLine, 0);
        const end = position;
        let codeBefore = document.getText(new vscode.Range(start, end));

        // 特殊处理：如果当前行为空且上一行是注释，包含注释作为上下文
        const currentLineText = document.lineAt(position.line).text.trim();
        if (currentLineText.length === 0 && position.line > 0) {
            const prevLineText = document.lineAt(position.line - 1).text.trim();
            if (prevLineText.startsWith('//') || prevLineText.startsWith('#')) {
                // 提取注释内容作为提示
                const commentContent = prevLineText.replace(/^(\/\/|#)\s*/, '');
                codeBefore += `\n// TODO: ${commentContent}\n`;
            }
        }

        // 获取光标后的少量代码作为上下文（可选）
        const endLine = Math.min(document.lineCount - 1, line + 3);
        const afterEnd = new vscode.Position(endLine, document.lineAt(endLine).text.length);
        const codeAfter = document.getText(new vscode.Range(position, afterEnd));

        // 获取 Dify 语言代码
        const difyLanguage = ConfigManager.getDifyLanguageCode(document.languageId);

        return {
            language: difyLanguage,
            code_before_cursor: codeBefore,
            code_after_cursor: codeAfter.length > 0 ? codeAfter : undefined,
            line_number: line + 1,
            column_number: char + 1,
            file_path: this.getRelativeFilePath(document.uri),
            project_context: this.getProjectContext()
        };
    }

    private static getRelativeFilePath(uri: vscode.Uri): string {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        if (workspaceFolder) {
            return vscode.workspace.asRelativePath(uri, false);
        }
        return uri.fsPath;
    }

    private static getProjectContext(): string | undefined {
        // 获取项目上下文信息（如 package.json 中的依赖等）
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return undefined;
        }

        // 简单返回项目名称
        return workspaceFolders[0].name;
    }

    public static shouldTriggerCompletion(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.CompletionContext
    ): boolean {
        const config = ConfigManager.getConfiguration();
        
        // 检查是否启用
        if (!config.enabled) {
            return false;
        }

        // 检查语言支持
        if (!ConfigManager.isLanguageSupported(document.languageId)) {
            return false;
        }

        // 检查是否在注释中
        const lineText = document.lineAt(position.line).text;
        const beforeCursor = lineText.substring(0, position.character);
        
        // 简单的注释检测
        if (beforeCursor.includes('//') || beforeCursor.includes('#')) {
            return false;
        }

        // 检查是否在字符串中（简单检测）
        const singleQuotes = (beforeCursor.match(/'/g) || []).length;
        const doubleQuotes = (beforeCursor.match(/"/g) || []).length;
        if (singleQuotes % 2 === 1 || doubleQuotes % 2 === 1) {
            return false;
        }

        return true;
    }
}