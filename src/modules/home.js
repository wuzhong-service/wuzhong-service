/**
 * 首页模块
 * 显示项目信息、本周重点提醒、6个功能入口
 */

import { getToday, formatDate } from '../utils.js'
import { navigate } from '../router.js'
import { getSettings, getHomeNotices } from '../data-service.js'

/**
 * 渲染首页
 * @param {Object} data 应用数据
 */
export function renderHome(data) {
  const app = document.getElementById('app')
  const settings = getSettings()
  const notices = getHomeNotices()

  const today = getToday()
  const updateTime = settings['数据更新时间'] || today
  const siteName = settings['网站名称'] || '吴中零售客户营销服务'
  const contactName = settings['客户经理姓名'] || ''
  const contactPhone = settings['客户经理联系电话'] || ''
  const showContact = settings['是否显示联系方式'] || '是'
  const serviceNotice = settings['服务对象提示'] || '仅供持证卷烟零售客户业务查询'

  app.innerHTML = `
    <!-- 顶部标题 -->
    <div class="header">
      <div class="header-title">${siteName}</div>
      <div class="header-subtitle">${serviceNotice}</div>
      <div class="header-info">
        <span>📅 ${today}</span>
        <span>📌 更新于 ${formatDate(updateTime)}</span>
      </div>
    </div>

    <div class="page active">
      <!-- 合规提示 -->
      <div class="legal-notice" style="margin-top: 0;">
        本页面仅面向持证卷烟零售客户提供业务信息查询和服务提醒，不面向消费者提供卷烟宣传、交易、预订或支付服务。具体业务安排以正式通知为准。
      </div>

      <!-- 客户经理联系信息 -->
      ${showContact === '是' && (contactName || contactPhone) ? `
        <div class="contact-bar">
          ${contactName ? `<strong>${contactName}</strong>` : ''}
          ${contactPhone ? ` | 📞 ${contactPhone}` : ''}
        </div>
      ` : ''}

      <!-- 本周重点提醒 -->
      <div class="card">
        <div class="card-title">📢 本周重点提醒</div>
        <div class="card-subtitle">近期重要安排，请务必留意</div>
        ${notices.length > 0 ? `
          <div style="margin-top: 8px;">
            ${notices.slice(0, 3).map(notice => `
              <div style="
                padding: 12px 0;
                border-bottom: 1px solid var(--color-border);
                ${notice.紧急 ? 'background: var(--color-highlight); padding: 12px 8px; border-radius: 8px; margin-bottom: 8px; border-bottom: none;' : ''}
              ">
                <div style="display: flex; align-items: flex-start; gap: 8px;">
                  <span style="flex-shrink: 0;">${notice.紧急 ? '🔴' : '📌'}</span>
                  <div>
                    <div style="font-weight: 500; font-size: 15px;">${notice.标题}</div>
                    ${notice.内容 ? `<div style="font-size: 13px; color: #666; margin-top: 4px;">${notice.内容}</div>` : ''}
                    ${notice.日期 ? `<div style="font-size: 12px; color: #999; margin-top: 4px;">${formatDate(notice.日期)}</div>` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="text-align: center; padding: 20px 0; color: #999; font-size: 14px;">
            暂无本周提醒
          </div>
        `}
      </div>

      <!-- 演示数据提示 -->
      <div class="notice-bar">
        ⚠️ 以下内容仅为系统演示，不代表实际业务安排。
      </div>

      <!-- 功能入口 -->
      <div class="grid-3" style="margin-top: 4px;">
        <div class="entry-card" onclick="navigate('package')">
          <div class="entry-icon">📦</div>
          <div class="entry-label">本周套餐</div>
        </div>
        <div class="entry-card" onclick="navigate('cigarette')">
          <div class="entry-icon">🚬</div>
          <div class="entry-label">卷烟信息</div>
        </div>
        <div class="entry-card" onclick="navigate('calendar')">
          <div class="entry-icon">📅</div>
          <div class="entry-label">订货日历</div>
        </div>
        <div class="entry-card" onclick="navigate('service')">
          <div class="entry-icon">📺</div>
          <div class="entry-label">直播专区</div>
        </div>
        <div class="entry-card" onclick="navigate('service')">
          <div class="entry-icon">📋</div>
          <div class="entry-label">分档解读</div>
        </div>
        <div class="entry-card" onclick="navigate('service')">
          <div class="entry-icon">⚡</div>
          <div class="entry-label">应急订单</div>
        </div>
      </div>

      <!-- 页脚 -->
      <div class="footer-notice">
        <p>本页面仅面向持证卷烟零售客户提供业务信息查询和服务提醒，</p>
        <p>不面向消费者提供卷烟宣传、交易、预订或支付服务。</p>
        <p>具体业务安排以正式通知为准。</p>
        <p style="margin-top: 8px;">吴中烟草 · 客户服务</p>
      </div>
    </div>
  `
}
