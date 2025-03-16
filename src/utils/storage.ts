// 存储键名
const STORAGE_KEYS = {
  API_KEY: 'dify_api_key',
  USER_ID: 'user_id',
  CONVERSATION_ID: 'conversation_id',
  CHAT_HISTORY: 'chat_history',
}

// 保存数据到存储
export function saveData(key: string, data: any): void {
  try {
    uni.setStorageSync(key, JSON.stringify(data))
  }
  catch (e) {
    console.error(`保存数据失败: ${key}`, e)
  }
}

// 从存储获取数据
export function getData<T>(key: string, defaultValue: T): T {
  try {
    const data = uni.getStorageSync(key)
    return data ? JSON.parse(data) : defaultValue
  }
  catch (e) {
    console.error(`获取数据失败: ${key}`, e)
    return defaultValue
  }
}

// 从存储删除数据
export function removeData(key: string): void {
  try {
    uni.removeStorageSync(key)
  }
  catch (e) {
    console.error(`删除数据失败: ${key}`, e)
  }
}

// 保存API密钥
export function saveApiKey(apiKey: string): void {
  saveData(STORAGE_KEYS.API_KEY, apiKey)
}

// 获取API密钥
export function getApiKey(): string {
  return getData<string>(STORAGE_KEYS.API_KEY, '')
}

// 保存用户ID
export function saveUserId(userId: string): void {
  saveData(STORAGE_KEYS.USER_ID, userId)
}

// 获取用户ID
export function getUserId(): string {
  return getData<string>(STORAGE_KEYS.USER_ID, '')
}

// 保存会话ID
export function saveConversationId(conversationId: string): void {
  saveData(STORAGE_KEYS.CONVERSATION_ID, conversationId)
}

// 获取会话ID
export function getConversationId(): string {
  return getData<string>(STORAGE_KEYS.CONVERSATION_ID, '')
}

// 保存聊天历史
export function saveChatHistory(history: any[]): void {
  saveData(STORAGE_KEYS.CHAT_HISTORY, history)
}

// 获取聊天历史
export function getChatHistory(): any[] {
  return getData<any[]>(STORAGE_KEYS.CHAT_HISTORY, [])
}

// 清除所有聊天相关数据
export function clearChatData(): void {
  removeData(STORAGE_KEYS.CONVERSATION_ID)
  removeData(STORAGE_KEYS.CHAT_HISTORY)
}

// 导出存储服务
export default {
  saveData,
  getData,
  removeData,
  saveApiKey,
  getApiKey,
  saveUserId,
  getUserId,
  saveConversationId,
  getConversationId,
  saveChatHistory,
  getChatHistory,
  clearChatData,
}
