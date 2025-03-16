<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import { useI18n } from '@/composables/useI18n'
import { api, storage } from '@/utils'
import { getContentHeight } from '@/utils/navHelper'
import { ref } from 'vue'

const { t, locale, availableLocales, changeLocale } = useI18n()

// 历史记录开关状态
const historyEnabled = ref(true)
// 滚动区域高度
const scrollHeight = ref(getContentHeight())
// API密钥
const apiKey = ref(storage.getApiKey())
// 是否显示API密钥
const showApiKey = ref(false)

// 切换历史记录状态
function toggleHistory(e: any) {
  historyEnabled.value = e.detail.value
}

// 切换显示API密钥
function toggleShowApiKey() {
  showApiKey.value = !showApiKey.value
}

// 保存API密钥
function saveApiKey() {
  if (apiKey.value) {
    storage.saveApiKey(apiKey.value)
    api.setApiKey(apiKey.value)
    uni.showToast({
      title: '保存成功',
      icon: 'success',
    })
  }
  else {
    uni.showToast({
      title: 'API密钥不能为空',
      icon: 'none',
    })
  }
}

// 切换语言
function changeLanguage(lang: string) {
  changeLocale(lang)
  uni.showToast({
    title: t('settings.languageChanged'),
    icon: 'success',
  })
}

// 导航到其他页面
function navigateTo(page: string) {
  // 这里可以根据实际路由结构进行导航
  uni.showToast({
    title: `${t('common.navigateTo')}${page}${t('common.page')}`,
    icon: 'none',
  })
}

// 退出登录
function logout() {
  uni.showModal({
    title: t('common.tip'),
    content: t('settings.logoutConfirm'),
    success: (res) => {
      if (res.confirm) {
        // 执行退出登录逻辑
        uni.showToast({
          title: t('settings.logoutSuccess'),
          icon: 'success',
          success: () => {
            // 退出后可以跳转到登录页
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/index/index',
              })
            }, 1500)
          },
        })
      }
    },
  })
}
</script>

<template>
  <view class="settings-page h-full flex flex-col bg-gray-100">
    <!-- 使用NavBar组件 -->
    <NavBar
      :title="t('settings.title')"
      :show-back="true"
      back-url="/pages/main/index"
      :show-action="false"
    />

    <!-- 主内容区 -->
    <scroll-view
      scroll-y
      class="flex-1 overflow-scroll"
      :style="{ height: scrollHeight }"
      enable-back-to-top
      enhanced
      show-scrollbar
      bounces
    >
      <!-- API密钥设置 -->
      <view class="settings-section">
        <view class="settings-section-title">
          API设置
        </view>

        <view class="settings-item">
          <view class="settings-item-label">
            Dify API密钥
          </view>
          <view class="settings-item-content">
            <input
              v-model="apiKey"
              :password="!showApiKey"
              placeholder="请输入Dify API密钥"
              class="api-key-input"
            >
            <view class="settings-item-actions">
              <view class="action-icon" @click="toggleShowApiKey">
                <view :class="showApiKey ? 'i-fa-solid:eye-slash' : 'i-fa-solid:eye'" />
              </view>
            </view>
          </view>
        </view>

        <view class="save-api-key">
          <button class="save-button" @click="saveApiKey">
            保存API密钥
          </button>
        </view>
      </view>

      <!-- 用户信息 -->
      <view class="border-b border-gray-200 bg-white p-4">
        <view class="flex items-center">
          <view class="mr-4 h-16 w-16 flex items-center justify-center rounded-full bg-blue-600 text-2xl text-white">
            <text>明</text>
          </view>
          <view>
            <view class="text-xl font-bold">
              小明
            </view>
            <view class="text-gray-500">
              集团XXX
            </view>
          </view>
        </view>
      </view>

      <!-- 设置分组：账户 -->
      <view class="mb-2 mt-4 px-4">
        <text class="text-xs text-gray-500 font-semibold tracking-wider uppercase">
          账户
        </text>
      </view>
      <view class="bg-white">
        <view class="setting-item flex items-center justify-between border-b border-gray-100 p-4" @click="navigateTo('personal')">
          <view class="flex items-center">
            <view class="i-fa-solid:user-circle mr-3 text-lg text-gray-500" />
            <text>个人信息</text>
          </view>
          <view class="i-fa-solid:chevron-right text-gray-400" />
        </view>
        <view class="setting-item flex items-center justify-between border-b border-gray-100 p-4" @click="navigateTo('security')">
          <view class="flex items-center">
            <view class="i-fa-solid:lock mr-3 text-lg text-gray-500" />
            <text>安全设置</text>
          </view>
          <view class="i-fa-solid:chevron-right text-gray-400" />
        </view>
        <view class="setting-item flex items-center justify-between p-4" @click="navigateTo('notifications')">
          <view class="flex items-center">
            <view class="i-fa-solid:bell mr-3 text-lg text-gray-500" />
            <text>通知设置</text>
          </view>
          <view class="i-fa-solid:chevron-right text-gray-400" />
        </view>
      </view>

      <!-- 设置分组：应用 -->
      <view class="mb-2 mt-4 px-4">
        <text class="text-xs text-gray-500 font-semibold tracking-wider uppercase">
          应用
        </text>
      </view>
      <view class="bg-white">
        <view class="setting-item flex items-center justify-between border-b border-gray-100 p-4" @click="navigateTo('appearance')">
          <view class="flex items-center">
            <view class="i-fa-solid:palette mr-3 text-lg text-gray-500" />
            <text>外观</text>
          </view>
          <text class="text-sm text-gray-500">
            浅色
          </text>
        </view>
        <view class="setting-item flex items-center justify-between border-b border-gray-100 p-4">
          <view class="flex items-center">
            <view class="i-fa-solid:language mr-3 text-lg text-gray-500" />
            <text>{{ t('settings.language') }}</text>
          </view>
          <view class="language-selector">
            <view
              v-for="lang in availableLocales"
              :key="lang.code"
              class="language-option"
              :class="{ active: locale === lang.code }"
              @click="changeLanguage(lang.code)"
            >
              {{ lang.name }}
            </view>
          </view>
        </view>
        <view class="setting-item flex items-center justify-between border-b border-gray-100 p-4" @click="navigateTo('datasource')">
          <view class="flex items-center">
            <view class="i-fa-solid:database mr-3 text-lg text-gray-500" />
            <text>数据源管理</text>
          </view>
          <view class="i-fa-solid:chevron-right text-gray-400" />
        </view>
        <view class="setting-item flex items-center justify-between p-4" @click="navigateTo('visualization')">
          <view class="flex items-center">
            <view class="i-fa-solid:chart-pie mr-3 text-lg text-gray-500" />
            <text>默认可视化设置</text>
          </view>
          <view class="i-fa-solid:chevron-right text-gray-400" />
        </view>
      </view>

      <!-- 设置分组：AI设置 -->
      <view class="mb-2 mt-4 px-4">
        <text class="text-xs text-gray-500 font-semibold tracking-wider uppercase">
          AI设置
        </text>
      </view>
      <view class="bg-white">
        <view class="setting-item flex items-center justify-between border-b border-gray-100 p-4" @click="navigateTo('ai-mode')">
          <view class="flex items-center">
            <view class="i-fa-solid:brain mr-3 text-lg text-gray-500" />
            <text>默认分析模式</text>
          </view>
          <text class="text-sm text-gray-500">
            深度思考
          </text>
        </view>
        <view class="setting-item flex items-center justify-between border-b border-gray-100 p-4">
          <view class="flex items-center">
            <view class="i-fa-solid:history mr-3 text-lg text-gray-500" />
            <text>历史记录</text>
          </view>
          <switch :checked="historyEnabled" color="#3b82f6" @change="toggleHistory" />
        </view>
        <view class="setting-item flex items-center justify-between p-4" @click="navigateTo('ai-model')">
          <view class="flex items-center">
            <view class="i-fa-solid:robot mr-3 text-lg text-gray-500" />
            <text>AI模型选择</text>
          </view>
          <text class="text-sm text-gray-500">
            企业专用模型
          </text>
        </view>
      </view>

      <!-- 设置分组：其他 -->
      <view class="mb-2 mt-4 px-4">
        <text class="text-xs text-gray-500 font-semibold tracking-wider uppercase">
          其他
        </text>
      </view>
      <view class="bg-white">
        <view class="setting-item flex items-center justify-between border-b border-gray-100 p-4" @click="navigateTo('help')">
          <view class="flex items-center">
            <view class="i-fa-solid:question-circle mr-3 text-lg text-gray-500" />
            <text>帮助与支持</text>
          </view>
          <view class="i-fa-solid:chevron-right text-gray-400" />
        </view>
        <view class="setting-item flex items-center justify-between border-b border-gray-100 p-4" @click="navigateTo('about')">
          <view class="flex items-center">
            <view class="i-fa-solid:info-circle mr-3 text-lg text-gray-500" />
            <text>{{ t('settings.about') }}</text>
          </view>
          <text class="text-sm text-gray-500">
            v2.3.1
          </text>
        </view>
        <view class="setting-item flex items-center justify-between p-4" @click="logout">
          <view class="flex items-center">
            <view class="i-fa-solid:sign-out-alt mr-3 text-lg text-red-500" />
            <text class="text-red-500">
              {{ t('settings.logout') }}
            </text>
          </view>
        </view>
      </view>

      <!-- 底部版权信息 -->
      <view class="p-4 text-center">
        <text class="text-xs text-gray-500">
          © 2023 企业智能分析平台 · 集团数字化部门
        </text>
      </view>
    </scroll-view>
  </view>
</template>

<style>
.setting-item {
  transition: all 0.3s ease;
}
.setting-item:active {
  background-color: #f1f5f9;
}
.overflow-scroll {
  -webkit-overflow-scrolling: touch;
}
/* 确保页面占满整个屏幕高度 */
page {
  height: 100%;
}

.language-selector {
  display: flex;
  flex-direction: row;
  gap: 15px;
  padding: 10px 0;
}

.language-option {
  padding: 8px 16px;
  border-radius: 20px;
  background-color: #f0f0f0;
  font-size: 14px;
}

.language-option.active {
  background-color: #007aff;
  color: #ffffff;
}

/* API密钥输入框样式 */
.api-key-input {
  flex: 1;
  height: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 14px;
}

.settings-item-actions {
  display: flex;
  align-items: center;
}

.action-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.save-api-key {
  margin-top: 10px;
  padding: 0 15px;
}

.save-button {
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 4px;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
}
</style>
