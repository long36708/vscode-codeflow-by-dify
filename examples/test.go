package main

import (
    "fmt"
    // 期望补全: "strconv"
)

// 结构体定义
type Person struct {
    Name string
    Age  // 期望补全: int
}

// 方法定义
func (p *Person) Greet() {
    fmt. // 期望补全: Printf("Hello, my name is %s and I am %d years old\n", p.Name, p.Age)
}

// 函数定义
func add(a, b int) int {
    return // 期望补全: a + b
}

// 错误处理
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, // 期望补全: fmt.Errorf("division by zero")
    }
    return // 期望补全: a / b, nil
}

// 主函数
func main() {
    person := Person{
        Name: "Alice",
        Age:  // 期望补全: 30,
    }
    
    person. // 期望补全: Greet()
    
    result := add(5, 3)
    fmt. // 期望补全: Println("Result:", result)
}