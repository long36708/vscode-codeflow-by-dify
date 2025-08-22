import React from 'react';

// 测试 TSX 文件中的代码补全
interface Props {
    name: string;
    age: number;
}

const TestComponent: React.FC<Props> = ({ name, age }) => {
    // 在这里输入点号应该触发补全
    console.log('test');
    
    // 测试对象属性访问
    const user = { name: 'test', email: 'test@example.com' };
    user.name;
    
    // 测试 React 相关补全
    const [state, setState] = React.useState('');
    setState('new value');
    
    const handleClick = () => {
        console.log('clicked');
    };
    
    return (
        <div>
            <h1>{name}</h1>
            <p>Age: {age}</p>
            {/* 测试 JSX 中的补全 */}
            <button onClick={handleClick}>Click me</button>
        </div>
    );
};

export default TestComponent;