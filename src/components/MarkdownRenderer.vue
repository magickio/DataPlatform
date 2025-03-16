<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

// 定义组件属性
const props = defineProps<{
  content: string // Markdown内容
}>()

// 将Markdown转换为HTML
const htmlContent = computed(() => {
  if (!props.content)
    return ''

  // 基本的Markdown解析
  let html = props.content
    // 处理标题
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // 处理粗体和斜体
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 处理代码块
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // 处理行内代码
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // 处理链接
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    // 处理无序列表
    .replace(/^\s*[\-*] (.*$)/gm, '<li>$1</li>')
    // 处理有序列表
    .replace(/^\s*\d+\. (.*$)/gm, '<li>$1</li>')
    // 处理引用块
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    // 处理水平线
    .replace(/^---$/gm, '<hr>')
    // 处理段落
    .replace(/^(?!<[a-z])(.*$)/gim, '<p>$1</p>')

  // 将连续的<li>标签包装在<ul>中
  html = html.replace(/<li>[\s\S]*?<\/li>/gi, (match) => {
    return `<ul>${match}</ul>`
  })

  // 简单的表格处理
  html = html.replace(/\|(.+)\|/g, (match, content) => {
    const cells = content.split('|').map((cell: string) => cell.trim())
    const row = cells.map((cell: string) => `<td>${cell}</td>`).join('')
    return `<tr>${row}</tr>`
  })

  // 将表格行包装在表格中
  html = html.replace(/<tr>[\s\S]*?<\/tr>/gi, (match) => {
    return `<table>${match}</table>`
  })

  return html
})

// 创建一个ref来引用渲染容器
const markdownContainer = ref<HTMLElement | null>(null)

// 在组件挂载后应用样式
onMounted(() => {
  if (markdownContainer.value) {
    // 可以在这里添加额外的DOM操作，如果需要的话
  }
})
</script>

<template>
  <view
    ref="markdownContainer"
    class="markdown-content"
  >
    <!-- 使用安全的方式渲染HTML内容 -->
    <rich-text :nodes="htmlContent" />
  </view>
</template>

<style>
.markdown-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  word-break: break-word;
  padding: 0;
}

.markdown-content h1 {
  font-size: 1.5em;
  margin: 1em 0 0.5em;
  font-weight: 600;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-content h2 {
  font-size: 1.3em;
  margin: 1em 0 0.5em;
  font-weight: 600;
}

.markdown-content h3 {
  font-size: 1.1em;
  margin: 1em 0 0.5em;
  font-weight: 600;
}

.markdown-content p {
  margin: 0.5em 0;
}

.markdown-content ul {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.markdown-content li {
  margin: 0.3em 0;
  list-style-type: disc;
}

.markdown-content code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  background-color: rgba(175, 184, 193, 0.2);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.85em;
}

.markdown-content pre {
  background-color: #f6f8fa;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.8em 0;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  font-size: 0.9em;
  display: block;
  line-height: 1.5;
}

.markdown-content a {
  color: #0969da;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

/* 添加表格样式 */
.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
  overflow-x: auto;
  display: block;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid #dfe2e5;
  padding: 0.6em 1em;
  text-align: left;
}

.markdown-content th {
  background-color: #f6f8fa;
  font-weight: 600;
}

.markdown-content tr:nth-child(2n) {
  background-color: #f6f8fa;
}

/* 引用块样式 */
.markdown-content blockquote {
  margin: 1em 0;
  padding: 0 1em;
  color: #57606a;
  border-left: 0.25em solid #d0d7de;
}
</style>
