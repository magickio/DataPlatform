import type { ChatMessage, StreamChatEvent } from './api'
import { reactive, ref } from 'vue'
import api from './api'

// 消息类型
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  status: 'sending' | 'success' | 'error'
}

// 聊天状态
export const chatState = reactive({
  messages: [] as Message[],
  conversationId: '',
  isLoading: false,
  currentTaskId: '',
  error: null as string | null,
})

// 当前用户ID
export const currentUserId = ref('')

// 设置用户ID
export function setUserId(userId: string) {
  currentUserId.value = userId
}

// 添加用户消息
export function addUserMessage(content: string): Message {
  const message: Message = {
    id: `user-${Date.now()}`,
    role: 'user',
    content,
    timestamp: Date.now(),
    status: 'success',
  }

  chatState.messages.push(message)
  return message
}

// 添加助手消息
export function addAssistantMessage(initialContent = ''): Message {
  const message: Message = {
    id: `assistant-${Date.now()}`,
    role: 'assistant',
    content: initialContent,
    timestamp: Date.now(),
    status: 'sending',
  }

  chatState.messages.push(message)
  return message
}

// 更新消息
export function updateMessage(id: string, updates: Partial<Message>) {
  const index = chatState.messages.findIndex(msg => msg.id === id)
  if (index !== -1) {
    chatState.messages[index] = { ...chatState.messages[index], ...updates }
  }
}

// 发送消息
export async function sendMessage(content: string, options: Partial<ChatMessage> = {}) {
  if (!content.trim())
    return

  // 添加用户消息
  addUserMessage(content)

  // 创建初始的助手消息
  const assistantMessage = addAssistantMessage()

  // 设置加载状态
  chatState.isLoading = true
  chatState.error = null

  try {
    // 准备消息数据
    const messageData: ChatMessage = {
      query: content,
      user: currentUserId.value,
      response_mode: 'streaming',
      ...options,
    }

    // 如果有会话ID，添加到请求中
    if (chatState.conversationId) {
      messageData.conversation_id = chatState.conversationId
    }

    // 发送流式消息
    const requestTask = api.sendStreamChatMessage(
      messageData,
      (event: StreamChatEvent) => handleStreamEvent(event, assistantMessage.id),
      (error) => {
        console.error('发送消息失败:', error)
        chatState.error = typeof error === 'string' ? error : error.message || '发送消息失败'
        updateMessage(assistantMessage.id, { status: 'error' })
        chatState.isLoading = false
      },
      () => {
        // 确保在完成时更新消息状态为成功
        updateMessage(assistantMessage.id, { status: 'success' })
        chatState.isLoading = false
        chatState.currentTaskId = ''
      },
    )

    // 保存当前请求任务
    return requestTask
  }
  catch (error: any) {
    console.error('发送消息失败:', error)
    chatState.error = error.message || '发送消息失败'
    updateMessage(assistantMessage.id, { status: 'error' })
    chatState.isLoading = false
    return null
  }
}

// 处理流式事件
function handleStreamEvent(event: StreamChatEvent, messageId: string) {
  switch (event.event) {
    case 'message':
      // 更新消息内容
      if (event.answer) {
        updateMessage(messageId, {
          content: (chatState.messages.find(m => m.id === messageId)?.content || '') + event.answer,
        })
      }

      // 保存任务ID，用于可能的取消操作
      if (event.task_id) {
        chatState.currentTaskId = event.task_id
      }

      // 保存会话ID
      if (event.conversation_id && !chatState.conversationId) {
        chatState.conversationId = event.conversation_id
      }
      break

    case 'message_end':
      // 消息完成
      updateMessage(messageId, { status: 'success' })

      // 保存会话ID
      if (event.conversation_id && !chatState.conversationId) {
        chatState.conversationId = event.conversation_id
      }
      break

    case 'error':
      // 处理错误
      chatState.error = event.message || '接收消息时发生错误'
      updateMessage(messageId, { status: 'error' })
      break

    default:
      // 其他事件类型，如需要可以添加处理
      break
  }
}

// 取消当前响应
export async function cancelResponse() {
  if (chatState.currentTaskId) {
    try {
      await api.stopChatResponse(chatState.currentTaskId)
      chatState.currentTaskId = ''
      chatState.isLoading = false
    }
    catch (error) {
      console.error('取消响应失败:', error)
    }
  }
}

// 清空聊天记录
export function clearChat() {
  chatState.messages = []
  chatState.conversationId = ''
  chatState.error = null
}

// 导出聊天服务
export default {
  chatState,
  currentUserId,
  setUserId,
  sendMessage,
  cancelResponse,
  clearChat,
  addUserMessage,
  addAssistantMessage,
  updateMessage,
}
