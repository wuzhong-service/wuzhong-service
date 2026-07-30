/**
 * 本周套餐模块
 * 展示套餐信息，支持按周次筛选、按名称搜索和状态显示
 */

import { formatDate, escapeHtml, getPackageStatus } from '../utils.js'
import { getPackages } from '../data-service.js'
import { navigate } from '../router.js'

let currentFilters = { week: '', keyword: '' }

/**
 * 渲染套餐页面
 * @param {Object} data
 */
export function renderPackage(data) {
  const app = document.getElementById('app')
  const packages = data.packages || []

  // 获取不重复的周次列表
  const weeks = [...new Set(packages.map(p => p.周次).filter(Boolean))].sort()

  // 更新当前套餐数据
  renderPackageContent(app, packages, weeks, currentFilters)
}

/**
 * 渲染套餐列表内容
 */
function renderPackageContent(app, packages, weeks, filters) {
  const filtered = getPackages(filters)

  app.innerHTML = `
    <!-- 顶部标题 -->
    <div class="header">
      <div class="header-back" onclick="navigate('home')">← 返回</div>
      <div class="header-title">📦 本周套餐</div>
    </div>

    <div class="page active">
      <!-- 演示提示 -->
      <div class="notice-bar">
        ⚠️ 以下内容仅为系统演示，不代表实际业务安排。
      </div>

      <!-- 搜索和筛选 -->
      <div class="search-bar">
        <input type="text" class="search-input" id="package-search"
          placeholder="搜索套餐名称..." value="${escapeHtml(filters.keyword)}">
        <button class="btn btn-primary" id="package-search-btn">搜索</button>
      </div>

      <div class="filter-bar">
        <select class="filter-select" id="package-week-filter">
          <option value="">全部周次</option>
          ${weeks.map(w => `
            <option value="${escapeHtml(String(w))}" ${String(filters.week) === String(w) ? 'selected' : ''}>
              第${w}周
            </option>
          `).join('')}
        </select>
      </div>

      <!-- 结果数量 -->
      <div class="result-count">
        共 ${filtered.length} 条套餐信息
      </div>

      <!-- 套餐列表 -->
      ${filtered.length > 0 ? filtered.map(pkg => {
        const isFeatured = filters.week || String(pkg.周次) === String(getCurrentWeek(packages))
        const status = getPackageStatus(pkg.订购结束日期)

        return `
          <div class="package-card ${isFeatured ? 'featured' : ''}" onclick='showPackageDetail(${JSON.stringify(pkg).replace(/'/g, "\\'")})'>
            <div class="package-status">
              ${status === 'expired' ? '<span class="tag tag-expired">已结束</span>' : '<span class="tag tag-active">进行中</span>'}
              ${isFeatured ? '' : ''}
            </div>
            <div class="package-week">第${pkg.周次 || '—'}周</div>
            <div class="package-name">${escapeHtml(pkg.套餐名称 || '未命名套餐')}</div>
            <div class="package-info">
              <span>📋 适用档位：${escapeHtml(pkg.适用档位 || '—')}</span>
              <span>⏰ 订购时间：${formatDate(pkg.订购开始时间)} 至 ${formatDate(pkg.订购结束时间)}</span>
            </div>
          </div>
        `
      }).join('') : `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <p>暂无匹配的套餐信息</p>
        </div>
      `}

      <div class="footer-notice">
        <p>具体套餐内容和订购要求以正式业务通知为准</p>
        <p style="margin-top: 4px;">更新时间：${data.packages?.[0]?.更新时间 ? formatDate(data.packages[0].更新时间) : '—'}</p>
      </div>
    </div>
  `

  // 绑定事件
  document.getElementById('package-search-btn').addEventListener('click', () => {
    currentFilters.keyword = document.getElementById('package-search').value
    renderPackageContent(app, packages, weeks, currentFilters)
  })

  document.getElementById('package-search').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      currentFilters.keyword = e.target.value
      renderPackageContent(app, packages, weeks, currentFilters)
    }
  })

  document.getElementById('package-week-filter').addEventListener('change', (e) => {
    currentFilters.week = e.target.value
    renderPackageContent(app, packages, weeks, currentFilters)
  })
}

/**
 * 获取当前周次（从数据中判断）
 */
function getCurrentWeek(packages) {
  // 简单方法：找订购时间包含今天的套餐
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  for (const p of packages) {
    if (p.订购开始时间 && p.订购结束时间) {
      if (todayStr >= p.订购开始时间 && todayStr <= p.订购结束时间) {
        return p.周次
      }
    }
  }
  return packages[0]?.周次 || ''
}

/**
 * 显示套餐详情弹窗
 */
window.showPackageDetail = function(pkg) {
  const overlay = document.createElement('div')
  overlay.className = 'modal-overlay'
  overlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
      <div class="modal-title">${pkg.套餐名称 || '套餐详情'}</div>

      <div style="display: grid; gap: 12px; font-size: 15px; line-height: 1.8;">
        <div><strong>周次：</strong>第${pkg.周次 || '—'}周</div>
        <div><strong>适用档位：</strong>${pkg.适用档位 || '—'}</div>
        <div><strong>订购时间：</strong>${formatDate(pkg.订购开始时间)} 至 ${formatDate(pkg.订购结束时间)}</div>
        <div><strong>包含品规：</strong>${pkg.包含品规 || '—'}</div>
        <div><strong>各品规数量：</strong>${pkg.各品规数量 || '—'}</div>
        ${pkg.注意事项 ? `<div><strong>注意事项：</strong>${pkg.注意事项}</div>` : ''}
        <div><strong>更新时间：</strong>${pkg.更新时间 ? formatDate(pkg.更新时间) : '—'}</div>
      </div>

      <button class="btn btn-secondary btn-block" style="margin-top: 16px;"
        onclick="this.closest('.modal-overlay').remove()">关闭</button>
    </div>
  `
  document.body.appendChild(overlay)
}
