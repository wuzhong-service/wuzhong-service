/**
 * 应急订单模块
 * 展示应急订单信息，支持状态显示和支付截止时间醒目提示
 */

import { formatDate, escapeHtml, isBeforeToday, isToday } from '../utils.js'
import { getEmergencyOrders } from '../data-service.js'
import { navigate } from '../router.js'

/**
 * 渲染应急订单页面
 * @param {Object} data
 */
export function renderEmergency(data) {
  const app = document.getElementById('app')
  const orders = data.emergencyOrders || []

  // 排序：进行中 > 待开始 > 已调整 > 已结束
  const statusOrder = { '进行中': 0, '待开始': 1, '已调整': 2, '已结束': 3 }
  const sorted = [...orders].sort((a, b) => {
    const orderA = statusOrder[a.当前状态] || 99
    const orderB = statusOrder[b.当前状态] || 99
    return orderA - orderB
  })

  // 是否有进行中的订单
  const hasActive = sorted.some(o => o.当前状态 === '进行中' || o.当前状态 === '待开始')

  app.innerHTML = `
    <div class="header">
      <div class="header-back" onclick="navigate('service')">← 返回</div>
      <div class="header-title">⚡ 应急订单</div>
    </div>

    <div class="page active">
      <div class="notice-bar">
        ⚠️ 以下内容仅为系统演示，不代表实际业务安排。
      </div>

      <!-- 重要提示 -->
      <div class="legal-notice" style="background: #fef9e7; border-left-color: var(--color-warning);">
        <strong>💡 温馨提示：</strong>请提前确认账户资金充足，以免影响订单兑付。具体安排以工业到货后及时通知为准，不对实际到货时间做不准确承诺。
      </div>

      ${sorted.length > 0 ? sorted.map(order => {
        const statusTag = order.当前状态 === '进行中' ? 'tag-active' :
          order.当前状态 === '待开始' ? 'tag-upcoming' :
          order.当前状态 === '已结束' ? 'tag-expired' : 'tag-warning'
        const isEnded = order.当前状态 === '已结束' || order.当前状态 === '已调整'
        const isUrgent = order.当前状态 === '进行中'

        return `
          <div class="urgent-card" style="${isEnded ? 'opacity: 0.6;' : ''}">
            <!-- 标题和状态 -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <strong style="font-size: 16px;">${escapeHtml(order.标题 || '应急订单')}</strong>
              <span class="tag ${statusTag}">${order.当前状态 || '未知'}</span>
            </div>

            <!-- 支付截止时间，醒目显示 -->
            ${order.支付截止时间 && !isEnded ? `
              <div class="urgent-deadline">
                ⏰ 支付截止：${formatDate(order.支付截止时间)}
                ${isToday(order.支付截止时间) ? '（今天截止）' : ''}
                ${isBeforeToday(order.支付截止时间) ? '（已截止）' : ''}
              </div>
            ` : ''}

            <!-- 详情 -->
            <div style="font-size: 14px; line-height: 1.8; color: #444;">
              ${order.安排日期 ? `<div>📅 安排日期：${formatDate(order.安排日期)}</div>` : ''}
              ${order.涉及批次 ? `<div>🔢 涉及批次：${escapeHtml(order.涉及批次)}</div>` : ''}
              ${order.涉及品规 ? `<div>🚬 涉及品规：${escapeHtml(order.涉及品规)}</div>` : ''}
              ${order.适用客户 ? `<div>👥 适用客户：${escapeHtml(order.适用客户)}</div>` : ''}
              ${order.具体说明 ? `<div style="margin-top: 8px; padding: 8px 10px; background: #f5f6fa; border-radius: 6px;">${escapeHtml(order.具体说明)}</div>` : ''}
            </div>

            <!-- 更新时间 -->
            ${order.更新时间 ? `
              <div style="margin-top: 8px; font-size: 12px; color: #999; text-align: right;">
                更新于 ${formatDate(order.更新时间)}
              </div>
            ` : ''}
          </div>
        `
      }).join('') : `
        <div class="empty-state">
          <div class="empty-state-icon">⚡</div>
          <p>暂无应急订单信息</p>
        </div>
      `}

      <div class="footer-notice">
        <p>具体应急订单安排以正式通知为准</p>
        <p>工业到货后及时安排兑付，不对到货时间做不准确承诺</p>
      </div>
    </div>
  `
}
