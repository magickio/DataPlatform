<script setup lang="ts">
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import NavBar from '@/components/NavBar.vue'
import { chatService } from '@/utils'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

// 状态变量
const activeModes = ref(new Set<string>()) // 使用 Set 来存储选中的模式
const isRecording = ref(false)
const inputText = ref('')
const isKeyboardVisible = ref(false)
const keyboardHeight = ref(0)
const inputBottom = ref(0)
// 添加领域抽屉状态
const isDomainDrawerOpen = ref(false)
const isHistoryDrawerOpen = ref(false)

// 聊天相关状态
const { chatState } = chatService
const isSending = computed(() => chatState.isLoading)
const messages = computed(() => chatState.messages)

// 添加历史记录相关状态
const chatHistory = ref<Array<{
  id: string
  date: string
  title: string
  preview: string
  messages: any[]
  conversationId: string
}>>([])

// 计算属性：内容区域的底部内边距
const contentPaddingBottom = computed(() => {
  // 当键盘弹出时，底部内边距需要加上键盘高度（单位：px）
  return isKeyboardVisible.value ? `calc(6rem + ${keyboardHeight.value}px)` : '6rem'
})

// 监听键盘事件
onMounted(() => {
  // 检查 uni.onKeyboardHeightChange 是否存在
  if (typeof uni.onKeyboardHeightChange === 'function') {
    // 监听键盘高度变化
    uni.onKeyboardHeightChange((res) => {
      isKeyboardVisible.value = res.height > 0
      keyboardHeight.value = res.height

      if (res.height > 0) {
        // 键盘弹出时，设置输入框的bottom为键盘高度
        inputBottom.value = res.height
      }
      else {
        // 键盘收起时，恢复输入框位置
        inputBottom.value = 0
        // 修复iOS键盘收起后页面不回弹的问题
        nextTick(() => {
          const currentPosition = document.documentElement.scrollTop || document.body.scrollTop
          // 先滚动到顶部再回到当前位置，修复iOS键盘收起后的页面问题
          document.body.scrollTop = document.documentElement.scrollTop = 0
          setTimeout(() => {
            document.body.scrollTop = document.documentElement.scrollTop = currentPosition
          }, 10)
        })
      }
    })
  }
  else {
    console.warn('uni.onKeyboardHeightChange 方法不存在，可能是在不支持的环境中运行')
  }

  // 加载保存的聊天历史
  loadSavedConversations()
})

onUnmounted(() => {
  if (typeof uni.offKeyboardHeightChange === 'function') {
    uni.offKeyboardHeightChange()
  }
})

// 领域数据
const domains = [
  {
    title: 'IOE设备保养',
    description: '设备状态与维护分析',
    icon: 'i-fa-solid:cogs',
    iconBg: 'bg-blue-100 text-blue-600',
    isActive: false,
  },
  {
    title: 'ESG数据',
    description: '环境社会治理指标',
    icon: 'i-fa-solid:leaf',
    iconBg: 'bg-green-100 text-green-600',
    isActive: false,
  },
  {
    title: '财务数据',
    description: '财务报表与预测分析',
    icon: 'i-fa-solid:chart-line',
    iconBg: 'bg-purple-100 text-purple-600',
    isActive: false,
  },
  {
    title: '人力资源',
    description: '人员配置与绩效分析',
    icon: 'i-fa-solid:users',
    iconBg: 'bg-orange-100 text-orange-600',
    isActive: false,
  },
  // 添加更多领域
  {
    title: '通用助手',
    description: '日常问答与任务',
    icon: 'i-fa-solid:robot',
    iconBg: 'bg-gray-100 text-gray-600',
    isActive: true,
  },
  {
    title: '编程开发',
    description: '代码与技术问题',
    icon: 'i-fa-solid:code',
    iconBg: 'bg-indigo-100 text-indigo-600',
    isActive: false,
  },
]

// 最近分析数据
const _recentAnalyses = [
  {
    title: 'Q2财务报表分析',
    description: '营收增长趋势与成本结构分析',
    time: '昨天',
    url: '/pages/results/index',
  },
  {
    title: '数据中心设备状态报告',
    description: '关键设备维护预警与建议',
    time: '3天前',
    url: '/pages/device_report/index',
  },
]

// 方法
function _toggleMode(mode: string) {
  if (activeModes.value.has(mode)) {
    activeModes.value.delete(mode)
  }
  else {
    activeModes.value.add(mode)
  }
}

function toggleRecording() {
  isRecording.value = !isRecording.value
}

// 发送消息
async function sendMessage() {
  if (inputText.value.trim()) {
    // 准备消息选项
    const options = {
      // 如果选择了深度思考模式，可以添加相关提示
      inputs: activeModes.value.has('thinking') ? { thinking_depth: 'deep' } : {},
      // 如果选择了联网搜索模式，可以添加相关标记
      web_search: activeModes.value.has('search'),
    }

    // 发送消息
    const content = inputText.value
    inputText.value = ''
    await chatService.sendMessage(content, options)
  }
}

// 取消响应
function cancelResponse() {
  chatService.cancelResponse()
}

// 处理输入框聚焦
function handleFocus() {
  // 在某些情况下，键盘事件可能不会触发，这里手动设置状态
  isKeyboardVisible.value = true
}

// 处理输入框失焦
function handleBlur() {
  // 延迟设置，避免与键盘事件冲突
  setTimeout(() => {
    if (keyboardHeight.value === 0) {
      isKeyboardVisible.value = false
      inputBottom.value = 0
    }
  }, 100)
}

// 格式化时间
function _formatTime(timestamp: number): string {
  // 保留此函数，虽然在UI中不再显示时间，但可能在其他地方需要使用
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 清除聊天记录，开始新对话
function startNewChat() {
  // 只有当有消息时才保存历史记录
  if (messages.value.length > 0) {
    uni.showModal({
      title: '提示',
      content: '确定要开始新的对话吗？当前对话记录将被保存。',
      success: (res) => {
        if (res.confirm) {
          // 保存当前对话到历史记录
          saveConversation()

          // 清空聊天记录
          chatService.clearChat()
        }
      },
    })
  }
  else {
    // 如果没有消息，直接清空
    chatService.clearChat()
  }
}

// 保存聊天历史
function saveConversation() {
  // 获取当前对话内容
  const currentMessages = messages.value
  if (currentMessages.length < 1)
    return // 至少需要一条消息

  // 创建新的历史记录
  const now = new Date()
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`

  // 获取第一个用户问题作为标题
  const firstUserMessage = currentMessages.find(msg => msg.role === 'user')
  const title = firstUserMessage ? firstUserMessage.content.substring(0, 30) : '新对话'

  // 获取最后一个AI回复作为预览
  const lastAIMessage = [...currentMessages].reverse().find(msg => msg.role === 'assistant')
  const preview = lastAIMessage ? lastAIMessage.content.substring(0, 50) : ''

  // 创建历史记录对象
  const conversationData = {
    id: Date.now().toString(),
    date: dateStr,
    title,
    preview,
    messages: JSON.parse(JSON.stringify(currentMessages)), // 深拷贝消息
    conversationId: chatState.conversationId, // 保存会话ID
  }

  // 添加到历史记录
  chatHistory.value.unshift(conversationData)

  // 保存到本地存储
  try {
    uni.setStorageSync('stella_conversations', JSON.stringify(chatHistory.value))
  }
  catch (e) {
    console.error('保存聊天历史失败:', e)
  }
}

// 加载保存的对话历史
function loadSavedConversations() {
  try {
    const savedHistory = uni.getStorageSync('stella_conversations')
    if (savedHistory) {
      chatHistory.value = JSON.parse(savedHistory)
    }
  }
  catch (e) {
    console.error('加载聊天历史失败:', e)
  }
}

// 加载历史对话
function loadConversation(conversation: any) {
  // 确认是否加载历史对话
  uni.showModal({
    title: '加载历史对话',
    content: '加载此对话将替换当前对话内容，确定继续吗？',
    success: (res) => {
      if (res.confirm) {
        // 保存当前对话（如果有消息）
        if (messages.value.length > 0) {
          saveConversation()
        }

        // 清空当前对话
        chatService.clearChat()

        // 加载历史消息
        // 由于 chatService 没有直接的 loadMessages 方法，我们需要手动添加消息
        if (conversation.messages && conversation.messages.length > 0) {
          // 先设置会话ID（如果有的话）
          if (conversation.conversationId) {
            chatState.conversationId = conversation.conversationId
          }

          // 逐条添加消息到聊天状态
          conversation.messages.forEach((msg: any) => {
            // 创建一个新的消息对象，确保ID和时间戳是新的
            const newMsg = {
              ...msg,
              id: `${msg.role}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              timestamp: Date.now(),
              status: 'success' as const,
            }

            // 添加到消息列表
            chatState.messages.push(newMsg)
          })
        }

        // 关闭抽屉
        isHistoryDrawerOpen.value = false

        // 显示加载成功提示
        uni.showToast({
          title: '历史对话已加载',
          icon: 'success',
          duration: 2000,
        })
      }
    },
  })
}

// 删除历史对话
function deleteConversation(id: string, event: Event) {
  // 阻止事件冒泡
  event.stopPropagation()

  uni.showModal({
    title: '删除对话',
    content: '确定要删除此对话吗？此操作不可撤销。',
    success: (res) => {
      if (res.confirm) {
        // 从历史记录中删除
        chatHistory.value = chatHistory.value.filter(conv => conv.id !== id)

        // 保存到本地存储
        try {
          uni.setStorageSync('stella_conversations', JSON.stringify(chatHistory.value))
        }
        catch (e) {
          console.error('保存聊天历史失败:', e)
        }
      }
    },
  })
}

// 新增方法
function toggleSearch() {
  uni.showToast({
    title: '搜索功能即将上线',
    icon: 'none',
  })
}

function toggleGraph() {
  uni.showToast({
    title: '图表功能即将上线',
    icon: 'none',
  })
}

// 添加领域抽屉方法
function toggleDomainDrawer() {
  isDomainDrawerOpen.value = !isDomainDrawerOpen.value
  if (isDomainDrawerOpen.value) {
    isHistoryDrawerOpen.value = false
  }
}

function toggleHistoryDrawer() {
  isHistoryDrawerOpen.value = !isHistoryDrawerOpen.value
  if (isHistoryDrawerOpen.value) {
    isDomainDrawerOpen.value = false
  }
}

function selectDomain(index: number) {
  // 重置所有领域的激活状态
  domains.forEach((domain, i) => {
    domain.isActive = i === index
  })

  // 关闭抽屉
  isDomainDrawerOpen.value = false

  // 添加系统消息提示领域切换
  if (domains[index].title !== '通用助手') {
    // 使用 sendMessage 方法代替不存在的 addSystemMessage
    const systemMessage = `已切换到「${domains[index].title}」领域，我将为您提供更专业的回答。`

    // 显示提示消息
    uni.showToast({
      title: systemMessage,
      icon: 'none',
      duration: 2000,
    })

    // 如果需要在聊天中显示这条消息，可以考虑以下方式之一：
    // 1. 如果 chatService 有 addMessage 方法
    // chatService.addMessage({ role: 'system', content: systemMessage })

    // 2. 或者使用 sendMessage 但标记为系统消息
    // chatService.sendMessage(systemMessage, { isSystem: true })
  }
}

function closeDrawers() {
  isDomainDrawerOpen.value = false
  isHistoryDrawerOpen.value = false
}
</script>

<template>
  <view class="page-container">
    <!-- 导航栏 -->
    <view class="nav-container">
      <NavBar
        title="SMART STELLA"
        :show-back="false"
        :show-action="true"
        :show-menu="true"
        :show-history="true"
        action-url="/pages/settings/index"
        @menu="toggleDomainDrawer"
        @history="toggleHistoryDrawer"
      />
    </view>

    <!-- 主内容区 -->
    <scroll-view
      scroll-y
      class="content-scroll-view"
      :style="{ paddingBottom: contentPaddingBottom }"
    >
      <view id="chat-messages" class="chat-messages">
        <!-- AI欢迎消息 -->
        <view v-if="messages.length === 0" class="ai-message message">
          <view class="mb-1 text-xs text-gray-500">
            STELLA
          </view>
          您好！我是您的智能助手Stella。今天我能为您做些什么？
        </view>

        <!-- 聊天消息区域 -->
        <view v-else>
          <view
            v-for="message in messages"
            :key="message.id"
            class="message"
            :class="message.role === 'user' ? 'user-message' : 'ai-message'"
          >
            <!-- 用户消息 -->
            <view v-if="message.role === 'user'" class="mb-1 text-right text-xs text-gray-500">
              您
            </view>
            <!-- AI消息 -->
            <view v-else class="mb-1 text-xs text-gray-500">
              STELLA
            </view>

            <!-- 消息内容 -->
            <view v-if="message.role === 'user'">
              {{ message.content }}
            </view>
            <view v-else>
              <MarkdownRenderer :content="message.content" />
              <!-- 加载动画 -->
              <view
                v-if="message.status === 'sending' && isSending && message.id === messages[messages.length - 1].id"
                class="typing-indicator mt-2"
              >
                <view class="typing-dot" />
                <view class="typing-dot" />
                <view class="typing-dot" />
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 新对话悬浮按钮 -->
      <view v-if="messages.length > 0" class="new-chat-button" @click="startNewChat">
        <view class="i-fa-solid:plus" />
        <view class="tooltip">
          开始新对话
        </view>
      </view>
    </scroll-view>

    <!-- 底部输入区 -->
    <view
      class="input-area"
      :style="{
        bottom: `${inputBottom}px`,
      }"
    >
      <!-- 输入框 -->
      <view class="input-container">
        <input
          v-model="inputText"
          type="text"
          placeholder="输入您的问题..."
          class="input-field"
          :adjust-position="false"
          :disabled="isSending"
          @focus="handleFocus"
          @blur="handleBlur"
        >
        <!-- 输入框图标区域 -->
        <view class="flex items-center">
          <view
            :class="{ 'text-red-500 animate-pulse': isRecording }"
            class="voice-btn mr-3 h-8 w-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200"
            @click="toggleRecording"
          >
            <view class="i-fa-solid:microphone text-current" />
          </view>
          <view
            v-if="!isSending"
            class="send-button"
            @click="sendMessage"
          >
            <view class="i-fa-solid:paper-plane" />
          </view>
          <view
            v-else
            class="send-button cancel-button"
            @click="cancelResponse"
          >
            <view class="i-fa-solid:times-circle" />
          </view>
        </view>
      </view>
    </view>

    <!-- 工具栏 -->
    <view class="toolbar">
      <view class="tool-button" @click="toggleSearch">
        <view class="i-fa-solid:search mr-1 inline-block" />
        <text>搜索</text>
      </view>
      <view class="tool-button" @click="toggleGraph">
        <view class="i-fa-solid:project-diagram mr-1 inline-block" />
        <text>图表</text>
      </view>
    </view>

    <!-- 领域选择抽屉 -->
    <view class="domain-drawer" :class="{ open: isDomainDrawerOpen }">
      <view class="border-b border-gray-200 p-4">
        <text class="block text-lg text-gray-800 font-medium">
          选择专业领域
        </text>
        <text class="mt-1 block text-sm text-gray-500">
          选择一个领域以获得更专业的回答
        </text>
      </view>

      <view class="domain-list">
        <view
          v-for="(domain, index) in domains"
          :key="index"
          class="domain-item flex items-center"
          :class="{ active: domain.isActive }"
          @click="selectDomain(index)"
        >
          <view class="domain-icon" :class="domain.iconBg">
            <view :class="domain.icon" />
          </view>
          <view>
            <text class="block text-gray-800 font-medium">
              {{ domain.title }}
            </text>
            <text class="block text-sm text-gray-500">
              {{ domain.description }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 聊天历史抽屉 -->
    <view class="history-drawer" :class="{ open: isHistoryDrawerOpen }">
      <view class="border-b border-gray-200 p-4">
        <text class="block text-lg text-gray-800 font-medium">
          聊天历史
        </text>
        <text class="mt-1 block text-sm text-gray-500">
          查看您之前的对话
        </text>
      </view>

      <!-- 显示历史记录 -->
      <view v-if="chatHistory.length === 0" class="empty-history">
        <view class="i-fa-regular:comment-dots mb-4 text-4xl opacity-50" />
        <text class="block">
          暂无聊天历史
        </text>
        <text class="mt-2 block text-sm">
          您的对话将会保存在这里
        </text>
      </view>

      <view v-else class="history-list">
        <view
          v-for="conversation in chatHistory"
          :key="conversation.id"
          class="history-item flex flex-col"
          @click="loadConversation(conversation)"
        >
          <view class="history-date">
            {{ conversation.date }}
          </view>
          <view class="history-preview font-medium">
            {{ conversation.title }}
          </view>
          <view class="history-preview text-sm">
            {{ conversation.preview }}
          </view>
          <view
            class="delete-history-btn"
            @click="deleteConversation(conversation.id, $event)"
          >
            <view class="i-fa-solid:trash-alt" />
          </view>
        </view>
      </view>
    </view>

    <!-- 抽屉遮罩层 -->
    <view class="drawer-overlay" :class="{ open: isDomainDrawerOpen || isHistoryDrawerOpen }" @click="closeDrawers" />
  </view>
</template>

<style>
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.animate-pulse {
  animation: pulse 1.5s infinite;
}

.page-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

.nav-container {
  width: 100%;
  background-color: #ffffff;
  z-index: 100;
}

.content-scroll-view {
  flex: 1;
  width: 100%;
  height: 0;
  z-index: 1;
}

.input-placeholder {
  width: 100%;
}

.input-area {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff;
  padding: 1rem;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  z-index: 99;
}

/* 消息样式 */
.message-item {
  position: relative;
  margin-bottom: 0;
  border-bottom: 1px solid #f0f0f0;
}

.user-message {
  background-color: #ffffff;
}

.assistant-message {
  background-color: #ffffff;
}

.message-content {
  word-break: break-word;
  white-space: pre-wrap;
}

/* 用户消息气泡 */
.user-bubble {
  display: inline-block;
  background-color: #e6e6e6;
  border-radius: 18px 18px 4px 18px;
  padding: 8px 12px;
  max-width: 100%;
}

/* AI消息样式 */
.ai-message {
  padding: 0;
  max-width: 100%;
  background-color: #ffffff;
  border-radius: 18px 18px 18px 4px;
  padding: 12px 16px;
  position: relative;
  color: #333333;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.ai-message::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 0;
  width: 12px;
  height: 12px;
  background-color: #8e6f47;
  border-radius: 50%;
  opacity: 0.8;
}

/* 加载动画 */
.typing-indicator {
  display: flex;
  align-items: center;
  margin-left: 12px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background-color: #8e6f47;
  border-radius: 50%;
  margin: 0 2px;
  opacity: 0.6;
  animation: pulse 1.5s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

/* 新对话按钮样式 */
.new-chat-button {
  position: fixed;
  left: 85%;
  transform: translateX(-50%);
  bottom: 130px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(142, 111, 71, 0.8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 30;
  transition: all 0.3s ease;
}

.new-chat-button:hover {
  transform: translateX(-50%) scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  background-color: rgba(142, 111, 71, 1);
}

.tooltip {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.new-chat-button:hover .tooltip {
  opacity: 1;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 工具栏 */
.toolbar {
  display: flex;
  padding: 8px 16px;
  gap: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background-color: #ffffff;
}

.tool-button {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8e6f47;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 16px;
  background-color: rgba(142, 111, 71, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-button:hover {
  background-color: rgba(142, 111, 71, 0.2);
}

.tool-button i,
.tool-button .i-fa-solid\:search,
.tool-button .i-fa-solid\:project-diagram {
  margin-right: 6px;
  color: #8e6f47;
}

/* 输入容器 */
.input-container {
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 24px;
  padding: 0 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.input-field {
  flex: 1;
  background: transparent;
  border: none;
  color: #333333;
  padding: 12px 0;
  outline: none;
  font-size: 16px;
}

.send-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #8e6f47;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-button:hover {
  transform: scale(1.05);
}

.cancel-button {
  background-color: #e74c3c;
}

.accent-color {
  color: #8e6f47;
}

/* 领域选择抽屉 */
.domain-drawer {
  position: fixed;
  top: 0;
  left: -300px;
  width: 300px;
  height: 100vh;
  background-color: #ffffff;
  z-index: 100;
  transition: transform 0.3s ease;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  padding-top: 60px;
}

.domain-drawer.open {
  transform: translateX(300px);
}

.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 90;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.drawer-overlay.open {
  opacity: 1;
  pointer-events: auto;
}

.domain-item {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.domain-item:hover {
  background-color: #f5f5f5;
}

.domain-item.active {
  background-color: rgba(142, 111, 71, 0.1);
  border-left: 3px solid #8e6f47;
}

.domain-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #8e6f47;
}

/* 聊天历史抽屉 */
.history-drawer {
  position: fixed;
  top: 0;
  right: -300px;
  width: 300px;
  height: 100vh;
  background-color: #ffffff;
  z-index: 100;
  transition: transform 0.3s ease;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  padding-top: 60px;
}

.history-drawer.open {
  transform: translateX(-300px);
}

.history-item {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.history-item:hover {
  background-color: #f5f5f5;
}

.history-item.active {
  background-color: rgba(142, 111, 71, 0.1);
  border-left: 3px solid #8e6f47;
}

.history-date {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.history-preview {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #555;
}

.empty-history {
  padding: 32px 16px;
  text-align: center;
  color: #888;
}

.empty-history i,
.empty-history .i-fa-regular\:comment-dots {
  color: #8e6f47;
  opacity: 0.5;
}

.delete-history-btn {
  position: absolute;
  right: 16px;
  top: 16px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease, background-color 0.2s ease;
}

.history-item:hover .delete-history-btn {
  opacity: 1;
}

.delete-history-btn:hover {
  background-color: rgba(231, 76, 60, 0.2);
}

/* 聊天容器样式 */
.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

/* 消息样式 */
.message {
  margin-bottom: 16px;
  max-width: 80%;
  animation: fadeIn 0.3s ease-out;
}

.user-message {
  margin-left: auto;
  background-color: #e6e6e6;
  border-radius: 18px 18px 4px 18px;
  padding: 12px 16px;
  color: #333333;
}

.ai-message {
  max-width: 100%;
  margin-right: auto;
  background-color: #ffffff;
  border-radius: 18px 18px 18px 4px;
  padding: 12px 16px;
  position: relative;
  color: #333333;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.ai-message::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 0;
  width: 12px;
  height: 12px;
  background-color: #8e6f47;
  border-radius: 50%;
  opacity: 0.8;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 历史记录列表样式 */
.history-list {
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.history-item {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.history-item:hover {
  background-color: #f5f5f5;
}

.delete-history-btn {
  position: absolute;
  right: 16px;
  top: 16px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease, background-color 0.2s ease;
}

.history-item:hover .delete-history-btn {
  opacity: 1;
}

.delete-history-btn:hover {
  background-color: rgba(231, 76, 60, 0.2);
}
</style>
