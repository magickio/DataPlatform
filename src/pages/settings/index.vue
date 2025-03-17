<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import { useI18n } from '@/composables/useI18n'
import { ref } from 'vue'

const { t } = useI18n()

// 历史记录开关状态
const historyEnabled = ref(true)
// 自动回复开关状态
const autoReplyEnabled = ref(false)

// 切换历史记录状态
function toggleHistory(e: any) {
  historyEnabled.value = e.detail.value
}

// 切换自动回复状态
function toggleAutoReply(e: any) {
  autoReplyEnabled.value = e.detail.value
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
  <view class="settings-page">
    <!-- 使用NavBar组件 -->
    <NavBar
      :title="t('settings.title')"
      :show-back="true"
      back-url="/pages/main/index"
      :show-action="false"
    />

    <!-- 设置内容区 -->
    <scroll-view
      scroll-y
      class="settings-container fade-in"
      :style="{ height: `calc(100vh - 104px)` }"
      enable-back-to-top
      enhanced
      :show-scrollbar="false"
      bounces
    >
      <!-- 用户信息 -->
      <view class="setting-group mb-6">
        <view class="flex items-center p-4">
          <view class="user-avatar">
            <text>S</text>
          </view>
          <view class="flex-1">
            <view class="text-lg font-semibold">
              Smart Stella
            </view>
            <view class="text-sm text-gray-500">
              stella@example.com
            </view>
          </view>
        </view>
      </view>

      <!-- 账户设置 -->
      <view class="mb-6">
        <view class="setting-group-title">
          账户
        </view>
        <view class="setting-group">
          <view class="setting-item flex items-center justify-between p-4" @click="navigateTo('personal')">
            <view class="flex flex-1 items-center">
              <view class="setting-icon">
                <view class="i-fa-solid:user" />
              </view>
              <text>个人信息</text>
            </view>
            <view class="i-fa-solid:chevron-right text-sm text-gray-400" />
          </view>
          <view class="setting-item flex items-center justify-between p-4" @click="navigateTo('security')">
            <view class="flex flex-1 items-center">
              <view class="setting-icon">
                <view class="i-fa-solid:lock" />
              </view>
              <text>安全设置</text>
            </view>
            <view class="i-fa-solid:chevron-right text-sm text-gray-400" />
          </view>
          <view class="setting-item flex items-center justify-between p-4" @click="navigateTo('notifications')">
            <view class="flex flex-1 items-center">
              <view class="setting-icon">
                <view class="i-fa-solid:bell" />
              </view>
              <text>通知设置</text>
            </view>
            <view class="i-fa-solid:chevron-right text-sm text-gray-400" />
          </view>
        </view>
      </view>

      <!-- 应用设置 -->
      <view class="mb-6">
        <view class="setting-group-title">
          应用
        </view>
        <view class="setting-group">
          <view class="setting-item flex items-center justify-between p-4" @click="navigateTo('appearance')">
            <view class="flex flex-1 items-center">
              <view class="setting-icon">
                <view class="i-fa-solid:palette" />
              </view>
              <text>外观</text>
            </view>
            <view class="text-sm text-gray-500">
              浅色
            </view>
          </view>
          <view class="setting-item flex items-center justify-between p-4" @click="navigateTo('language')">
            <view class="flex flex-1 items-center">
              <view class="setting-icon">
                <view class="i-fa-solid:language" />
              </view>
              <text>语言</text>
            </view>
            <view class="text-sm text-gray-500">
              简体中文
            </view>
          </view>
          <view class="setting-item flex items-center justify-between p-4">
            <view class="flex flex-1 items-center">
              <view class="setting-icon">
                <view class="i-fa-solid:history" />
              </view>
              <text>聊天历史</text>
            </view>
            <switch :checked="historyEnabled" color="#8e6f47" @change="toggleHistory" />
          </view>
        </view>
      </view>

      <!-- AI设置 -->
      <view class="mb-6">
        <view class="setting-group-title">
          AI设置
        </view>
        <view class="setting-group">
          <view class="setting-item flex items-center justify-between p-4" @click="navigateTo('ai-model')">
            <view class="flex flex-1 items-center">
              <view class="setting-icon">
                <view class="i-fa-solid:brain" />
              </view>
              <text>AI模型</text>
            </view>
            <view class="text-sm text-gray-500">
              Stella Pro
            </view>
          </view>
          <view class="setting-item flex items-center justify-between p-4" @click="navigateTo('creativity')">
            <view class="flex flex-1 items-center">
              <view class="setting-icon">
                <view class="i-fa-solid:lightbulb" />
              </view>
              <text>创意程度</text>
            </view>
            <view class="text-sm text-gray-500">
              平衡
            </view>
          </view>
          <view class="setting-item flex items-center justify-between p-4">
            <view class="flex flex-1 items-center">
              <view class="setting-icon">
                <view class="i-fa-solid:robot" />
              </view>
              <text>自动回复</text>
            </view>
            <switch :checked="autoReplyEnabled" color="#8e6f47" @change="toggleAutoReply" />
          </view>
        </view>
      </view>

      <!-- 其他设置 -->
      <view class="mb-6">
        <view class="setting-group-title">
          其他
        </view>
        <view class="setting-group">
          <view class="setting-item flex items-center justify-between p-4" @click="navigateTo('help')">
            <view class="flex flex-1 items-center">
              <view class="setting-icon">
                <view class="i-fa-solid:question-circle" />
              </view>
              <text>帮助与支持</text>
            </view>
            <view class="i-fa-solid:chevron-right text-sm text-gray-400" />
          </view>
          <view class="setting-item flex items-center justify-between p-4" @click="navigateTo('about')">
            <view class="flex flex-1 items-center">
              <view class="setting-icon">
                <view class="i-fa-solid:info-circle" />
              </view>
              <text>关于</text>
            </view>
            <view class="text-sm text-gray-500">
              v1.0.0
            </view>
          </view>
          <view class="setting-item flex items-center justify-between p-4" @click="logout">
            <view class="flex flex-1 items-center">
              <view class="setting-icon logout-button">
                <view class="i-fa-solid:sign-out-alt" />
              </view>
              <text class="logout-button">
                退出登录
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部版权信息 -->
      <view class="mb-8 mt-4 text-center text-xs text-gray-400">
        <text>© 2023 Smart Stella · 智能助手</text>
      </view>
    </scroll-view>
  </view>
</template>

<style>
/* 确保页面占满整个屏幕高度 */
page {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: #f8f8f8;
}

.settings-page {
  width: 100%;
  height: 100vh;
  background-color: #f8f8f8;
}

.settings-container {
  overflow-y: auto;
  padding: 16px;
  background-color: #f8f8f8;
  width: 100%;
  box-sizing: border-box;
}

.settings-container::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.setting-group {
  margin-bottom: 16px;
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
}

.setting-group-title {
  font-size: 13px;
  font-weight: 600;
  color: #8e6f47;
  margin-bottom: 8px;
  padding: 0 16px;
}

.setting-item {
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
}

.setting-item:hover {
  background-color: #f8f8f8;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #8e6f47;
  opacity: 0.8;
  flex-shrink: 0;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #8e6f47;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  margin-right: 16px;
  flex-shrink: 0;
}

.logout-button {
  color: #e53e3e;
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}
</style>
