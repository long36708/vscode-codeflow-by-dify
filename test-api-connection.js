const fetch = require('node-fetch');

// 您的配置
const config = {
    baseUrl: 'https://api.dify.ai/v1',
    apiKey: 'app-7IRTJMVkFl5DGQaQ28wqjcdo',
    workflowId: '47de270b-b96b-4bb0-9c4c-7b03331b5192'
};

async function testDifyConnection() {
    console.log('🧪 开始测试 Dify API 连接...');
    console.log('配置信息:');
    console.log(`- Base URL: ${config.baseUrl}`);
    console.log(`- API Key: ${config.apiKey}`);
    console.log(`- Workflow ID: ${config.workflowId}`);
    console.log('');

    const workflowUrl = `${config.baseUrl}/workflows/${config.workflowId}/run`;
    
    // 测试用的代码上下文
    const testContext = {
        language: 'javascript',
        code_before_cursor: 'function calculateSum(a, b) {\n  return',
        line_number: 2,
        column_number: 9,
        file_path: 'test.js'
    };

    const requestBody = {
        inputs: testContext,
        response_mode: 'blocking',
        user: 'vscode-test-user'
    };

    console.log('📡 发送请求到:', workflowUrl);
    console.log('📋 请求体:', JSON.stringify(requestBody, null, 2));
    console.log('');

    try {
        const response = await fetch(workflowUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'VSCode-Dify-Extension-Test/1.0.0'
            },
            body: JSON.stringify(requestBody),
            timeout: 30000
        });

        console.log('📊 响应状态:', response.status, response.statusText);
        console.log('📋 响应头:', Object.fromEntries(response.headers.entries()));
        console.log('');

        const responseText = await response.text();
        console.log('📄 响应内容:', responseText);
        console.log('');

        if (!response.ok) {
            console.log('❌ API 调用失败!');
            console.log(`状态码: ${response.status}`);
            console.log(`错误信息: ${responseText}`);
            
            // 分析常见错误
            if (response.status === 401) {
                console.log('💡 可能的原因: API Key 无效或已过期');
            } else if (response.status === 404) {
                console.log('💡 可能的原因: Workflow ID 不存在或无权访问');
            } else if (response.status === 400) {
                console.log('💡 可能的原因: 请求格式错误或缺少必需参数');
            }
            return false;
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.log('⚠️  响应不是有效的 JSON 格式');
            return false;
        }

        console.log('✅ API 调用成功!');
        console.log('📊 解析后的响应:', JSON.stringify(data, null, 2));

        if (data.status === 'succeeded' && data.outputs) {
            console.log('🎉 工作流执行成功!');
            if (data.outputs.completion) {
                console.log('💡 代码补全结果:', data.outputs.completion);
            }
            return true;
        } else if (data.error) {
            console.log('❌ 工作流执行失败:', data.error);
            return false;
        } else {
            console.log('⚠️  工作流状态异常:', data.status);
            return false;
        }

    } catch (error) {
        console.log('❌ 网络请求失败!');
        console.log('错误详情:', error.message);
        
        if (error.code === 'ENOTFOUND') {
            console.log('💡 可能的原因: 网络连接问题或 DNS 解析失败');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('💡 可能的原因: 请求超时，网络较慢或服务器响应慢');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('💡 可能的原因: 服务器拒绝连接');
        }
        
        return false;
    }
}

// 执行测试
testDifyConnection().then(success => {
    console.log('');
    console.log('='.repeat(50));
    if (success) {
        console.log('🎉 测试结果: 连接成功! API 配置正确。');
    } else {
        console.log('❌ 测试结果: 连接失败! 请检查配置。');
    }
    console.log('='.repeat(50));
}).catch(error => {
    console.error('💥 测试脚本执行失败:', error);
});