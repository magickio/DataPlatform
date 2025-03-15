/**
 * 导航栏辅助工具
 * 提供与导航栏相关的工具函数
 */

/**
 * 获取状态栏高度
 * @returns {number} 状态栏高度（单位：px）
 */
export function getStatusBarHeight(): number {
  try {
    const systemInfo = uni.getSystemInfoSync()
    return systemInfo.statusBarHeight || 0
  }
  catch (error) {
    console.error('获取系统信息失败', error)
    return 0
  }
}

/**
 * 计算内容区域高度
 * @param {number} navBarHeight 导航栏高度，默认为44px
 * @param {number} bottomHeight 底部区域高度，默认为0
 * @returns {string} 计算后的CSS高度值
 */
export function getContentHeight(navBarHeight = 44, bottomHeight = 0): string {
  const statusBarHeight = getStatusBarHeight()
  const totalNavHeight = statusBarHeight + navBarHeight

  if (bottomHeight > 0) {
    return `calc(100vh - ${totalNavHeight}px - ${bottomHeight}px)`
  }

  return `calc(100vh - ${totalNavHeight}px)`
}

/**
 * 获取安全区域信息
 * @returns {object} 安全区域信息
 */
export function getSafeAreaInsets(): Record<string, number> {
  try {
    const systemInfo = uni.getSystemInfoSync()
    return {
      top: systemInfo.safeArea?.top || 0,
      right: systemInfo.screenWidth - (systemInfo.safeArea?.right || systemInfo.screenWidth),
      bottom: systemInfo.screenHeight - (systemInfo.safeArea?.bottom || systemInfo.screenHeight),
      left: systemInfo.safeArea?.left || 0,
    }
  }
  catch (error) {
    console.error('获取安全区域信息失败', error)
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }
}
