import * as vscode from 'vscode';
import { DifyClient } from './difyClient';
import { ContextBuilder } from './contextBuilder';
import { ConfigManager } from './configManager';
import { UiManager } from './uiManager';

export class DifyCompletionProvider implements vscode.CompletionItemProvider {
    private lastTriggerTime: number = 0;
    private cache: Map<string, vscode.CompletionItem[]> = new Map();
    private readonly cacheTimeout = 5 * 60 * 1000; // 5分钟缓存

    public async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): Promise<vscode.CompletionItem[] | null> {

        // 检查是否应该触发补全
        if (!ContextBuilder.shouldTriggerCompletion(document, position, context)) {
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

        // 显示加载状态
        UiManager.showStatusLoading();

        try {
            const client = new DifyClient(config.apiKey, config.workflowId, config.baseUrl);
            
            // 检查取消令牌
            if (token.isCancellationRequested) {
                return null;
            }

            // 获取补全建议
            const completion = await client.getCompletion(codeContext);
            
            if (token.isCancellationRequested) {
                return null;
            }

            if (!completion) {
                UiManager.showStatusReady();
                return [];
            }

            // 创建补全项
            const items = this.createCompletionItems(completion, codeContext);
            
            // 缓存结果
            this.cache.set(cacheKey, items);
            setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);

            UiManager.showStatusReady();
            return items;

        } catch (error) {
            UiManager.showStatusError();
            
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
}