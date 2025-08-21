const fetch = require('node-fetch');

const config = {
    baseUrl: 'https://api.dify.ai/v1',
    apiKey: 'app-7IRTJMVkFl5DGQaQ28wqjcdo',
    workflowId: '47de270b-b96b-4bb0-9c4c-7b03331b5192'
};

async function testDifferentRoutes() {
    console.log('🔍 检测应用类型和正确的 API 路由...');
    console.log('');

    // 测试不同的 API 路由
    const routes = [
        {
            name: 'Workflow App',
            url: `${config.baseUrl}/workflows/${config.workflowId}/run`,
            body: {
                inputs: {
                    language: 'javascript',
                    code_before_cursor: 'function test() {\n  return',
                    line_number: 2,
                    column_number: 9
                },
                response_mode: 'blocking',
                user: 'vscode-test'
            }
        },
        {
            name: 'Chat Completion',
            url: `${config.baseUrl}/chat-messages`,
            body: {
                inputs: {},
                query: 'Complete this JavaScript code: function calculateSum(a, b) { return',
                response_mode: 'blocking',
                conversation_id: '',
                user: 'vscode-test'
            }
        },
        {
            name: 'Completion',
            url: `${config.baseUrl}/completion-messages`,
            body: {
                inputs: {
                    code_context: 'function calculateSum(a, b) {\n  return'
                },
                response_mode: 'blocking',
                user: 'vscode-test'
            }
        }
    ];

    for (const route of routes) {
        console.log(`🧪 测试 ${route.name}...`);
        console.log(`📡 URL: ${route.url}`);
        
        try {
            const response = await fetch(route.url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(route.body),
                timeout: 10000
            });

            console.log(`📊 状态: ${response.status} ${response.statusText}`);
            
            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.log(`❌ 响应不是 JSON: ${responseText.substring(0, 100)}...`);
                continue;
            }

            if (response.ok) {
                console.log(`✅ ${route.name} 成功!`);
                console.log(`📋 响应: ${JSON.stringify(data, null, 2)}`);
                return { success: true, route: route.name, url: route.url, data };
            } else {
                console.log(`❌ ${route.name} 失败: ${data.message || data.error || '未知错误'}`);
                if (data.code) {
                    console.log(`   错误代码: ${data.code}`);
                }
            }
        } catch (error) {
            console.log(`❌ ${route.name} 网络错误: ${error.message}`);
        }
        
        console.log('');
    }

    return { success: false };
}

// 检查应用信息的函数
async function checkAppInfo() {
    console.log('📋 检查应用信息...');
    
    // 尝试获取应用信息（如果 API 支持）
    const infoUrl = `${config.baseUrl}/apps`;
    
    try {
        const response = await fetch(infoUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('📊 应用信息:', JSON.stringify(data, null, 2));
        } else {
            console.log('⚠️  无法获取应用信息');
        }
    } catch (error) {
        console.log('⚠️  获取应用信息失败:', error.message);
    }
    console.log('');
}

async function main() {
    await checkAppInfo();
    const result = await testDifferentRoutes();
    
    console.log('='.repeat(60));
    if (result.success) {
        console.log(`🎉 找到正确的 API 路由: ${result.route}`);
        console.log(`📡 正确的 URL: ${result.url}`);
        console.log('');
        console.log('💡 解决方案:');
        console.log('1. 在 Dify 控制台检查您的应用类型');
        console.log('2. 如果是聊天应用，使用 chat-messages 端点');
        console.log('3. 如果是补全应用，使用 completion-messages 端点');
        console.log('4. 如果是工作流应用，检查工作流是否正确发布');
    } else {
        console.log('❌ 所有 API 路由都失败了');
        console.log('');
        console.log('💡 可能的解决方案:');
        console.log('1. 检查 API Key 是否正确且有效');
        console.log('2. 检查应用 ID 是否正确');
        console.log('3. 确认应用已发布且处于活跃状态');
        console.log('4. 检查 Dify 控制台中的应用类型和配置');
        console.log('5. 查看 Dify 控制台的 API 文档获取正确的调用方式');
    }
    console.log('='.repeat(60));
}

main().catch(console.error);