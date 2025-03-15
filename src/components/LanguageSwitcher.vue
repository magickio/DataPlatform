<script setup lang="ts">
import { useI18n } from '../composables/useI18n'

const { locale, availableLocales, changeLocale } = useI18n()

function handleChangeLanguage(code: string) {
  changeLocale(code)
}
</script>

<template>
  <view class="language-switcher">
    <view
      v-for="lang in availableLocales"
      :key="lang.code"
      class="language-item"
      :class="{ active: locale === lang.code }"
      @click="handleChangeLanguage(lang.code)"
    >
      {{ lang.name }}
    </view>
  </view>
</template>

<style lang="scss" scoped>
.language-switcher {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(139, 90, 43, 0.1);
}

.language-item {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 24rpx;
  cursor: pointer;
  color: #6B4423;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.95);
  }
}

.language-item.active {
  background: linear-gradient(90deg, rgba(139, 90, 43, 0.2), rgba(107, 68, 35, 0.2));
  color: #8B5A2B;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(139, 90, 43, 0.1);
}
</style>
