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

// 聊天相关状态
const { chatState } = chatService
const isSending = computed(() => chatState.isLoading)
const messages = computed(() => chatState.messages)

// 计算属性：内容区域的底部内边距
const contentPaddingBottom = computed(() => {
  // 当键盘弹出时，底部内边距需要加上键盘高度（单位：px）
  return isKeyboardVisible.value ? `calc(6rem + ${keyboardHeight.value}px)` : '6rem'
})

// 监听键盘事件
onMounted(() => {
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
})

onUnmounted(() => {
  uni.offKeyboardHeightChange()
})

// 领域数据
const domains = [
  {
    title: 'IOE设备保养',
    description: '设备状态与维护分析',
    icon: 'i-fa-solid:cogs',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'ESG数据',
    description: '环境社会治理指标',
    icon: 'i-fa-solid:leaf',
    iconBg: 'bg-green-100 text-green-600',
  },
  {
    title: '财务数据',
    description: '财务报表与预测分析',
    icon: 'i-fa-solid:chart-line',
    iconBg: 'bg-purple-100 text-purple-600',
  },
  {
    title: '人力资源',
    description: '人员配置与绩效分析',
    icon: 'i-fa-solid:users',
    iconBg: 'bg-orange-100 text-orange-600',
  },
]

// 最近分析数据
const recentAnalyses = [
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
function toggleMode(mode: string) {
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
  uni.showModal({
    title: '提示',
    content: '确定要开始新的对话吗？当前对话记录将被清除。',
    success: (res) => {
      if (res.confirm) {
        chatService.clearChat()
      }
    },
  })
}
</script>

<template>
  <view class="page-container">
    <!-- 导航栏 -->
    <view class="nav-container">
      <NavBar
        title="智能分析"
        :show-back="false"
        :show-action="true"
        action-url="/pages/settings/index"
      />
    </view>

    <!-- 主内容区 -->
    <scroll-view
      scroll-y
      class="content-scroll-view"
      :style="{ paddingBottom: contentPaddingBottom }"
    >
      <view class="p-4">
        <!-- 欢迎信息 -->
        <view class="mb-6 text-left">
          <text class="mb-1 block text-left text-2xl font-bold">
            您好，小明
          </text>
          <text class="text-left text-gray-600">
            今天有什么可以帮您分析的？
          </text>
        </view>

        <!-- 聊天消息区域 -->
        <view v-if="messages.length > 0" class="mb-6">
          <view class="space-y-0">
            <view
              v-for="message in messages"
              :key="message.id"
              class="message-item px-5 py-4" :class="[
                message.role === 'user' ? 'user-message' : 'assistant-message',
              ]"
            >
              <view class="mx-auto">
                <!-- 用户消息直接显示 -->
                <view v-if="message.role === 'user'" class="flex justify-end">
                  <view class="user-bubble message-content">
                    {{ message.content }}
                  </view>
                </view>
                <!-- AI消息使用Markdown渲染器 -->
                <view v-else class="ai-message">
                  <MarkdownRenderer :content="message.content" />
                  <!-- 只有当消息是最后一条助手消息，状态为sending，且全局加载状态为true时才显示加载动画 -->
                  <view
                    v-if="message.status === 'sending' && isSending && message.id === messages[messages.length - 1].id && message.role === 'assistant'"
                    class="mt-2 flex items-center text-xs text-gray-400"
                  >
                    <view class="loading-dots">
                      <text>.</text><text>.</text><text>.</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 领域选择 -->
        <view v-if="messages.length === 0" class="mb-6">
          <view class="mb-3 flex items-center justify-between">
            <text class="text-lg font-semibold">
              选择业务领域
            </text>
            <navigator url="/pages/domain/index" class="flex items-center text-sm text-blue-600">
              <text>查看全部</text>
              <view class="i-fa-solid:chevron-right ml-1 text-xs" />
            </navigator>
          </view>
          <view class="grid grid-cols-2 gap-3">
            <navigator
              v-for="(domain, index) in domains"
              :key="index"
              url="/pages/domain/index"
              class="domain-card border border-gray-100 rounded-xl bg-white p-4 shadow-sm transition-all duration-300 hover:translate-y-[-5px] hover:shadow-md"
            >
              <view :class="domain.iconBg" class="mb-3 h-10 w-10 flex items-center justify-center rounded-full">
                <view :class="domain.icon" />
              </view>
              <text class="block font-medium">
                {{ domain.title }}
              </text>
              <text class="mt-1 text-xs text-gray-500">
                {{ domain.description }}
              </text>
            </navigator>
          </view>
        </view>

        <!-- 最近分析 -->
        <view v-if="messages.length === 0" class="mb-6">
          <text class="mb-3 block text-lg font-semibold">
            最近分析
          </text>
          <view class="space-y-3">
            <navigator
              v-for="(analysis, index) in recentAnalyses"
              :key="index"
              :url="analysis.url"
              class="block border border-gray-100 rounded-xl bg-white p-4 shadow-sm"
            >
              <view class="flex items-start">
                <view class="flex-1">
                  <text class="block text-left font-medium">
                    {{ analysis.title }}
                  </text>
                  <text class="mt-1 block text-left text-xs text-gray-500">
                    {{ analysis.description }}
                  </text>
                </view>
                <text class="ml-4 text-xs text-gray-400">
                  {{ analysis.time }}
                </text>
              </view>
            </navigator>
          </view>
        </view>

        <!-- 底部空白区域，确保内容不被输入框遮挡 -->
        <view
          class="input-placeholder"
          :style="{ height: isKeyboardVisible ? `calc(6rem + ${keyboardHeight}px)` : '6rem' }"
        />
      </view>
    </scroll-view>

    <!-- 底部输入区 -->
    <view
      class="input-area"
      :style="{
        bottom: `${inputBottom}px`,
      }"
    >
      <!-- 新对话按钮 - 当有消息时显示 -->
      <view v-if="messages.length > 0" class="new-chat-button">
        <view class="new-chat-button-inner" @click="startNewChat">
          <view class="i-fa-solid:plus mr-1 inline-block" />
          <text>开启新对话</text>
        </view>
      </view>

      <!-- 模式切换 -->
      <view class="mb-3 flex justify-center">
        <view class="mode-toggle flex rounded-full bg-gray-100 p-0.5">
          <view
            :class="{ 'bg-blue-200': activeModes.has('thinking') }"
            class="mode-toggle-btn rounded-full px-3 py-1.5 text-xs transition-all duration-300"
            @click="toggleMode('thinking')"
          >
            <view class="i-fa-solid:brain mr-1 inline-block" />
            <text>深度思考</text>
          </view>
          <view
            :class="{ 'bg-blue-200': activeModes.has('search') }"
            class="mode-toggle-btn rounded-full px-3 py-1.5 text-xs transition-all duration-300"
            @click="toggleMode('search')"
          >
            <view class="i-fa-solid:globe mr-1 inline-block" />
            <text>联网搜索</text>
          </view>
        </view>
      </view>

      <!-- 输入框 -->
      <view class="relative">
        <input
          v-model="inputText"
          type="text"
          placeholder="输入您的分析需求..."
          class="w-[72%] rounded-full bg-gray-100 py-3 pl-4 pr-20 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          :adjust-position="false"
          :disabled="isSending"
          @focus="handleFocus"
          @blur="handleBlur"
        >
        <!-- 输入框图标区域 -->
        <view class="absolute right-3 top-1/2 flex transform items-center -translate-y-1/2">
          <view
            :class="{ 'text-red-500 animate-pulse': isRecording }"
            class="voice-btn mr-1 h-8 w-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200"
            @click="toggleRecording"
          >
            <view class="i-fa-solid:microphone text-current" />
          </view>
          <view
            v-if="!isSending"
            class="text-blue-600"
            @click="sendMessage"
          >
            <view class="i-fa-solid:paper-plane text-current" />
          </view>
          <view
            v-else
            class="text-red-500"
            @click="cancelResponse"
          >
            <view class="i-fa-solid:times-circle text-current" />
          </view>
        </view>
      </view>
    </view>
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
  /* 不使用fixed定位，而是作为flex布局的一部分 */
  background-color: #ffffff;
  z-index: 100;
}

.content-scroll-view {
  flex: 1;
  width: 100%;
  height: 0; /* flex布局会自动计算高度 */
  z-index: 1;
  /* 移除固定的padding-bottom，使用动态样式代替 */
}

.input-placeholder {
  width: 100%;
}

.input-area {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 6rem;
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
  background-color: #f2edf3;
  border-radius: 12px;
  padding: 8px 12px;
  max-width: 100%;
}

/* AI消息样式 */
.ai-message {
  padding: 0;
  max-width: 100%;
}

/* 加载动画 */
@keyframes loading {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

.loading-dots text {
  animation: loading 1.4s infinite;
  animation-fill-mode: both;
}

.loading-dots text:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots text:nth-child(3) {
  animation-delay: 0.4s;
}

/* 新对话按钮样式 */
.new-chat-button {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.new-chat-button-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  color: #666;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #eaeaea;
}

.new-chat-button-inner:active {
  background-color: #f5f5f5;
}
</style>
