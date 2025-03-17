<script setup lang="ts">
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
  // 是否显示左侧菜单按钮
  showMenu: {
    type: Boolean,
    default: false,
  },
  // 是否显示历史记录按钮
  showHistory: {
    type: Boolean,
    default: false,
  },
})

// 定义事件
const emit = defineEmits(['back', 'action', 'menu', 'history'])

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

// 处理菜单按钮点击
function handleMenu() {
  emit('menu')
}

// 处理历史记录按钮点击
function handleHistory() {
  emit('history')
}
</script>

<template>
  <view class="nav-bar h-15 flex items-center justify-between border-b border-gray-200 bg-white px-4">
    <view class="flex items-center">
      <view v-if="showBack" class="text-accent-color i-fa-solid:chevron-left mr-2" style="font-size: 1.1rem;" @click="handleBack" />
      <view v-if="showMenu" class="text-accent-color i-fa-solid:bars mr-4" style="font-size: 1.1rem;" @click="handleMenu" />
      <view class="text-lg text-gray-800 font-medium">
        <text v-if="title.includes('SMART')" class="accent-color">
          SMART
        </text>
        <text v-if="title.includes('SMART')">
          STELLA
        </text>
        <text v-else>
          {{ title }}
        </text>
      </view>
    </view>
    <view class="flex items-center space-x-4">
      <view v-if="showHistory" class="text-accent-color i-fa-solid:history" style="font-size: 1.1rem;" @click="handleHistory" />
      <view v-if="showAction" @click="handleAction">
        <view class="text-accent-color" :class="[actionIcon]" style="font-size: 1.1rem;" />
      </view>
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

.accent-color {
  color: #8e6f47;
}

.text-accent-color {
  color: #8e6f47;
}
</style>
