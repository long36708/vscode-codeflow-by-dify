"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const TestComponent = ({ name, age }) => {
    // 在这里输入点号应该触发补全
    console.log('test');
    // 测试对象属性访问
    const user = { name: 'test', email: 'test@example.com' };
    user.name;
    // 测试 React 相关补全
    const [state, setState] = react_1.default.useState('');
    setState('new value');
    const handleClick = () => {
        console.log('clicked');
    };
    return (<div>
            <h1>{name}</h1>
            <p>Age: {age}</p>
            {/* 测试 JSX 中的补全 */}
            <button onClick={handleClick}>Click me</button>
        </div>);
};
exports.default = TestComponent;
//# sourceMappingURL=test-completion.js.map