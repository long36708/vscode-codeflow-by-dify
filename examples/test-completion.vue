<template>
  <div class="container">
    <h1>{{ title }}</h1>
    <button @click="handleClick">点击我</button>
    <!-- 在这里测试补全 -->
    <p>{{ user. }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 测试 Vue 文件中的代码补全
const title = ref('Hello Vue!')
const user = ref({
  name: 'John',
  email: 'john@example.com'
})

// 在这里输入点号应该触发补全
console.

// 测试对象属性访问
user.value.

// 测试函数调用补全
const handleClick = () => {
  // 测试补全
  user.value.
}

// 测试计算属性
const displayName = computed(() => {
  return user.value.
})
</script>

<style scoped>
.container {
  /* 测试 CSS 补全 */
  display: 
  background-color: 
  border-radius: 
}
</style>