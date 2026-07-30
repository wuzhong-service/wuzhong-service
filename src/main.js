/**
 * 主入口文件
 * 初始化应用、路由、页面模块
 */

import { initRouter, registerRoute, navigate, setRouteChangeCallback } from './router.js'
import { loadData, clearCache, isDataLoaded } from './data-service.js'
import { getToday, formatDate } from './utils.js'

// 导入页面模块
import { renderHome } from './modules/home.js'
import { renderPackage } from './modules/weekly-package.js'
import { renderCigarette } from './modules/cigarette-info.js'
import { renderCalendar } from './modules/order-calendar.js'
import { renderService } from './modules/service.js'
import { renderBroadcast } from './modules/live-broadcast.js'
import { renderClassification } from './modules/classification.js'
import { renderEmergency } from './modules/emergency-order.js'

// 应用状态
let appData = null
let isInitialized = false

/**
 * 显示错误页面
 */
function showError(errorMsg) {
  const app = document.getElementById('app')
  app.innerHTML = `
    <div class="error-state">
      <div class="error-state-icon">⚠️</div>
      <div class="error-state-title">数据暂时无法加载</div>
      <div class="error-state-desc">
        ${errorMsg || '请稍后重试或联系客户经理。'}
      </div>
      <button class="btn btn-primary" onclick="location.reload()">
        重新加载
      </button>
    </div>
  `
  // 隐藏底部导航
  document.getElementById('bottom-nav').style.display = 'none'
}

/**
 * 显示加载状态
 */
function showLoading() {
  const app = document.getElementById('app')
  app.innerHTML = `
    <div class="loading">
      <div class="loading-spinner"></div>
      <div style="color: var(--color-text-secondary);">数据加载中...</div>
    </div>
  `
}

/**
 * 渲染页面头部
 */
function renderHeader(title, showBack = false) {
  const header = document.getElementById('page-header')
  if (!header) {
    const app = document.getElementById('app')
    const headerEl = document.createElement('div')
    headerEl.id = 'page-header'
    headerEl.className = 'header'
    headerEl.innerHTML = `
      <div class="header-title">${title}</div>
    `
    app.prepend(headerEl)
  } else {
    header.querySelector('.header-title').textContent = title
  }
}

/**
 * 获取共享数据（供模块使用）
 */
export function getAppData() {
  return appData
}

/**
 * 应用初始化
 */
async function initApp() {
  showLoading()

  // 显示底部导航
  const bottomNav = document.getElementById('bottom-nav')
  bottomNav.style.display = 'flex'

  try {
    appData = await loadData()
    isInitialized = true

    // 注册路由
    registerRoute('home', (path, query) => {
      renderHome(appData)
      updateNav('home')
    })

    registerRoute('package', (path, query) => {
      renderPackage(appData)
      updateNav('package')
    })

    registerRoute('cigarette', (path, query) => {
      renderCigarette(appData)
      updateNav('cigarette')
    })

    registerRoute('calendar', (path, query) => {
      renderCalendar(appData)
      updateNav('calendar')
    })

    registerRoute('service', (path, query) => {
      renderService(appData)
      updateNav('service')
    })

    registerRoute('broadcast', (path, query) => {
      renderBroadcast(appData)
      updateNav('service')
    })

    registerRoute('classification', (path, query) => {
      renderClassification(appData)
      updateNav('service')
    })

    registerRoute('emergency', (path, query) => {
      renderEmergency(appData)
      updateNav('service')
    })

    // 绑定底部导航点击
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const route = item.dataset.route
        navigate(route)
      })
    })

    // 初始化路由
    initRouter()

  } catch (err) {
    showError(err.message)
  }
}

/**
 * 更新导航栏高亮
 */
function updateNav(route) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.route === route)
  })
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initApp()
})

// 暴露 navigate 给全局（用于 HTML onclick）
window.navigate = navigate
