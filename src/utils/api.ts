import { ENV } from './env'

// API密钥，从环境配置中获取默认值
let API_KEY = ENV.API_KEY

// 设置API密钥
export function setApiKey(key: string) {
  API_KEY = key
}

// 获取API密钥
export const getApiKey = () => API_KEY

// 基础请求头
function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  }
}

// 获取流式请求头
function getStreamHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
    'Accept': 'text/event-stream',
  }
}

// 聊天消息类型
export interface ChatMessage {
  query: string
  inputs?: Record<string, any>
  response_mode?: 'streaming' | 'blocking'
  user?: string
  conversation_id?: string
  files?: Array<{
    type: 'document' | 'image' | 'audio' | 'video' | 'custom'
    transfer_method: 'remote_url' | 'local_file'
    url?: string
    upload_file_id?: string
  }>
  auto_generate_name?: boolean
}

// 聊天响应类型
export interface ChatResponse {
  message_id: string
  conversation_id: string
  mode: string
  answer: string
  metadata: any
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  retriever_resources?: any[]
  created_at: number
}

// 流式聊天事件类型
export interface StreamChatEvent {
  event: string
  task_id?: string
  message_id?: string
  conversation_id?: string
  answer?: string
  created_at?: number
  // 其他可能的字段
  [key: string]: any
}

// 发送聊天消息（阻塞模式）
export async function sendChatMessage(message: ChatMessage): Promise<ChatResponse> {
  try {
    const response = await uni.request({
      url: `${ENV.API_BASE_URL}/chat-messages`,
      method: 'POST',
      header: getHeaders(),
      data: {
        ...message,
        response_mode: 'blocking',
      },
    })

    if (response.statusCode !== 200) {
      throw new Error(`API请求失败: ${response.statusCode}`)
    }

    return response.data as ChatResponse
  }
  catch (error) {
    console.error('发送聊天消息失败:', error)
    throw error
  }
}

// 发送流式聊天消息（使用XMLHttpRequest实现）
export function sendStreamChatMessage(message: ChatMessage, onMessage: (event: StreamChatEvent) => void, onError: (error: any) => void, onComplete: () => void) {
  const xhr = new XMLHttpRequest()
  const url = `${ENV.API_BASE_URL}/chat-messages`
  const headers = getStreamHeaders()

  // 确保使用流式模式
  const streamMessage = {
    ...message,
    response_mode: 'streaming',
  }

  xhr.open('POST', url, true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.setRequestHeader('Authorization', headers.Authorization)
  xhr.setRequestHeader('Accept', headers.Accept)

  let buffer = ''
  const processedEvents = new Set() // 用于跟踪已处理的事件
  let isCompleted = false // 跟踪是否已经完成

  // 确保onComplete只被调用一次
  const safeComplete = () => {
    if (!isCompleted) {
      isCompleted = true
      onComplete()
    }
  }

  xhr.onprogress = () => {
    if (xhr.readyState === 3) { // 正在接收数据
      const newData = xhr.responseText.substring(buffer.length)
      buffer += newData

      // 分割事件并处理
      const chunks = buffer.split('\n\n')
      // 保留最后一个可能不完整的块
      buffer = chunks.pop() || ''

      for (const chunk of chunks) {
        if (!chunk.startsWith('data: '))
          continue

        try {
          const jsonStr = chunk.substring(6) // 移除 'data: ' 前缀

          // 使用事件内容作为唯一标识
          if (processedEvents.has(jsonStr))
            continue
          processedEvents.add(jsonStr)

          const eventData = JSON.parse(jsonStr) as StreamChatEvent
          onMessage(eventData)

          // 如果是结束事件，调用完成回调
          if (eventData.event === 'message_end' || eventData.event === 'error') {
            safeComplete()
          }
        }
        catch (err) {
          console.error('解析事件数据失败:', err, chunk)
        }
      }
    }
  }

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      // 请求完成，处理最后可能的数据块
      if (buffer && buffer.startsWith('data: ')) {
        try {
          const jsonStr = buffer.substring(6)
          if (!processedEvents.has(jsonStr)) {
            processedEvents.add(jsonStr)
            const eventData = JSON.parse(jsonStr) as StreamChatEvent
            onMessage(eventData)

            if (eventData.event === 'message_end' || eventData.event === 'error') {
              safeComplete()
            }
          }
        }
        catch (err) {
          console.error('解析最终事件数据失败:', err, buffer)
        }
      }

      // 如果没有明确的结束事件，确保调用完成回调
      if (xhr.status === 200) {
        safeComplete()
      }
    }
  }

  xhr.onerror = (err) => {
    onError(err)
    safeComplete() // 确保在错误时也调用完成回调
  }

  xhr.send(JSON.stringify(streamMessage))

  // 返回取消函数
  return () => {
    xhr.abort()
    safeComplete() // 确保在取消时也调用完成回调
  }
}

// 停止响应
export async function stopChatResponse(taskId: string) {
  try {
    const response = await uni.request({
      url: `${ENV.API_BASE_URL}/chat-messages/${taskId}/stop`,
      method: 'POST',
      header: getHeaders(),
    })

    return response.data
  }
  catch (error) {
    console.error('停止聊天响应失败:', error)
    throw error
  }
}

// 导出默认API服务
export default {
  setApiKey,
  getApiKey,
  sendChatMessage,
  sendStreamChatMessage,
  stopChatResponse,
}
