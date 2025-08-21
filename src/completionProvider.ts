import * as vscode from 'vscode';
import { DifyClient } from './difyClient';
import { ContextBuilder } from './contextBuilder';
import { ConfigManager } from './configManager';
import { UiManager } from './uiManager';

export class DifyCompletionProvider implements vscode.CompletionItemProvider {
    private lastTriggerTime: number = 0;
    private cache: Map<string, vscode.CompletionItem[]> = new Map();
    private readonly cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
    private loadingTimeout: NodeJS.Timeout | null = null;

    public async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): Promise<vscode.CompletionItem[] | null> {

        // 检查是否应该触发补全
        if (!this.shouldProvideCompletion(document, position, context)) {
            return null;
        }

        const config = ConfigManager.getConfiguration();
        
        // 检查配置
        if (!config.apiKey || !config.workflowId) {
            if (context.triggerKind === vscode.CompletionTriggerKind.Invoke) {
                UiManager.showWarning('请先配置 Dify API Key 和 Workflow ID');
            }
            return null;
        }

        // 防抖处理
        const now = Date.now();
        if (config.autoTrigger && context.triggerKind === vscode.CompletionTriggerKind.TriggerCharacter) {
            if (now - this.lastTriggerTime < config.triggerDelay) {
                return null;
            }
        }
        this.lastTriggerTime = now;

        // 构建上下文
        const codeContext = ContextBuilder.buildContext(document, position);
        
        // 检查缓存
        const cacheKey = this.generateCacheKey(codeContext);
        const cached = this.cache.get(cacheKey);
        if (cached && this.isCacheValid(cacheKey)) {
            return cached;
        }

        // 显示加载状态并设置超时保护
        UiManager.showStatusLoading();
        
        // 清除之前的超时
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
        }
        
        // 设置5秒超时，强制恢复状态
        this.loadingTimeout = setTimeout(() => {
            console.log('Dify completion timeout - forcing status reset');
            UiManager.showStatusReady();
        }, 5000);

        try {
            const client = new DifyClient(config.apiKey, config.workflowId, config.baseUrl);
            
            // 检查取消令牌
            if (token.isCancellationRequested) {
                this.clearLoadingTimeout();
                UiManager.showStatusReady();
                return null;
            }

            // 获取补全建议
            const completion = await client.getCompletion(codeContext);
            
            if (token.isCancellationRequested) {
                this.clearLoadingTimeout();
                UiManager.showStatusReady();
                return null;
            }

            if (!completion) {
                this.clearLoadingTimeout();
                UiManager.showStatusReady();
                return [];
            }

            // 创建补全项
            const items = this.createCompletionItems(completion, codeContext);
            
            // 缓存结果
            this.cache.set(cacheKey, items);
            setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);

            this.clearLoadingTimeout();
            UiManager.showStatusReady();
            return items;

        } catch (error) {
            // 确保在任何错误情况下都清除 loading 状态
            this.clearLoadingTimeout();
            UiManager.showStatusError();
            
            // 2秒后恢复到 Ready 状态
            setTimeout(() => {
                UiManager.showStatusReady();
            }, 2000);
            
            if (context.triggerKind === vscode.CompletionTriggerKind.Invoke) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                UiManager.showError(`获取补全失败: ${errorMessage}`);
            }
            
            console.error('Dify completion error:', error);
            return [];
        }
    }

    private createCompletionItems(completion: string, context: any): vscode.CompletionItem[] {
        const items: vscode.CompletionItem[] = [];

        // 主要补全项
        const mainItem = new vscode.CompletionItem(
            completion.split('\n')[0] || completion,
            vscode.CompletionItemKind.Snippet
        );
        
        mainItem.insertText = new vscode.SnippetString(completion);
        mainItem.detail = 'Dify AI 建议';
        mainItem.documentation = new vscode.MarkdownString(
            `**AI 生成的代码补全**\n\n\`\`\`${context.language}\n${completion}\n\`\`\``
        );
        mainItem.sortText = '0000'; // 置顶显示
        mainItem.preselect = true;
        
        // 添加标签
        mainItem.tags = [vscode.CompletionItemTag.Deprecated]; // 使用这个标签来标识AI生成
        
        items.push(mainItem);

        // 如果补全内容较长，创建一个简化版本
        if (completion.length > 50) {
            const shortCompletion = completion.split('\n')[0] || completion.substring(0, 50);
            const shortItem = new vscode.CompletionItem(
                shortCompletion,
                vscode.CompletionItemKind.Text
            );
            shortItem.insertText = shortCompletion;
            shortItem.detail = 'Dify AI 建议 (简化)';
            shortItem.sortText = '0001';
            items.push(shortItem);
        }

        return items;
    }

    private generateCacheKey(context: any): string {
        return `${context.language}:${context.line_number}:${context.code_before_cursor.slice(-100)}`;
    }

    private isCacheValid(cacheKey: string): boolean {
        // 简单的缓存有效性检查
        return this.cache.has(cacheKey);
    }

    public clearCache(): void {
        this.cache.clear();
    }

    private clearLoadingTimeout(): void {
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
            this.loadingTimeout = null;
        }
    }

    private shouldProvideCompletion(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.CompletionContext
    ): boolean {
        const config = ConfigManager.getConfiguration();
        
        // 检查是否启用
        if (!config.enabled) {
            console.log('Dify completion disabled in config');
            return false;
        }

        // 检查语言支持
        if (!ConfigManager.isLanguageSupported(document.languageId)) {
            console.log(`Language ${document.languageId} not supported`);
            return false;
        }

        // 如果是手动触发，总是允许
        if (context.triggerKind === vscode.CompletionTriggerKind.Invoke) {
            console.log('Manual trigger - allowing completion');
            return true;
        }

        // 如果禁用了自动触发，只允许手动触发
        if (!config.autoTrigger) {
            if (context.triggerKind === vscode.CompletionTriggerKind.TriggerCharacter || 
                context.triggerKind === vscode.CompletionTriggerKind.TriggerForIncompleteCompletions) {
                console.log('Auto trigger disabled');
                return false;
            }
        }

        // 检查当前行内容
        const lineText = document.lineAt(position.line).text;
        const beforeCursor = lineText.substring(0, position.character);
        
        // 跳过空行或只有空格的行
        if (beforeCursor.trim().length === 0) {
            return false;
        }

        // 改进的注释检测 - 支持注释后换行的代码补全
        const trimmedBefore = beforeCursor.trim();
        
        // 检查是否在注释中（但允许注释后的新行）
        if (trimmedBefore.length > 0) {
            // 如果当前行有内容且是注释，跳过
            if (trimmedBefore.startsWith('//') || trimmedBefore.startsWith('#') || 
                trimmedBefore.startsWith('/*') || trimmedBefore.startsWith('*')) {
                return false;
            }
        } else {
            // 如果当前行为空，检查上一行是否是注释
            if (position.line > 0) {
                const prevLineText = document.lineAt(position.line - 1).text.trim();
                
                // 如果上一行是注释（如 "// 深拷贝"），允许在新行触发补全
                if (prevLineText.startsWith('//') || prevLineText.startsWith('#')) {
                    console.log('Allowing completion after comment line:', prevLineText);
                    return true;
                }
            }
        }

        // 检查是否在字符串中
        const singleQuotes = (beforeCursor.match(/'/g) || []).length;
        const doubleQuotes = (beforeCursor.match(/"/g) || []).length;
        const backticks = (beforeCursor.match(/`/g) || []).length;
        
        if (singleQuotes % 2 === 1 || doubleQuotes % 2 === 1 || backticks % 2 === 1) {
            return false;
        }

        console.log(`Completion trigger allowed for ${document.languageId} at ${position.line}:${position.character}`);
        return true;
    }
}