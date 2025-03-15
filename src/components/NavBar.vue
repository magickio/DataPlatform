<script setup lang="ts">
import { ref } from 'vue'

// 定义组件属性
const props = defineProps({
  // 导航栏标题
  title: {
    type: String,
    default: '',
  },
  // 是否显示返回按钮
  showBack: {
    type: Boolean,
    default: true,
  },
  // 返回按钮的URL
  backUrl: {
    type: String,
    default: '',
  },
  // 是否显示右侧操作按钮
  showAction: {
    type: Boolean,
    default: false,
  },
  // 右侧操作按钮的图标
  actionIcon: {
    type: String,
    default: 'i-fa-solid:user-circle',
  },
  // 右侧操作按钮的URL
  actionUrl: {
    type: String,
    default: '',
  },
})

// 定义事件
const emit = defineEmits(['back', 'action'])

// 添加一个ref来跟踪当前语言
const currentLanguage = ref('zh')

// 处理返回按钮点击
function handleBack() {
  emit('back')
  if (props.backUrl) {
    // 使用reLaunch代替navigateTo，避免页面栈问题
    uni.navigateBack({
      delta: 1,
    })
  }
}

// 处理右侧操作按钮点击
function handleAction() {
  emit('action')
  if (props.actionUrl) {
    uni.navigateTo({
      url: props.actionUrl,
    })
  }
}
</script>

<template>
  <view class="nav-bar navbar h-11 flex items-center justify-between border-b border-gray-200 bg-gray-100 px-4">
    <view class="flex items-center">
      <view v-if="showBack" class="i-fa-solid:chevron-left mr-2" @click="handleBack" />
      <transition name="slide" mode="out-in">
        <text :key="currentLanguage" class="font-semibold">
          {{ title }}
        </text>
      </transition>
    </view>
    <view v-if="showAction" class="flex items-center" @click="handleAction">
      <view :class="actionIcon" />
    </view>
  </view>
</template>

<style>
.nav-bar {
  position: relative;
  z-index: 100;
}

/* 使用Unocss实现滑动动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
