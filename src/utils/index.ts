// 导出所有工具和服务
import api from './api'
import chatService from './chatService'
import { ENV } from './env'
import { initApp } from './init'
import storage from './storage'

// 导出所有工具
export {
  api,
  chatService,
  ENV,
  initApp,
  storage,
}

// 默认导出
export default {
  api,
  chatService,
  storage,
  initApp,
  ENV,
}
