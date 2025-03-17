<script setup lang="ts">
import { useI18n } from '../composables/useI18n'

const { t } = useI18n()

function handleLogin() {
  // 登录逻辑，后续实现
  uni.navigateTo({
    url: '/pages/main/index',
  })
}

function handleSkip() {
  // 跳过登录
  uni.navigateTo({
    url: '/pages/main/index',
  })
}
</script>

<template>
  <view class="welcome-container">
    <view class="content-area">
      <text class="subtitle">
        {{ t('welcome.startWith') }}
      </text>
      <text class="brand-name">
        SMART\nSTELLA
      </text>
      <text class="description">
        {{ t('welcome.description') }}
      </text>
    </view>

    <view class="accent-square" />
    <view class="vertical-line" />

    <view class="action-buttons">
      <view class="action-button skip-button" @click="handleSkip">
        <text>{{ t('welcome.skip') }}</text>
      </view>
      <view class="action-button login-button" @click="handleLogin">
        <text>{{ t('welcome.login') }}</text>
        <view class="login-indicator" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.welcome-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #ffffff;
  color: #333333;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  overflow: hidden;
}

.content-area {
  margin-top: 80px;
  padding: 0 8%;
  animation: fadeIn 1.2s ease-out;
}

.subtitle {
  font-size: 36rpx;
  font-weight: 500;
  color: #666666;
  display: block;
}

.brand-name {
  font-size: 90rpx;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -1px;
  margin-top: 20rpx;
  color: #333333;
  display: block;
  white-space: pre-line;
}

.description {
  margin-top: 30rpx;
  color: #666666;
  font-size: 28rpx;
  max-width: 600rpx;
  display: block;
}

.accent-square {
  width: 200rpx;
  height: 200rpx;
  background-color: #8e6f47;
  position: absolute;
  top: 15%;
  right: 8%;
  animation: float 6s ease-in-out infinite;
  transform-origin: center;
  border-radius: 8rpx;
  box-shadow: 0 20rpx 60rpx rgba(142, 111, 71, 0.2);
}

.vertical-line {
  position: absolute;
  right: 10%;
  top: 30%;
  bottom: 10%;
  width: 2rpx;
  background-color: rgba(0, 0, 0, 0.1);
}

.action-buttons {
  width: 100%;
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}

.action-button {
  padding: 40rpx 0;
  text-align: center;
  font-weight: 500;
  transition: all 0.3s ease;
}

.skip-button {
  width: 33.33%;
  background-color: #f5f5f5;
  color: #666666;
}

.login-button {
  width: 66.67%;
  background-color: #8e6f47;
  color: #ffffff;
  position: relative;
  overflow: hidden;
}

.login-indicator {
  width: 40%;
  height: 6rpx;
  background-color: white;
  margin: 20rpx auto 0;
  position: relative;
  overflow: hidden;
}

.login-indicator::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
  animation: shimmer 2s infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-40rpx) rotate(5deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(40rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  100% { left: 100%; }
}
</style>
