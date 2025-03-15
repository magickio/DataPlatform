<script setup lang="ts">
import { ref } from 'vue'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import { useI18n } from '../composables/useI18n'

const { t } = useI18n()
const username = ref('')
const password = ref('')
const rememberMe = ref(false)

function handleLogin() {
  // 登录逻辑，后续实现
  uni.navigateTo({
    url: '/pages/main/index',
  })
}

function toggleRememberMe() {
  rememberMe.value = !rememberMe.value
}
</script>

<template>
  <view class="login-container">
    <view class="language-area">
      <LanguageSwitcher />
    </view>

    <view class="content-area">
      <view class="logo-section">
        <view class="logo-pulse">
          <view class="i-fa-solid:brain text-5xl text-amber-800" />
        </view>
        <text class="title">
          {{ t('welcome.title') }}
        </text>
        <text class="subtitle">
          {{ t('welcome.subtitle') }}
        </text>
      </view>

      <view class="login-form">
        <view class="input-group">
          <view class="input-icon">
            <view class="i-fa-solid:user" />
          </view>
          <input
            v-model="username"
            class="input-field"
            type="text"
            :placeholder="t('welcome.login.usernamePlaceholder')"
          >
        </view>

        <view class="input-group">
          <view class="input-icon">
            <view class="i-fa-solid:lock" />
          </view>
          <input
            v-model="password"
            class="input-field"
            password
            :placeholder="t('welcome.login.passwordPlaceholder')"
          >
        </view>

        <view class="options-row">
          <view class="remember-me" @click="toggleRememberMe">
            <checkbox :checked="rememberMe" color="#8B5A2B" style="transform: scale(0.8);" />
            <text>{{ t('welcome.login.rememberMe') }}</text>
          </view>
          <text class="forgot-password">
            {{ t('welcome.login.forgotPassword') }}
          </text>
        </view>

        <view class="login-button" @click="handleLogin">
          <text>{{ t('welcome.startButton') }}</text>
        </view>
      </view>
    </view>

    <view class="footer-area">
      <text class="copyright">
        {{ t('welcome.copyright') }}
      </text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #ffffff 0%, #f8f7f3 100%);
  color: #333;
  padding-top: calc(60rpx + env(safe-area-inset-top));
}

.language-area {
  display: flex;
  justify-content: flex-end;
  padding: 20rpx 40rpx;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 50rpx;
  margin-top: -80rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}

.logo-pulse {
  background-color: rgba(139, 90, 43, 0.1);
  border-radius: 50%;
  padding: 40rpx;
  margin-bottom: 30rpx;
  animation: pulse 2s infinite;
  box-shadow: 0 0 30rpx rgba(139, 90, 43, 0.2);
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 16rpx;
  background: linear-gradient(90deg, #8B5A2B, #6B4423);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(139, 90, 43, 0.1);
}

.subtitle {
  font-size: 32rpx;
  color: #6B4423;
  text-align: center;
  margin-bottom: 60rpx;
}

.login-form {
  width: 100%;
  max-width: 650rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  padding: 50rpx;
  border-radius: 24rpx;
}

.input-group {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 16rpx;
  padding: 6rpx 20rpx;
  transition: all 0.3s ease;
  border: 1px solid rgba(139, 90, 43, 0.1);

  &:focus-within {
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 0 2px rgba(139, 90, 43, 0.2);
    border-color: rgba(139, 90, 43, 0.3);
  }
}

.input-icon {
  color: #8B5A2B;
  font-size: 36rpx;
  padding: 20rpx 20rpx 20rpx 10rpx;
}

.input-field {
  flex: 1;
  height: 90rpx;
  background: transparent;
  border: none;
  color: #333;
  font-size: 30rpx;

  &::placeholder {
    color: rgba(107, 68, 35, 0.5);
  }
}

.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10rpx;
  margin-top: 10rpx;
}

.remember-me {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #6B4423;
}

.forgot-password {
  font-size: 26rpx;
  color: #8B5A2B;
  transition: color 0.3s ease;

  &:active {
    color: #6B4423;
  }
}

.login-button {
  margin-top: 50rpx;
  background: linear-gradient(90deg, #8B5A2B, #6B4423);
  color: white;
  font-weight: bold;
  font-size: 32rpx;
  padding: 28rpx 0;
  border-radius: 50rpx;
  text-align: center;
  box-shadow: 0 10rpx 20rpx rgba(139, 90, 43, 0.3);
  transition: all 0.3s ease;
  width: 400rpx;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  overflow: hidden;
  letter-spacing: 4rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: all 0.6s ease;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50rpx;
    border: 1px solid rgba(255, 255, 255, 0.2);
    pointer-events: none;
  }

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 5rpx 10rpx rgba(139, 90, 43, 0.3);
    background: linear-gradient(90deg, #6B4423, #5A371D);
  }

  &:active::before {
    left: 100%;
  }

  text {
    position: relative;
    z-index: 1;
  }
}

.footer-area {
  padding: 30rpx;
  width: 100%;
  box-sizing: border-box;
  margin-top: auto;
}

.copyright {
  font-size: 22rpx;
  color: #6B4423;
  text-align: center;
  display: block;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
