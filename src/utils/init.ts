import { v4 as uuidv4 } from 'uuid'
import api from './api'
import chatService from './chatService'
import storage from './storage'

// 初始化API密钥
function initApiKey() {
  const apiKey = storage.getApiKey()
  if (apiKey) {
    api.setApiKey(apiKey)
    return true
  }
  return false
}

// 初始化用户ID
function initUserId() {
  let userId = storage.getUserId()
  if (!userId) {
    // 生成随机用户ID
    userId = `user_${uuidv4()}`
    storage.saveUserId(userId)
  }
  chatService.setUserId(userId)
  return userId
}

// 初始化会话
function initConversation() {
  const conversationId = storage.getConversationId()
  if (conversationId) {
    chatService.chatState.conversationId = conversationId
  }

  // 加载聊天历史
  const chatHistory = storage.getChatHistory()
  if (chatHistory && chatHistory.length > 0) {
    chatService.chatState.messages = chatHistory
  }
}

// 保存聊天状态
function saveChatState() {
  // 保存会话ID
  if (chatService.chatState.conversationId) {
    storage.saveConversationId(chatService.chatState.conversationId)
  }

  // 保存聊天历史
  storage.saveChatHistory(chatService.chatState.messages)
}

// 初始化应用
export function initApp() {
  const hasApiKey = initApiKey()
  const userId = initUserId()
  initConversation()

  // 定期保存聊天状态
  setInterval(saveChatState, 10000)

  return {
    hasApiKey,
    userId,
  }
}

// 导出初始化服务
export default {
  initApp,
  initApiKey,
  initUserId,
  initConversation,
  saveChatState,
}
