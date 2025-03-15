<script setup>
import { onBeforeMount, onMounted, ref } from 'vue'

// 只获取状态栏高度
const statusBarHeight = ref(20) // 默认值设为20px

// 在组件挂载前就获取状态栏高度
onBeforeMount(() => {
  getStatusBarHeight()
})

onMounted(() => {
  getStatusBarHeight()
})

// 获取状态栏高度
function getStatusBarHeight() {
  try {
    const sysInfo = uni.getSystemInfoSync()
    statusBarHeight.value = sysInfo.statusBarHeight || 20
  }
  catch (e) {
    console.error('获取状态栏高度失败:', e)
  }
}
</script>

<template>
  <view class="layout-container">
    <!-- 只保留状态栏占位 -->
    <view class="status-bar" :style="{ height: `${statusBarHeight}px` }" />

    <!-- 页面内容区域 -->
    <view class="content-container" :style="{ paddingTop: `${statusBarHeight}px` }">
      <slot />
      <app-footer />
      <view class="mx-auto mt-5 text-center text-sm opacity-25">
        [Default Layout]
      </view>
    </view>
  </view>
</template>

<style>
.layout-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 简化的状态栏样式 */
.status-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  background-color: #000000;
}

/* 内容区域样式 */
.content-container {
  flex: 1;
  width: 100%;
  box-sizing: border-box;
}
</style>
