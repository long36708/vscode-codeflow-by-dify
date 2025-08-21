// 配置验证脚本
const config = {
    baseUrl: 'https://api.dify.ai/v1',
    apiKey: 'app-7IRTJMVkFl5DGQaQ28wqjcdo',
    workflowId: '47de270b-b96b-4bb0-9c4c-7b03331b5192'
};

console.log('🔍 配置验证:');
console.log('');

// 1. 检查 Base URL 格式
console.log('1. Base URL 检查:');
console.log(`   URL: ${config.baseUrl}`);
if (config.baseUrl.endsWith('/v1')) {
    console.log('   ✅ Base URL 格式正确');
} else {
    console.log('   ❌ Base URL 应该以 /v1 结尾');
}
console.log('');

// 2. 检查 API Key 格式
console.log('2. API Key 检查:');
console.log(`   Key: ${config.apiKey}`);
if (config.apiKey.startsWith('app-')) {
    console.log('   ✅ API Key 格式正确 (以 app- 开头)');
} else {
    console.log('   ❌ API Key 应该以 app- 开头');
}
console.log('');

// 3. 检查 Workflow ID 格式
console.log('3. Workflow ID 检查:');
console.log(`   ID: ${config.workflowId}`);
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (uuidRegex.test(config.workflowId)) {
    console.log('   ✅ Workflow ID 格式正确 (UUID 格式)');
} else {
    console.log('   ❌ Workflow ID 格式不正确，应该是 UUID 格式');
}
console.log('');

// 4. 构建完整的 API URL
const fullUrl = `${config.baseUrl}/workflows/${config.workflowId}/run`;
console.log('4. 完整 API URL:');
console.log(`   ${fullUrl}`);
console.log('');

console.log('📋 Dify API 调用说明:');
console.log('- 确保您的 API Key 有访问该工作流的权限');
console.log('- 确保工作流已发布并处于活跃状态');
console.log('- 确保工作流配置了正确的输入和输出变量');
console.log('- 检查 Dify 控制台中的工作流日志');