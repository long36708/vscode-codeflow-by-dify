import fetch, { RequestInit } from 'node-fetch';
import * as https from 'https';
import { CodeContext } from './contextBuilder';

export interface DifyResponse {
    workflow_run_id?: string;
    task_id?: string;
    data?: {
        id: string;
        workflow_id: string;
        status: string;
        outputs?: {
            [key: string]: any;
        };
        error?: string;
        elapsed_time?: number;
        total_tokens?: number;
        total_steps?: number;
        created_at?: number;
        finished_at?: number;
    };
    // 保留聊天 API 的字段
    answer?: string;
    message?: string;
}

export class DifyClient {
    private apiKey: string;
    private workflowUrl: string;
    private chatUrl: string;
    private baseUrl: string;

    constructor(apiKey: string, baseUrl: string = 'https://api.dify.ai/v1') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.workflowUrl = `${baseUrl}/workflows/run`;
        this.chatUrl = `${baseUrl}/chat-messages`;
    }

    public async getCompletion(context: CodeContext, appType: 'auto' | 'workflow' | 'chatbot' = 'workflow', fallbackEnabled: boolean = true, preferredAppType: 'workflow' | 'chatbot' = 'workflow'): Promise<string | null> {
        switch (appType) {
            case 'workflow':
                return await this.tryWorkflowOnly(context, fallbackEnabled);
            case 'chatbot':
                return await this.tryChatbotOnly(context, fallbackEnabled);
            case 'auto':
            default:
                return await this.tryAutoMode(context, preferredAppType, fallbackEnabled);
        }
    }

    private async tryWorkflowOnly(context: CodeContext, fallbackEnabled: boolean): Promise<string | null> {
        try {
            return await this.retryRequest(() => this.tryWorkflowCompletion(context), 2);
        } catch (workflowError) {
            if (fallbackEnabled) {
                const workflowErrorMsg = workflowError instanceof Error ? workflowError.message : String(workflowError);
                console.log('工作流应用失败，尝试聊天应用:', workflowErrorMsg);
                try {
                    return await this.retryRequest(() => this.tryChatCompletion(context), 2);
                } catch (chatError) {
                    const chatErrorMsg = chatError instanceof Error ? chatError.message : String(chatError);
                    throw new Error(`所有应用类型都失败了。工作流错误: ${workflowErrorMsg}; 聊天错误: ${chatErrorMsg}`);
                }
            } else {
                throw workflowError;
            }
        }
    }

    private async tryChatbotOnly(context: CodeContext, fallbackEnabled: boolean): Promise<string | null> {
        try {
            return await this.retryRequest(() => this.tryChatCompletion(context), 2);
        } catch (chatError) {
            if (fallbackEnabled) {
                const chatErrorMsg = chatError instanceof Error ? chatError.message : String(chatError);
                console.log('聊天应用失败，尝试工作流应用:', chatErrorMsg);
                try {
                    return await this.retryRequest(() => this.tryWorkflowCompletion(context), 2);
                } catch (workflowError) {
                    const workflowErrorMsg = workflowError instanceof Error ? workflowError.message : String(workflowError);
                    throw new Error(`所有应用类型都失败了。聊天错误: ${chatErrorMsg}; 工作流错误: ${workflowErrorMsg}`);
                }
            } else {
                throw chatError;
            }
        }
    }

    private async tryAutoMode(context: CodeContext, preferredAppType: 'workflow' | 'chatbot', fallbackEnabled: boolean): Promise<string | null> {
        if (preferredAppType === 'chatbot') {
            // 优先使用聊天应用
            try {
                return await this.retryRequest(() => this.tryChatCompletion(context), 2);
            } catch (chatError) {
                if (fallbackEnabled) {
                    const chatErrorMsg = chatError instanceof Error ? chatError.message : String(chatError);
                    console.log('聊天应用失败，尝试工作流应用:', chatErrorMsg);
                    try {
                        return await this.retryRequest(() => this.tryWorkflowCompletion(context), 2);
                    } catch (workflowError) {
                        const workflowErrorMsg = workflowError instanceof Error ? workflowError.message : String(workflowError);
                        throw new Error(`所有应用类型都失败了。聊天错误: ${chatErrorMsg}; 工作流错误: ${workflowErrorMsg}`);
                    }
                } else {
                    throw chatError;
                }
            }
        } else {
            // 优先使用工作流应用
            try {
                return await this.retryRequest(() => this.tryWorkflowCompletion(context), 2);
            } catch (workflowError) {
                if (fallbackEnabled) {
                    const workflowErrorMsg = workflowError instanceof Error ? workflowError.message : String(workflowError);
                    console.log('工作流应用失败，尝试聊天应用:', workflowErrorMsg);
                    try {
                        return await this.retryRequest(() => this.tryChatCompletion(context), 2);
                    } catch (chatError) {
                        const chatErrorMsg = chatError instanceof Error ? chatError.message : String(chatError);
                        throw new Error(`所有应用类型都失败了。工作流错误: ${workflowErrorMsg}; 聊天错误: ${chatErrorMsg}`);
                    }
                } else {
                    throw workflowError;
                }
            }
        }
    }

    private async retryRequest<T>(requestFn: () => Promise<T>, maxRetries: number): Promise<T> {
        let lastError: Error;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await requestFn();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                
                if (attempt < maxRetries) {
                    // 如果是连接重置错误，等待后重试
                    if (lastError.message.includes('ECONNRESET') || 
                        lastError.message.includes('ETIMEDOUT') ||
                        lastError.message.includes('timeout')) {
                        console.log(`连接失败，${1000 * (attempt + 1)}ms 后重试 (${attempt + 1}/${maxRetries + 1})`);
                        await this.delay(1000 * (attempt + 1));
                        continue;
                    }
                }
                
                // 如果不是网络错误或已达到最大重试次数，直接抛出
                throw lastError;
            }
        }
        
        throw lastError!;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async tryWorkflowCompletion(context: CodeContext): Promise<string | null> {
        // 根据 baseUrl 协议选择合适的 Agent
        const isHttps = this.baseUrl.startsWith('https://');
        let agent;
        
        if (isHttps) {
            agent = new https.Agent({
                keepAlive: true,
                timeout: 30000,
                rejectUnauthorized: true
            });
        } else {
            // HTTP 协议不需要 HTTPS Agent
            agent = undefined;
        }

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'VSCode-Dify-Extension/1.0.0',
                'Connection': 'keep-alive'
            },
            body: JSON.stringify({
                inputs: {
                    query: this.buildWorkflowPrompt(context)
                },
                response_mode: 'blocking',
                user: 'vscode-user'
            }),
            timeout: 30000,
            agent: agent
        };

        const response = await fetch(this.workflowUrl, requestOptions);

        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                throw new Error(`工作流 API 错误: ${response.status} - ${errorText}`);
            }
            
            if (errorData.code === 'not_workflow_app') {
                throw new Error('应用类型不是工作流');
            }
            throw new Error(`工作流 API 错误: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        // 根据 API.md 文档，工作流 API 返回格式为：
        // { workflow_run_id, task_id, data: { status, outputs, error, ... } }
        if (data.data) {
            const workflowData = data.data;
            if (workflowData.status === 'succeeded' && workflowData.outputs) {
                // 从 outputs 中提取代码补全结果
                // outputs 是一个 JSON 对象，需要根据工作流配置的输出变量名来获取
                const outputs = workflowData.outputs;
                
                // 尝试常见的输出变量名
                if (outputs.completion) {
                    return outputs.completion;
                } else if (outputs.result) {
                    return outputs.result;
                } else if (outputs.answer) {
                    return outputs.answer;
                } else if (outputs.text) {
                    return outputs.text;
                } else {
                    // 如果没有找到预期的字段，返回第一个字符串值
                    for (const key in outputs) {
                        if (typeof outputs[key] === 'string' && outputs[key].trim()) {
                            return outputs[key];
                        }
                    }
                }
            } else if (workflowData.error) {
                throw new Error(`工作流执行错误: ${workflowData.error}`);
            } else if (workflowData.status === 'failed') {
                throw new Error('工作流执行失败');
            }
        }
        
        return null;
    }

    private async tryChatCompletion(context: CodeContext): Promise<string | null> {
        // 构建聊天提示词
        const prompt = this.buildChatPrompt(context);
        
        // 根据 baseUrl 协议选择合适的 Agent
        const isHttps = this.baseUrl.startsWith('https://');
        let agent;
        
        if (isHttps) {
            agent = new https.Agent({
                keepAlive: true,
                timeout: 30000,
                rejectUnauthorized: true
            });
        } else {
            // HTTP 协议不需要 HTTPS Agent
            agent = undefined;
        }

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'VSCode-Dify-Extension/1.0.0',
                'Connection': 'keep-alive'
            },
            body: JSON.stringify({
                inputs: {},
                query: prompt,
                response_mode: 'blocking',
                conversation_id: '',
                user: 'vscode-user'
            }),
            timeout: 30000,
            agent: agent
        };

        const response = await fetch(this.chatUrl, requestOptions);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`聊天 API 错误: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        if (data.answer) {
            // 从聊天回复中提取代码补全
            return this.extractCodeFromChatResponse(data.answer);
        }
        
        return null;
    }

    private buildWorkflowPrompt(context: CodeContext): string {
        return `作为一个专业的${context.language}代码补全助手，请为光标位置提供准确的代码补全。

规则：
1. 只返回需要补全的代码，不要包含任何解释、注释或代码块标记
2. 不要重复已有的代码
3. 确保补全的代码语法正确且符合上下文
4. 如果是赋值语句，只返回等号后面的值
5. 如果是对象或数组，确保格式正确

当前代码:
${context.code_before_cursor}

补全内容:`;
    }

    private buildChatPrompt(context: CodeContext): string {
        return `作为一个专业的${context.language}代码补全助手，请为光标位置提供准确的代码补全。

规则：
1. 只返回需要补全的代码，不要包含任何解释、注释或代码块标记
2. 不要重复已有的代码
3. 确保补全的代码语法正确且符合上下文
4. 如果是赋值语句，只返回等号后面的值
5. 如果是对象或数组，确保格式正确

当前代码:
${context.code_before_cursor}

补全内容:`;
    }

    private extractCodeFromChatResponse(answer: string): string {
        // 清理回复内容
        let cleanAnswer = answer.trim();
        
        // 移除常见的解释性文本
        const explanationPatterns = [
            /^(Here's|Here is|This is|The|You can|Try this|Consider|Based on)/i,
            /^(以下是|这是|可以|尝试|考虑|根据)/,
            /^(补全|完成|建议|代码)/
        ];
        
        for (const pattern of explanationPatterns) {
            cleanAnswer = cleanAnswer.replace(pattern, '').trim();
        }
        
        // 尝试提取代码块内容
        const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)\s*```/g;
        const codeBlocks = [];
        let match;
        
        while ((match = codeBlockRegex.exec(cleanAnswer)) !== null) {
            if (match[1] && match[1].trim()) {
                codeBlocks.push(match[1].trim());
            }
        }
        
        if (codeBlocks.length > 0) {
            // 使用第一个代码块
            let code = codeBlocks[0];
            
            // 如果代码块以语言标识符开头，移除它
            if (code.startsWith('typescript') || code.startsWith('javascript') || 
                code.startsWith('python') || code.startsWith('java')) {
                const lines = code.split('\n');
                if (lines.length > 1) {
                    code = lines.slice(1).join('\n').trim();
                }
            }
            
            return this.cleanupCodeCompletion(code);
        }
        
        // 如果没有代码块，处理纯文本回复
        const lines = cleanAnswer.split('\n');
        const codeLines = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && 
                !trimmed.startsWith('//') && 
                !trimmed.startsWith('#') &&
                !trimmed.match(/^(Here|This|The|You|Try|Consider|Based|以下|这是|可以|尝试|考虑|根据)/i)) {
                codeLines.push(trimmed);
            }
        }
        
        if (codeLines.length > 0) {
            return this.cleanupCodeCompletion(codeLines.join('\n'));
        }
        
        return this.cleanupCodeCompletion(cleanAnswer);
    }
    
    private cleanupCodeCompletion(code: string): string {
        // 移除多余的空行
        code = code.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        // 移除开头和结尾的空行
        code = code.trim();
        
        // 如果代码以分号结尾但前面没有内容，移除分号
        if (code === ';') {
            return '';
        }
        
        // 处理常见的格式问题
        // 如果是对象字面量，确保格式正确
        if (code.includes('{') && code.includes('}')) {
            // 简单的对象格式化
            code = code.replace(/{\s*([^}]+)\s*}/, (match, content) => {
                const properties = content.split(',').map((prop: string) => prop.trim()).filter((prop: string) => prop);
                if (properties.length > 0) {
                    return '{\n  ' + properties.join(',\n  ') + '\n}';
                }
                return '{}';
            });
        }
        
        return code;
    }

    public async testConnection(appType: 'auto' | 'workflow' | 'chatbot' = 'workflow', fallbackEnabled: boolean = true, preferredAppType: 'workflow' | 'chatbot' = 'workflow'): Promise<boolean> {
        try {
            // 使用简单的测试上下文
            const testContext: CodeContext = {
                language: 'javascript',
                code_before_cursor: 'function test() {\n  return',
                line_number: 2,
                column_number: 9
            };

            const result = await this.getCompletion(testContext, appType, fallbackEnabled, preferredAppType);
            return result !== null && result.length > 0;
        } catch (error) {
            console.error('Dify connection test failed:', error);
            return false;
        }
    }

    public async getMultipleCompletions(context: CodeContext, count: number = 3): Promise<string[]> {
        try {
            const response = await fetch(this.workflowUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'VSCode-Dify-Extension/1.0.0'
                },
                body: JSON.stringify({
                    inputs: {
                        query: this.buildWorkflowPrompt(context),
                        suggestion_count: count
                    },
                    response_mode: 'blocking',
                    user: 'vscode-user'
                }),
                timeout: 30000
            });

            if (!response.ok) {
                throw new Error(`Dify API error: ${response.status}`);
            }

            const data = await response.json() as DifyResponse;
            
            if (data.data && data.data.status === 'succeeded' && data.data.outputs) {
                const outputs = data.data.outputs;
                if (outputs.suggestions && Array.isArray(outputs.suggestions)) {
                    return outputs.suggestions;
                } else if (outputs.completion) {
                    return [outputs.completion];
                } else {
                    // 返回第一个字符串值作为单个补全
                    for (const key in outputs) {
                        if (typeof outputs[key] === 'string' && outputs[key].trim()) {
                            return [outputs[key]];
                        }
                    }
                }
            }

            return [];
        } catch (error) {
            console.error('Failed to get multiple completions:', error);
            return [];
        }
    }
}