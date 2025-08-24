// 测试修复后的 Dify 客户端
const { DifyClient } = require('./out/difyClient');

const config = {
    apiKey: 'app-8GiS84siDVpEJJO0V7aDUQgq',
    baseUrl: 'http://localhost/v1'

    // 下方调用的是chat-messages的接口，多轮对话
    // apiKey: 'app-LclIeM5kbhVr1niWFgAfaX4W',
    // workflowId: '94efe12f-afc6-4348-bf3b-7ef3fbd7891e',
    // baseUrl: 'https://api.dify.ai/v1'
};

async function testFixedClient() {
    console.log('🧪 测试修复后的 Dify 客户端...');
    console.log('');

    const client = new DifyClient(config.apiKey, config.baseUrl);

    // 测试连接
    console.log('1. 测试连接...');
    try {
        const connectionResult = await client.testConnection('auto');
        console.log(`   结果: ${connectionResult ? '✅ 成功' : '❌ 失败'}`);
    } catch (error) {
        console.log(`   ❌ 连接测试失败: ${error.message}`);
    }
    console.log('');

    // 测试代码补全
    // console.log('2. 测试代码补全...');
    // const testCases = [
    //     {
    //         name: 'JavaScript 函数补全',
    //         context: {
    //             language: 'javascript',
    //             code_before_cursor: 'function calculateSum(a, b) {\n  return',
    //             line_number: 2,
    //             column_number: 9
    //         }
    //     },
    //     {
    //         name: 'Python 函数补全',
    //         context: {
    //             language: 'python',
    //             code_before_cursor: 'def fibonacci(n):\n    if n <= 1:\n        return',
    //             line_number: 3,
    //             column_number: 15
    //         }
    //     }
    // ];
    //
    // for (const testCase of testCases) {
    //     console.log(`   测试: ${testCase.name}`);
    //     try {
    //         const result = await client.getCompletion(testCase.context);
    //         if (result) {
    //             console.log(`   ✅ 成功: "${result}"`);
    //         } else {
    //             console.log(`   ⚠️  无结果`);
    //         }
    //     } catch (error) {
    //         console.log(`   ❌ 失败: ${error.message}`);
    //     }
    //     console.log('');
    // }
}

testFixedClient().catch(console.error);