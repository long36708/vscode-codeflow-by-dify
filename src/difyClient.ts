import fetch from 'node-fetch';
import { CodeContext } from './contextBuilder';

export interface DifyResponse {
    task_id?: string;
    status: string;
    outputs?: {
        completion?: string;
        suggestions?: string[];
        [key: string]: any;
    };
    error?: string;
    message?: string;
}

export class DifyClient {
    private apiKey: string;
    private workflowUrl: string;
    private baseUrl: string;

    constructor(apiKey: string, workflowId: string, baseUrl: string = 'https://api.dify.ai/v1') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.workflowUrl = `${baseUrl}/workflows/${workflowId}/run`;
    }

    public async getCompletion(context: CodeContext): Promise<string | null> {
        try {
            const response = await fetch(this.workflowUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'VSCode-Dify-Extension/1.0.0'
                },
                body: JSON.stringify({
                    inputs: context,
                    response_mode: 'blocking',
                    user: 'vscode-user'
                }),
                timeout: 30000 // 30秒超时
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Dify API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json() as DifyResponse;
            
            if (data.status === 'succeeded' && data.outputs?.completion) {
                return data.outputs.completion;
            } else if (data.error) {
                throw new Error(`Dify workflow error: ${data.error}`);
            } else {
                return null;
            }

        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(`Unknown error: ${String(error)}`);
        }
    }

    public async testConnection(): Promise<boolean> {
        try {
            // 使用简单的测试上下文
            const testContext: CodeContext = {
                language: 'javascript',
                code_before_cursor: 'function test() {\n  return',
                line_number: 2,
                column_number: 9
            };

            const result = await this.getCompletion(testContext);
            return result !== null;
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
                        ...context,
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
            
            if (data.status === 'succeeded') {
                if (data.outputs?.suggestions && Array.isArray(data.outputs.suggestions)) {
                    return data.outputs.suggestions;
                } else if (data.outputs?.completion) {
                    return [data.outputs.completion];
                }
            }

            return [];
        } catch (error) {
            console.error('Failed to get multiple completions:', error);
            return [];
        }
    }
}