/**
 * 直播专区模块
 * 展示直播信息，支持状态显示和链接跳转
 */

import { formatDate, escapeHtml, openExternalLink } from '../utils.js'
import { getLiveBroadcasts } from '../data-service.js'
import { navigate } from '../router.js'

/**
 * 渲染直播页面
 * @param {Object} data
 */
export function renderBroadcast(data) {
  const app = document.getElementById('app')
  const broadcasts = data.liveBroadcasts || []

  // 排序：即将开始 > 直播中 > 可回看 > 已结束
  const statusOrder = { '即将开始': 0, '直播中': 1, '可回看': 2, '已结束': 3 }
  const sorted = [...broadcasts].sort((a, b) => {
    const orderA = statusOrder[a.状态] || 99
    const orderB = statusOrder[b.状态] || 99
    return orderA - orderB
  })

  app.innerHTML = `
    <div class="header">
      <div class="header-back" onclick="navigate('service')">← 返回</div>
      <div class="header-title">📺 直播专区</div>
    </div>

    <div class="page active">

      ${sorted.length > 0 ? sorted.map(b => {
        const statusClass = b.状态 === '直播中' ? 'tag-live' :
          b.状态 === '即将开始' ? 'tag-upcoming' :
          b.状态 === '可回看' ? 'tag-active' : 'tag-expired'
        const isLive = b.状态 === '直播中'
        const hasLink = !!b.直播入口
        const hasReplay = !!b.回看入口

        return `
          <div class="live-card ${isLive ? 'live-now' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="tag ${statusClass}">${b.状态 || '未知'}</span>
              <span style="font-size: 12px; color: #999;">${b.更新时间 ? formatDate(b.更新时间) : ''}</span>

            <div class="live-time">📅 ${b.直播时间 || '时间待定'}</div>
            <div class="live-title">${escapeHtml(b.直播主题 || '未命名直播')}</div>

            ${b.主要内容 ? `<div style="font-size: 14px; color: #666; margin: 6px 0 10px; line-height: 1.6;">${escapeHtml(b.主要内容)}</div>` : ''}

            <div class="live-host">👤 主讲人：${escapeHtml(b.主讲人 || '待定')}</div>

            <div class="live-actions">
              ${hasLink ? `
                <button class="btn btn-sm btn-primary" onclick='openExternalLink("${escapeHtml(b.直播入口)}")'>
                  ${isLive ? '🔴 进入直播' : '▶ 直播入口'}
                </button>
              ` : `
                <button class="btn btn-sm btn-secondary" disabled>入口暂未发布</button>
              `}

              ${hasReplay ? `
                <button class="btn btn-sm btn-outline" onclick='openExternalLink("${escapeHtml(b.回看入口)}")'>
                  📼 观看回放
                </button>
              ` : ''}
            </div>

            ${b.直播二维码 ? `
              <div style="margin-top: 12px; text-align: center;">
                <img src="${escapeHtml(b.直播二维码)}" alt="直播二维码"
                  style="max-width: 150px; border-radius: 8px; border: 1px solid var(--color-border);">
              </div>
            ` : ''}
          </div>
        `
      }).join('') : `
        <div class="empty-state">
          <div class="empty-state-icon">📺</div>
          <p>暂无直播信息</p>
        </div>
      `}

      <div class="footer-notice">
        <p>直播链接及具体时间以正式通知为准</p>
        <p style="margin-top: 4px;">每周四直播信息请关注首页提醒</p>
      </div>
    </div>
  `
}
