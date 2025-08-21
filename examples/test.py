# Python 测试文件 - 用于测试 Dify 代码补全

def fibonacci(n):
    if n <= 1:
        return # 期望补全: n
    else:
        return # 期望补全: fibonacci(n-1) + fibonacci(n-2)

class Calculator:
    def __init__(self):
        self. # 期望补全: result = 0
    
    def add(self, a, b):
        return # 期望补全: a + b
    
    def multiply(self, x, y):
        result = # 期望补全: x * y
        return result

# 列表推导式
numbers = [1, 2, 3, 4, 5]
squares = [x # 期望补全: ** 2 for x in numbers]

# 异常处理
try:
    result = 10 / 0
except # 期望补全: ZeroDivisionError as e:
    print # 期望补全: (f"Error: {e}")

# 装饰器
def timer(func):
    def wrapper(*args, **kwargs):
        import time
        start = # 期望补全: time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"Function {func.__name__} took {end - start} seconds")
        return # 期望补全: result
    return # 期望补全: wrapper