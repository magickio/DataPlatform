import { createI18n, useI18n as vueUseI18n } from 'vue-i18n'
import messages, { availableLocales } from '../locales'

// 获取系统语言
function getSystemLocale(): string {
  // 获取系统语言，默认为中文
  try {
    const sysLocale = uni.getSystemInfoSync().language || 'zh-CN'
    // 简单处理一下，如果是英文就返回en-US，否则返回zh-CN
    return sysLocale.toLowerCase().includes('zh') ? 'zh-CN' : 'en-US'
  }
  catch {
    return 'zh-CN'
  }
}

// 获取存储的语言设置
function getStoredLocale(): string | null {
  try {
    return uni.getStorageSync('locale') || null
  }
  catch {
    return null
  }
}

// 设置语言到存储
function setStoredLocale(locale: string): void {
  try {
    uni.setStorageSync('locale', locale)
  }
  catch (e) {
    console.error('Failed to store locale', e)
  }
}

// 确定当前使用的语言
function determineLocale(): string {
  // 优先使用存储的语言设置
  const storedLocale = getStoredLocale()
  if (storedLocale && availableLocales.some(l => l.code === storedLocale)) {
    return storedLocale
  }

  // 其次使用系统语言
  const sysLocale = getSystemLocale()
  if (availableLocales.some(l => l.code === sysLocale)) {
    return sysLocale
  }

  // 默认使用中文
  return 'zh-CN'
}

// 创建i18n实例
export const i18n = createI18n({
  legacy: false,
  locale: determineLocale(),
  fallbackLocale: 'zh-CN',
  messages,
})

// 自定义useI18n钩子，增加切换语言功能
export function useI18n() {
  const i18n = vueUseI18n()

  // 切换语言
  const changeLocale = (locale: string) => {
    if (availableLocales.some(l => l.code === locale)) {
      i18n.locale.value = locale
      setStoredLocale(locale)
    }
  }

  return {
    ...i18n,
    availableLocales,
    changeLocale,
  }
}

export default useI18n
